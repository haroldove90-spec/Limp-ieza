import React, { useState } from 'react';
import { AppUser, UserRole } from '../../types';
import { supabase } from '../../lib/supabase';
import { INITIAL_USERS } from '../../data/mockData';
import {
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  HardHat,
  Building2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  Info
} from 'lucide-react';
import { COMPANY_BRAND } from '../../constants/branding';

interface LoginFormProps {
  onLoginSuccess: (user: AppUser) => void;
  onSwitchToRoleSelector?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onSwitchToRoleSelector
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const cleanIdentifier = identifier.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setErrorMessage('Por favor ingresa tu usuario o correo y tu contraseña.');
      setLoading(false);
      return;
    }

    try {
      let matchedUser: AppUser | null = null;

      // 1. Intentar consultar en Supabase (tabla app_users por username o por email)
      try {
        const [emailRes, usernameRes] = await Promise.all([
          supabase.from('app_users').select('*').ilike('email', cleanIdentifier),
          supabase.from('app_users').select('*').ilike('username', cleanIdentifier)
        ]);

        let combined = [
          ...(emailRes.data || []),
          ...(usernameRes.data || [])
        ];

        // Si no se encontró en app_users, buscar en la tabla employees por email o username
        if (combined.length === 0) {
          const [empEmailRes, empUserRes] = await Promise.all([
            supabase.from('employees').select('*').ilike('email', cleanIdentifier),
            supabase.from('employees').select('*').ilike('username', cleanIdentifier)
          ]);
          const empCombined = [...(empEmailRes.data || []), ...(empUserRes.data || [])];
          if (empCombined.length > 0) {
            combined = empCombined.map((e: any) => ({
              id: e.id,
              name: e.name,
              email: e.email,
              username: e.username || (e.email ? e.email.split('@')[0] : 'usuario'),
              password: e.password,
              role: (e.role?.toLowerCase().includes('admin') || e.role?.toLowerCase().includes('director'))
                ? 'admin'
                : 'operative',
              job_title: e.job_title || e.role,
              phone: e.phone,
              assigned_zone: e.assigned_zone,
              avatar_url: e.avatar_url,
              status: e.status || 'activo',
              notes: e.notes
            }));
          }
        }

        // Si todavía no hay registros y no hubo error de conexión, intentar traer todos para filtro local
        if (combined.length === 0) {
          const { data, error } = await supabase.from('app_users').select('*');
          if (!error && data && data.length > 0) {
            combined = data.filter(
              (u: any) =>
                (u.username && u.username.toLowerCase().trim() === cleanIdentifier) ||
                (u.email && u.email.toLowerCase().trim() === cleanIdentifier)
            );
          }
        }

        if (combined.length > 0) {
          const row = combined[0];
          const dbPassword = (row.password || '').trim();

          const isPasswordValid =
            dbPassword === cleanPassword ||
            dbPassword.toLowerCase() === cleanPassword.toLowerCase() ||
            ((cleanIdentifier.includes('harold') || cleanIdentifier === 'haroldo90') &&
              (cleanPassword.toLowerCase() === 'chevropar#1970' ||
                cleanPassword.toLowerCase() === 'chevropar1970')) ||
            ((cleanIdentifier.includes('jose') || cleanIdentifier === 'josesers') &&
              (cleanPassword.toLowerCase() === 'sers#segura2025!' ||
                cleanPassword.toLowerCase() === 'sers#segura2025'));

          if (isPasswordValid) {
            matchedUser = {
              id: row.id,
              name: row.name,
              email: row.email,
              username: row.username,
              password: row.password,
              role: row.role as any,
              jobTitle: row.job_title || undefined,
              phone: row.phone,
              assignedZone: row.assigned_zone || undefined,
              avatarUrl: row.avatar_url || undefined,
              status: row.status || 'activo',
              notes: row.notes || undefined,
              createdAt: row.created_at || undefined
            };
          } else {
            setErrorMessage('La contraseña ingresada no coincide. Por favor verifica mayúsculas y caracteres especiales.');
            setLoading(false);
            return;
          }
        }
      } catch (sbErr) {
        console.warn('Consulta en Supabase falló o tabla aún no creada, validando con base local:', sbErr);
      }

      // 2. Respaldo Directo: Harold Anguiano Morales (Admin) - Acepta usuario o correos
      if (!matchedUser) {
        const isHaroldIdentifier =
          cleanIdentifier === 'haroldo90' ||
          cleanIdentifier === 'haroldo90@hotmail.com' ||
          cleanIdentifier === 'haroldove90@gmail.com' ||
          cleanIdentifier === 'harold' ||
          cleanIdentifier === 'admin';

        const isHaroldPassword =
          cleanPassword === 'Chevropar#1970' ||
          cleanPassword.toLowerCase() === 'chevropar#1970' ||
          cleanPassword === 'Chevropar1970' ||
          cleanPassword.toLowerCase() === 'chevropar1970';

        if (isHaroldIdentifier && isHaroldPassword) {
          matchedUser = {
            id: 'USR-HAROLD-01',
            name: 'Harold Anguiano Morales',
            email: 'haroldo90@hotmail.com',
            username: 'haroldo90',
            password: 'Chevropar#1970',
            role: 'admin',
            jobTitle: 'Director General / Administrador',
            phone: '+52 55 1234 5678',
            assignedZone: 'Oficina Central / Todas las Zonas',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
            status: 'activo',
            notes: 'Administrador Principal SERS Soluciones'
          };
        }
      }

      // 3. Respaldo Directo: José del Carmen Sotero (Operativo) - Acepta usuario o correos
      if (!matchedUser) {
        const isJoseIdentifier =
          cleanIdentifier === 'josesers' ||
          cleanIdentifier === 'contacto.sers@gmail.com' ||
          cleanIdentifier === 'josesers@gmail.com' ||
          cleanIdentifier === 'jose' ||
          cleanIdentifier === 'sotero';

        const isJosePassword =
          cleanPassword === 'Sers#Segura2025!' ||
          cleanPassword.toLowerCase() === 'sers#segura2025!' ||
          cleanPassword === 'Sers#Segura2025' ||
          cleanPassword.toLowerCase() === 'sers#segura2025';

        if (isJoseIdentifier && isJosePassword) {
          matchedUser = {
            id: 'USR-JOSE-02',
            name: 'José del Carmen Sotero',
            email: 'contacto.sers@gmail.com',
            username: 'josesers',
            password: 'Sers#Segura2025!',
            role: 'operative',
            jobTitle: 'Supervisor Operativo / Técnico Especialista',
            phone: '+52 99 3123 4567',
            assignedZone: 'Zona Industrial y Corporativa',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
            status: 'activo',
            notes: 'Supervisor Operativo en Sitio'
          };
        }
      }

      // 4. Respaldo en lista INITIAL_USERS (validando tanto username como email)
      if (!matchedUser) {
        const localMatch = INITIAL_USERS.find(
          (u) =>
            (u.username.toLowerCase() === cleanIdentifier ||
              u.email.toLowerCase() === cleanIdentifier ||
              (u.username === 'haroldo90' &&
                (cleanIdentifier === 'haroldove90@gmail.com' ||
                  cleanIdentifier === 'haroldo90@hotmail.com')) ||
              (u.username === 'josesers' && cleanIdentifier === 'contacto.sers@gmail.com')) &&
            (u.password === cleanPassword || u.password.toLowerCase() === cleanPassword.toLowerCase())
        );

        if (localMatch) {
          matchedUser = localMatch;
        }
      }

      if (matchedUser) {
        try {
          localStorage.setItem('cleanpro_current_user', JSON.stringify(matchedUser));
        } catch {
          // ignore
        }
        onLoginSuccess(matchedUser);
      } else {
        setErrorMessage(
          'Usuario, correo o contraseña no encontrados. Verifica que el identificador ingresado (nombre de usuario o correo) y la contraseña sean correctos.'
        );
      }
    } catch (err: any) {
      setErrorMessage(`Error de autenticación: ${err.message || 'Intente nuevamente'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (userOrEmail: string, pass: string) => {
    setIdentifier(userOrEmail);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6">
      {/* App Header & Official Brand Icon */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-slate-800 shadow-md p-2 mx-auto flex items-center justify-center">
          <img
            src="https://ksnvpnvpajhujmwutumh.supabase.co/storage/v1/object/public/logo/icono.png"
            alt="Sers Soluciones"
            className="w-full h-full object-contain"
          />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {COMPANY_BRAND.name}
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Acceso seguro al sistema con <strong>Usuario</strong> o <strong>Correo Electrónico</strong>
        </p>
      </div>

      {/* Dual Access Indicator Badge */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-blue-800">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Puedes ingresar con tu <strong>nombre de usuario</strong> (ej. <code className="bg-blue-100 px-1 py-0.5 rounded text-[11px] font-mono">haroldo90</code>) o con tu <strong>correo</strong> (ej. <code className="bg-blue-100 px-1 py-0.5 rounded text-[11px] font-mono">haroldo90@hotmail.com</code>).
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-start gap-2.5 animate-shake">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700">
              Usuario o Correo Electrónico
            </label>
            <span className="text-[10px] font-semibold text-slate-400">
              {identifier.includes('@') ? 'Detectado: Correo' : identifier.trim() ? 'Detectado: Usuario' : 'Cualquiera de los dos'}
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {identifier.includes('@') ? (
                <Mail className="w-4 h-4 text-blue-500" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <input
              type="text"
              required
              placeholder="ej. haroldo90 o haroldo90@hotmail.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-slate-300 transition-all disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-block animate-spin mr-1">↻</span>
          ) : (
            <LogIn className="w-4 h-4 text-blue-400" />
          )}
          <span>{loading ? 'Validando acceso...' : 'Iniciar Sesión'}</span>
        </button>
      </form>

      {/* Acceso Rápido para Pruebas (Usuario o Correo) */}
      <div className="pt-2 border-t border-slate-100">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
          Credenciales Oficiales SERS
        </p>

        <div className="grid grid-cols-1 gap-2">
          {/* Harold Anguiano (Admin) */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Harold Anguiano (Admin)
              </span>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                Admin
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <button
                type="button"
                onClick={() => handleQuickFill('haroldo90', 'Chevropar#1970')}
                className="px-2 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-[11px] text-slate-700 hover:text-blue-700 cursor-pointer transition-colors"
                title="Llenar usando nombre de usuario"
              >
                Usuario: <strong>haroldo90</strong>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('haroldo90@hotmail.com', 'Chevropar#1970')}
                className="px-2 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-[11px] text-slate-700 hover:text-blue-700 cursor-pointer transition-colors"
                title="Llenar usando correo electrónico"
              >
                Correo: <strong>haroldo90@hotmail.com</strong>
              </button>
            </div>
          </div>

          {/* José del Carmen Sotero (Operativo) */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <HardHat className="w-3.5 h-3.5 text-amber-500" />
                José del Carmen Sotero
              </span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                Operativo
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <button
                type="button"
                onClick={() => handleQuickFill('josesers', 'Sers#Segura2025!')}
                className="px-2 py-1 rounded-lg bg-white hover:bg-amber-50 border border-slate-200 text-[11px] text-slate-700 hover:text-amber-800 cursor-pointer transition-colors"
                title="Llenar usando nombre de usuario"
              >
                Usuario: <strong>josesers</strong>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('contacto.sers@gmail.com', 'Sers#Segura2025!')}
                className="px-2 py-1 rounded-lg bg-white hover:bg-amber-50 border border-slate-200 text-[11px] text-slate-700 hover:text-amber-800 cursor-pointer transition-colors"
                title="Llenar usando correo electrónico"
              >
                Correo: <strong>contacto.sers@gmail.com</strong>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

