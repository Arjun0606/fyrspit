import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Validate required environment variables
const requiredEnvVars = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(`Missing required Firebase Admin environment variables: ${missingVars.join(', ')}`);
}

const serviceAccount: ServiceAccount = {
  projectId: requiredEnvVars.projectId!,
  clientEmail: requiredEnvVars.clientEmail!,
  privateKey: requiredEnvVars.privateKey!.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin
let app;
if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: requiredEnvVars.projectId,
    storageBucket: requiredEnvVars.storageBucket,
  });
} else {
  app = getApps()[0];
}

// Initialize Admin services
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export const adminStorage = getStorage(app);

export default app;
