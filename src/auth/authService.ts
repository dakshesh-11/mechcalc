import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { firebaseAuth } from '../firebase/firebase';
import { isPasswordValid } from './passwordPolicy';

function requireAuth() {
  if (!firebaseAuth) throw new Error('Firebase is not configured. Add the required VITE_FIREBASE values and restart the dev server.');
  return firebaseAuth;
}

export async function registerWithEmail(email: string, password: string, confirmPassword: string) {
  if (!isPasswordValid(password)) throw new Error('Password does not meet all listed requirements.');
  if (password !== confirmPassword) throw new Error('Passwords do not match.');
  const auth = requireAuth();
  await setPersistence(auth, browserLocalPersistence);
  return createUserWithEmailAndPassword(auth, email.trim(), password);
}

export async function signInWithEmail(email: string, password: string) {
  const auth = requireAuth();
  await setPersistence(auth, browserLocalPersistence);
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signInWithGoogle() {
  const auth = requireAuth();
  await setPersistence(auth, browserLocalPersistence);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  if (/(Android|iPhone|iPad|iPod|Mobile)/i.test(navigator.userAgent)) {
    await signInWithRedirect(auth, provider);
    return null;
  }

  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';
    if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw error;
  }
}

export async function sendPasswordReset(email: string) {
  const auth = requireAuth();
  return sendPasswordResetEmail(auth, email.trim());
}

export async function logOut() {
  const auth = requireAuth();
  return signOut(auth);
}
