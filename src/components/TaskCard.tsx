import React from 'react';
import { AgentTask } from '../types';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  RotateCw,
  FileCheck,
  ChevronRight,
  ExternalLink,
  Ban,
  Layers,
} from 'lucide-react';

interface TaskCardProps {
  task: AgentTask;
  onClick: () => void;
  onCancel?: (taskId: string) => void;
  onOpenReport?: (reportId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onCancel,
  onOpenReport,
}) => {
  const getStatusBadge = () => {
    switch (task.status) {
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            <RotateCw className="w-3 h-3 animate-spin text-cyan-400" />
            <span>Running</span>
          </span>
        );
      case 'PLANNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>Planning</span>
          </span>
        );
      case 'WAITING_FOR_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Payment Approval</span>
          </span>
        );
      case 'WAITING_FOR_USER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            <span>Waiting for You</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Completed</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3 h-3 text-rose-400" />
            <span>Failed</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-400 border border-slate-700">
            <Ban className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <Clock className="w-3 h-3" />
            <span>Queued</span>
          </span>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border transition-all cursor-pointer group shadow-lg ${
        task.status === 'WAITING_FOR_USER'
          ? 'border-amber-500/40 bg-amber-500/5'
          : task.status === 'RUNNING'
          ? 'border-cyan-500/30'
          : 'border-slate-800/80 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {getStatusBadge()}
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h3 className="font-semibold text-slate-100 text-sm sm:text-base group-hover:text-cyan-300 transition-colors line-clamp-1">
            {task.title}
          </h3>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-300 transition shrink-0 mt-1" />
      </div>

      {/* Original command excerpt */}
      <p className="text-xs text-slate-400 line-clamp-2 mb-3 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
        "{task.command}"
      </p>

      {/* Live action text */}
      {task.currentAction && (
        <div className="flex items-center gap-2 text-xs text-cyan-400/90 mb-3 font-medium">
          {task.status === 'RUNNING' && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
          <span className="truncate">{task.currentAction}</span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-1.5 mb-3">
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>
            Step {task.currentStep} of {task.totalSteps || 5}
          </span>
          <span className="font-medium text-slate-300">{task.progressPercent || 0}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              task.status === 'COMPLETED'
                ? 'bg-emerald-500'
                : task.status === 'WAITING_FOR_USER'
                ? 'bg-amber-400'
                : 'bg-gradient-to-r from-cyan-400 to-indigo-500'
            }`}
            style={{ width: `${task.progressPercent || 5}%` }}
          />
        </div>
      </div>

      {/* Footer Tools & Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5 flex-wrap">
          {task.toolsUsed?.slice(0, 3).map((t, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60"
            >
              {t.replace(/_/g, ' ')}
            </span>
          ))}
          {task.toolsUsed?.length > 3 && (
            <span className="text-[10px] text-slate-500">+{task.toolsUsed.length - 3}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {task.reportId && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenReport) onOpenReport(task.reportId!);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition flex items-center gap-1"
            >
              <FileCheck className="w-3 h-3" />
              <span>Report</span>
            </button>
          )}

          {(task.status === 'RUNNING' || task.status === 'PLANNING') && onCancel && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel(task.id);
              }}
              className="px-2.5 py-1 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
