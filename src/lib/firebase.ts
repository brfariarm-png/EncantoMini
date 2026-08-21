import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

// Default embedded config to guarantee Vercel and production builds always connect to the correct Firestore database
const defaultFirebaseConfig = {
  projectId: "gen-lang-client-0657249394",
  appId: "1:483979230083:web:64fc6c408e63287edc54b6",
  apiKey: "AIzaSyAZrON71VrOd-q2tQ4nnRm9OkViFnJtQ28",
  authDomain: "gen-lang-client-0657249394.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-encantominicardp-5c6c68be-6772-4f1d-89b9-3ef74636b6b2",
  storageBucket: "gen-lang-client-0657249394.firebasestorage.app",
  messagingSenderId: "483979230083",
};

let config = defaultFirebaseConfig;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const appletConfig = require('../../firebase-applet-config.json');
  if (appletConfig && appletConfig.projectId) {
    config = { ...defaultFirebaseConfig, ...appletConfig };
  }
} catch {
  // Use default embedded config if json file is not present in build
}

const app = !getApps().length ? initializeApp(config) : getApp();

export const db = initializeFirestore(
  app,
  {
    ignoreUndefinedProperties: true,
  },
  config.firestoreDatabaseId || undefined
);

export default app;

