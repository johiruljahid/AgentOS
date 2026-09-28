import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AgentVisual3D } from '../components/AgentVisual3D';
import { CommandBox } from '../components/CommandBox';
import { TaskCard } from '../components/TaskCard';
import {
  AgentTask,
  TaskReport,
  ApprovalRequest,
  AgentInstruction,
  DriveKnowledge,
} from '../types';
import {
  Sparkles,
  PlayCircle,
  CheckCircle2,
  Clock,
  Link2,
  ArrowRight,
  ShieldCheck,
  FolderOpen,
  Mail,
  Calendar,
} from 'lucide-react';

interface DashboardViewProps {
  tasks: AgentTask[];
  reports: TaskReport[];
  approvals: ApprovalRequest[];
  instructions: AgentInstruction[];
  knowledge: DriveKnowledge[];
  onSelectTask: (task: AgentTask) => void;
  onOpenReport: (reportId: string) => void;
  onOpenApproval: () => void;
  onCancelTask: (taskId: string) => void;
  setActiveView: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  reports,
  approvals,
  instructions,
  knowledge,
  onSelectTask,
  onOpenReport,
  onOpenApproval,
  onCancelTask,
  setActiveView,
}) => {
  const { profile, agentConfig } = useAuth();

  const runningTasks = tasks.filter((t) => t.status === 'RUNNING' || t.status === 'PLANNING');
  const waitingTasks = tasks.filter((t) => t.status === 'WAITING_FOR_USER' || t.status === 'WAITING_FOR_APPROVAL');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');

  // Derive agent visual state
  const agentVisualStatus =
    waitingTasks.length > 0 ? 'WAITING' : runningTasks.length > 0 ? 'RUNNING' : 'IDLE';

  const greetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-2xl">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Autonomous Cloud Daemon Ready</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {greetingTime()}, {profile?.preferredName || profile?.fullName || 'User'}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-normal max-w-xl">
              Your personal AI agent is ready. Submit tasks and close your browser at any time — backend execution continues autonomously.
            </p>
          </div>

          {/* 3D Agent Visual Card */}
          <div className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-slate-950/50 border border-slate-800/80 backdrop-blur-md shadow-xl">
            <AgentVisual3D status={agentVisualStatus} size="lg" />
            <div className="text-center">
              <span className="text-xs font-bold text-white block">{agentConfig?.agentName || 'Agent Prime'}</span>
              <span className="text-[11px] text-cyan-400 capitalize">Status: {agentVisualStatus.toLowerCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Running */}
        <div
          onClick={() => setActiveView('tasks')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Running Tasks</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <PlayCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{runningTasks.length}</div>
          <span className="text-[11px] text-cyan-400/80 mt-1 block">Executing in backend</span>
        </div>

        {/* Waiting */}
        <div
          onClick={onOpenApproval}
          className={`p-5 rounded-2xl border transition-all cursor-pointer group shadow-lg ${
            approvals.length > 0
              ? 'bg-amber-500/10 border-amber-500/40'
              : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Waiting for You</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-300">{approvals.length}</div>
          <span className="text-[11px] text-amber-400/80 mt-1 block">
            {approvals.length > 0 ? 'Action approval required' : 'No pending actions'}
          </span>
        </div>

        {/* Completed */}
        <div
          onClick={() => setActiveView('reports')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Completed Tasks</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{completedTasks.length}</div>
          <span className="text-[11px] text-emerald-400/80 mt-1 block">Full reports stored</span>
        </div>

        {/* Google Knowledge */}
        <div
          onClick={() => setActiveView('knowledge')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Drive Knowledge</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{knowledge.length}</div>
          <span className="text-[11px] text-indigo-400/80 mt-1 block">Documents indexed</span>
        </div>
      </div>

      {/* Main Command Box */}
      <CommandBox
        onTaskStarted={(taskId) => {
          const match = tasks.find((t) => t.id === taskId);
          if (match) {
            onSelectTask(match);
          } else {
            // Immediate cockpit launch with live placeholder state
            onSelectTask({
              id: taskId,
              userId: profile?.userId || 'user',
              command: 'Executing agent instructions...',
              title: 'Planning autonomous execution...',
              status: 'RUNNING',
              progressPercent: 15,
              currentStep: 1,
              totalSteps: 5,
              currentAction: 'Initializing Gemini reasoning engine and Google Workspace tools...',
              executionPlan: [],
              toolsUsed: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }}
        instructions={instructions}
        knowledge={knowledge}
      />

      {/* Running Tasks Live Section */}
      {runningTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span>Active Autonomous Execution ({runningTasks.length})</span>
            </h2>
            <button
              onClick={() => setActiveView('tasks')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>View All Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {runningTasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onClick={() => onSelectTask(t)}
                onCancel={onCancelTask}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity / Completed Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white">Recent Task Activity</h2>
          <button
            onClick={() => setActiveView('reports')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            <span>Task Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">No tasks executed yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Give your agent your first natural language instruction using the command box above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.slice(0, 6).map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onClick={() => onSelectTask(t)}
                onCancel={onCancelTask}
                onOpenReport={onOpenReport}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
