import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  browserLocalPersistence,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  type User,
} from 'firebase/auth';
import { firebaseAuth, firebaseConfigured } from '../firebase/firebase';
import { getAuthErrorMessage } from './authErrors';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  startupError: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [startupError, setStartupError] = useState('');

  useEffect(() => {
    const auth = firebaseAuth;
    if (!auth) {
      setLoading(false);
      return;
    }

    let active = true;
    let unsubscribe = () => {};

    void (async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        if (active) setStartupError(getAuthErrorMessage(error));
      }

      try {
        await getRedirectResult(auth);
      } catch (error) {
        if (active) setStartupError(getAuthErrorMessage(error));
      }

      if (!active) return;
      unsubscribe = onAuthStateChanged(
        auth,
        (nextUser) => {
          if (!active) return;
          setUser(nextUser);
          setLoading(false);
        },
        (error) => {
          if (!active) return;
          setStartupError(getAuthErrorMessage(error));
          setLoading(false);
        },
      );
    })();

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ user, loading, configured: firebaseConfigured, startupError }),
    [user, loading, startupError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider.');
  return value;
}
