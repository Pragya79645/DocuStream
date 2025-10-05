'use client';

import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, User as AuthUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/client-init';
import { getUserByEmail, createUser, getUserById } from '@/lib/services/users.service';
import type { User as AppUser } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  authUser: AuthUser | null;
  user: AppUser | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  authUser: null,
  user: null,
  loading: true,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setAuthUser(firebaseUser);
        let appUser = await getUserByEmail(firebaseUser.email!);

        if (!appUser) {
          // If user exists in Firebase Auth but not in our DB, they are a new sign-up
          console.log("Creating new user in Firestore DB...");
          const newUser: Omit<AppUser, 'id'> = {
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email!,
            avatarUrl: firebaseUser.photoURL || '',
            role: 'user', // Default role
            categoryIds: [], // Default empty categories
          };
          const newUserId = await createUser(newUser);
          appUser = await getUserById(newUserId);
        }
        setUser(appUser);

      } else {
        setAuthUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener will handle the rest
    } catch (error) {
      console.error("Error during sign in with email/password:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (_: string, email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener will handle the rest
    } catch (error) {
      console.error("Error during sign up with email/password:", error);
      throw error;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    // The onAuthStateChanged listener will clear user state
  };

  const value = { authUser, user, loading, signInWithEmail, signUpWithEmail, signOut };

  if (loading) {
     return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
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
