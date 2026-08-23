import React from 'react';
import { UserRole } from '../../types';
import { Sparkles, LogOut, LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  name: string;
  icon: LucideIcon;
  badgeCount?: number;
}

interface SidebarProps {
  currentRole: UserRole;
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  navItems,
  activeTab,
  onTabChange,
  onLogout
}) => {
  const getRoleTitle = () => {
    switch (currentRole) {
      case 'operative':
        return 'Personal Operativo';
      case 'client':
        return 'Portal de Cliente';
      case 'admin':
        return 'Administración';
      default:
        return 'Dashboard';
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 h-screen sticky top-0 shrink-0 select-none justify-between py-8 px-6">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight leading-tight text-slate-900">
              Gestión de<br />Limpieza
            </h1>
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mt-0.5">
              {getRoleTitle()}
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Módulos
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="tracking-tight text-left">{item.name}</span>
                </div>

                {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Switch Role / Logout area */}
      <div className="space-y-2 pt-6 border-t border-slate-100">
        <button
          onClick={onLogout}
          className="w-full p-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl flex items-center justify-center gap-3 font-semibold text-sm shadow-lg shadow-slate-200 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Cambiar Rol</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full p-2.5 text-red-600 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
