import React from 'react';
import { UserRole, AppUser } from '../../types';
import { Sparkles, LogOut, LucideIcon, User, Settings, ShieldCheck, HardHat, Building2 } from 'lucide-react';
import { COMPANY_BRAND } from '../../constants/branding';

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
  currentUser?: AppUser | null;
  onOpenProfile?: () => void;
  isAdmin?: boolean;
  onSelectRole?: (role: UserRole) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  navItems,
  activeTab,
  onTabChange,
  onLogout,
  currentUser,
  onOpenProfile,
  isAdmin,
  onSelectRole
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
    <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 h-screen sticky top-0 shrink-0 select-none justify-between py-6 px-6 overflow-y-auto">
      <div>
        {/* Brand Header with Sers Logo */}
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-1 border border-slate-100 shadow-sm shrink-0 overflow-hidden">
            <img
              src={COMPANY_BRAND.logoUrl}
              alt={COMPANY_BRAND.name}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-extrabold text-base tracking-tight leading-tight text-slate-900 truncate">
              {COMPANY_BRAND.name}
            </h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-0.5">
              {getRoleTitle()}
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Módulos Principales
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

      {/* Bottom Profile & Actions Area */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        {/* Profile Card Button */}
        {onOpenProfile && (
          <button
            onClick={onOpenProfile}
            className="w-full p-2.5 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/70 hover:border-blue-200 text-left transition-all cursor-pointer group flex items-center justify-between"
            title="Abrir Mi Perfil (foto, clave, datos)"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-xs shrink-0 flex items-center justify-center font-bold text-slate-700 text-sm">
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  currentUser?.name.charAt(0) || 'U'
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-700">
                  {currentUser?.name || 'Mi Perfil'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  @{currentUser?.username || 'usuario'}
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-white group-hover:bg-blue-600 text-slate-400 group-hover:text-white flex items-center justify-center shadow-xs transition-colors shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
          </button>
        )}

        {/* Admin Multi-Role Navigation (Strictly visible only if logged in user is Admin) */}
        {isAdmin && onSelectRole && (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Navegar Roles (Admin)
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Acceso Total Concedido"></span>
            </div>
            <div className="grid grid-cols-1 gap-1">
              <button
                type="button"
                onClick={() => onSelectRole('admin')}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                  currentRole === 'admin'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Panel Administrador</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectRole('operative')}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                  currentRole === 'operative'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <HardHat className="w-3.5 h-3.5 text-amber-500" />
                <span>Vista Operativa</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectRole('client')}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                  currentRole === 'client'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Portal de Cliente</span>
              </button>
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          className="w-full p-2.5 text-slate-600 hover:text-red-600 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer border border-transparent hover:border-red-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
