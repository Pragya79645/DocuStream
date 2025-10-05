/**
 * Client service for multi-language document processing
 */

export interface ProcessedDocument {
  originalText: string;
  detectedLanguage: string;
  translatedText: string;
  confidence: number;
  fileName?: string;
  fileType?: string;
}

export interface DocumentAnalysis {
  text: ProcessedDocument;
  summary: string;
  actionPoints: string[];
  keyInsights: string[];
  fileName?: string;
  fileType?: string;
}

export interface HealthStatus {
  status: string;
  services: Record<string, boolean>;
}

export class MultiLanguageProcessorClient {
  private baseUrl = '/api/multi-language-processor';

  /**
   * Process document with OCR and translation
   */
  async processDocument(file: File): Promise<ProcessedDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', 'process');

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || 'Failed to process document');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Complete document analysis with summary and action points
   */
  async analyzeDocument(file: File): Promise<DocumentAnalysis> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', 'analyze');

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || 'Failed to analyze document');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Extract text from image using OCR only
   */
  async extractText(file: File): Promise<{ extractedText: string; confidence: number; fileName?: string; fileType?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', 'extract-text');

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || 'Failed to extract text');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Translate text to English
   */
  async translateText(text: string): Promise<ProcessedDocument> {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('action', 'translate');

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || 'Failed to translate text');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Check service health
   */
  async healthCheck(): Promise<HealthStatus> {
    const response = await fetch(this.baseUrl, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Health check failed');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Check if a file type is supported for OCR
   */
  static isSupportedImageType(fileType: string): boolean {
    const supportedTypes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/gif', 
      'image/webp', 
      'image/bmp', 
      'image/tiff'
    ];
    return supportedTypes.includes(fileType.toLowerCase());
  }

  /**
   * Get supported file types for OCR
   */
  static getSupportedFileTypes(): string[] {
    return [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/gif', 
      'image/webp', 
      'image/bmp', 
      'image/tiff'
    ];
  }

  /**
   * Format language code to readable name
   */
  static formatLanguageName(languageCode: string): string {
    const languageNames: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'nl': 'Dutch',
      'pl': 'Polish',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'hi': 'Hindi',
      'ar': 'Arabic',
      'ta': 'Tamil',
      'te': 'Telugu',
      'ml': 'Malayalam',
      'kn': 'Kannada',
      'bn': 'Bengali',
      'gu': 'Gujarati',
      'mr': 'Marathi',
      'pa': 'Punjabi',
      'or': 'Odia',
      'unknown': 'Unknown'
    };

    return languageNames[languageCode] || languageCode.toUpperCase();
  }
}

// Export singleton instance
export const multiLanguageProcessorClient = new MultiLanguageProcessorClient();