import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  loginEmail: (email: string, pass: string) => Promise<void>;
  registerEmail: (email: string, pass: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Initialize user doc if not exists
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            email: user.email,
            username: user.displayName || user.email?.split('@')[0],
            balanceObligations: 0,
            balancePersonal: 0,
            balanceInvestment: 0,
            totalIncome: 0,
            totalExpenses: 0,
            splitObligations: 20,
            splitPersonal: 30,
            splitInvestment: 50,
            updatedAt: serverTimestamp(),
          });
        }
      }
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerEmail = async (email: string, pass: string, username: string) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(newUser, { displayName: username });
    
    // Explicitly create firestore doc to ensure username is saved
    const userRef = doc(db, 'users', newUser.uid);
    await setDoc(userRef, {
      email: newUser.email,
      username: username,
      balanceObligations: 0,
      balancePersonal: 0,
      balanceInvestment: 0,
      totalIncome: 0,
      totalExpenses: 0,
      splitObligations: 20,
      splitPersonal: 30,
      splitInvestment: 50,
      updatedAt: serverTimestamp(),
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginEmail, registerEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
