import React from 'react';
import { UserRole, AppUser } from '../../types';
import { COMPANY_BRAND } from '../../constants/branding';
import { LoginForm } from '../auth/LoginForm';

interface RoleSelectorHomeProps {
  onSelectRole: (role: UserRole) => void;
  onLoginSuccess?: (user: AppUser) => void;
  onOpenSupabase?: () => void;
  onOpenWorkflow?: () => void;
}

export const RoleSelectorHome: React.FC<RoleSelectorHomeProps> = ({
  onSelectRole,
  onLoginSuccess
}) => {
  const handleLogin = (user: AppUser) => {
    if (onLoginSuccess) {
      onLoginSuccess(user);
    } else {
      onSelectRole(user.role);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between p-6 md:p-12">
      {/* Brand Header */}
      <header className="max-w-5xl mx-auto w-full pt-4 md:pt-8 text-center">
        {/* Large Prominent Logo Container */}
        <div className="flex items-center justify-center mb-4">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-3xl p-3 border border-slate-200/80 shadow-md flex items-center justify-center overflow-hidden transition-transform hover:scale-105">
            <img
              src={COMPANY_BRAND.logoUrl}
              alt={COMPANY_BRAND.name}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {COMPANY_BRAND.name}
        </h1>
        <p className="text-slate-500 text-sm md:text-base mt-2 font-normal max-w-xl mx-auto">
          Plataforma centralizada de supervisión, calidad, insumos y control operativo
        </p>
      </header>

      {/* Main Content: Direct Login Form */}
      <main className="max-w-5xl mx-auto w-full my-auto py-8">
        <div className="flex justify-center animate-fade-in">
          <LoginForm onLoginSuccess={handleLogin} />
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="max-w-5xl mx-auto w-full pb-4 text-center text-xs md:text-sm text-slate-400 font-medium">
        <span>{COMPANY_BRAND.legalName} • Todos los derechos reservados</span>
      </footer>
    </div>
  );
};
