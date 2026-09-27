import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  PlayCircle,
  FileCheck,
  Clock,
  FolderOpen,
  Sliders,
  Brain,
  Link2,
  User,
  BookOpen,
  Sparkles,
  Camera,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
  pendingApprovalsCount: number;
  runningTasksCount: number;
  onOpenMultimodalStudio: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  isOpen,
  onClose,
  pendingApprovalsCount,
  runningTasksCount,
  onOpenMultimodalStudio,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'new-task', label: 'New Task', icon: PlusCircle, highlight: true },
    { id: 'tasks', label: 'Running & Queue', icon: PlayCircle, badge: runningTasksCount > 0 ? runningTasksCount : null },
    { id: 'reports', label: 'Reports & History', icon: FileCheck },
    { id: 'approvals', label: 'Waiting for You', icon: Clock, alertBadge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null },
    { id: 'knowledge', label: 'Agent Knowledge', icon: FolderOpen },
    { id: 'instructions', label: 'Agent Instructions', icon: Sliders },
    { id: 'memory', label: 'Agent Memory', icon: Brain },
    { id: 'connections', label: 'Google Connections', icon: Link2 },
    { id: 'profile', label: 'Profile & Agent', icon: User },
    { id: 'docs', label: 'Cloud Architecture', icon: BookOpen },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Aside Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-950/95 lg:bg-slate-950/60 lg:backdrop-blur-xl border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header on Mobile */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-slate-800">
          <span className="font-bold text-slate-100 text-sm">AgentOS Navigation</span>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : item.highlight
                    ? 'text-indigo-300 hover:bg-indigo-500/10 hover:text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-cyan-400'
                        : item.highlight
                        ? 'text-indigo-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {/* Status Badges */}
                {item.alertBadge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.alertBadge}
                  </span>
                )}
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Feature Pill: Multimodal AI Studio */}
        <div className="p-3 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-slate-100">Multimodal Studio</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Image Generation (1K/2K/4K), Vision Inspection & Grounding tools.
            </p>
            <button
              onClick={() => {
                onOpenMultimodalStudio();
                onClose();
              }}
              className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Open Studio</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
