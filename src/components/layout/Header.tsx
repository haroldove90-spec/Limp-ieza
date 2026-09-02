import React from 'react';
import { UserRole, AppUser } from '../../types';
import {
  Sparkles,
  LogOut,
  HardHat,
  Building2,
  ShieldCheck,
  User,
  ChevronDown,
  Database,
  FileText
} from 'lucide-react';
import { COMPANY_BRAND } from '../../constants/branding';

interface HeaderProps {
  currentRole: UserRole;
  activeModuleName: string;
  onLogout: () => void;
  onSelectRole?: (role: UserRole) => void;
  onOpenSupabase?: () => void;
  onOpenWorkflow?: () => void;
  clientName?: string;
  operativeName?: string;
  currentUser?: AppUser | null;
  onOpenProfile?: () => void;
  isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  activeModuleName,
  onLogout,
  onSelectRole,
  onOpenSupabase,
  onOpenWorkflow,
  clientName,
  operativeName,
  currentUser,
  onOpenProfile,
  isAdmin
}) => {
  const getRoleInfo = () => {
    switch (currentRole) {
      case 'operative':
        return {
          label: 'Operativo',
          name: currentUser?.name || operativeName || 'José del Carmen Sotero',
          roleDesc: currentUser?.jobTitle || 'Técnico Especialista de Limpieza',
          icon: HardHat,
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'client':
        return {
          label: 'Cliente',
          name: currentUser?.name || clientName || 'Oficinas SkyTower',
          roleDesc: currentUser?.jobTitle || 'Sede Principal',
          icon: Building2,
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'admin':
        return {
          label: 'Administrador',
          name: currentUser?.name || 'Harold Anguiano Morales',
          roleDesc: currentUser?.jobTitle || 'Dirección General SERS',
          icon: ShieldCheck,
          badgeColor: 'bg-slate-100 text-slate-800 border-slate-200'
        };
      default:
        return {
          label: 'Usuario',
          name: currentUser?.name || 'Usuario',
          roleDesc: 'General',
          icon: User,
          badgeColor: 'bg-slate-50 text-slate-600 border-slate-200'
        };
    }
  };

  const roleInfo = getRoleInfo();
  const Icon = roleInfo.icon;

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 md:px-10 sticky top-0 z-20">
      {/* Left: Mobile Brand & Active module title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 border border-slate-200 shadow-xs shrink-0 overflow-hidden">
            <img
              src={COMPANY_BRAND.logoUrl}
              alt={COMPANY_BRAND.name}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-800 tracking-tight leading-tight">
            {activeModuleName}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${roleInfo.badgeColor}`}>
              {roleInfo.label}
            </span>
            <p className="text-xs text-slate-500 font-semibold hidden sm:inline">
              {COMPANY_BRAND.name}
            </p>
          </div>
        </div>
      </div>

      {/* Center: Admin Multi-Role Quick Access (Strictly exclusive for Admin) */}
      {isAdmin && onSelectRole && (
        <div className="hidden md:flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 select-none">
            Navegar Rol:
          </span>
          <button
            type="button"
            onClick={() => onSelectRole('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentRole === 'admin'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
            title="Ir a Panel Administrador"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Admin</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectRole('operative')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentRole === 'operative'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
            title="Navegar como Operativo"
          >
            <HardHat className="w-3.5 h-3.5 text-amber-400" />
            <span>Operativo</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectRole('client')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentRole === 'client'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
            title="Navegar como Cliente"
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Cliente</span>
          </button>
        </div>
      )}

      {/* Right: User Profile & Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* User Profile Card Button */}
        {onOpenProfile ? (
          <button
            onClick={onOpenProfile}
            title="Ver y editar Mi Perfil (foto, clave y datos)"
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200 text-left"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {roleInfo.name}
              </p>
              <p className="text-[10px] text-blue-600 font-semibold">
                Mi Perfil
              </p>
            </div>

            <div className="relative">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-700 font-bold text-sm">
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={roleInfo.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  roleInfo.name.charAt(0)
                )}
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0"></span>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">
                {roleInfo.name}
              </p>
              <p className="text-xs text-slate-400 font-medium">
                {roleInfo.roleDesc}
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-700 font-bold text-sm">
              {roleInfo.name.charAt(0)}
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={onLogout}
          title="Cerrar Sesión"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 font-semibold text-xs shadow-xs cursor-pointer transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </div>
    </header>
  );
};
