'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Filter,
  FileText,
  Download,
  Calendar,
  User,
  Tag,
  BookOpen,
  Archive,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Document, Category, User as UserType } from '@/lib/types';
import { getAllDocuments } from '@/lib/services/documents.service';
import { getCategories } from '@/lib/services/categories.service';
import { getUsers } from '@/lib/services/users.service';
import { useToast } from '@/hooks/use-toast';

interface KnowledgeHubDocument extends Document {
  uploaderName?: string;
  categoryName?: string;
  hasProcessedSummary?: boolean;
}

export function KnowledgeHub() {
  const [documents, setDocuments] = useState<KnowledgeHubDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<KnowledgeHubDocument[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [summaryFilter, setSummaryFilter] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<KnowledgeHubDocument | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, selectedCategory, selectedDepartment, summaryFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docsData, categoriesData, usersData] = await Promise.all([
        getAllDocuments(),
        getCategories(),
        getUsers(),
      ]);

      // Enrich documents with additional information
      const enrichedDocuments: KnowledgeHubDocument[] = docsData.map(doc => {
        const uploader = usersData.find(user => user.id === doc.uploaderId);
        const category = categoriesData.find(cat => cat.id === doc.categoryId);
        
        return {
          ...doc,
          uploaderName: uploader?.name || 'Unknown User',
          categoryName: category?.name || 'Unknown Category',
          hasProcessedSummary: Boolean(doc.summary && doc.summary.trim()),
        };
      });

      setDocuments(enrichedDocuments);
      setCategories(categoriesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading knowledge hub data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load knowledge hub data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(term) ||
        doc.originalFilename.toLowerCase().includes(term) ||
        doc.summary?.toLowerCase().includes(term) ||
        doc.uploaderName?.toLowerCase().includes(term) ||
        doc.categoryName?.toLowerCase().includes(term) ||
        doc.crossDepartmentTags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.categoryId === selectedCategory);
    }

    // Department filter (based on cross-department tags or affected departments)
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(doc =>
        doc.affectedDepartmentIds?.includes(selectedDepartment) ||
        doc.categoryId === selectedDepartment
      );
    }

    // Summary filter
    if (summaryFilter === 'with-summary') {
      filtered = filtered.filter(doc => doc.hasProcessedSummary);
    } else if (summaryFilter === 'without-summary') {
      filtered = filtered.filter(doc => !doc.hasProcessedSummary);
    }

    setFilteredDocuments(filtered);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'processed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Processed</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="outline">Low Priority</Badge>;
      default:
        return null;
    }
  };

  const handleDownload = async (doc: KnowledgeHubDocument) => {
    if (doc.fileUrl) {
      try {
        const link = document.createElement('a');
        link.href = doc.fileUrl;
        link.download = doc.originalFilename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        toast({
          title: 'Download Failed',
          description: 'Unable to download the document',
          variant: 'destructive',
        });
      }
    }
  };

  const DocumentDetailsDialog = ({ document }: { document: KnowledgeHubDocument }) => (
    <DialogContent className="max-w-4xl max-h-[80vh]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {document.title}
        </DialogTitle>
      </DialogHeader>
      <ScrollArea className="max-h-[60vh]">
        <div className="space-y-6">
          {/* Document Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Document Information</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Original Filename:</strong> {document.originalFilename}</div>
                <div><strong>File Type:</strong> {document.fileType}</div>
                <div><strong>Uploaded:</strong> {formatDistanceToNow(new Date(document.uploadedAt))} ago</div>
                <div><strong>Uploader:</strong> {document.uploaderName}</div>
                <div><strong>Category:</strong> {document.categoryName}</div>
                <div><strong>Status:</strong> {getStatusBadge(document.status)}</div>
                {document.priority && (
                  <div><strong>Priority:</strong> {getPriorityBadge(document.priority)}</div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Cross-Department Information</h4>
              <div className="space-y-2 text-sm">
                {document.affectedDepartmentIds && document.affectedDepartmentIds.length > 0 && (
                  <div>
                    <strong>Affected Departments:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {document.affectedDepartmentIds.map(deptId => {
                        const dept = categories.find(c => c.id === deptId);
                        return (
                          <Badge key={deptId} variant="outline" className="text-xs">
                            {dept?.name || deptId}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
                {document.crossDepartmentTags && document.crossDepartmentTags.length > 0 && (
                  <div>
                    <strong>Tags:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {document.crossDepartmentTags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Document Summary */}
          {document.summary && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Document Summary
              </h4>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {document.summary}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Points */}
          {document.actionPoints && document.actionPoints.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Action Points</h4>
              <div className="space-y-2">
                {document.actionPoints.map((actionPoint, index) => (
                  <div key={actionPoint.id || index} className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      actionPoint.isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <span className={`text-sm ${
                      actionPoint.isCompleted ? 'line-through text-gray-500' : ''
                    }`}>
                      {actionPoint.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Information */}
          {document.isComplianceRelated && (
            <div>
              <h4 className="font-semibold mb-2">Compliance Information</h4>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm space-y-1">
                    <div><strong>Compliance Related:</strong> Yes</div>
                    {document.complianceDeadline && (
                      <div><strong>Deadline:</strong> {new Date(document.complianceDeadline).toLocaleDateString()}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="flex justify-end gap-2 pt-4">
        <Button 
          variant="outline" 
          onClick={() => handleDownload(document)}
          disabled={!document.fileUrl}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        {document.fileUrl && (
          <Button 
            variant="outline"
            onClick={() => window.open(document.fileUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open File
          </Button>
        )}
      </div>
    </DialogContent>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Archive className="h-8 w-8" />
          Knowledge Hub
        </h1>
        <p className="text-muted-foreground mt-2">
          Centralized repository of all organizational documents and their AI-generated summaries.
          All documents are stored permanently at the system level for complete institutional knowledge retention.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">With Summaries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {documents.filter(d => d.hasProcessedSummary).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compliance Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {documents.filter(d => d.isComplianceRelated).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cross-Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {documents.filter(d => d.affectedDepartmentIds && d.affectedDepartmentIds.length > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents, summaries, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={summaryFilter} onValueChange={setSummaryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by summary status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="with-summary">With Summary</SelectItem>
                <SelectItem value="without-summary">Without Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Uploader</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{document.title}</div>
                      <div className="text-sm text-muted-foreground">{document.originalFilename}</div>
                      {document.hasProcessedSummary && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          <BookOpen className="h-3 w-3 mr-1" />
                          Has Summary
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{document.categoryName}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {document.uploaderName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getStatusBadge(document.status)}
                      {document.priority && getPriorityBadge(document.priority)}
                      {document.isComplianceRelated && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          Compliance
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {document.crossDepartmentTags && document.crossDepartmentTags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {document.crossDepartmentTags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {document.crossDepartmentTags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{document.crossDepartmentTags.length - 2} more
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No tags</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      {formatDistanceToNow(new Date(document.uploadedAt))} ago
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DocumentDetailsDialog document={document} />
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(document)}
                        disabled={!document.fileUrl}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredDocuments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No documents found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}