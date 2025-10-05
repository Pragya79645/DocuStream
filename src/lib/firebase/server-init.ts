
import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// Ensure Firebase Admin SDK is only initialized once
let firebaseAdminApp: admin.app.App | null = null;

// Get service account from environment variable
function getServiceAccount() {
  const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (!serviceAccountJson) {
    console.error('GOOGLE_APPLICATION_CREDENTIALS environment variable is not set');
    throw new Error('Firebase service account credentials not configured. Please set GOOGLE_APPLICATION_CREDENTIALS environment variable.');
  }

  if (typeof serviceAccountJson !== 'string' || serviceAccountJson.trim() === '') {
    console.error('GOOGLE_APPLICATION_CREDENTIALS is empty or not a string');
    throw new Error('Firebase service account credentials are empty.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    // Validate required fields
    const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
    const missingFields = requiredFields.filter(field => !serviceAccount[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields in service account:', missingFields);
      throw new Error(`Service account is missing required fields: ${missingFields.join(', ')}`);
    }
    
    return serviceAccount;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS as JSON:', error.message);
      throw new Error('Invalid JSON format in GOOGLE_APPLICATION_CREDENTIALS environment variable');
    }
    throw error;
  }
}

export function initializeFirebaseAdmin() {
  // Debug logging
  console.log('initializeFirebaseAdmin called');
  console.log('admin object type:', typeof admin);
  console.log('admin object keys:', admin ? Object.keys(admin) : 'admin is undefined');
  console.log('admin.apps:', admin?.apps);
  console.log('admin.initializeApp:', typeof admin?.initializeApp);

  // Check if admin SDK is available
  if (!admin) {
    console.error('Firebase Admin SDK is not available');
    throw new Error('Firebase Admin SDK is not available. Please ensure firebase-admin is properly installed.');
  }

  if (typeof admin.initializeApp !== 'function') {
    console.error('admin.initializeApp is not a function, type:', typeof admin.initializeApp);
    throw new Error('Firebase Admin SDK initializeApp method is not available.');
  }

  // Return existing app if already initialized
  if (firebaseAdminApp) {
    console.log('Using existing Firebase Admin app');
    return firebaseAdminApp;
  }

  // Check if admin SDK is already initialized
  if (admin.apps && admin.apps.length > 0) {
    console.log('Using existing admin.apps[0]');
    firebaseAdminApp = admin.apps[0];
    return firebaseAdminApp;
  }

  try {
    console.log('Getting service account...');
    const serviceAccount = getServiceAccount();
    console.log('Service account obtained, project_id:', serviceAccount?.project_id);
    
    if (!serviceAccount || !serviceAccount.project_id) {
      throw new Error('Service account credentials are missing or malformed.');
    }
    
    console.log('About to call admin.initializeApp...');
    // Initialize the app
    firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as ServiceAccount),
      projectId: serviceAccount.project_id,
    });
    
    console.log('Firebase Admin SDK initialized successfully.');
    return firebaseAdminApp;
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
    throw error; // Re-throw to ensure proper error handling
  }
}

// Don't initialize Firebase Admin on module load to avoid issues
// Initialize on first use instead
console.log('Firebase server-init module loaded');

// Helper function to check Firebase Admin SDK status
export function getFirebaseAdminStatus() {
  return {
    isInitialized: firebaseAdminApp !== null || (admin.apps && admin.apps.length > 0),
    appCount: admin.apps ? admin.apps.length : 0,
    hasCredentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
  };
}

// Export a function to get the db instance, ensuring initialization first.
export function getDb() {
  try {
    const app = initializeFirebaseAdmin();
    return app ? admin.firestore(app) : admin.firestore();
  } catch (error) {
    console.error('Error getting Firestore database:', error);
    throw new Error('Firebase Admin SDK not initialized.');
  }
}

// Export a function to get the storage instance.
export function getStorage() {
  try {
    const app = initializeFirebaseAdmin();
    return app ? admin.storage(app) : admin.storage();
  } catch (error) {
    console.error('Error getting Firebase Storage:', error);
    throw new Error('Firebase Admin SDK not initialized.');
  }
}

