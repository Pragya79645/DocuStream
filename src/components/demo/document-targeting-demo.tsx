import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { classifyDocumentTargeting } from '@/lib/services/document-targeting.service';
import { DocumentTargetingClassification } from '@/lib/types';
import { Users, User, Crown, Briefcase, FileText, Target } from 'lucide-react';

const SAMPLE_DOCUMENTS = [
  {
    title: "Executive Budget Review - Engineering Department",
    content: "This confidential report is prepared for the CEO of Engineering to review Q3 budget allocations. Please review and approve additional funding for critical infrastructure upgrades. Management decision required by August 30th.",
    department: "eng"
  },
  {
    title: "All Staff Safety Training - Engineering Department",
    content: "Mandatory safety training for all engineering team members. All staff must attend the training session scheduled for August 15th. This applies to everyone in the engineering department.",
    department: "eng"
  },
  {
    title: "Marketing Manager Performance Review",
    content: "Quarterly performance review document for the Manager of Marketing. This confidential document contains performance metrics and improvement recommendations for management review only.",
    department: "mkt"
  },
  {
    title: "Company-Wide Holiday Schedule",
    content: "Holiday schedule announcement for all employees across all departments. Please mark your calendars and plan accordingly. This applies to the entire organization.",
    department: "hr"
  },
  {
    title: "Legal Counsel Required - Contract Review",
    content: "Urgent contract review required by our General Counsel. This matter requires immediate attention from the legal department head due to compliance implications.",
    department: "legal"
  }
];

export function DocumentTargetingDemo() {
  const [selectedSample, setSelectedSample] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [department, setDepartment] = useState('');
  const [classification, setClassification] = useState<DocumentTargetingClassification | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSampleSelect = (index: string) => {
    if (index && SAMPLE_DOCUMENTS[parseInt(index)]) {
      const sample = SAMPLE_DOCUMENTS[parseInt(index)];
      setTitle(sample.title);
      setContent(sample.content);
      setDepartment(sample.department);
      setSelectedSample(index);
    }
  };

  const handleAnalyze = async () => {
    if (!title || !content || !department) return;
    
    setIsAnalyzing(true);
    try {
      const result = classifyDocumentTargeting(title, content, department);
      setClassification(result);
    } catch (error) {
      console.error('Classification failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setContent('');
    setDepartment('');
    setClassification(null);
    setSelectedSample('');
  };

  const getTargetingIcon = () => {
    if (!classification) return <Target className="w-5 h-5" />;
    
    if (classification.targetingType === 'department') {
      return <Users className="w-5 h-5 text-blue-600" />;
    }
    
    if (classification.roleClassification) {
      switch (classification.roleClassification.roleLevel) {
        case 'executive':
          return <Crown className="w-5 h-5 text-purple-600" />;
        case 'management':
          return <Briefcase className="w-5 h-5 text-blue-600" />;
        default:
          return <User className="w-5 h-5 text-green-600" />;
      }
    }
    
    return <User className="w-5 h-5" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getTargetingColor = (targetingType: 'department' | 'role') => {
    return targetingType === 'department' 
      ? 'bg-blue-100 text-blue-800'
      : 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Targeting Classification Demo
          </CardTitle>
          <CardDescription>
            Test the AI system that automatically classifies whether documents are intended for entire departments or specific roles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="sample-select">Quick Start (Optional)</Label>
                <Select value={selectedSample} onValueChange={handleSampleSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a sample document..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SAMPLE_DOCUMENTS.map((sample, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {sample.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  placeholder="Enter document title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="department">Primary Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eng">Engineering</SelectItem>
                    <SelectItem value="mkt">Marketing</SelectItem>
                    <SelectItem value="fin">Finance</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="ops">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content">Document Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter document content or description..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleAnalyze}
                  disabled={!title || !content || !department || isAnalyzing}
                  className="flex-1"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Targeting'}
                </Button>
                <Button onClick={handleReset} variant="outline">
                  Reset
                </Button>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              <Label>Classification Results</Label>
              {classification ? (
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {getTargetingIcon()}
                      Classification Complete
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className={getTargetingColor(classification.targetingType)}>
                        {classification.targetingType === 'department' ? 'Department-wide' : 'Role-specific'}
                      </Badge>
                      <Badge className={getConfidenceColor(classification.confidence)}>
                        {Math.round(classification.confidence * 100)}% confidence
                      </Badge>
                    </div>

                    {classification.roleClassification && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Role Details:</h4>
                        <div className="space-y-1 text-sm">
                          <div><strong>Role:</strong> {classification.roleClassification.roleTitle}</div>
                          <div><strong>Level:</strong> {classification.roleClassification.roleLevel}</div>
                          <div><strong>Department:</strong> {classification.roleClassification.departmentId}</div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Reasoning:</h4>
                      <p className="text-sm text-muted-foreground">{classification.reasoning}</p>
                    </div>

                    {classification.detectedPatterns.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Detected Patterns:</h4>
                        <div className="flex flex-wrap gap-1">
                          {classification.detectedPatterns.map((pattern, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {pattern}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex items-center justify-center h-40 text-muted-foreground">
                    <div className="text-center">
                      <Target className="w-8 h-8 mx-auto mb-2" />
                      <p>Enter document details and click "Analyze Targeting" to see classification results</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How it Works Section */}
      <Card>
        <CardHeader>
          <CardTitle>How Document Targeting Classification Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Department-wide Documents
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Detected when documents contain keywords like:
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {['all team members', 'entire department', 'everyone in', 'department policy', 'team announcement'].map(keyword => (
                  <Badge key={keyword} variant="outline" className="text-xs">{keyword}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                Role-specific Documents
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Detected when documents contain keywords like:
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {['manager only', 'executives only', 'confidential', 'for approval', 'management decision'].map(keyword => (
                  <Badge key={keyword} variant="outline" className="text-xs">{keyword}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DocumentTargetingDemo;