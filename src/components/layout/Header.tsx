import React from 'react';
import { UserRole } from '../../types';
import { Sparkles, LogOut, HardHat, Building2, ShieldCheck, User, ChevronDown, Database } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  activeModuleName: string;
  onLogout: () => void;
  onSelectRole?: (role: UserRole) => void;
  onOpenSupabase?: () => void;
  clientName?: string;
  operativeName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  activeModuleName,
  onLogout,
  onSelectRole,
  onOpenSupabase,
  clientName,
  operativeName
}) => {
  const getRoleInfo = () => {
    switch (currentRole) {
      case 'operative':
        return {
          label: 'Operativo',
          name: operativeName || 'Carlos Mendoza',
          roleDesc: 'Técnico de Limpieza',
          icon: HardHat,
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'client':
        return {
          label: 'Cliente',
          name: clientName || 'Oficinas SkyTower',
          roleDesc: 'Sede Principal',
          icon: Building2,
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'admin':
        return {
          label: 'Administrador',
          name: 'Carlos Méndez',
          roleDesc: 'Dueño de Negocio',
          icon: ShieldCheck,
          badgeColor: 'bg-slate-100 text-slate-800 border-slate-200'
        };
      default:
        return {
          label: 'Usuario',
          name: 'Usuario',
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
        <div className="flex md:hidden items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            {activeModuleName}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${roleInfo.badgeColor}`}>
              {roleInfo.label}
            </span>
            <p className="text-xs text-slate-400 font-medium hidden sm:inline">
              Gestión CleanPro
            </p>
          </div>
        </div>
      </div>

      {/* Right: Supabase Button, Quick Role Switcher & User Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {onOpenSupabase && (
          <button
            onClick={onOpenSupabase}
            title="Estado y Configuración de Supabase"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs cursor-pointer transition-all shadow-xs"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Supabase</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>
        )}

        {onSelectRole && (
          <div className="hidden lg:flex items-center bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80 text-xs">
            <button
              onClick={() => onSelectRole('admin')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentRole === 'admin'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin
            </button>
            <button
              onClick={() => onSelectRole('client')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentRole === 'client'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Cliente
            </button>
            <button
              onClick={() => onSelectRole('operative')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentRole === 'operative'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HardHat className="w-3.5 h-3.5" /> Operativo
            </button>
          </div>
        )}

        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-800 leading-tight">
            {roleInfo.name}
          </p>
          <p className="text-xs text-slate-400 font-medium">
            {roleInfo.roleDesc}
          </p>
        </div>

        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-700 font-bold text-sm">
          {roleInfo.name.charAt(0)}
        </div>

        {/* Switch Role / Logout button */}
        <button
          onClick={onLogout}
          title="Cambiar Rol"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm cursor-pointer transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Cambiar Rol</span>
          <span className="sm:hidden">Roles</span>
        </button>
      </div>
    </header>
  );
};

