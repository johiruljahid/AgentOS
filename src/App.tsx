/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { firestoreService } from './lib/firestore-service';
import { taskRunner } from './lib/task-runner';
import {
  AgentTask,
  TaskReport,
  ApprovalRequest,
  AgentInstruction,
  DriveKnowledge,
} from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AgentVisual3D } from './components/AgentVisual3D';
import { TaskDetailModal } from './components/TaskDetailModal';
import { WaitingApprovalModal } from './components/WaitingApprovalModal';
import { ReportViewerModal } from './components/ReportViewerModal';
import { MultimodalStudioModal } from './components/MultimodalStudioModal';
import { DashboardView } from './views/DashboardView';
import { TasksView } from './views/TasksView';
import { ReportsView } from './views/ReportsView';
import { KnowledgeView } from './views/KnowledgeView';
import { InstructionsView } from './views/InstructionsView';
import { MemoryView } from './views/MemoryView';
import { ConnectionsView } from './views/ConnectionsView';
import { ProfileView } from './views/ProfileView';
import { SetupDocsView } from './views/SetupDocsView';
import { CommandBox } from './components/CommandBox';
import {
  Bot,
  ShieldCheck,
  Zap,
  FolderOpen,
  Mail,
  Calendar,
  Sparkles,
  Lock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

function AppContent() {
  const { user, profile, agentConfig, accessToken, needsAuth, loginWithGoogle, loginAsGuest, isLoading } = useAuth();

  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Firestore real-time state
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [reports, setReports] = useState<TaskReport[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [instructions, setInstructions] = useState<AgentInstruction[]>([]);
  const [knowledge, setKnowledge] = useState<DriveKnowledge[]>([]);
  const [memories, setMemories] = useState<any[]>([]);

  // Modals state
  const [selectedTask, setSelectedTask] = useState<AgentTask | null>(null);
  const [selectedReport, setSelectedReport] = useState<TaskReport | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [isMultimodalOpen, setIsMultimodalOpen] = useState(false);

  // Setup Firestore real-time listeners when user is authenticated
  useEffect(() => {
    if (!user) return;

    const unsubTasks = firestoreService.subscribeTasks(user.uid, (t) => {
      setTasks(t);
      if (selectedTask) {
        const updated = t.find((x) => x.id === selectedTask.id);
        if (updated) setSelectedTask(updated);
      }
    });

    const unsubReports = firestoreService.subscribeReports(user.uid, (r) => {
      setReports(r);
    });

    const unsubApprovals = firestoreService.subscribeApprovals(user.uid, (a) => {
      setApprovals(a);
      // Auto-open approval modal if new pending item arrives
      if (a.length > 0 && !selectedApproval) {
        setSelectedApproval(a[0]);
      }
    });

    const unsubInstructions = firestoreService.subscribeInstructions(user.uid, (inst) => {
      setInstructions(inst);
    });

    const unsubKnowledge = firestoreService.subscribeKnowledge(user.uid, (k) => {
      setKnowledge(k);
    });

    const unsubMemories = firestoreService.subscribeMemories(user.uid, (m) => {
      setMemories(m);
    });

    return () => {
      unsubTasks();
      unsubReports();
      unsubApprovals();
      unsubInstructions();
      unsubKnowledge();
      unsubMemories();
    };
  }, [user]);

  // Handlers
  const handleOpenReportById = async (reportId: string) => {
    if (!user) return;
    const r = await firestoreService.getTaskReport(user.uid, reportId);
    if (r) setSelectedReport(r);
  };

  const handleCancelTask = async (taskId: string) => {
    if (!user) return;
    await taskRunner.cancelTask(user.uid, taskId);
  };

  const handleResolveApproval = async (approvalId: string, approved: boolean) => {
    if (!user || !selectedApproval) return;
    await taskRunner.resumeTask(
      user.uid,
      selectedApproval.taskId,
      approvalId,
      approved,
      accessToken,
      profile,
      knowledge,
      instructions
    );
    setSelectedApproval(null);
  };

  // 1. Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-4">
        <AgentVisual3D status="RUNNING" size="lg" />
        <h2 className="text-lg font-bold text-white mt-6">Initializing AgentOS Workspace...</h2>
        <p className="text-xs text-slate-400 mt-1">Connecting to Cloud Firestore and verifying Google OAuth</p>
      </div>
    );
  }

  // 2. Unauthenticated Login Screen
  if (needsAuth || !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
        {/* Ambient Lights */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none" />

        {/* Navigation Bar */}
        <header className="px-6 py-5 flex items-center justify-between border-b border-slate-900 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              AgentOS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Autonomous v2.4
            </span>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 max-w-4xl mx-auto px-6 py-12 flex flex-col items-center justify-center text-center z-10 space-y-8">
          <AgentVisual3D status="IDLE" size="lg" />

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Your Autonomous Personal AI Agent
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Every user gets a completely separate private AI agent connected to their own Google Workspace, Drive knowledge, instructions, and permissions.
            </p>
          </div>

          {/* Auth Options */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={loginWithGoogle}
                className="py-3 px-8 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all flex items-center gap-3 active:scale-98 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.01 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500">
              One-click Google OAuth setup • Multi-user Tenant Isolation • Autonomous Background Engine
            </span>
          </div>

          {/* Permissions explanation box */}
          <div className="w-full max-w-xl p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-left text-xs text-slate-400 space-y-2">
            <span className="font-semibold text-slate-200 block text-xs">
              Why your Agent needs Google Workspace Permissions:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300">
                <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Search Drive CVs & Docs</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Send emails with permission</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Manage calendar appointments</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Strict Tenant Data Isolation</span>
              </span>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 border-t border-slate-900 text-center text-xs text-slate-600">
          AgentOS • Built for Autonomous Execution with Cloud Firestore & Gemini Intelligence
        </footer>
      </div>
    );
  }

  // 3. Authenticated App Layout
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenApprovalModal={() => {
          if (approvals.length > 0) setSelectedApproval(approvals[0]);
        }}
        pendingApprovalsCount={approvals.length}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          pendingApprovalsCount={approvals.length}
          runningTasksCount={tasks.filter((t) => t.status === 'RUNNING' || t.status === 'PLANNING').length}
          onOpenMultimodalStudio={() => setIsMultimodalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-6xl mx-auto pb-12">
            {activeView === 'dashboard' && (
              <DashboardView
                tasks={tasks}
                reports={reports}
                approvals={approvals}
                instructions={instructions}
                knowledge={knowledge}
                onSelectTask={(t) => setSelectedTask(t)}
                onOpenReport={handleOpenReportById}
                onOpenApproval={() => {
                  if (approvals.length > 0) setSelectedApproval(approvals[0]);
                }}
                onCancelTask={handleCancelTask}
                setActiveView={setActiveView}
              />
            )}

            {activeView === 'new-task' && (
              <div className="space-y-6 animate-in fade-in max-w-3xl mx-auto">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">New Autonomous Task</h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Your agent handles planning, retrieval, Google APIs, and cloud browser steps in the background.
                  </p>
                </div>
                <CommandBox
                  onTaskStarted={(taskId) => {
                    const t = tasks.find((x) => x.id === taskId);
                    if (t) setSelectedTask(t);
                    setActiveView('tasks');
                  }}
                  instructions={instructions}
                  knowledge={knowledge}
                />
              </div>
            )}

            {activeView === 'tasks' && (
              <TasksView
                tasks={tasks}
                onSelectTask={(t) => setSelectedTask(t)}
                onOpenReport={handleOpenReportById}
                onCancelTask={handleCancelTask}
                onNewTaskClick={() => setActiveView('new-task')}
                instructions={instructions}
                knowledge={knowledge}
              />
            )}

            {activeView === 'reports' && (
              <ReportsView reports={reports} onOpenReport={handleOpenReportById} />
            )}

            {activeView === 'approvals' && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Action Approvals ({approvals.length})
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Tasks paused at safety gates for payments, sensitive operations, or OTP verification.
                  </p>
                </div>

                {approvals.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-slate-900/30 border border-slate-800 text-slate-400 text-xs">
                    No pending approvals. Your agent is operating within authorized parameters.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {approvals.map((appr) => (
                      <div
                        key={appr.id}
                        className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/40 shadow-xl space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                            {appr.type} APPROVAL
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(appr.requestedAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-sm">{appr.title}</h3>
                        <p className="text-xs text-slate-300">{appr.reason}</p>
                        <button
                          onClick={() => setSelectedApproval(appr)}
                          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
                        >
                          Review & Decide
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeView === 'knowledge' && <KnowledgeView knowledge={knowledge} />}

            {activeView === 'instructions' && <InstructionsView instructions={instructions} />}

            {activeView === 'memory' && <MemoryView memories={memories} />}

            {activeView === 'connections' && <ConnectionsView />}

            {activeView === 'profile' && <ProfileView />}

            {activeView === 'docs' && <SetupDocsView />}
          </div>
        </main>
      </div>

      {/* Floating Modals */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onCancelTask={handleCancelTask}
          onOpenReport={handleOpenReportById}
          onOpenApproval={() => {
            const appr = approvals.find((a) => a.taskId === selectedTask.id);
            if (appr) setSelectedApproval(appr);
          }}
        />
      )}

      {selectedApproval && (
        <WaitingApprovalModal
          approval={selectedApproval}
          onClose={() => setSelectedApproval(null)}
          onResolve={handleResolveApproval}
        />
      )}

      {selectedReport && (
        <ReportViewerModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}

      <MultimodalStudioModal
        isOpen={isMultimodalOpen}
        onClose={() => setIsMultimodalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
