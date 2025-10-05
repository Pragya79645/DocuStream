declare module 'adm-zip' {
    class AdmZip {
        constructor(zipPathOrBuffer?: string | Buffer);
        addFile(entryName: string, data: Buffer, comment?: string, attr?: number): void;
        addLocalFile(localPath: string, zipPath?: string, zipName?: string): void;
        addZipComment(comment: string): void;
        addZipEntry(entryName: string, data: Buffer, comment?: string, attr?: number): void;
        getEntries(): IZipEntry[];
        getEntry(entryName: string): IZipEntry | null;
        extractAllTo(targetPath: string, overwrite?: boolean): void;
        extractEntryTo(entryName: string, targetPath: string, maintainEntryPath?: boolean, overwrite?: boolean): boolean;
        readZip(): void;
        readZip(zipPath: string): void;
        toBuffer(): Buffer;
        writeZip(targetPath?: string, callback?: (error: Error | null) => void): void;
    }

    export interface IZipEntry {
        entryName: string;
        rawEntryName: Buffer;
        comment: string;
        name: string;
        isDirectory: boolean;
        getCompressedData(): Buffer;
        getCompressedDataAsync(callback: (data: Buffer) => void): void;
        getData(): Buffer;
        getDataAsync(callback: (data: Buffer) => void): void;
        header: any;
    }

    export default AdmZip;
}
