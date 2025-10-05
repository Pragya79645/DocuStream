'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, ListTodo, Users, Folder, FileUp, FileSpreadsheet } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Document, Category, User } from '@/lib/types';
import { listenToAllDocuments } from '@/lib/client-services/documents.client.service';
import { getCategories } from '@/lib/services/categories.service';
import { getUsers } from '@/lib/services/users.service';
import { Button } from '../ui/button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';


export function ReportingAnalytics() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [cats, usersData] = await Promise.all([getCategories(), getUsers()]);
        setCategories(cats);
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch categories or users", error);
      }
    }
    
    fetchInitialData();
    
    const unsubscribe = listenToAllDocuments((docs) => {
      setDocuments(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const totalDocuments = documents.length;
  const totalUsers = users.length;
  const totalCategories = categories.length;

  const pendingActions = documents.reduce((acc, doc) => {
    return acc + doc.actionPoints.filter(ap => !ap.isCompleted).length;
  }, 0);
  
  const documentsPerCategory = categories.map(cat => ({
      name: cat.name,
      documents: documents.filter(doc => doc.categoryId === cat.id).length
  })).filter(item => item.documents > 0);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableData = documentsPerCategory.map(item => [item.name, item.documents]);
    
    doc.text("DocuSnap Analytics Report", 14, 16);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    autoTable(doc, {
        startY: 30,
        head: [['Metric', 'Value']],
        body: [
            ['Total Documents', totalDocuments],
            ['Pending Action Points', pendingActions],
            ['Total Users', totalUsers],
            ['Total Categories', totalCategories],
        ],
        theme: 'striped',
    })

    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Category', 'Number of Documents']],
        body: tableData,
        theme: 'grid',
    });

    doc.save('docsnap_report.pdf');
  };

  const handleExportExcel = () => {
    const summaryData = [
        { Metric: 'Total Documents', Value: totalDocuments },
        { Metric: 'Pending Action Points', Value: pendingActions },
        { Metric: 'Total Users', Value: totalUsers },
        { Metric: 'Total Categories', Value: totalCategories },
    ];
    const categoryData = documentsPerCategory;

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    const categorySheet = XLSX.utils.json_to_sheet(categoryData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Documents Per Category');
    
    XLSX.writeFile(workbook, 'docsnap_report.xlsx');
  };


  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <FileUp className="mr-2 h-4 w-4" />
                Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export Excel
            </Button>
        </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Points Pending</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingActions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Documents per Category</CardTitle>
        </CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={documentsPerCategory}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip wrapperClassName="!bg-popover !border-border" cursor={{fill: 'hsl(var(--accent))', opacity: 0.1}}/>
                    <Bar dataKey="documents" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
}
