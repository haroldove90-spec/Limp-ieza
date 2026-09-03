import React from 'react';
import { NavItem } from './Sidebar';
import { UserRole } from '../../types';
import { ShieldCheck, HardHat, Building2 } from 'lucide-react';

interface BottomNavProps {
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isAdmin?: boolean;
  currentRole?: UserRole;
  onSelectRole?: (role: UserRole) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  navItems,
  activeTab,
  onTabChange,
  isAdmin,
  currentRole,
  onSelectRole
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-slate-200 shadow-xl px-2 py-1.5 safe-area-pb">
      {/* Quick Role Switcher for Admin on Mobile */}
      {(isAdmin || onSelectRole) && onSelectRole && (
        <div className="flex items-center justify-between gap-1 pb-1.5 mb-1.5 border-b border-slate-100 px-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0">
            Rol:
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSelectRole('admin')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                currentRole === 'admin'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-3 h-3 text-blue-400" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectRole('operative')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                currentRole === 'operative'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <HardHat className="w-3 h-3 text-amber-300" />
              <span>Operativo</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectRole('client')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                currentRole === 'client'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3 h-3 text-emerald-300" />
              <span>Cliente</span>
            </button>
          </div>
        </div>
      )}

      <nav className="grid grid-flow-col auto-cols-fr gap-1 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-blue-700 font-bold bg-blue-50'
                  : 'text-slate-500 font-medium hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badgeCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] leading-tight tracking-tight mt-1 truncate max-w-[76px] text-center">
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

