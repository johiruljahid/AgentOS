import React, { useState } from 'react';
import { AgentTask } from '../types';
import { TaskCard } from '../components/TaskCard';
import {
  ListFilter,
  PlayCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
} from 'lucide-react';

interface TasksViewProps {
  tasks: AgentTask[];
  onSelectTask: (task: AgentTask) => void;
  onOpenReport: (reportId: string) => void;
  onCancelTask: (taskId: string) => void;
  onNewTaskClick: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onSelectTask,
  onOpenReport,
  onCancelTask,
  onNewTaskClick,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'RUNNING' | 'WAITING' | 'COMPLETED'>('ALL');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'RUNNING') return t.status === 'RUNNING' || t.status === 'PLANNING';
    if (filter === 'WAITING') return t.status === 'WAITING_FOR_USER' || t.status === 'WAITING_FOR_APPROVAL';
    if (filter === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Autonomous Task Queue</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Monitor real-time backend execution, step plans, and action checkpoints.
          </p>
        </div>

        <button
          onClick={onNewTaskClick}
          className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'ALL', label: `All (${tasks.length})` },
          {
            id: 'RUNNING',
            label: `Running (${tasks.filter((t) => t.status === 'RUNNING' || t.status === 'PLANNING').length})`,
          },
          {
            id: 'WAITING',
            label: `Waiting (${tasks.filter((t) => t.status === 'WAITING_FOR_USER' || t.status === 'WAITING_FOR_APPROVAL').length})`,
          },
          {
            id: 'COMPLETED',
            label: `Completed (${tasks.filter((t) => t.status === 'COMPLETED').length})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
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
        <div className="p-12 text-center rounded-3xl bg-slate-900/30 border border-slate-800 text-slate-400 text-xs">
          No tasks found under this filter.
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
