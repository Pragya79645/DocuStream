'use server';

import { createComplianceDocument } from '@/lib/services/compliance.service';
import { getCategories } from '@/lib/services/categories.service';
import { getUsers } from '@/lib/services/users.service';
import { getAllDocuments } from '@/lib/services/documents.service';
import { ComplianceDocument } from '@/lib/types';

export async function seedComplianceData(): Promise<void> {
  try {
    console.log('Starting compliance data seeding...');

    // Get existing data to reference
    const [categories, users, documents] = await Promise.all([
      getCategories(),
      getUsers(),
      getAllDocuments()
    ]);

    if (categories.length === 0) {
      console.log('No categories found. Please seed categories first.');
      return;
    }

    if (users.length === 0) {
      console.log('No users found. Please seed users first.');
      return;
    }

    // Sample compliance documents
    const complianceDocuments = [
      {
        title: 'Annual Safety Compliance Report',
        description: 'Submit annual safety compliance report to regulatory authorities including all safety incidents, training records, and safety protocol updates.',
        dueDate: new Date('2025-09-30').toISOString(),
        categoryId: categories.find(cat => cat.name.toLowerCase().includes('safety'))?.id || categories[0].id,
        assignedToIds: users.slice(0, 2).map(user => user.id),
        documentId: documents.length > 0 ? documents[0].id : '',
        reminderDays: 7,
        status: 'due-soon' as const,
        notes: 'Include all safety incidents from the past year. Priority: High'
      },
      {
        title: 'Environmental Impact Assessment',
        description: 'Complete comprehensive environmental impact assessment for new metro line extension project.',
        dueDate: new Date('2025-10-15').toISOString(),
        categoryId: categories.find(cat => cat.name.toLowerCase().includes('environment'))?.id || categories[0].id,
        assignedToIds: users.slice(2, 4).map(user => user.id),
        documentId: documents.length > 1 ? documents[1].id : '',
        reminderDays: 14,
        status: 'on-track' as const,
        notes: 'Coordinate with environmental consultants and local authorities'
      },
      {
        title: 'Financial Audit Documentation',
        description: 'Prepare all financial documents, transaction records, and compliance reports for annual audit.',
        dueDate: new Date('2025-09-10').toISOString(),
        categoryId: categories.find(cat => cat.name.toLowerCase().includes('finance'))?.id || categories[0].id,
        assignedToIds: users.slice(1, 3).map(user => user.id),
        documentId: documents.length > 2 ? documents[2].id : '',
        reminderDays: 5,
        status: 'overdue' as const,
        notes: 'Auditors arriving next week. Immediate action required.'
      },
      {
        title: 'Operational Safety Certification Renewal',
        description: 'Renew operational safety certification for metro operations including rolling stock and infrastructure.',
        dueDate: new Date('2025-11-20').toISOString(),
        categoryId: categories.find(cat => cat.name.toLowerCase().includes('operations'))?.id || categories[0].id,
        assignedToIds: [users[0]?.id || ''].filter(Boolean),
        documentId: '',
        reminderDays: 30,
        status: 'on-track' as const,
        notes: 'Schedule inspection with certification authority'
      },
      {
        title: 'Emergency Response Plan Update',
        description: 'Update and submit emergency response plan including evacuation procedures and crisis management protocols.',
        dueDate: new Date('2025-12-01').toISOString(),
        categoryId: categories.find(cat => cat.name.toLowerCase().includes('safety'))?.id || categories[0].id,
        assignedToIds: users.slice(0, 3).map(user => user.id),
        documentId: '',
        reminderDays: 21,
        status: 'on-track' as const,
        notes: 'Include coordination with local emergency services'
      },
      {
        title: 'Quarterly Maintenance Compliance Report',
        description: 'Submit quarterly report on maintenance activities, equipment status, and compliance with maintenance standards.',
        dueDate: new Date('2025-10-05').toISOString(),
        categoryId: categories.find(cat => cat.name.toLowerCase().includes('maintenance') || cat.name.toLowerCase().includes('operations'))?.id || categories[0].id,
        assignedToIds: [users[users.length - 1]?.id || ''].filter(Boolean),
        documentId: '',
        reminderDays: 10,
        status: 'due-soon' as const,
        notes: 'Include preventive maintenance schedules and equipment lifecycle reports'
      },
      {
        title: 'Data Protection Compliance Audit',
        description: 'Complete data protection compliance audit including passenger data handling and privacy policy updates.',
        dueDate: new Date('2025-08-30').toISOString(),
        categoryId: categories.find(cat => cat.name.toLowerCase().includes('legal') || cat.name.toLowerCase().includes('admin'))?.id || categories[0].id,
        assignedToIds: users.slice(1, 2).map(user => user.id),
        documentId: '',
        reminderDays: 14,
        status: 'completed' as const,
        notes: 'Audit completed successfully. Certificate obtained.',
        completedAt: new Date('2025-08-25').toISOString()
      }
    ];

    console.log(`Creating ${complianceDocuments.length} compliance documents...`);

    for (const complianceDoc of complianceDocuments) {
      try {
        const id = await createComplianceDocument(complianceDoc);
        console.log(`Created compliance document: ${complianceDoc.title} (ID: ${id})`);
      } catch (error) {
        console.error(`Failed to create compliance document "${complianceDoc.title}":`, error);
      }
    }

    console.log('Compliance data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding compliance data:', error);
    throw new Error('Failed to seed compliance data');
  }
}

export async function clearComplianceData(): Promise<void> {
  console.log('Note: clearComplianceData function is not implemented for safety reasons.');
  console.log('To clear compliance data, use Firebase console or implement this function with proper safety checks.');
}