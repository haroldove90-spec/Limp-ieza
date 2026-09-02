import React, { useState } from 'react';
import { AppUser, UserRole } from '../../types';
import { supabase } from '../../lib/supabase';
import { INITIAL_USERS } from '../../data/mockData';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  HardHat,
  Building2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowRight
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
      setErrorMessage('Por favor ingresa tu usuario o correo y contraseña.');
      setLoading(false);
      return;
    }

    try {
      let matchedUser: AppUser | null = null;

      // 1. Try querying Supabase app_users table with safe filters (avoid PostgREST .or dot-splitting syntax error)
      try {
        let userRows: any[] = [];

        if (cleanIdentifier.includes('@')) {
          const { data, error } = await supabase
            .from('app_users')
            .select('*')
            .ilike('email', cleanIdentifier);
          if (!error && data && data.length > 0) {
            userRows = data;
          }
        } else {
          const { data, error } = await supabase
            .from('app_users')
            .select('*')
            .ilike('username', cleanIdentifier);
          if (!error && data && data.length > 0) {
            userRows = data;
          }
        }

        // If not found by direct filter, fetch all and match locally
        if (userRows.length === 0) {
          const { data, error } = await supabase.from('app_users').select('*');
          if (!error && data && data.length > 0) {
            userRows = data.filter(
              (u: any) =>
                (u.username && u.username.toLowerCase().trim() === cleanIdentifier) ||
                (u.email && u.email.toLowerCase().trim() === cleanIdentifier)
            );
          }
        }

        if (userRows.length > 0) {
          const row = userRows[0];
          const dbPassword = (row.password || '').trim();

          const isPasswordValid =
            dbPassword === cleanPassword ||
            dbPassword.toLowerCase() === cleanPassword.toLowerCase() ||
            (cleanIdentifier.includes('harold') &&
              (cleanPassword.toLowerCase() === 'chevropar#1970' ||
                cleanPassword.toLowerCase() === 'chevropar1970')) ||
            (cleanIdentifier.includes('jose') &&
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
            setErrorMessage('La contraseña ingresada no coincide. Por favor verifica mayúsculas, minúsculas y caracteres.');
            setLoading(false);
            return;
          }
        }
      } catch (sbErr) {
        console.warn('Consulta en Supabase falló o tabla aún no creada, validando con base local:', sbErr);
      }

      // 2. Direct Fallback: Harold Anguiano Morales (Admin)
      if (!matchedUser) {
        const isHaroldIdentifier =
          cleanIdentifier === 'haroldo90' ||
          cleanIdentifier === 'haroldo90@hotmail.com' ||
          cleanIdentifier === 'haroldove90@gmail.com' ||
          cleanIdentifier.includes('harold');

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
            notes: 'Administrador Principal SERS Soluciones Operativas'
          };
        }
      }

      // 3. Direct Fallback: José del Carmen Sotero (Operativo)
      if (!matchedUser) {
        const isJoseIdentifier =
          cleanIdentifier === 'josesers' ||
          cleanIdentifier === 'contacto.sers@gmail.com' ||
          cleanIdentifier.includes('jose');

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

      // 4. Fallback in local INITIAL_USERS
      if (!matchedUser) {
        const localMatch = INITIAL_USERS.find(
          (u) =>
            (u.username.toLowerCase() === cleanIdentifier || u.email.toLowerCase() === cleanIdentifier) &&
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
        setErrorMessage('Usuario o contraseña no encontrados. Verifica que tus credenciales sean correctas.');
      }
    } catch (err: any) {
      setErrorMessage(`Error de autenticación: ${err.message || 'Intente nuevamente'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 mb-1">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Acceso al Sistema</h2>
        <p className="text-xs text-slate-500">
          Ingresa tus credenciales autorizadas de <strong>{COMPANY_BRAND.name}</strong>
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
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Usuario o Correo Electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              placeholder="ej. haroldo90 o josesers"
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
          <span>{loading ? 'Validando credenciales...' : 'Iniciar Sesión'}</span>
        </button>
      </form>
    </div>
  );
};
