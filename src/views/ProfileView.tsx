import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../lib/firestore-service';
import { UserProfile, AgentConfig } from '../types';
import {
  User,
  Bot,
  Save,
  CheckCircle2,
  Shield,
  Sparkles,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, profile, agentConfig, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [preferredName, setPreferredName] = useState(profile?.preferredName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [professionalTitle, setProfessionalTitle] = useState(profile?.professionalTitle || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [preferredEmailStyle, setPreferredEmailStyle] = useState(
    profile?.preferredEmailStyle || 'Professional and concise'
  );
  const [skillsStr, setSkillsStr] = useState((profile?.skills || []).join(', '));

  // Agent settings
  const [agentName, setAgentName] = useState(agentConfig?.agentName || 'Agent Prime');
  const [autonomyLevel, setAutonomyLevel] = useState<AgentConfig['autonomyLevel']>(
    agentConfig?.autonomyLevel || 'FULL_AUTONOMOUS'
  );
  const [emailNotifications, setEmailNotifications] = useState(
    agentConfig?.emailNotificationsEnabled ?? true
  );

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const skills = skillsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await firestoreService.upsertUserProfile(user.uid, {
        fullName,
        preferredName,
        phone,
        location,
        professionalTitle,
        bio,
        preferredEmailStyle,
        skills,
      });

      await firestoreService.upsertAgentConfig(user.uid, {
        agentName,
        autonomyLevel,
        emailNotificationsEnabled: emailNotifications,
      });

      await refreshProfile();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Profile & Agent Persona</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Configure personal context, professional qualifications, and your agent's autonomy settings.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Profile & Agent settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Identity Section */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Personal & Professional Identity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Md Johirul Islam"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Name / Call Name</label>
              <input
                type="text"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                placeholder="e.g. Johirul"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Professional Title</label>
              <input
                type="text"
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                placeholder="e.g. Molecular Biologist / AI Engineer"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Munich, Germany"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Core Skills (comma separated)</label>
            <input
              type="text"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              placeholder="e.g. Laboratory Analysis, Molecular Biology, PCR, Python, Research"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Professional Bio / Summary</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Summary of experience used when drafting cold applications and emails..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Email Writing Tone</label>
            <input
              type="text"
              value={preferredEmailStyle}
              onChange={(e) => setPreferredEmailStyle(e.target.value)}
              placeholder="e.g. Formal, concise, structured, with bulleted highlights"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Agent Persona Section */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>Dedicated Agent Persona & Autonomy</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Agent Name</label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Autonomy Model</label>
              <select
                value={autonomyLevel}
                onChange={(e) => setAutonomyLevel(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-cyan-500"
              >
                <option value="FULL_AUTONOMOUS">Full Autonomous (Runs to completion, halts only for payments)</option>
                <option value="SEMI_AUTONOMOUS">Semi-Autonomous (Pauses on ambiguous actions)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
              />
              <span>Send me an email via Gmail when an autonomous task completes</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="py-3 px-8 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg transition flex items-center gap-2"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  );
};
