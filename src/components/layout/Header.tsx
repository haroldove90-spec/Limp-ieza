import React from 'react';
import { UserRole } from '../../types';
import { Sparkles, LogOut, HardHat, Building2, ShieldCheck, User } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  activeModuleName: string;
  onLogout: () => void;
  clientName?: string;
  operativeName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  activeModuleName,
  onLogout,
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
          <p className="text-xs text-slate-400 font-medium hidden sm:block">
            Panel: {roleInfo.label}
          </p>
        </div>
      </div>

      {/* Right: User Profile & Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
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

        {/* Mobile Switch Role / Logout button */}
        <button
          onClick={onLogout}
          title="Cerrar sesión / Cambiar Rol"
          className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs shadow-sm cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Salir</span>
        </button>
      </div>
    </header>
  );
};
