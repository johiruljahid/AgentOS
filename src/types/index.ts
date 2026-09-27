export type TaskStatus =
  | 'QUEUED'
  | 'PLANNING'
  | 'RUNNING'
  | 'WAITING_FOR_USER'
  | 'WAITING_FOR_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type WaitingType = 'PAYMENT' | 'CAPTCHA' | 'OTP' | 'MFA' | 'CONFIRMATION';

export interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  preferredName?: string;
  phone?: string;
  location?: string;
  professionalTitle?: string;
  bio?: string;
  skills: string[];
  preferredLanguage?: string;
  preferredEmailStyle?: string;
  preferredCVFileId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentConfig {
  userId: string;
  agentName: string;
  status: 'IDLE' | 'RUNNING' | 'WAITING' | 'OFFLINE';
  autonomyLevel: 'SEMI_AUTONOMOUS' | 'FULL_AUTONOMOUS';
  thinkingLevel: 'LOW' | 'HIGH';
  activeModel: string;
  emailNotificationsEnabled: boolean;
  autoSaveDriveReports: boolean;
  totalTasksExecuted: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentInstruction {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: 'COMMUNICATION' | 'APPLICATIONS' | 'PAYMENTS' | 'CALENDAR' | 'GENERAL';
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentMemory {
  id: string;
  userId: string;
  title: string;
  category: 'PREFERENCE' | 'WORKFLOW' | 'FACT' | 'CONTACT_NOTE';
  content: string;
  confidence: number;
  sourceTaskId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionStep {
  stepNumber: number;
  title: string;
  description: string;
  tool: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  output?: string;
  timestamp?: string;
}

export interface AgentTask {
  id: string;
  userId: string;
  command: string;
  title: string;
  status: TaskStatus;
  progressPercent: number;
  currentStep: number;
  totalSteps: number;
  currentAction?: string;
  executionPlan: ExecutionStep[];
  resultSummary?: string;
  reportId?: string;
  waitingReason?: string;
  waitingType?: WaitingType;
  waitingPayload?: Record<string, any>;
  errorMessage?: string;
  toolsUsed: string[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;
}

export interface TaskReport {
  id: string;
  userId: string;
  taskId: string;
  title: string;
  status: 'COMPLETED' | 'FAILED' | 'CANCELLED';
  summary: string;
  details: {
    command: string;
    durationSeconds?: number;
    stepsExecuted: number;
    actionsTaken: string[];
    emailsSent?: number;
    sheetsUpdated?: number;
    calendarEventsCreated?: number;
    docsCreated?: number;
    browserActionsPerformed?: number;
  };
  attachments: {
    name: string;
    type: string;
    url?: string;
    driveId?: string;
  }[];
  googleServicesImpact: {
    gmail?: string[];
    calendar?: string[];
    sheets?: string[];
    docs?: string[];
    drive?: string[];
  };
  nextActions: string[];
  driveDocUrl?: string;
  createdAt: string;
  completedAt: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  taskId?: string;
  title: string;
  message: string;
  type: 'TASK_COMPLETED' | 'TASK_FAILED' | 'USER_ACTION_REQUIRED' | 'PAYMENT_REQUIRED' | 'TASK_CANCELLED';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface DriveKnowledge {
  id: string;
  userId: string;
  fileId: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  category: 'CV' | 'CERTIFICATE' | 'SPREADSHEET' | 'DOC' | 'PRESENTATION' | 'OTHER';
  sizeBytes?: number;
  summary?: string;
  lastModified?: string;
  createdAt: string;
}

export interface ApprovalRequest {
  id: string;
  userId: string;
  taskId: string;
  type: WaitingType;
  title: string;
  merchant?: string;
  amount?: number;
  currency?: string;
  purpose?: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  respondedAt?: string;
}

export interface GoogleIntegrationStatus {
  id: string;
  name: string;
  connected: boolean;
  icon: string;
  description: string;
  scope: string;
}
