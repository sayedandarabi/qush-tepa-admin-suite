import React, { createContext, useContext, useEffect, useState } from 'react';
import { blink, type Branch } from '@/lib/blink';

interface AuthContextType {
  user: any;
  isLoading: boolean;
  branch: Branch | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [branch, setBranch] = useState<Branch | null>(null);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      setIsLoading(state.isLoading);
      
      if (state.user) {
        // In a real app, role/branch would come from user metadata or a separate profile table
        // For this MVP, we'll check metadata or default to 'super_admin' if none exists
        const userBranch = (state.user.metadata?.branch as Branch) || 'super_admin';
        setBranch(userBranch);
      } else {
        setBranch(null);
      }
    });

    return unsubscribe;
  }, []);

  const login = () => blink.auth.login();
  const logout = () => blink.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, isLoading, branch, login, logout }}>
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
