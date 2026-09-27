import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  UserProfile,
  AgentConfig,
  AgentInstruction,
  AgentMemory,
  AgentTask,
  TaskReport,
  UserNotification,
  DriveKnowledge,
  ApprovalRequest,
} from '../types';

export const firestoreService = {
  // 1. Profile operations
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const path = `users/${userId}/profile/main`;
    try {
      const snap = await getDoc(doc(db, 'users', userId, 'profile', 'main'));
      return snap.exists() ? (snap.data() as UserProfile) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async upsertUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    const path = `users/${userId}/profile/main`;
    try {
      const existing = await this.getUserProfile(userId);
      const data: UserProfile = {
        userId,
        fullName: profile.fullName || existing?.fullName || '',
        email: profile.email || existing?.email || '',
        preferredName: profile.preferredName || existing?.preferredName || '',
        phone: profile.phone || existing?.phone || '',
        location: profile.location || existing?.location || '',
        professionalTitle: profile.professionalTitle || existing?.professionalTitle || '',
        bio: profile.bio || existing?.bio || '',
        skills: profile.skills || existing?.skills || [],
        preferredLanguage: profile.preferredLanguage || existing?.preferredLanguage || 'English',
        preferredEmailStyle: profile.preferredEmailStyle || existing?.preferredEmailStyle || 'Professional and concise',
        preferredCVFileId: profile.preferredCVFileId || existing?.preferredCVFileId || '',
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', userId, 'profile', 'main'), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // 2. Agent Config operations
  async getAgentConfig(userId: string): Promise<AgentConfig | null> {
    const path = `users/${userId}/agent/config`;
    try {
      const snap = await getDoc(doc(db, 'users', userId, 'agent', 'config'));
      return snap.exists() ? (snap.data() as AgentConfig) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async upsertAgentConfig(userId: string, config: Partial<AgentConfig>): Promise<void> {
    const path = `users/${userId}/agent/config`;
    try {
      const existing = await this.getAgentConfig(userId);
      const data: AgentConfig = {
        userId,
        agentName: config.agentName || existing?.agentName || 'Agent Prime',
        status: config.status || existing?.status || 'IDLE',
        autonomyLevel: config.autonomyLevel || existing?.autonomyLevel || 'FULL_AUTONOMOUS',
        thinkingLevel: config.thinkingLevel || existing?.thinkingLevel || 'HIGH',
        activeModel: config.activeModel || existing?.activeModel || 'gemini-3.5-flash',
        emailNotificationsEnabled: config.emailNotificationsEnabled ?? existing?.emailNotificationsEnabled ?? true,
        autoSaveDriveReports: config.autoSaveDriveReports ?? existing?.autoSaveDriveReports ?? true,
        totalTasksExecuted: config.totalTasksExecuted ?? existing?.totalTasksExecuted ?? 0,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', userId, 'agent', 'config'), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // 3. Tasks Real-time and CRUD
  subscribeTasks(userId: string, callback: (tasks: AgentTask[]) => void) {
    const path = `users/${userId}/tasks`;
    const colRef = collection(db, 'users', userId, 'tasks');
    const q = query(colRef, orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const tasks: AgentTask[] = [];
        snapshot.forEach((d) => tasks.push(d.data() as AgentTask));
        callback(tasks);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  async createTask(userId: string, task: AgentTask): Promise<void> {
    const path = `users/${userId}/tasks/${task.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'tasks', task.id), task);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateTask(userId: string, taskId: string, updates: Partial<AgentTask>): Promise<void> {
    const path = `users/${userId}/tasks/${taskId}`;
    try {
      await updateDoc(doc(db, 'users', userId, 'tasks', taskId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async getTask(userId: string, taskId: string): Promise<AgentTask | null> {
    const path = `users/${userId}/tasks/${taskId}`;
    try {
      const snap = await getDoc(doc(db, 'users', userId, 'tasks', taskId));
      return snap.exists() ? (snap.data() as AgentTask) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  // 4. Reports CRUD
  async getTaskReport(userId: string, reportId: string): Promise<TaskReport | null> {
    const path = `users/${userId}/reports/${reportId}`;
    try {
      const snap = await getDoc(doc(db, 'users', userId, 'reports', reportId));
      return snap.exists() ? (snap.data() as TaskReport) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveTaskReport(userId: string, report: TaskReport): Promise<void> {
    const path = `users/${userId}/reports/${report.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'reports', report.id), report);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  subscribeReports(userId: string, callback: (reports: TaskReport[]) => void) {
    const path = `users/${userId}/reports`;
    const colRef = collection(db, 'users', userId, 'reports');
    const q = query(colRef, orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const reports: TaskReport[] = [];
        snapshot.forEach((d) => reports.push(d.data() as TaskReport));
        callback(reports);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  // 5. Notifications
  subscribeNotifications(userId: string, callback: (notifications: UserNotification[]) => void) {
    const path = `users/${userId}/notifications`;
    const colRef = collection(db, 'users', userId, 'notifications');
    const q = query(colRef, orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: UserNotification[] = [];
        snapshot.forEach((d) => list.push(d.data() as UserNotification));
        callback(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  async createNotification(userId: string, notification: UserNotification): Promise<void> {
    const path = `users/${userId}/notifications/${notification.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'notifications', notification.id), notification);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async markNotificationRead(userId: string, notificationId: string): Promise<void> {
    const path = `users/${userId}/notifications/${notificationId}`;
    try {
      await updateDoc(doc(db, 'users', userId, 'notifications', notificationId), {
        isRead: true,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // 6. Instructions CRUD
  subscribeInstructions(userId: string, callback: (instructions: AgentInstruction[]) => void) {
    const path = `users/${userId}/instructions`;
    const colRef = collection(db, 'users', userId, 'instructions');
    const q = query(colRef, orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: AgentInstruction[] = [];
        snapshot.forEach((d) => list.push(d.data() as AgentInstruction));
        callback(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  async saveInstruction(userId: string, instruction: AgentInstruction): Promise<void> {
    const path = `users/${userId}/instructions/${instruction.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'instructions', instruction.id), instruction);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteInstruction(userId: string, id: string): Promise<void> {
    const path = `users/${userId}/instructions/${id}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'instructions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // 7. Memory CRUD
  subscribeMemories(userId: string, callback: (memories: AgentMemory[]) => void) {
    const path = `users/${userId}/memory`;
    const colRef = collection(db, 'users', userId, 'memory');
    const q = query(colRef, orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: AgentMemory[] = [];
        snapshot.forEach((d) => list.push(d.data() as AgentMemory));
        callback(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  async saveMemory(userId: string, memory: AgentMemory): Promise<void> {
    const path = `users/${userId}/memory/${memory.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'memory', memory.id), memory);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteMemory(userId: string, id: string): Promise<void> {
    const path = `users/${userId}/memory/${id}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'memory', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // 8. Drive Knowledge CRUD
  subscribeKnowledge(userId: string, callback: (knowledge: DriveKnowledge[]) => void) {
    const path = `users/${userId}/knowledge`;
    const colRef = collection(db, 'users', userId, 'knowledge');
    const q = query(colRef, orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: DriveKnowledge[] = [];
        snapshot.forEach((d) => list.push(d.data() as DriveKnowledge));
        callback(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  async saveKnowledge(userId: string, knowledge: DriveKnowledge): Promise<void> {
    const path = `users/${userId}/knowledge/${knowledge.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'knowledge', knowledge.id), knowledge);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // 9. Approvals (Human-in-the-loop)
  subscribeApprovals(userId: string, callback: (approvals: ApprovalRequest[]) => void) {
    const path = `users/${userId}/approvals`;
    const colRef = collection(db, 'users', userId, 'approvals');
    const q = query(colRef, where('status', '==', 'PENDING'));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: ApprovalRequest[] = [];
        snapshot.forEach((d) => list.push(d.data() as ApprovalRequest));
        callback(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  async createApproval(userId: string, approval: ApprovalRequest): Promise<void> {
    const path = `users/${userId}/approvals/${approval.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'approvals', approval.id), approval);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async resolveApproval(userId: string, approvalId: string, approved: boolean): Promise<void> {
    const path = `users/${userId}/approvals/${approvalId}`;
    try {
      await updateDoc(doc(db, 'users', userId, 'approvals', approvalId), {
        status: approved ? 'APPROVED' : 'REJECTED',
        respondedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },
};
