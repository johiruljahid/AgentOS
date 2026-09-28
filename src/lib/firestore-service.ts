import {
  collection,
  doc,
  getDoc,
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

// In-memory and localStorage resilient caching layer
function getCached<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(`agentos_${key}`);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setCached<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`agentos_${key}`, JSON.stringify(value));
  } catch {
    // quota exceeded or disabled
  }
}

// Local reactive state listeners
const taskSubscribers = new Set<(tasks: AgentTask[]) => void>();
const approvalSubscribers = new Set<(approvals: ApprovalRequest[]) => void>();
const reportSubscribers = new Set<(reports: TaskReport[]) => void>();
const notificationSubscribers = new Set<(notifs: UserNotification[]) => void>();
const instructionSubscribers = new Set<(instructions: AgentInstruction[]) => void>();
const knowledgeSubscribers = new Set<(knowledge: DriveKnowledge[]) => void>();
const memorySubscribers = new Set<(memories: AgentMemory[]) => void>();

function notifyTaskSubscribers(tasks: AgentTask[]) {
  taskSubscribers.forEach((cb) => {
    try {
      cb(tasks);
    } catch (e) {
      console.warn('Error in task subscriber:', e);
    }
  });
}

function notifyApprovalSubscribers(approvals: ApprovalRequest[]) {
  approvalSubscribers.forEach((cb) => {
    try {
      cb(approvals);
    } catch (e) {
      console.warn('Error in approval subscriber:', e);
    }
  });
}

function notifyReportSubscribers(reports: TaskReport[]) {
  reportSubscribers.forEach((cb) => {
    try {
      cb(reports);
    } catch (e) {
      console.warn('Error in report subscriber:', e);
    }
  });
}

function notifyNotificationSubscribers(notifs: UserNotification[]) {
  notificationSubscribers.forEach((cb) => {
    try {
      cb(notifs);
    } catch (e) {
      console.warn('Error in notification subscriber:', e);
    }
  });
}

export const firestoreService = {
  // 1. Profile operations
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const path = `users/${userId}/profile/main`;
    try {
      const snap = await getDoc(doc(db, 'users', userId, 'profile', 'main'));
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setCached(`profile_${userId}`, data);
        return data;
      }
    } catch (error) {
      console.warn('Firestore profile get error, using cache:', error);
    }
    return getCached<UserProfile | null>(`profile_${userId}`, null);
  },

  async upsertUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    const path = `users/${userId}/profile/main`;
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
    setCached(`profile_${userId}`, data);
    try {
      await setDoc(doc(db, 'users', userId, 'profile', 'main'), data);
    } catch (error) {
      console.warn('Firestore profile save warning:', error);
    }
  },

  // 2. Agent Config operations
  async getAgentConfig(userId: string): Promise<AgentConfig | null> {
    const path = `users/${userId}/agent/config`;
    try {
      const snap = await getDoc(doc(db, 'users', userId, 'agent', 'config'));
      if (snap.exists()) {
        const data = snap.data() as AgentConfig;
        setCached(`agent_config_${userId}`, data);
        return data;
      }
    } catch (error) {
      console.warn('Firestore config get error, using cache:', error);
    }
    return getCached<AgentConfig | null>(`agent_config_${userId}`, null);
  },

  async upsertAgentConfig(userId: string, config: Partial<AgentConfig>): Promise<void> {
    const path = `users/${userId}/agent/config`;
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
    setCached(`agent_config_${userId}`, data);
    try {
      await setDoc(doc(db, 'users', userId, 'agent', 'config'), data);
    } catch (error) {
      console.warn('Firestore config save warning:', error);
    }
  },

  // 3. Tasks Real-time and CRUD
  subscribeTasks(userId: string, callback: (tasks: AgentTask[]) => void) {
    // 1. Immediately deliver cached tasks for instant UI responsiveness
    const cached = getCached<AgentTask[]>(`tasks_${userId}`, []);
    callback(cached);

    // Register to local subscribers set
    taskSubscribers.add(callback);

    const path = `users/${userId}/tasks`;
    let unsubscribeFirestore = () => {};

    try {
      const colRef = collection(db, 'users', userId, 'tasks');
      const q = query(colRef, orderBy('createdAt', 'desc'));

      unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          const remoteTasks: AgentTask[] = [];
          snapshot.forEach((d) => remoteTasks.push(d.data() as AgentTask));

          // Merge remote with local to preserve immediate local changes
          const currentLocal = getCached<AgentTask[]>(`tasks_${userId}`, []);
          const mergedMap = new Map<string, AgentTask>();

          // Remote tasks
          remoteTasks.forEach((t) => mergedMap.set(t.id, t));
          // Overlay local tasks if newer
          currentLocal.forEach((t) => {
            const remote = mergedMap.get(t.id);
            if (!remote || new Date(t.updatedAt || t.createdAt).getTime() > new Date(remote.updatedAt || remote.createdAt).getTime()) {
              mergedMap.set(t.id, t);
            }
          });

          const merged = Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setCached(`tasks_${userId}`, merged);
          callback(merged);
        },
        (error) => {
          console.warn('Firestore tasks onSnapshot warning (using local store):', error?.message || error);
          // Still provide cached tasks
          callback(getCached<AgentTask[]>(`tasks_${userId}`, []));
        }
      );
    } catch (err) {
      console.warn('Could not establish Firestore tasks listener:', err);
    }

    return () => {
      taskSubscribers.delete(callback);
      try {
        unsubscribeFirestore();
      } catch {}
    };
  },

  async createTask(userId: string, task: AgentTask): Promise<void> {
    // 1. Instantly update local cache and broadcast to all React subscribers
    const current = getCached<AgentTask[]>(`tasks_${userId}`, []);
    const filtered = current.filter((t) => t.id !== task.id);
    const updated = [task, ...filtered];
    setCached(`tasks_${userId}`, updated);
    notifyTaskSubscribers(updated);

    // 2. Persist to Firestore asynchronously
    try {
      await setDoc(doc(db, 'users', userId, 'tasks', task.id), task);
    } catch (error) {
      console.warn('Firestore createTask warning (saved in local store):', error);
    }
  },

  async updateTask(userId: string, taskId: string, updates: Partial<AgentTask>): Promise<void> {
    // 1. Instantly update local cache
    const current = getCached<AgentTask[]>(`tasks_${userId}`, []);
    const updated = current.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    setCached(`tasks_${userId}`, updated);
    notifyTaskSubscribers(updated);

    // 2. Persist to Firestore asynchronously
    try {
      await updateDoc(doc(db, 'users', userId, 'tasks', taskId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Firestore updateTask warning (saved in local store):', error);
    }
  },

  async getTask(userId: string, taskId: string): Promise<AgentTask | null> {
    const current = getCached<AgentTask[]>(`tasks_${userId}`, []);
    const match = current.find((t) => t.id === taskId);
    if (match) return match;

    try {
      const snap = await getDoc(doc(db, 'users', userId, 'tasks', taskId));
      if (snap.exists()) return snap.data() as AgentTask;
    } catch (error) {
      console.warn('Firestore getTask warning:', error);
    }
    return null;
  },

  // 4. Reports CRUD
  async getTaskReport(userId: string, reportId: string): Promise<TaskReport | null> {
    const current = getCached<TaskReport[]>(`reports_${userId}`, []);
    const match = current.find((r) => r.id === reportId);
    if (match) return match;

    try {
      const snap = await getDoc(doc(db, 'users', userId, 'reports', reportId));
      if (snap.exists()) return snap.data() as TaskReport;
    } catch (error) {
      console.warn('Firestore getTaskReport warning:', error);
    }
    return null;
  },

  async saveTaskReport(userId: string, report: TaskReport): Promise<void> {
    const current = getCached<TaskReport[]>(`reports_${userId}`, []);
    const filtered = current.filter((r) => r.id !== report.id);
    const updated = [report, ...filtered];
    setCached(`reports_${userId}`, updated);
    notifyReportSubscribers(updated);

    try {
      await setDoc(doc(db, 'users', userId, 'reports', report.id), report);
    } catch (error) {
      console.warn('Firestore saveTaskReport warning (saved locally):', error);
    }
  },

  subscribeReports(userId: string, callback: (reports: TaskReport[]) => void) {
    const cached = getCached<TaskReport[]>(`reports_${userId}`, []);
    callback(cached);
    reportSubscribers.add(callback);

    let unsubscribeFirestore = () => {};
    try {
      const colRef = collection(db, 'users', userId, 'reports');
      const q = query(colRef, orderBy('createdAt', 'desc'));

      unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          const list: TaskReport[] = [];
          snapshot.forEach((d) => list.push(d.data() as TaskReport));
          setCached(`reports_${userId}`, list);
          callback(list);
        },
        (error) => {
          console.warn('Firestore reports snapshot warning:', error);
          callback(getCached<TaskReport[]>(`reports_${userId}`, []));
        }
      );
    } catch (err) {
      console.warn('Firestore reports listener error:', err);
    }

    return () => {
      reportSubscribers.delete(callback);
      try {
        unsubscribeFirestore();
      } catch {}
    };
  },

  // 5. Notifications
  subscribeNotifications(userId: string, callback: (notifications: UserNotification[]) => void) {
    const cached = getCached<UserNotification[]>(`notifs_${userId}`, []);
    callback(cached);
    notificationSubscribers.add(callback);

    let unsubscribeFirestore = () => {};
    try {
      const colRef = collection(db, 'users', userId, 'notifications');
      const q = query(colRef, orderBy('createdAt', 'desc'));

      unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          const list: UserNotification[] = [];
          snapshot.forEach((d) => list.push(d.data() as UserNotification));
          setCached(`notifs_${userId}`, list);
          callback(list);
        },
        (error) => {
          console.warn('Firestore notifications snapshot warning:', error);
          callback(getCached<UserNotification[]>(`notifs_${userId}`, []));
        }
      );
    } catch (err) {
      console.warn('Firestore notifications listener error:', err);
    }

    return () => {
      notificationSubscribers.delete(callback);
      try {
        unsubscribeFirestore();
      } catch {}
    };
  },

  async createNotification(userId: string, notification: UserNotification): Promise<void> {
    const current = getCached<UserNotification[]>(`notifs_${userId}`, []);
    const updated = [notification, ...current.filter((n) => n.id !== notification.id)];
    setCached(`notifs_${userId}`, updated);
    notifyNotificationSubscribers(updated);

    try {
      await setDoc(doc(db, 'users', userId, 'notifications', notification.id), notification);
    } catch (error) {
      console.warn('Firestore createNotification warning:', error);
    }
  },

  async markNotificationRead(userId: string, notificationId: string): Promise<void> {
    const current = getCached<UserNotification[]>(`notifs_${userId}`, []);
    const updated = current.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n));
    setCached(`notifs_${userId}`, updated);
    notifyNotificationSubscribers(updated);

    try {
      await updateDoc(doc(db, 'users', userId, 'notifications', notificationId), {
        isRead: true,
      });
    } catch (error) {
      console.warn('Firestore markNotificationRead warning:', error);
    }
  },

  // 6. Instructions CRUD
  subscribeInstructions(userId: string, callback: (instructions: AgentInstruction[]) => void) {
    const defaultInstructions: AgentInstruction[] = [
      {
        id: 'inst_safety_payments',
        userId,
        title: 'Mandatory Payment Approval',
        content: 'Never make or approve any payment independently. Always request explicit confirmation with merchant, amount, and reason.',
        category: 'PAYMENTS',
        isActive: true,
        priority: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'inst_email_style',
        userId,
        title: 'Professional Communication',
        content: 'Draft emails with clear subject lines, polite greetings, structured bullets, and appropriate attachments.',
        category: 'COMMUNICATION',
        isActive: true,
        priority: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const cached = getCached<AgentInstruction[]>(`instructions_${userId}`, defaultInstructions);
    callback(cached);
    instructionSubscribers.add(callback);

    let unsubscribeFirestore = () => {};
    try {
      const colRef = collection(db, 'users', userId, 'instructions');
      const q = query(colRef, orderBy('createdAt', 'desc'));

      unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: AgentInstruction[] = [];
            snapshot.forEach((d) => list.push(d.data() as AgentInstruction));
            setCached(`instructions_${userId}`, list);
            callback(list);
          }
        },
        (error) => {
          console.warn('Firestore instructions warning:', error);
        }
      );
    } catch (err) {
      console.warn('Firestore instructions listener error:', err);
    }

    return () => {
      instructionSubscribers.delete(callback);
      try {
        unsubscribeFirestore();
      } catch {}
    };
  },

  async saveInstruction(userId: string, instruction: AgentInstruction): Promise<void> {
    const current = getCached<AgentInstruction[]>(`instructions_${userId}`, []);
    const updated = [instruction, ...current.filter((i) => i.id !== instruction.id)];
    setCached(`instructions_${userId}`, updated);
    instructionSubscribers.forEach((cb) => cb(updated));

    try {
      await setDoc(doc(db, 'users', userId, 'instructions', instruction.id), instruction);
    } catch (error) {
      console.warn('Firestore saveInstruction warning:', error);
    }
  },

  async deleteInstruction(userId: string, id: string): Promise<void> {
    const current = getCached<AgentInstruction[]>(`instructions_${userId}`, []);
    const updated = current.filter((i) => i.id !== id);
    setCached(`instructions_${userId}`, updated);
    instructionSubscribers.forEach((cb) => cb(updated));

    try {
      await deleteDoc(doc(db, 'users', userId, 'instructions', id));
    } catch (error) {
      console.warn('Firestore deleteInstruction warning:', error);
    }
  },

  // 7. Memory CRUD
  subscribeMemories(userId: string, callback: (memories: AgentMemory[]) => void) {
    const cached = getCached<AgentMemory[]>(`memories_${userId}`, []);
    callback(cached);
    memorySubscribers.add(callback);

    let unsubscribeFirestore = () => {};
    try {
      const colRef = collection(db, 'users', userId, 'memory');
      const q = query(colRef, orderBy('createdAt', 'desc'));

      unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          const list: AgentMemory[] = [];
          snapshot.forEach((d) => list.push(d.data() as AgentMemory));
          setCached(`memories_${userId}`, list);
          callback(list);
        },
        (error) => {
          console.warn('Firestore memories snapshot warning:', error);
        }
      );
    } catch (err) {
      console.warn('Firestore memories listener error:', err);
    }

    return () => {
      memorySubscribers.delete(callback);
      try {
        unsubscribeFirestore();
      } catch {}
    };
  },

  async saveMemory(userId: string, memory: AgentMemory): Promise<void> {
    const current = getCached<AgentMemory[]>(`memories_${userId}`, []);
    const updated = [memory, ...current.filter((m) => m.id !== memory.id)];
    setCached(`memories_${userId}`, updated);
    memorySubscribers.forEach((cb) => cb(updated));

    try {
      await setDoc(doc(db, 'users', userId, 'memory', memory.id), memory);
    } catch (error) {
      console.warn('Firestore saveMemory warning:', error);
    }
  },

  async deleteMemory(userId: string, id: string): Promise<void> {
    const current = getCached<AgentMemory[]>(`memories_${userId}`, []);
    const updated = current.filter((m) => m.id !== id);
    setCached(`memories_${userId}`, updated);
    memorySubscribers.forEach((cb) => cb(updated));

    try {
      await deleteDoc(doc(db, 'users', userId, 'memory', id));
    } catch (error) {
      console.warn('Firestore deleteMemory warning:', error);
    }
  },

  // 8. Drive Knowledge CRUD
  subscribeKnowledge(userId: string, callback: (knowledge: DriveKnowledge[]) => void) {
    const defaultKnowledge: DriveKnowledge[] = [
      {
        id: 'file_cv_default',
        userId,
        fileId: 'cv_drive_ref_01',
        name: 'Md_Johirul_Islam_CV.pdf',
        mimeType: 'application/pdf',
        category: 'CV',
        summary: 'Primary curriculum vitae and laboratory experience document',
        createdAt: new Date().toISOString(),
      },
    ];

    const cached = getCached<DriveKnowledge[]>(`knowledge_${userId}`, defaultKnowledge);
    callback(cached);
    knowledgeSubscribers.add(callback);

    let unsubscribeFirestore = () => {};
    try {
      const colRef = collection(db, 'users', userId, 'knowledge');
      const q = query(colRef, orderBy('createdAt', 'desc'));

      unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: DriveKnowledge[] = [];
            snapshot.forEach((d) => list.push(d.data() as DriveKnowledge));
            setCached(`knowledge_${userId}`, list);
            callback(list);
          }
        },
        (error) => {
          console.warn('Firestore knowledge snapshot warning:', error);
        }
      );
    } catch (err) {
      console.warn('Firestore knowledge listener error:', err);
    }

    return () => {
      knowledgeSubscribers.delete(callback);
      try {
        unsubscribeFirestore();
      } catch {}
    };
  },

  async saveKnowledge(userId: string, knowledge: DriveKnowledge): Promise<void> {
    const current = getCached<DriveKnowledge[]>(`knowledge_${userId}`, []);
    const updated = [knowledge, ...current.filter((k) => k.id !== knowledge.id)];
    setCached(`knowledge_${userId}`, updated);
    knowledgeSubscribers.forEach((cb) => cb(updated));

    try {
      await setDoc(doc(db, 'users', userId, 'knowledge', knowledge.id), knowledge);
    } catch (error) {
      console.warn('Firestore saveKnowledge warning:', error);
    }
  },

  // 9. Approvals (Human-in-the-loop: Payments, CAPTCHA, sensitive triggers)
  subscribeApprovals(userId: string, callback: (approvals: ApprovalRequest[]) => void) {
    const cached = getCached<ApprovalRequest[]>(`approvals_${userId}`, []);
    callback(cached.filter((a) => a.status === 'PENDING'));
    approvalSubscribers.add(callback);

    let unsubscribeFirestore = () => {};
    try {
      const colRef = collection(db, 'users', userId, 'approvals');
      const q = query(colRef, where('status', '==', 'PENDING'));

      unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          const list: ApprovalRequest[] = [];
          snapshot.forEach((d) => list.push(d.data() as ApprovalRequest));
          setCached(`approvals_${userId}`, list);
          callback(list);
        },
        (error) => {
          console.warn('Firestore approvals snapshot warning:', error);
          const current = getCached<ApprovalRequest[]>(`approvals_${userId}`, []);
          callback(current.filter((a) => a.status === 'PENDING'));
        }
      );
    } catch (err) {
      console.warn('Firestore approvals listener error:', err);
    }

    return () => {
      approvalSubscribers.delete(callback);
      try {
        unsubscribeFirestore();
      } catch {}
    };
  },

  async createApproval(userId: string, approval: ApprovalRequest): Promise<void> {
    const current = getCached<ApprovalRequest[]>(`approvals_${userId}`, []);
    const updated = [approval, ...current.filter((a) => a.id !== approval.id)];
    setCached(`approvals_${userId}`, updated);
    notifyApprovalSubscribers(updated.filter((a) => a.status === 'PENDING'));

    try {
      await setDoc(doc(db, 'users', userId, 'approvals', approval.id), approval);
    } catch (error) {
      console.warn('Firestore createApproval warning:', error);
    }
  },

  async resolveApproval(userId: string, approvalId: string, approved: boolean): Promise<void> {
    const current = getCached<ApprovalRequest[]>(`approvals_${userId}`, []);
    const updated = current.map((a) =>
      a.id === approvalId
        ? {
            ...a,
            status: (approved ? 'APPROVED' : 'REJECTED') as 'APPROVED' | 'REJECTED',
            respondedAt: new Date().toISOString(),
          }
        : a
    );
    setCached(`approvals_${userId}`, updated);
    notifyApprovalSubscribers(updated.filter((a) => a.status === 'PENDING'));

    try {
      await updateDoc(doc(db, 'users', userId, 'approvals', approvalId), {
        status: approved ? 'APPROVED' : 'REJECTED',
        respondedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Firestore resolveApproval warning:', error);
    }
  },
};
