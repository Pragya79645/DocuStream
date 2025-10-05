import 'dotenv/config';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { User, Document, AuditLogEntry, Category, Notification } from './types';

// Hardcoded data to be seeded
const usersData: Omit<User, 'id'>[] = [
  {
    name: 'Admin User',
    email: 'admin@kmrl.co.in',
    avatarUrl: 'https://i.pravatar.cc/150?u=admin',
    categoryIds: ['fin', 'hr', 'maint', 'ops', 'eng', 'legal', 'proc', 'safety'],
    role: 'admin',
  },
  {
    name: 'Anoop Menon - Operations Director',
    email: 'anoop.menon@kmrl.co.in',
    avatarUrl: 'https://i.pravatar.cc/150?u=anoop',
    categoryIds: ['ops', 'safety'],
    role: 'user',
    departmentRoles: {
      'ops': {
        roleTitle: 'Operations Director',
        roleLevel: 'executive'
      },
      'safety': {
        roleTitle: 'Safety Commissioner',
        roleLevel: 'executive'
      }
    }
  },
  {
    name: 'Priya Nair - Finance Manager',
    email: 'priya.nair@kmrl.co.in',
    avatarUrl: 'https://i.pravatar.cc/150?u=priya',
    categoryIds: ['fin', 'proc'],
    role: 'user',
    departmentRoles: {
      'fin': {
        roleTitle: 'Finance Manager',
        roleLevel: 'management'
      },
      'proc': {
        roleTitle: 'Procurement Specialist',
        roleLevel: 'senior'
      }
    }
  },
  {
    name: 'Rajesh Kumar - Senior Engineer',
    email: 'rajesh.kumar@kmrl.co.in',
    avatarUrl: 'https://i.pravatar.cc/150?u=rajesh',
    categoryIds: ['maint', 'eng'],
    role: 'user',
    departmentRoles: {
      'eng': {
        roleTitle: 'Senior Engineer',
        roleLevel: 'senior'
      },
      'maint': {
        roleTitle: 'Maintenance Specialist',
        roleLevel: 'senior'
      }
    }
  },
  {
    name: 'Sunita George - HR Director',
    email: 'sunita.george@kmrl.co.in',
    avatarUrl: 'https://i.pravatar.cc/150?u=sunita',
    categoryIds: ['hr', 'legal'],
    role: 'user',
    departmentRoles: {
      'hr': {
        roleTitle: 'HR Director',
        roleLevel: 'executive'
      },
      'legal': {
        roleTitle: 'Legal Counsel',
        roleLevel: 'senior'
      }
    }
  },
  // Add some regular department members without specific roles
  {
    name: 'John Smith - Engineering Team Member',
    email: 'john.smith@kmrl.co.in',
    avatarUrl: 'https://i.pravatar.cc/150?u=john',
    categoryIds: ['eng'],
    role: 'user',
    // No departmentRoles - this means they're a regular team member
  },
  {
    name: 'Sarah Wilson - Finance Team Member',
    email: 'sarah.wilson@kmrl.co.in',
    avatarUrl: 'https://i.pravatar.cc/150?u=sarah',
    categoryIds: ['fin'],
    role: 'user',
    // No departmentRoles - this means they're a regular team member
  },
];

const documentsData: {data: Omit<Document, 'id'| 'uploadedAt' | 'uploaderId'>, uploaderEmail: string}[] = [
  {
    uploaderEmail: 'priya.nair@kmrl.co.in',
    data: {
      title: 'Q2 Vendor Invoice Summary',
      originalFilename: 'vendor_invoices_q2_2024.pdf',
      fileType: 'PDF',
      categoryId: 'fin',
      targetingType: 'department',
      status: 'processed',
      actionPoints: [
        { id: 'ap-1-1', text: 'Verify payment to "ABC Suppliers" for order #5821', isCompleted: true },
        { id: 'ap-1-2', text: 'Flag invoice from "Creative Solutions" for discrepancy review', isCompleted: false },
        { id: 'ap-1-3', text: 'Process payment for all verified invoices by July 25th', isCompleted: false },
      ],
      fileUrl: '#',
    }
  },
  {
    uploaderEmail: 'sunita.george@kmrl.co.in',
    data: {
      title: 'New Employee Onboarding Policy',
      originalFilename: 'KMRL_Onboarding_V3.docx',
      fileType: 'DOCX',
      categoryId: 'hr',
      targetingType: 'department',
      status: 'processed',
      actionPoints: [
        { id: 'ap-2-1', text: 'Update HR portal with the new policy document', isCompleted: true },
        { id: 'ap-2-2', text: 'Schedule briefing session for all line managers', isCompleted: false },
      ],
      fileUrl: '#',
    }
  },
  {
    uploaderEmail: 'rajesh.kumar@kmrl.co.in',
    data: {
      title: 'Rolling Stock Maintenance Schedule - July',
      originalFilename: 'July_Maintenance_Plan.pdf',
      fileType: 'PDF',
      categoryId: 'maint',
      targetingType: 'department',
      status: 'processed',
      actionPoints: [
        { id: 'ap-3-1', text: 'Schedule brake system check for Train Set 04', isCompleted: true },
        { id: 'ap-3-2', text: 'Order replacement HVAC filters for all trains', isCompleted: true },
        { id: 'ap-3-3', text: 'Perform software update on Train Set 08 control unit', isCompleted: false },
      ],
      fileUrl: '#',
    }
  },
  {
    uploaderEmail: 'anoop.menon@kmrl.co.in',
    data: {
      title: 'Incident Report - Aluva Station',
      originalFilename: 'aluva_incident_110724.docx',
      fileType: 'DOCX',
      categoryId: 'safety',
      targetingType: 'role',
      specificRole: 'Safety Commissioner',
      roleClassification: {
        departmentId: 'safety',
        roleTitle: 'Safety Commissioner',
        roleLevel: 'executive',
        confidence: 0.9
      },
      status: 'processed',
      actionPoints: [
        { id: 'ap-4-1', text: 'Review CCTV footage of the platform area at 17:45', isCompleted: false },
        { id: 'ap-4-2', text: 'Interview station controller on duty', isCompleted: false },
        { id: 'ap-4-3', text: 'Submit final report to Safety Commissioner by July 20th', isCompleted: false },
      ],
      fileUrl: '#',
    }
  },
  {
    uploaderEmail: 'admin@kmrl.co.in',
    data: {
      title: 'Executive Budget Review - Engineering Department',
      originalFilename: 'eng_budget_executive_review.pdf',
      fileType: 'PDF',
      categoryId: 'eng',
      targetingType: 'role',
      specificRole: 'CEO of Engineering',
      roleClassification: {
        departmentId: 'eng',
        roleTitle: 'CEO of Engineering',
        roleLevel: 'executive',
        confidence: 0.95
      },
      status: 'processed',
      priority: 'high',
      actionPoints: [
        { id: 'ap-5-1', text: 'Review Q3 budget allocations for critical projects', isCompleted: false },
        { id: 'ap-5-2', text: 'Approve additional funding for infrastructure upgrades', isCompleted: false },
        { id: 'ap-5-3', text: 'Schedule executive meeting with Finance team', isCompleted: false },
      ],
      fileUrl: '#',
    }
  },
  {
    uploaderEmail: 'admin@kmrl.co.in',
    data: {
      title: 'All Staff Safety Training - Engineering Department',
      originalFilename: 'eng_safety_training_all_staff.pdf',
      fileType: 'PDF',
      categoryId: 'eng',
      targetingType: 'department',
      status: 'processed',
      priority: 'medium',
      actionPoints: [
        { id: 'ap-6-1', text: 'Attend mandatory safety training session by August 15th', isCompleted: false },
        { id: 'ap-6-2', text: 'Complete online safety certification', isCompleted: false },
        { id: 'ap-6-3', text: 'Update safety protocols documentation', isCompleted: false },
      ],
      fileUrl: '#',
    }
  },
];

const auditLogData: {data: Omit<AuditLogEntry, 'id' | 'timestamp' | 'userId'>, userEmail: string}[] = [
    { userEmail: 'priya.nair@kmrl.co.in', data: { action: 'UPLOAD', details: 'Uploaded "vendor_invoices_q2_2024.pdf". AI categorized as Finance.' }},
    { userEmail: 'admin@kmrl.co.in', data: { action: 'REASSIGN', details: 'Reassigned "aluva_incident_110724.docx" from Operations to Safety.' }},
    { userEmail: 'rajesh.kumar@kmrl.co.in', data: { action: 'UPDATE_STATUS', details: 'Marked "Schedule brake system check for Train Set 04" as completed.' }},
    { userEmail: 'sunita.george@kmrl.co.in', data: { action: 'UPLOAD', details: 'Uploaded "KMRL_Onboarding_V3.docx". AI categorized as HR.' }},
    { userEmail: 'admin@kmrl.co.in', data: { action: 'ADD_USER', details: 'Invited "new.employee@kmrl.co.in" to the HR category.' }},
    { userEmail: 'anoop.menon@kmrl.co.in', data: { action: 'DOWNLOAD_REPORT', details: 'Downloaded report for Operations department.' }},
];

const categoriesData: {id: string, data: Omit<Category, 'id'>}[] = [
  { id: 'fin', data: { name: 'Finance', icon: 'Briefcase' } },
  { id: 'hr', data: { name: 'HR', icon: 'Users' } },
  { id: 'maint', data: { name: 'Maintenance', icon: 'Wrench' } },
  { id: 'ops', data: { name: 'Operations', icon: 'Train' } },
  { id: 'eng', data: { name: 'Engineering', icon: 'HardHat' } },
  { id: 'legal', data: { name: 'Legal', icon: 'Scale' } },
  { id: 'proc', data: { name: 'Procurement', icon: 'ShoppingCart' } },
  { id: 'safety', data: { name: 'Safety', icon: 'Shield' } },
];


async function main() {
  try {
    const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!serviceAccount) {
      throw new Error('The GOOGLE_APPLICATION_CREDENTIALS environment variable is not set. Make sure to point it to your service account JSON file.');
    }

    initializeApp({
      credential: cert(serviceAccount),
    });

    const db = getFirestore();
    console.log('Firebase Initialized.');

    // Clear existing data
    console.log('Clearing existing data...');
    const collectionsToClear = ['users', 'documents', 'auditLog', 'categories', 'notifications'];
    for (const collectionName of collectionsToClear) {
        const snapshot = await db.collection(collectionName).get();
        if (!snapshot.empty) {
            const batch = db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log(`Cleared collection: ${collectionName}`);
        }
    }
    
    // Seeding with new batch
    const seedingBatch = db.batch();
    
    console.log('Seeding categories...');
    for (const category of categoriesData) {
        const docRef = db.collection('categories').doc(category.id);
        seedingBatch.set(docRef, category.data);
    }

    console.log('Seeding users...');
    const userEmailToIdMap: { [email: string]: string } = {};
    for (const user of usersData) {
      const docRef = db.collection('users').doc(); // Auto-generate ID
      seedingBatch.set(docRef, user);
      userEmailToIdMap[user.email] = docRef.id;
    }
    
    // Need to commit users and categories first to get their IDs
    await seedingBatch.commit();
    console.log("Users and Categories committed.");

    // We need to resolve user IDs for documents and logs, so we'll do this in a separate loop
    const userDocs = await db.collection('users').get();
    userDocs.forEach(doc => {
      const user = doc.data() as User;
      userEmailToIdMap[user.email] = doc.id;
    });


    const finalBatch = db.batch();

    console.log('Seeding documents...');
    const docIdMap: {[key: string]: string} = {};
    for (const doc of documentsData) {
      const uploaderId = userEmailToIdMap[doc.uploaderEmail];
      if (!uploaderId) {
        console.warn(`Could not find user with email ${doc.uploaderEmail} for document "${doc.data.title}"`);
        continue;
      }
      const docRef = db.collection('documents').doc(); // Auto-generate ID
      const timestamp = Timestamp.now();
      finalBatch.set(docRef, { ...doc.data, uploaderId, uploadedAt: timestamp });
      docIdMap[doc.data.title] = docRef.id;
    }

    console.log('Seeding audit log...');
    for (const log of auditLogData) {
      const userId = userEmailToIdMap[log.userEmail];
      if (!userId) {
         console.warn(`Could not find user with email ${log.userEmail} for audit log`);
         continue;
      }
        const docRef = db.collection('auditLog').doc();
        const timestamp = Timestamp.now();
        finalBatch.set(docRef, { ...log.data, userId, timestamp });
    }

    // Add initial notifications
    const priyaId = userEmailToIdMap['priya.nair@kmrl.co.in'];
    const anoopId = userEmailToIdMap['anoop.menon@kmrl.co.in'];

    if (priyaId) {
        finalBatch.set(db.collection('notifications').doc(), {
            userId: priyaId,
            message: 'Action item assigned: "Flag invoice..."',
            href: `/dashboard/doc/${docIdMap['Q2 Vendor Invoice Summary']}`,
            isRead: false,
            createdAt: Timestamp.now()
        });
    }
     if (anoopId) {
        finalBatch.set(db.collection('notifications').doc(), {
            userId: anoopId,
            message: 'New document in Safety: "Incident Report..."',
            href: `/dashboard/doc/${docIdMap['Incident Report - Aluva Station']}`,
            isRead: false,
            createdAt: Timestamp.now()
        });
         finalBatch.set(db.collection('notifications').doc(), {
            userId: anoopId,
            message: 'Document "Station Cleanliness Report" was processed.',
            href: `#`,
            isRead: true,
            createdAt: Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        });
    }

    await finalBatch.commit();
    console.log('Database seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main();
