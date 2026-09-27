import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DriveKnowledge } from '../types';
import { googleWorkspace } from '../lib/google-services';
import {
  FolderOpen,
  FileText,
  FileCheck,
  Table,
  Presentation,
  RefreshCw,
  FolderPlus,
  ExternalLink,
  ShieldCheck,
  Search,
  CheckCircle2,
} from 'lucide-react';

interface KnowledgeViewProps {
  knowledge: DriveKnowledge[];
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({ knowledge }) => {
  const { accessToken, user, refreshDriveKnowledge } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderCreatedId, setFolderCreatedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const handleSyncDrive = async () => {
    setIsRefreshing(true);
    try {
      await refreshDriveKnowledge();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateAgentOSFolder = async () => {
    if (!accessToken) return;
    setIsCreatingFolder(true);
    try {
      const folderId = await googleWorkspace.createAgentOSFolder(accessToken);
      if (folderId) setFolderCreatedId(folderId);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const filtered = knowledge.filter(
    (k) =>
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Google Drive Knowledge Base
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Indexed authorized documents used as contextual grounding and attachments during tasks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateAgentOSFolder}
            disabled={isCreatingFolder}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5"
          >
            <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Setup AgentOS Folder</span>
          </button>

          <button
            onClick={handleSyncDrive}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Resync Drive</span>
          </button>
        </div>
      </div>

      {folderCreatedId && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
          <span>AgentOS folder structure successfully verified in your Google Drive!</span>
          <a
            href={`https://drive.google.com/drive/folders/${folderCreatedId}`}
            target="_blank"
            rel="noreferrer"
            className="font-bold underline flex items-center gap-1"
          >
            <span>Open in Drive</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Recommended Folder Architecture Blueprint */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-semibold text-slate-200 block mb-0.5">
            Recommended Drive Taxonomy (Automatic)
          </span>
          <p className="text-slate-400">
            AgentOS/ • Knowledge/ • CV/ • Documents/ • Reports/ • Templates/
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Strict Least-Privilege Drive Access</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter indexed CVs, certificates, sheets, docs..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
        />
      </div>

      {/* Document Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/30 border border-slate-800 text-slate-400 text-xs space-y-2">
          <FolderOpen className="w-8 h-8 text-slate-600 mx-auto" />
          <p>No documents found in index. Click "Resync Drive" to scan authorized files.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const isCV = item.category === 'CV';
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all shadow-md ${
                  isCV
                    ? 'bg-indigo-950/20 border-indigo-500/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.category === 'CV'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : item.category === 'CERTIFICATE'
                        ? 'bg-purple-500/20 text-purple-300'
                        : item.category === 'SPREADSHEET'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.category}
                  </span>

                  {item.webViewLink && (
                    <a
                      href={item.webViewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded text-slate-500 hover:text-cyan-400 transition"
                      title="Open in Google Drive"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <h3 className="font-semibold text-slate-200 text-xs line-clamp-1 mb-1">{item.name}</h3>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {item.summary || 'Authorized for task contextual retrieval and attachments.'}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{item.mimeType.split('.').pop() || 'document'}</span>
                  <span>{item.lastModified ? new Date(item.lastModified).toLocaleDateString() : 'Indexed'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
