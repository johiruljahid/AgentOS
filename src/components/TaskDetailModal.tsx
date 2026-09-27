import React from 'react';
import { AgentTask } from '../types';
import {
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  FileCheck,
  Ban,
  ArrowRight,
  Shield,
  Layers,
  CreditCard,
  KeyRound,
} from 'lucide-react';

interface TaskDetailModalProps {
  task: AgentTask | null;
  onClose: () => void;
  onCancelTask?: (taskId: string) => void;
  onOpenReport?: (reportId: string) => void;
  onOpenApproval?: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onCancelTask,
  onOpenReport,
  onOpenApproval,
}) => {
  if (!task) return null;

  const isWaitingApproval = task.status === 'WAITING_FOR_APPROVAL';
  const isWaitingUser = task.status === 'WAITING_FOR_USER';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  task.status === 'COMPLETED'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : task.status === 'RUNNING'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : isWaitingApproval
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    : isWaitingUser
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isWaitingApproval ? 'WAITING FOR APPROVAL' : isWaitingUser ? 'WAITING FOR USER' : task.status}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(task.createdAt).toLocaleString()}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">{task.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Original Command */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Original User Command
            </span>
            <p className="text-sm text-slate-200 leading-relaxed italic">"{task.command}"</p>
          </div>

          {/* Waiting for Attention Banners */}
          {isWaitingApproval && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-rose-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-rose-200">Payment Approval Required</h4>
                  <p className="text-xs text-rose-300/90">{task.waitingReason || 'Agent policy forbids independent financial transactions.'}</p>
                </div>
              </div>
              <button
                onClick={onOpenApproval}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white text-xs font-bold transition shadow-lg shrink-0"
              >
                Review Payment
              </button>
            </div>
          )}

          {isWaitingUser && (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <KeyRound className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-amber-200">আপনার intervention প্রয়োজন</h4>
                  <p className="text-xs text-amber-300/90">{task.waitingReason || 'Human verification / OTP needed.'}</p>
                </div>
              </div>
              <button
                onClick={onOpenApproval}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 text-xs font-bold transition shadow-lg shrink-0"
              >
                Continue Task
              </button>
            </div>
          )}

          {/* Progress Overview */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="font-medium">Autonomous Execution Progress</span>
              <span className="font-bold text-cyan-400">{task.progressPercent || 0}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${task.progressPercent || 5}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 pt-1">
              Active Action: <span className="text-slate-200 font-medium">{task.currentAction}</span>
            </p>
          </div>

          {/* Step-by-Step Execution Plan */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Execution Timeline ({task.executionPlan?.length || 0} steps)
            </h3>

            <div className="space-y-3">
              {task.executionPlan?.map((step) => (
                <div
                  key={step.stepNumber}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    step.status === 'RUNNING'
                      ? 'bg-cyan-500/10 border-cyan-500/40 shadow-sm'
                      : step.status === 'COMPLETED'
                      ? 'bg-slate-950/40 border-slate-800/80'
                      : 'bg-slate-950/20 border-slate-800/40 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center bg-slate-800 text-slate-300">
                        {step.stepNumber}
                      </span>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-200">{step.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800/80">
                        {step.tool}
                      </span>
                      {step.status === 'COMPLETED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : step.status === 'RUNNING' ? (
                        <RotateCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 pl-7">{step.description}</p>

                  {step.output && (
                    <div className="mt-2 ml-7 p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400/90 leading-relaxed">
                      ✓ {step.output}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            {(task.status === 'RUNNING' || task.status === 'PLANNING') && onCancelTask && (
              <button
                onClick={() => {
                  onCancelTask(task.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Cancel Autonomous Task</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {task.reportId && (
              <button
                onClick={() => {
                  if (onOpenReport) onOpenReport(task.reportId!);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs shadow-md transition flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4" />
                <span>View Full Report</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
