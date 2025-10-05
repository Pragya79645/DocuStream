import { ImageAnnotatorClient } from '@google-cloud/vision';
import { Translate } from '@google-cloud/translate/build/src/v2';

interface ProcessedDocument {
  originalText: string;
  detectedLanguage: string;
  translatedText: string;
  confidence: number;
}

interface DocumentAnalysis {
  text: ProcessedDocument;
  summary: string;
  actionPoints: string[];
  keyInsights: string[];
}

export class MultiLanguageProcessor {
  private visionClient: ImageAnnotatorClient;
  private translateClient: Translate;

  constructor() {
    // Initialize Google Cloud Vision client with API key
    this.visionClient = new ImageAnnotatorClient({
      apiKey: process.env.GCP_CLOUD_VISION
    });

    // Initialize Google Cloud Translate client with API key
    this.translateClient = new Translate({
      key: process.env.GCP_CLOUD_VISION // Using same key for simplicity
    });
  }

  /**
   * Extract text from document image using OCR
   */
  async extractTextFromImage(imageBuffer: Buffer): Promise<{
    text: string;
    confidence: number;
  }> {
    try {
      const [result] = await this.visionClient.textDetection({
        image: { content: imageBuffer }
      });

      const detections = result.textAnnotations;
      if (!detections || detections.length === 0) {
        throw new Error('No text detected in the document');
      }

      // The first annotation contains the full text
      const fullText = detections[0].description || '';
      
      // Calculate average confidence from all detected words
      const confidence = detections.length > 1 
        ? detections.slice(1).reduce((sum, detection) => {
            return sum + (detection.confidence || 0);
          }, 0) / (detections.length - 1)
        : 0.9; // Default confidence if no word-level data

      return {
        text: fullText,
        confidence: confidence
      };
    } catch (error) {
      console.error('Error extracting text from image:', error);
      throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Detect language and translate text to English
   */
  async translateToEnglish(text: string): Promise<ProcessedDocument> {
    try {
      // Detect language
      const [detection] = await this.translateClient.detect(text);
      const detectedLanguage = Array.isArray(detection) ? detection[0] : detection;
      
      const languageCode = detectedLanguage.language;
      const confidence = detectedLanguage.confidence || 0;

      let translatedText = text;
      
      // Only translate if not already in English
      if (languageCode !== 'en') {
        const [translation] = await this.translateClient.translate(text, 'en');
        translatedText = Array.isArray(translation) ? translation[0] : translation;
      }

      return {
        originalText: text,
        detectedLanguage: languageCode,
        translatedText: translatedText,
        confidence: confidence
      };
    } catch (error) {
      console.error('Error translating text:', error);
      // If translation fails, return original text
      return {
        originalText: text,
        detectedLanguage: 'unknown',
        translatedText: text,
        confidence: 0
      };
    }
  }

  /**
   * Process document: extract text, translate, and prepare for analysis
   */
  async processDocument(imageBuffer: Buffer): Promise<ProcessedDocument> {
    try {
      // Step 1: Extract text using OCR
      const { text: extractedText, confidence: ocrConfidence } = await this.extractTextFromImage(imageBuffer);
      
      if (!extractedText.trim()) {
        throw new Error('No readable text found in the document');
      }

      // Step 2: Translate to English
      const processedDocument = await this.translateToEnglish(extractedText);
      
      // Combine OCR and translation confidence
      processedDocument.confidence = (ocrConfidence + processedDocument.confidence) / 2;

      return processedDocument;
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  }

  /**
   * Generate professional summary from translated text
   */
  async generateSummary(translatedText: string): Promise<string> {
    // This will be enhanced with Gemini AI integration
    // For now, return a structured format
    const sentences = translatedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length <= 3) {
      return translatedText.trim();
    }

    // Simple extractive summary - take first, middle, and last meaningful sentences
    const summary = [
      sentences[0]?.trim(),
      sentences[Math.floor(sentences.length / 2)]?.trim(),
      sentences[sentences.length - 1]?.trim()
    ].filter(Boolean).join('. ') + '.';

    return summary;
  }

  /**
   * Extract action points from translated text
   */
  async extractActionPoints(translatedText: string): Promise<string[]> {
    const actionKeywords = [
      'must', 'should', 'need to', 'required', 'implement', 'ensure',
      'complete', 'submit', 'review', 'approve', 'update', 'maintain',
      'monitor', 'comply', 'follow', 'adhere', 'establish', 'develop'
    ];

    const sentences = translatedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const actionPoints = sentences
      .filter(sentence => {
        const lowerSentence = sentence.toLowerCase();
        return actionKeywords.some(keyword => lowerSentence.includes(keyword));
      })
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 10) // Filter out very short sentences
      .slice(0, 10); // Limit to 10 action points

    return actionPoints.length > 0 ? actionPoints : ['No specific action points identified in the document.'];
  }

  /**
   * Extract key insights from translated text
   */
  async extractKeyInsights(translatedText: string): Promise<string[]> {
    const insightKeywords = [
      'important', 'critical', 'significant', 'key', 'main', 'primary',
      'essential', 'crucial', 'vital', 'fundamental', 'major', 'principal'
    ];

    const sentences = translatedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const insights = sentences
      .filter(sentence => {
        const lowerSentence = sentence.toLowerCase();
        return insightKeywords.some(keyword => lowerSentence.includes(keyword));
      })
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 15)
      .slice(0, 5); // Limit to 5 key insights

    return insights.length > 0 ? insights : ['Document contains standard procedural information.'];
  }

  /**
   * Complete document analysis pipeline
   */
  async analyzeDocument(imageBuffer: Buffer): Promise<DocumentAnalysis> {
    try {
      // Process the document (OCR + Translation)
      const processedText = await this.processDocument(imageBuffer);
      
      // Generate analysis components
      const [summary, actionPoints, keyInsights] = await Promise.all([
        this.generateSummary(processedText.translatedText),
        this.extractActionPoints(processedText.translatedText),
        this.extractKeyInsights(processedText.translatedText)
      ]);

      return {
        text: processedText,
        summary,
        actionPoints,
        keyInsights
      };
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw error;
    }
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<{ status: string; services: Record<string, boolean> }> {
    const status = {
      vision: false,
      translate: false
    };

    try {
      // Test Vision API
      await this.visionClient.getProjectId();
      status.vision = true;
    } catch (error) {
      console.error('Vision API health check failed:', error);
    }

    try {
      // Test Translate API with simple text
      await this.translateClient.detect('Hello');
      status.translate = true;
    } catch (error) {
      console.error('Translate API health check failed:', error);
    }

    return {
      status: status.vision && status.translate ? 'healthy' : 'degraded',
      services: status
    };
  }
}

// Export singleton instance
export const multiLanguageProcessor = new MultiLanguageProcessor();