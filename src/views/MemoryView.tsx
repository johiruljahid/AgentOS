import React from 'react';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../lib/firestore-service';
import { AgentMemory } from '../types';
import {
  Brain,
  Trash2,
  Sparkles,
  Lock,
  Workflow,
  CheckCircle,
} from 'lucide-react';

interface MemoryViewProps {
  memories: AgentMemory[];
}

export const MemoryView: React.FC<MemoryViewProps> = ({ memories }) => {
  const { user } = useAuth();

  const handleDelete = async (id: string) => {
    if (!user) return;
    await firestoreService.deleteMemory(user.uid, id);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Agent Private Memory</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Persistent contextual memory and workflow facts learned by your agent from past tasks.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs">
        <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-200">Strict Tenant Memory Isolation</span>
          <p className="text-slate-400 leading-relaxed">
            Your agent's memory is private to your user ID. No global memory is ever shared with other users
            or used outside your personal workspace.
          </p>
        </div>
      </div>

      {memories.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/30 border border-slate-800 text-slate-400 text-xs space-y-2">
          <Brain className="w-8 h-8 text-slate-600 mx-auto" />
          <p>No learned memories yet. As tasks execute, your agent will automatically distill key preferences here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memories.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                    {m.category}
                  </span>

                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-slate-500 hover:text-rose-400 transition p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-semibold text-slate-200 text-xs sm:text-sm mb-1.5">{m.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{m.content}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-[10px] text-slate-500">
                <span>Confidence: {(m.confidence * 100).toFixed(0)}%</span>
                <span>{new Date(m.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
