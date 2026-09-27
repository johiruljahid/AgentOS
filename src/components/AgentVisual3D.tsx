import React from 'react';
import { motion } from 'motion/react';

interface AgentVisualProps {
  status: 'IDLE' | 'RUNNING' | 'WAITING' | 'OFFLINE';
  size?: 'sm' | 'md' | 'lg';
}

export const AgentVisual3D: React.FC<AgentVisualProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-44 h-44',
  };

  const getStatusColor = () => {
    switch (status) {
      case 'RUNNING':
        return {
          glow: 'rgba(56, 189, 248, 0.45)',
          core: 'from-cyan-400 to-indigo-600',
          ring: 'border-cyan-400',
          orbit: 'border-indigo-400',
        };
      case 'WAITING':
        return {
          glow: 'rgba(245, 158, 11, 0.45)',
          core: 'from-amber-400 to-orange-600',
          ring: 'border-amber-400',
          orbit: 'border-amber-300',
        };
      case 'OFFLINE':
        return {
          glow: 'rgba(100, 116, 139, 0.2)',
          core: 'from-slate-400 to-slate-600',
          ring: 'border-slate-500',
          orbit: 'border-slate-600',
        };
      default:
        return {
          glow: 'rgba(99, 102, 241, 0.35)',
          core: 'from-indigo-400 to-purple-600',
          ring: 'border-indigo-400',
          orbit: 'border-purple-400',
        };
    }
  };

  const colors = getStatusColor();

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} select-none`}>
      {/* Ambient Glow */}
      <div
        className="absolute inset-0 rounded-full blur-2xl transition-all duration-700 pointer-events-none"
        style={{ backgroundColor: colors.glow }}
      />

      {/* Outer 3D Gyroscopic Orbit Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: status === 'RUNNING' ? 6 : 14, repeat: Infinity, ease: 'linear' }}
        className={`absolute inset-0 rounded-full border border-dashed opacity-50 ${colors.orbit}`}
      />

      {/* Middle Counter-Rotating Ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: status === 'RUNNING' ? 8 : 18, repeat: Infinity, ease: 'linear' }}
        className={`absolute inset-2 rounded-full border border-t-2 border-b-0 border-l-0 ${colors.ring} opacity-80`}
      />

      {/* Holographic Core Sphere */}
      <motion.div
        animate={
          status === 'RUNNING'
            ? { scale: [1, 1.08, 1], rotate: [0, 45, 0] }
            : status === 'WAITING'
            ? { scale: [1, 1.12, 1] }
            : { scale: [1, 1.03, 1] }
        }
        transition={{ duration: status === 'RUNNING' ? 2 : 3, repeat: Infinity, ease: 'easeInOut' }}
        className={`relative w-3/5 h-3/5 rounded-full bg-gradient-to-tr ${colors.core} shadow-2xl flex items-center justify-center overflow-hidden backdrop-blur-sm`}
      >
        {/* Core highlight reflection */}
        <div className="absolute top-1 left-2 w-3/5 h-2/5 rounded-full bg-white/40 blur-[2px]" />

        {/* Inner holographic eye / neural spark */}
        <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_12px_#fff]" />
      </motion.div>

      {/* Micro Orbit Satellite Nodes */}
      {status === 'RUNNING' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />
        </motion.div>
      )}
    </div>
  );
};
