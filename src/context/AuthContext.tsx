import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, githubProvider, serverTimestamp } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (provider?: 'google' | 'github') => Promise<void>;
  signInEmail: (email: string, pass: string, isSignUp?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const profileData = docSnap.data() as UserProfile;
          const isAdminEmail = user.email === 'pedrosoenzo627@gmail.com';
          
          if (isAdminEmail && profileData.role !== 'admin') {
            profileData.role = 'admin';
            await setDoc(docRef, { role: 'admin' }, { merge: true });
          }
          setProfile(profileData);
        } else {
          // Check if this is the owner email
          const isAdminEmail = user.email === 'pedrosoenzo627@gmail.com';
          
          // Create default profile
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            role: isAdminEmail ? 'admin' : 'user',
            createdAt: serverTimestamp() as any,
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (provider: 'google' | 'github' = 'google') => {
    try {
      const p = provider === 'google' ? googleProvider : githubProvider;
      await signInWithPopup(auth, p);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') return;
      console.error(`${provider} Login failed:`, error);
      throw error;
    }
  };

  const signInEmail = async (email: string, pass: string, isSignUp = false) => {
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, pass);
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
      }
    } catch (error: any) {
      console.error("Email auth failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signInEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
