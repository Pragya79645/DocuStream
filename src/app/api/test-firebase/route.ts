import { NextRequest, NextResponse } from 'next/server';
import { getDb, getFirebaseAdminStatus } from '@/lib/firebase/server-init';

export async function GET(request: NextRequest) {
  try {
    const status = getFirebaseAdminStatus();
    
    if (!status.isInitialized) {
      return NextResponse.json({
        success: false,
        error: 'Firebase Admin SDK not initialized',
        status
      }, { status: 500 });
    }

    // Test database connection
    const db = getDb();
    
    // Try to get a collection reference (doesn't actually fetch data)
    const usersRef = db.collection('users');
    
    return NextResponse.json({
      success: true,
      message: 'Firebase Admin SDK is working correctly',
      status,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Firebase test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: getFirebaseAdminStatus()
    }, { status: 500 });
  }
}