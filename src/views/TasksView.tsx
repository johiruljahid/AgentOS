import React, { useState } from 'react';
import { AgentTask, AgentInstruction, DriveKnowledge } from '../types';
import { TaskCard } from '../components/TaskCard';
import { CommandBox } from '../components/CommandBox';
import {
  ListFilter,
  PlayCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Sparkles,
  Bot,
  Zap,
} from 'lucide-react';

interface TasksViewProps {
  tasks: AgentTask[];
  onSelectTask: (task: AgentTask) => void;
  onOpenReport: (reportId: string) => void;
  onCancelTask: (taskId: string) => void;
  onNewTaskClick?: () => void;
  instructions?: AgentInstruction[];
  knowledge?: DriveKnowledge[];
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onSelectTask,
  onOpenReport,
  onCancelTask,
  onNewTaskClick,
  instructions = [],
  knowledge = [],
}) => {
  const [filter, setFilter] = useState<'ALL' | 'RUNNING' | 'WAITING' | 'COMPLETED'>('ALL');
  const [showQuickCommand, setShowQuickCommand] = useState(false);

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'RUNNING') return t.status === 'RUNNING' || t.status === 'PLANNING' || t.status === 'QUEUED';
    if (filter === 'WAITING') return t.status === 'WAITING_FOR_USER' || t.status === 'WAITING_FOR_APPROVAL';
    if (filter === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  const runningCount = tasks.filter((t) => t.status === 'RUNNING' || t.status === 'PLANNING' || t.status === 'QUEUED').length;
  const waitingCount = tasks.filter((t) => t.status === 'WAITING_FOR_USER' || t.status === 'WAITING_FOR_APPROVAL').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Autonomous Task Queue</span>
            {runningCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Monitor real-time backend execution, step plans, and action checkpoints.
          </p>
        </div>

        <button
          onClick={() => setShowQuickCommand(!showQuickCommand)}
          className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className={`w-4 h-4 transition-transform ${showQuickCommand ? 'rotate-45' : ''}`} />
          <span>{showQuickCommand ? 'Close Command Box' : 'New Task'}</span>
        </button>
      </div>

      {/* Quick Command Box Embedded */}
      {showQuickCommand && (
        <div className="p-1 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 animate-in fade-in">
          <CommandBox
            onTaskStarted={(taskId) => {
              setShowQuickCommand(false);
              const match = tasks.find((t) => t.id === taskId);
              if (match) onSelectTask(match);
            }}
            instructions={instructions}
            knowledge={knowledge}
          />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'ALL', label: `All (${tasks.length})` },
          {
            id: 'RUNNING',
            label: `Running (${runningCount})`,
          },
          {
            id: 'WAITING',
            label: `Waiting (${waitingCount})`,
          },
          {
            id: 'COMPLETED',
            label: `Completed (${completedCount})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
              filter === tab.id
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-slate-900/30 border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <Bot className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-200">No tasks in this view</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {tasks.length === 0
                ? 'Your autonomous agent is ready for instructions. Give a command below or open the command box.'
                : 'No tasks match the active filter criteria.'}
            </p>
          </div>
          {tasks.length === 0 && (
            <button
              onClick={() => setShowQuickCommand(true)}
              className="px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-medium text-xs border border-cyan-500/30 transition inline-flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Dispatch First Task</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((t) => (
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
  );
};
