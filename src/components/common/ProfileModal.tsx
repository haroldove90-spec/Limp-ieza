import React, { useState, useRef } from 'react';
import { AppUser, UserRole } from '../../types';
import { supabaseService } from '../../services/supabaseService';
import {
  User,
  Camera,
  Upload,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Sparkles,
  ShieldCheck,
  HardHat,
  Building2,
  Trash2
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  onUpdateUser: (updatedUser: AppUser) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser
}) => {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [jobTitle, setJobTitle] = useState(currentUser.jobTitle || '');
  const [notes, setNotes] = useState(currentUser.notes || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [password, setPassword] = useState(currentUser.password || '');
  const [showPassword, setShowPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Photo File Upload with automatic smart canvas compression
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Por favor selecciona un archivo de imagen válido (JPG, PNG o WEBP).' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const rawDataUrl = loadEvt.target?.result as string;
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 280;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.82);
            setAvatarUrl(compressedUrl);
            setStatusMessage({ type: 'success', text: 'Foto cargada correctamente. Haz clic en "Guardar y Actualizar Perfil" para aplicar los cambios.' });
          } else {
            setAvatarUrl(rawDataUrl);
            setStatusMessage({ type: 'success', text: 'Foto cargada. Recuerda hacer clic en "Guardar y Actualizar Perfil".' });
          }
        } catch {
          setAvatarUrl(rawDataUrl);
          setStatusMessage({ type: 'success', text: 'Foto cargada. Recuerda hacer clic en "Guardar y Actualizar Perfil".' });
        }
      };
      img.onerror = () => {
        setAvatarUrl(rawDataUrl);
        setStatusMessage({ type: 'success', text: 'Foto cargada. Recuerda hacer clic en "Guardar y Actualizar Perfil".' });
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Generate secure password
  const handleGenerateSecurePassword = () => {
    const prefix = 'Sers#';
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newPwd = `${prefix}${rand}!`;
    setPassword(newPwd);
    setShowPassword(true);
  };

  // Avatar presets
  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80'
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const updatedUser: AppUser = {
      ...currentUser,
      name,
      email,
      phone,
      jobTitle,
      notes,
      avatarUrl,
      password
    };

    try {
      // 1. Update in Supabase
      const res = await supabaseService.updateUserProfile(currentUser.id, {
        name,
        email,
        phone,
        jobTitle,
        notes,
        avatarUrl,
        password,
        username: currentUser.username
      });

      // 2. Update locally in app state
      onUpdateUser(updatedUser);

      // 3. Save to localStorage
      try {
        localStorage.setItem('cleanpro_current_user', JSON.stringify(updatedUser));
        localStorage.setItem('cleanpro_auth_user', JSON.stringify(updatedUser));
      } catch {
        // ignore
      }

      if (res.success) {
        setStatusMessage({ type: 'success', text: '¡Foto de perfil y datos actualizados exitosamente en Supabase!' });
      } else {
        setStatusMessage({
          type: 'success',
          text: 'Perfil y foto guardados localmente (' + (res.error || 'sin conexión') + ')'
        });
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Error al guardar: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrador / Dirección', icon: ShieldCheck, color: 'bg-slate-900 text-white' };
      case 'operative':
        return { label: 'Personal Operativo / Técnico', icon: HardHat, color: 'bg-blue-600 text-white' };
      case 'client':
        return { label: 'Representante de Cliente', icon: Building2, color: 'bg-emerald-600 text-white' };
      default:
        return { label: 'Usuario', icon: User, color: 'bg-slate-700 text-white' };
    }
  };

  const roleBadge = getRoleBadge(currentUser.role);
  const RoleIcon = roleBadge.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Mi Perfil de Usuario</h3>
              <p className="text-xs text-slate-300">Consulta y actualiza tus datos de acceso y foto</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Photo & Role Header Card */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
            {/* Avatar with Upload button */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-200 flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-2xl font-bold text-slate-600">
                    {name.charAt(0) || 'U'}
                  </span>
                )}
              </div>

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-900/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold gap-1"
                title="Subir foto desde dispositivo"
              >
                <Camera className="w-5 h-5" />
                <span>Cambiar Foto</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Info & Presets */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${roleBadge.color}`}>
                  <RoleIcon className="w-3 h-3" />
                  {roleBadge.label}
                </span>
                <span className="text-xs font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  @{currentUser.username}
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium">
                Haz clic sobre la foto para subir un archivo desde tu dispositivo, o elige uno de estos avatares:
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  <span>Subir Foto</span>
                </button>

                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className="w-7 h-7 rounded-full overflow-hidden border-2 border-white hover:scale-110 shadow-xs transition-transform cursor-pointer"
                    title="Avatar predeterminado"
                  >
                    <img src={preset} alt="Avatar preset" className="w-full h-full object-cover" />
                  </button>
                ))}
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="w-7 h-7 rounded-full bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600 flex items-center justify-center cursor-pointer transition-colors"
                    title="Quitar foto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre Completo */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nombre Completo:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
              />
            </div>

            {/* Usuario (Lectura / Fijo) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nombre de Usuario:
              </label>
              <input
                type="text"
                disabled
                value={currentUser.username}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-slate-100 text-slate-500 font-mono cursor-not-allowed"
                title="El nombre de usuario es tu identificador único en el sistema"
              />
            </div>

            {/* Correo Electrónico */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Correo Electrónico:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Teléfono Celular (WhatsApp):
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Puesto / Especialidad */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Puesto / Cargo:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Zona Asignada */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Zona Asignada:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  disabled
                  value={currentUser.assignedZone || 'Zona General'}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Password Update Section */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-blue-600" />
                  Actualizar Contraseña de Acceso
                </h4>
                <p className="text-[11px] text-slate-500">
                  Puedes escribir tu propia clave o generar una clave segura aleatoria
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateSecurePassword}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Generar Clave Segura
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3.5 pr-11 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Notas u Observaciones */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Notas del Perfil / Observaciones:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas internas del perfil..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-slate-300 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-blue-400" />
              <span>{saving ? 'Guardando...' : 'Guardar y Actualizar Perfil'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
