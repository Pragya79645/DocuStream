'use server';

/**
 * @fileOverview A flow to process zip files, extract their contents, and orchestrate their processing.
 *
 * - processZipFile - Downloads a zip file, extracts it, and processes each file.
 * - ProcessZipFileInput - The input type for the processZipFile function.
 * - ProcessZipFileOutput - The return type for the processZipFile function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import AdmZip from 'adm-zip';
import axios from 'axios';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Import the flow we want to call for each file.
import { extractActionPointsAndCategorizeDocuments } from './extract-action-points-and-categorize-documents';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});


const ProcessZipFileInputSchema = z.object({
  fileUrl: z.string().describe('The public URL of the .zip file to process.'),
  uploaderId: z.string().describe('The ID of the user who uploaded the file.'),
});
export type ProcessZipFileInput = z.infer<typeof ProcessZipFileInputSchema>;

const ProcessZipFileOutputSchema = z.object({
  fileCount: z.number().describe('The number of files found in the zip archive.'),
  processedFiles: z.array(z.string()).describe('A list of the file names that were processed.'),
});
export type ProcessZipFileOutput = z.infer<typeof ProcessZipFileOutputSchema>;

export async function processZipFile(input: ProcessZipFileInput): Promise<ProcessZipFileOutput> {
  return processZipFileFlow(input);
}


export const processZipFileFlow = ai.defineFlow(
  {
    name: 'processZipFileFlow',
    inputSchema: ProcessZipFileInputSchema,
    outputSchema: ProcessZipFileOutputSchema,
  },
  async (input) => {
    console.log(`Starting zip file processing for URL: ${input.fileUrl}`);
    
    // 1. Create a temporary directory to store the zip and its contents
    const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'zip-'));
    const zipPath = path.join(tempDir, 'downloaded.zip');
    const extractPath = path.join(tempDir, 'extracted');
    await fs.promises.mkdir(extractPath);

    let fileCount = 0;
    const processedFiles: string[] = [];
    const processingPromises: Promise<any>[] = [];


    try {
      // 2. Download the zip file from the URL
      console.log(`Downloading file to ${zipPath}`);
      const response = await axios({
        method: 'get',
        url: input.fileUrl,
        responseType: 'stream',
      });

      const writer = fs.createWriteStream(zipPath);
      response.data.pipe(writer);
      
      await new Promise<void>((resolve, reject) => {
        writer.on('finish', () => resolve());
        writer.on('error', reject);
      });

      console.log('Download complete. Extracting archive...');

      // 3. Extract the zip file
      const zip = new AdmZip(zipPath);
      const zipEntries = zip.getEntries();
      
      zip.extractAllTo(extractPath, /*overwrite*/ true);
      console.log('Extraction complete. Processing individual files...');


      for (const zipEntry of zipEntries) {
        // We skip directories and hidden files (like __MACOSX)
        if (zipEntry.isDirectory || zipEntry.entryName.startsWith('__')) {
            continue;
        }
        
        fileCount++;
        processedFiles.push(zipEntry.entryName);
        const localFilePath = path.join(extractPath, zipEntry.entryName);
        
        console.log(`Processing file: ${zipEntry.entryName}`);

        // For each file, we create a promise that uploads it and triggers the AI flow.
        const processPromise = (async () => {
          try {
            // 1. Upload the extracted file back to Cloudinary from the server.
            const uploadResult = await cloudinary.uploader.upload(localFilePath, {
              resource_type: 'auto',
              // Use the original filename from the zip for a clean public_id
              public_id: path.parse(zipEntry.entryName).name
            });

            console.log(`Uploaded ${zipEntry.entryName} to Cloudinary.`);
            console.log(`Cloudinary response - resource_type: ${uploadResult.resource_type}, format: ${uploadResult.format}`);

            // 2. Call the 'extractActionPointsAndCategorizeDocuments' flow.
            // We don't await here, letting it run in the background.
            const fileType = `${uploadResult.resource_type}/${uploadResult.format}`;
            console.log(`Calling AI processing with fileType: ${fileType}`);
            
            await extractActionPointsAndCategorizeDocuments({
              fileUrl: uploadResult.secure_url,
              originalFilename: zipEntry.entryName,
              fileType: fileType,
              uploaderId: input.uploaderId,
              title: zipEntry.entryName.replace(/\.[^/.]+$/, "").replace(/_/g, ' '),
            });
             console.log(`AI processing started for ${zipEntry.entryName}.`);
          } catch (uploadError) {
              console.error(`Failed to process individual file ${zipEntry.entryName}:`, uploadError);
              // We'll log the error but not fail the entire zip operation
          }
        })();

        processingPromises.push(processPromise);

      }
      
      // Wait for all the file processing promises to settle.
      // This ensures we don't clean up the temp directory before uploads are done.
      await Promise.all(processingPromises);
      console.log('All file processing initiated.');


    } catch (error) {
        console.error('An error occurred during zip processing:', error);
        throw new Error(`Failed to process zip file: ${(error as Error).message}`);
    } finally {
        // 4. Clean up the temporary directory
        console.log(`Cleaning up temporary directory: ${tempDir}`);
        await fs.promises.rm(tempDir, { recursive: true, force: true });
    }

    return {
      fileCount,
      processedFiles,
    };
  }
);
