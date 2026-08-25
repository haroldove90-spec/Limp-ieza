import React from 'react';
import { UserRole } from '../../types';
import { Sparkles, HardHat, Building2, ShieldCheck, ArrowRight } from 'lucide-react';

interface RoleSelectorHomeProps {
  onSelectRole: (role: UserRole) => void;
}

export const RoleSelectorHome: React.FC<RoleSelectorHomeProps> = ({ onSelectRole }) => {
  const roles = [
    {
      id: 'operative' as UserRole,
      title: 'Personal Operativo',
      desc: 'Agenda diaria, fotos antes/después, reporte de fallas en PDF y control de almacén/insumos.',
      icon: HardHat,
      iconBg: 'bg-blue-100 text-blue-600',
      badge: 'Campo',
      accentColor: 'hover:border-blue-500 hover:shadow-blue-100/50',
      active: true
    },
    {
      id: 'client' as UserRole,
      title: 'Portal de Cliente',
      desc: 'Evidencias de trabajo, auditoría fotográfica y solicitud de insumos (reporte de 3 días).',
      icon: Building2,
      iconBg: 'bg-emerald-100 text-emerald-600',
      badge: 'Transparencia',
      accentColor: 'hover:border-emerald-500 hover:shadow-emerald-100/50',
      active: true
    },
    {
      id: 'admin' as UserRole,
      title: 'Administrador / Dueño',
      desc: 'Supervisión de calidad, cotizaciones, inventario central, finanzas y equipo.',
      icon: ShieldCheck,
      iconBg: 'bg-slate-900 text-white',
      badge: 'Control Total',
      accentColor: 'hover:border-slate-800 hover:shadow-slate-200',
      active: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between p-6 md:p-12">
      {/* Brand Header */}
      <header className="max-w-5xl mx-auto w-full pt-4 md:pt-8 text-center">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200/80 mb-6">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 text-xs md:text-sm tracking-tight uppercase">
            Gestión de Limpieza
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Gestión de negocio Limpieza
        </h1>
        <p className="text-slate-500 text-base md:text-lg mt-3 font-normal max-w-xl mx-auto">
          Selecciona tu rol para acceder a la plataforma centralizada
        </p>
      </header>

      {/* Role Cards: 3 columns on desktop, responsive on mobile */}
      <main className="max-w-5xl mx-auto w-full my-auto py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {roles
            .filter((r) => r.active)
            .map((role) => {
              const Icon = role.icon;

              return (
                <button
                  key={role.id}
                  onClick={() => onSelectRole(role.id)}
                  className={`group relative bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 text-left transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between ${role.accentColor}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-6 md:mb-8">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${role.iconBg} shadow-xs`}
                      >
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                        {role.badge}
                      </span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight group-hover:text-slate-900">
                      {role.title}
                    </h2>

                    <p className="text-xs md:text-sm text-slate-500 mt-2 font-normal leading-relaxed">
                      {role.desc}
                    </p>
                  </div>

                  <div className="mt-8 md:mt-10 pt-4 border-t border-slate-100 flex items-center justify-between text-slate-600 group-hover:text-slate-900 font-semibold text-xs md:text-sm">
                    <span>Ingresar al panel</span>
                    <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="max-w-5xl mx-auto w-full pb-4 text-center text-xs md:text-sm text-slate-400 font-medium">
        <span>Plataforma Operativa de Supervisión, Insumos y Control de Calidad</span>
      </footer>
    </div>
  );
};
