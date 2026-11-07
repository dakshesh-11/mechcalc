export function getAuthErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code: unknown }).code)
    : '';

  switch (code) {
    case 'auth/invalid-email': return 'Enter a valid email address.';
    case 'auth/user-disabled': return 'This account has been disabled. Contact support.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'The email or password is incorrect.';
    case 'auth/email-already-in-use': return 'An account already exists for this email. Try signing in.';
    case 'auth/weak-password': return 'Choose a stronger password that meets every requirement.';
    case 'auth/too-many-requests': return 'Too many attempts. Wait a moment and try again.';
    case 'auth/network-request-failed': return 'A network error interrupted authentication. Check your connection and retry.';
    case 'auth/popup-closed-by-user': return 'Google sign-in was closed before it finished.';
    case 'auth/popup-blocked': return 'The sign-in popup was blocked. Allow popups or use redirect sign-in.';
    case 'auth/cancelled-popup-request': return 'The Google sign-in request was cancelled.';
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid': return 'Firebase rejected the web API key. Re-copy the apiKey from this project’s Firebase web app configuration into VITE_FIREBASE_API_KEY, then restart Vite.';
    case 'auth/app-not-authorized': return 'This app or API key is not authorized for Firebase Authentication. Check the API key restrictions and Firebase project configuration.';
    case 'auth/invalid-oauth-client-id': return 'Google OAuth is not fully configured for this Firebase project. Re-open the Google provider settings, set the support email, and save.';
    case 'auth/operation-not-allowed': return 'This sign-in method is not enabled in the Firebase project.';
    case 'auth/unauthorized-domain': return 'This website host is not authorized in Firebase. Add localhost under Authentication → Settings → Authorized domains; enter the hostname only, without a port.';
    case 'auth/internal-error': return 'Firebase could not complete Google OAuth. Check the Google provider support email and OAuth setup in Firebase, then retry.';
    case 'auth/account-exists-with-different-credential': return 'An account already uses this email with another sign-in method.';
    case 'auth/requires-recent-login': return 'Sign in again before continuing with this security-sensitive action.';
    default:
      if (error instanceof Error && !('code' in error)) return error.message;
      return code
        ? `Firebase authentication failed (${code}). Check the Firebase provider and authorized-domain settings.`
        : 'Authentication could not be completed. Check your Firebase setup and try again.';
  }
}
