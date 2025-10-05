'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, FileText, Globe, CheckCircle } from 'lucide-react';
import { multiLanguageProcessorClient, DocumentAnalysis, ProcessedDocument, MultiLanguageProcessorClient } from '@/lib/client-services/multi-language-processor.client.service';

export function MultiLanguageProcessorDemo() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DocumentAnalysis | ProcessedDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingMode, setProcessingMode] = useState<'process' | 'analyze'>('analyze');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!MultiLanguageProcessorClient.isSupportedImageType(file.type)) {
        setError('Please select a supported image file (JPEG, PNG, GIF, WebP, BMP, TIFF)');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setResult(null);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      if (processingMode === 'analyze') {
        const analysis = await multiLanguageProcessorClient.analyzeDocument(selectedFile);
        setResult(analysis);
      } else {
        const processed = await multiLanguageProcessorClient.processDocument(selectedFile);
        setResult(processed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const isAnalysis = (data: any): data is DocumentAnalysis => {
    return data && 'summary' in data && 'actionPoints' in data;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Multi-Language Document Processor
          </CardTitle>
          <CardDescription>
            Upload an image document in any language. The system will extract text using OCR, 
            translate to English, and provide professional summaries and action points.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Processing Mode
            </label>
            <div className="flex gap-2">
              <Button
                variant={processingMode === 'process' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setProcessingMode('process')}
              >
                <FileText className="w-4 h-4 mr-1" />
                Extract & Translate Only
              </Button>
              <Button
                variant={processingMode === 'analyze' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setProcessingMode('analyze')}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Full Analysis
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Document Image
            </label>
            <input
              type="file"
              accept={MultiLanguageProcessorClient.getSupportedFileTypes().join(',')}
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <Button 
            onClick={handleProcess} 
            disabled={!selectedFile || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {processingMode === 'analyze' ? 'Analyze Document' : 'Process Document'}
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
            <CardDescription>
              Document processed successfully with multi-language support
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Language Detection */}
            <div>
              <h4 className="font-medium mb-2">Language Detection</h4>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {MultiLanguageProcessorClient.formatLanguageName(
                    'text' in result ? result.text.detectedLanguage : result.detectedLanguage
                  )}
                </Badge>
                <span className="text-sm text-gray-600">
                  Confidence: {Math.round(('text' in result ? result.text.confidence : result.confidence) * 100)}%
                </span>
              </div>
            </div>

            {/* Original Text */}
            <div>
              <h4 className="font-medium mb-2">Original Extracted Text</h4>
              <Textarea
                value={'text' in result ? result.text.originalText : result.originalText}
                readOnly
                rows={4}
                className="text-sm"
              />
            </div>

            {/* Translated Text */}
            <div>
              <h4 className="font-medium mb-2">Translated Text (English)</h4>
              <Textarea
                value={'text' in result ? result.text.translatedText : result.translatedText}
                readOnly
                rows={4}
                className="text-sm"
              />
            </div>

            {/* Analysis Results (if full analysis was performed) */}
            {isAnalysis(result) && (
              <>
                <div>
                  <h4 className="font-medium mb-2">Professional Summary</h4>
                  <Card className="bg-blue-50">
                    <CardContent className="pt-4">
                      <p className="text-sm">{result.summary}</p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Action Points</h4>
                  <div className="space-y-2">
                    {result.actionPoints.map((point, index) => (
                      <Card key={index} className="bg-green-50">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{point}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Key Insights</h4>
                  <div className="space-y-2">
                    {result.keyInsights.map((insight, index) => (
                      <Card key={index} className="bg-yellow-50">
                        <CardContent className="pt-4">
                          <p className="text-sm">{insight}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}