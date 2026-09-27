import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../lib/firestore-service';
import { AgentInstruction } from '../types';
import {
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  Shield,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface InstructionsViewProps {
  instructions: AgentInstruction[];
}

export const InstructionsView: React.FC<InstructionsViewProps> = ({ instructions }) => {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<AgentInstruction['category']>('COMMUNICATION');
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !content.trim()) return;

    setIsSaving(true);
    try {
      const newInst: AgentInstruction = {
        id: `inst_${Date.now()}`,
        userId: user.uid,
        title: title.trim(),
        content: content.trim(),
        category,
        isActive: true,
        priority: instructions.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await firestoreService.saveInstruction(user.uid, newInst);
      setTitle('');
      setContent('');
      setShowAddForm(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (inst: AgentInstruction) => {
    if (!user) return;
    await firestoreService.saveInstruction(user.uid, {
      ...inst,
      isActive: !inst.isActive,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await firestoreService.deleteInstruction(user.uid, id);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Agent Directives & Instructions</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Explicit behavioral guidelines loaded by your agent during task planning.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Directive</span>
        </button>
      </div>

      {/* Priority Rule Hierarchy Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs">
        <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-200">Execution Priority Hierarchy</span>
          <p className="text-slate-400 leading-relaxed">
            1. System Safety Rules → 2. Platform Permissions → 3. User Agent Instructions → 4. Task Command.
            User instructions belong exclusively to your tenant and cannot be seen by other users.
          </p>
        </div>
      </div>

      {/* Add Instruction Modal / Form */}
      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-xl space-y-4 animate-in fade-in"
        >
          <h3 className="font-semibold text-sm text-white">New Agent Directive</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Instruction Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CV Selection for Biotech Jobs"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
              >
                <option value="COMMUNICATION">Communication & Email</option>
                <option value="APPLICATIONS">Job Applications & CV</option>
                <option value="PAYMENTS">Payments & Safety</option>
                <option value="CALENDAR">Calendar & Appointments</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Directive Details</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. When applying for laboratory jobs, emphasize my molecular biology background and use my latest CV file from Drive..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition"
            >
              Save Directive
            </button>
          </div>
        </form>
      )}

      {/* Instructions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {instructions.map((inst) => (
          <div
            key={inst.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              inst.isActive
                ? 'bg-slate-900/60 border-slate-800 shadow-md'
                : 'bg-slate-950/30 border-slate-900 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                  {inst.category}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(inst)}
                    className="text-xs text-slate-400 hover:text-cyan-400 transition"
                    title={inst.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {inst.isActive ? (
                      <ToggleRight className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-slate-600" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(inst.id)}
                    className="text-slate-500 hover:text-rose-400 transition p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-slate-100 text-xs sm:text-sm mb-1.5">{inst.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{inst.content}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/60 mt-3 flex items-center justify-between text-[10px] text-slate-500">
              <span>Tenant: Scoped to your Agent</span>
              <span>{inst.isActive ? 'Active Directive' : 'Disabled'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
