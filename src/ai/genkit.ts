import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});

// Export configuration for multi-language processing
export const multiLanguageConfig = {
  // Supported languages for document processing
  supportedLanguages: [
    'en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ru', 
    'ja', 'ko', 'zh', 'hi', 'ar', 'ta', 'te', 'ml', 'kn', 
    'bn', 'gu', 'mr', 'pa', 'or'
  ],
  
  // OCR confidence threshold
  ocrConfidenceThreshold: 0.5,
  
  // Translation confidence threshold
  translationConfidenceThreshold: 0.7,
  
  // Maximum file size for processing (10MB)
  maxFileSizeBytes: 10 * 1024 * 1024,
  
  // Supported image formats for OCR
  supportedImageFormats: [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
    'image/webp', 'image/bmp', 'image/tiff'
  ],
  
  // Processing timeouts
  timeouts: {
    ocr: 30000,        // 30 seconds
    translation: 15000, // 15 seconds
    analysis: 45000     // 45 seconds
  }
};
