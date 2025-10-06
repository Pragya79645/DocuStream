'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, ListTodo, Users, Folder, FileUp, Building2, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Document, Category, User } from '@/lib/types';
import { listenToAllDocuments } from '@/lib/client-services/documents.client.service';
import { getCategories } from '@/lib/services/categories.service';
import { getUsers } from '@/lib/services/users.service';
import { Button } from '../ui/button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type DepartmentEngagementData = {
  departmentId: string;
  departmentName: string;
  totalDocuments: number;
  pendingActionPoints: number;
  totalUsers: number;
  engagementScore: number;
  status: 'overloaded' | 'normal' | 'disengaged';
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export function DepartmentalEngagementReport() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentData, setDepartmentData] = useState<DepartmentEngagementData[]>([]);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [cats, usersData] = await Promise.all([getCategories(), getUsers()]);
        setCategories(cats || []);
        setUsers(usersData || []);
      } catch (error) {
        console.error("Failed to fetch categories or users", error);
        setCategories([]);
        setUsers([]);
      }
    }
    
    fetchInitialData();
    
    const unsubscribe = listenToAllDocuments((docs) => {
      setDocuments(docs || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      calculateDepartmentEngagement();
    } else if (!loading) {
      // If no categories but loading is complete, set empty data
      setDepartmentData([]);
    }
  }, [categories, users, documents, loading]);

  const calculateDepartmentEngagement = () => {
    const engagement: DepartmentEngagementData[] = categories.map(category => {
      // Get documents for this department
      const deptDocuments = documents.filter(doc => doc.categoryId === category.id);
      
      // Get users for this department
      const deptUsers = users.filter(user => user.categoryIds && user.categoryIds.includes(category.id));
      
      // Calculate pending action points for this department
      const pendingActionPoints = deptDocuments.reduce((acc, doc) => {
        return acc + (doc.actionPoints?.filter(ap => !ap.isCompleted).length || 0);
      }, 0);
      
      // Calculate engagement score (documents per user ratio with weighting for pending actions)
      const documentsPerUser = deptUsers.length > 0 ? deptDocuments.length / deptUsers.length : 0;
      const actionPointsPerUser = deptUsers.length > 0 ? pendingActionPoints / deptUsers.length : 0;
      
      // Engagement score formula: balance document volume with action point completion
      // Higher score = more overloaded, lower score = potentially disengaged
      const engagementScore = documentsPerUser + (actionPointsPerUser * 0.5);
      
      return {
        departmentId: category.id,
        departmentName: category.name,
        totalDocuments: deptDocuments.length,
        pendingActionPoints,
        totalUsers: deptUsers.length,
        engagementScore: Math.round(engagementScore * 100) / 100,
        status: 'normal' as 'overloaded' | 'normal' | 'disengaged'
      };
    });

    // Use fixed thresholds for stable and predictable status determination
    const OVERLOADED_THRESHOLD = 8.0;  // Departments with engagement score > 8.0 are overloaded
    const DISENGAGED_THRESHOLD = 2.0;  // Departments with engagement score < 2.0 are disengaged
    
    // Apply fixed threshold status determination
    engagement.forEach(dept => {
      if (dept.engagementScore > OVERLOADED_THRESHOLD && dept.totalDocuments > 0) {
        dept.status = 'overloaded';
      } else if (dept.engagementScore < DISENGAGED_THRESHOLD && dept.totalDocuments > 0 && dept.totalUsers > 0) {
        dept.status = 'disengaged';
      } else {
        dept.status = 'normal';
      }
    });

    setDepartmentData(engagement.sort((a, b) => b.engagementScore - a.engagementScore));
  };

  const handleExportPDF = () => {
    if (departmentData.length === 0) {
      alert('No data available to export');
      return;
    }

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text("Departmental Engagement Report", 14, 20);
    
    // Subtitle and date
    doc.setFontSize(12);
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generated on: ${currentDate}`, 14, 30);
    doc.text("Overview of departmental workload and engagement levels", 14, 36);

    // Summary statistics
    const totalDocs = departmentData.reduce((sum, dept) => sum + dept.totalDocuments, 0);
    const totalPending = departmentData.reduce((sum, dept) => sum + dept.pendingActionPoints, 0);
    const totalUsers = departmentData.reduce((sum, dept) => sum + dept.totalUsers, 0);
    const overloadedDepts = departmentData.filter(d => d.status === 'overloaded').length;
    const disengagedDepts = departmentData.filter(d => d.status === 'disengaged').length;

    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value']],
      body: [
        ['Total Documents', totalDocs.toString()],
        ['Total Pending Action Points', totalPending.toString()],
        ['Total Users', totalUsers.toString()],
        ['Total Departments', departmentData.length.toString()],
        ['Overloaded Departments', overloadedDepts.toString()],
        ['Disengaged Departments', disengagedDepts.toString()],
      ],
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Department details table
    const tableData = departmentData.map(dept => [
      dept.departmentName,
      dept.totalDocuments.toString(),
      dept.pendingActionPoints.toString(),
      dept.totalUsers.toString(),
      dept.engagementScore.toString(),
      dept.status.toUpperCase()
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [['Department', 'Documents', 'Pending Actions', 'Users', 'Engagement Score', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219] },
      bodyStyles: {
        cellPadding: 3,
      },
      columnStyles: {
        5: { // Status column
          cellWidth: 25,
          halign: 'center',
        }
      },
      didParseCell: function(data) {
        if (data.row.index >= 0 && data.column.index === 5) {
          const status = data.cell.text[0];
          if (status === 'OVERLOADED') {
            data.cell.styles.fillColor = [255, 99, 99]; // Light red
            data.cell.styles.textColor = [255, 255, 255];
          } else if (status === 'DISENGAGED') {
            data.cell.styles.fillColor = [255, 193, 7]; // Yellow
            data.cell.styles.textColor = [0, 0, 0];
          } else {
            data.cell.styles.fillColor = [40, 167, 69]; // Green
            data.cell.styles.textColor = [255, 255, 255];
          }
        }
      }
    });

    // Add insights section
    const insights = [];
    const overloaded = departmentData.filter(d => d.status === 'overloaded');
    const disengaged = departmentData.filter(d => d.status === 'disengaged');
    
    if (overloaded.length > 0) {
      insights.push(`Overloaded Departments: ${overloaded.map(d => d.departmentName).join(', ')}`);
    }
    if (disengaged.length > 0) {
      insights.push(`Potentially Disengaged: ${disengaged.map(d => d.departmentName).join(', ')}`);
    }
    
    if (insights.length > 0) {
      doc.setFontSize(14);
      doc.text("Key Insights:", 14, (doc as any).lastAutoTable.finalY + 25);
      doc.setFontSize(10);
      insights.forEach((insight, index) => {
        doc.text(`• ${insight}`, 14, (doc as any).lastAutoTable.finalY + 35 + (index * 8));
      });
    }

    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    doc.save(`departmental_engagement_report_${timestamp}.pdf`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overloaded': return 'text-red-600 bg-red-50';
      case 'disengaged': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overloaded': return <AlertTriangle className="h-4 w-4" />;
      case 'disengaged': return <AlertTriangle className="h-4 w-4" />;
      default: return <Building2 className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading departmental engagement data...</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Departments Found</h3>
          <p className="text-muted-foreground">Create some departments first to see engagement data.</p>
        </div>
      </div>
    );
  }

  // Summary statistics
  const totalDocuments = departmentData.reduce((sum, dept) => sum + dept.totalDocuments, 0);
  const totalPendingActions = departmentData.reduce((sum, dept) => sum + dept.pendingActionPoints, 0);
  const totalUsers = departmentData.reduce((sum, dept) => sum + dept.totalUsers, 0);
  const totalDepartments = departmentData.length;

  // Pie chart data for document distribution
  const pieData = departmentData
    .filter(dept => dept.totalDocuments > 0) // Only include departments with documents
    .map((dept, index) => ({
      name: dept.departmentName,
      value: dept.totalDocuments,
      color: COLORS[index % COLORS.length]
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Departmental Engagement Report</h2>
          <p className="text-muted-foreground">Identify workflow inefficiencies and overloaded teams</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportPDF}>
          <FileUp className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Summary Cards */}
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
            <CardTitle className="text-sm font-medium">Pending Action Points</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPendingActions}</div>
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
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDepartments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Department Engagement Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <XAxis 
                  dataKey="departmentName" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  wrapperClassName="!bg-popover !border-border" 
                  cursor={{fill: 'hsl(var(--accent))', opacity: 0.1}}
                  formatter={(value) => [`${value}`, 'Engagement Score']}
                />
                <Bar dataKey="engagementScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Department Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Department</th>
                  <th className="text-left p-2 font-medium">Documents</th>
                  <th className="text-left p-2 font-medium">Pending Actions</th>
                  <th className="text-left p-2 font-medium">Users</th>
                  <th className="text-left p-2 font-medium">Engagement Score</th>
                  <th className="text-left p-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {departmentData.map((dept) => (
                  <tr key={dept.departmentId} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{dept.departmentName}</td>
                    <td className="p-2">{dept.totalDocuments}</td>
                    <td className="p-2">{dept.pendingActionPoints}</td>
                    <td className="p-2">{dept.totalUsers}</td>
                    <td className="p-2">{dept.engagementScore}</td>
                    <td className="p-2">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dept.status)}`}>
                        {getStatusIcon(dept.status)}
                        {dept.status.charAt(0).toUpperCase() + dept.status.slice(1)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights Card */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {departmentData.filter(d => d.status === 'overloaded').length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900">Overloaded Departments</h4>
                  <p className="text-sm text-red-700">
                    {departmentData.filter(d => d.status === 'overloaded').map(d => d.departmentName).join(', ')} 
                    {departmentData.filter(d => d.status === 'overloaded').length === 1 ? ' has' : ' have'} high document volume and pending actions.
                  </p>
                </div>
              </div>
            )}
            {departmentData.filter(d => d.status === 'disengaged').length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Potentially Disengaged</h4>
                  <p className="text-sm text-yellow-700">
                    {departmentData.filter(d => d.status === 'disengaged').map(d => d.departmentName).join(', ')} 
                    {departmentData.filter(d => d.status === 'disengaged').length === 1 ? ' shows' : ' show'} low engagement levels.
                  </p>
                </div>
              </div>
            )}
            {departmentData.filter(d => d.status === 'normal').length === departmentData.length && (
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                <Building2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">All Departments Operating Normally</h4>
                  <p className="text-sm text-green-700">
                    All departments show healthy engagement levels and manageable workloads.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}