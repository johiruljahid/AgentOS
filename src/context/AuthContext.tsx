import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, googleSignIn, logout as fbLogout, initAuth, setAccessToken, testConnection } from '../lib/firebase';
import { firestoreService } from '../lib/firestore-service';
import { googleWorkspace } from '../lib/google-services';
import { UserProfile, AgentConfig, DriveKnowledge } from '../types';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  profile: UserProfile | null;
  agentConfig: AgentConfig | null;
  isLoading: boolean;
  needsAuth: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  signOutUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshDriveKnowledge: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [agentConfig, setAgentConfig] = useState<AgentConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);

  // Initialize auth listener
  useEffect(() => {
    testConnection();

    const unsubscribe = initAuth(
      async (currentUser, token) => {
        setUser(currentUser);
        setNeedsAuth(false);
        if (token) setToken(token);
        if (currentUser) {
          await loadUserData(currentUser, token);
        }
        setIsLoading(false);
      },
      async () => {
        const savedGuest = localStorage.getItem('agentos_guest_uid');
        if (savedGuest) {
          const guestUser: any = {
            uid: savedGuest,
            displayName: 'Agent Operator (Johirul)',
            email: 'johirul4873@gmail.com',
            isAnonymous: true,
            getIdToken: async () => 'operator_token',
          };
          setUser(guestUser);
          setNeedsAuth(false);
          await loadUserData(guestUser, null);
          setIsLoading(false);
          return;
        }
        setUser(null);
        setToken(null);
        setProfile(null);
        setAgentConfig(null);
        setNeedsAuth(true);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const loadUserData = async (currentUser: User, currentToken: string | null) => {
    try {
      // 1. Fetch or initialize UserProfile
      let p = await firestoreService.getUserProfile(currentUser.uid);
      if (!p) {
        p = {
          userId: currentUser.uid,
          fullName: currentUser.displayName || 'Authorized User',
          email: currentUser.email || '',
          preferredName: currentUser.displayName?.split(' ')[0] || 'User',
          skills: ['Research', 'Data Analysis', 'Documentation'],
          preferredLanguage: 'English',
          preferredEmailStyle: 'Professional and concise',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await firestoreService.upsertUserProfile(currentUser.uid, p);

        // Bootstrap initial default instructions
        await firestoreService.saveInstruction(currentUser.uid, {
          id: 'inst_safety_payments',
          userId: currentUser.uid,
          title: 'Mandatory Payment Approval',
          content: 'Never make or approve any payment independently. Always request explicit confirmation with merchant, amount, and reason.',
          category: 'PAYMENTS',
          isActive: true,
          priority: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        await firestoreService.saveInstruction(currentUser.uid, {
          id: 'inst_email_style',
          userId: currentUser.uid,
          title: 'Professional Communication',
          content: 'Draft emails with clear subject lines, polite greetings, structured bullets, and appropriate attachments.',
          category: 'COMMUNICATION',
          isActive: true,
          priority: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setProfile(p);

      // 2. Fetch or initialize AgentConfig
      let ac = await firestoreService.getAgentConfig(currentUser.uid);
      if (!ac) {
        ac = {
          userId: currentUser.uid,
          agentName: 'AgentOS Prime',
          status: 'IDLE',
          autonomyLevel: 'FULL_AUTONOMOUS',
          thinkingLevel: 'HIGH',
          activeModel: 'gemini-3.5-flash',
          emailNotificationsEnabled: true,
          autoSaveDriveReports: true,
          totalTasksExecuted: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await firestoreService.upsertAgentConfig(currentUser.uid, ac);
      }
      setAgentConfig(ac);

      // 3. Scan Drive Knowledge if token exists
      if (currentToken) {
        scanAndIndexDrive(currentUser.uid, currentToken);
      }
    } catch (err) {
      console.warn('Error loading user profile or config:', err);
    }
  };

  const scanAndIndexDrive = async (userId: string, token: string) => {
    try {
      const files = await googleWorkspace.listFiles(token);
      for (const f of files) {
        let category: DriveKnowledge['category'] = 'OTHER';
        const lowerName = f.name.toLowerCase();
        if (lowerName.includes('cv') || lowerName.includes('resume')) category = 'CV';
        else if (lowerName.includes('cert') || lowerName.includes('degree')) category = 'CERTIFICATE';
        else if (f.mimeType.includes('spreadsheet') || lowerName.endsWith('.csv') || lowerName.endsWith('.xlsx'))
          category = 'SPREADSHEET';
        else if (f.mimeType.includes('document') || lowerName.endsWith('.docx') || lowerName.endsWith('.pdf'))
          category = 'DOC';
        else if (f.mimeType.includes('presentation') || lowerName.endsWith('.pptx'))
          category = 'PRESENTATION';

        const item: DriveKnowledge = {
          id: `file_${f.id.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
          userId,
          fileId: f.id,
          name: f.name,
          mimeType: f.mimeType,
          webViewLink: f.webViewLink,
          category,
          sizeBytes: f.size ? parseInt(f.size, 10) : undefined,
          lastModified: f.modifiedTime,
          summary: `Authorized document available for task execution context (${category})`,
          createdAt: new Date().toISOString(),
        };
        await firestoreService.saveKnowledge(userId, item);
      }
    } catch (e) {
      console.warn('Drive indexing completed with note:', e);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setAccessToken(res.accessToken);
        setNeedsAuth(false);
        await loadUserData(res.user, res.accessToken);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = async () => {
    setIsLoading(true);
    try {
      let guestUid = localStorage.getItem('agentos_guest_uid');
      if (!guestUid) {
        guestUid = `operator_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('agentos_guest_uid', guestUid);
      }
      const guestUser: any = {
        uid: guestUid,
        displayName: 'Agent Operator (Johirul)',
        email: 'johirul4873@gmail.com',
        isAnonymous: true,
        getIdToken: async () => 'operator_token',
      };
      setUser(guestUser);
      setNeedsAuth(false);
      await loadUserData(guestUser, null);
    } finally {
      setIsLoading(false);
    }
  };

  const signOutUser = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem('agentos_guest_uid');
      await fbLogout();
      setUser(null);
      setToken(null);
      setProfile(null);
      setAgentConfig(null);
      setNeedsAuth(true);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const p = await firestoreService.getUserProfile(user.uid);
      if (p) setProfile(p);
      const ac = await firestoreService.getAgentConfig(user.uid);
      if (ac) setAgentConfig(ac);
    }
  };

  const refreshDriveKnowledge = async () => {
    if (user && accessToken) {
      await scanAndIndexDrive(user.uid, accessToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        profile,
        agentConfig,
        isLoading,
        needsAuth,
        loginWithGoogle,
        loginAsGuest,
        signOutUser,
        refreshProfile,
        refreshDriveKnowledge,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
