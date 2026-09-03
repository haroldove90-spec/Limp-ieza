import { COMPANY_BRAND } from '../constants/branding';
import { cleanPhoneNumber } from './exportUtils';

export const SYSTEM_PRODUCTION_URL = 'https://limp-ieza.vercel.app';

/**
 * Builds the direct access URL for a specific role and user.
 * When clicked, the system reads the query parameters and logs the user directly into their dashboard.
 */
export function buildDirectAccessUrl(role: 'operative' | 'client' | 'admin', user?: string, pass?: string): string {
  const baseUrl = SYSTEM_PRODUCTION_URL;
  const params = new URLSearchParams();
  params.set('role', role);
  if (user) params.set('user', user);
  if (pass) params.set('pass', pass);
  return `${baseUrl}/?${params.toString()}`;
}

/**
 * Generates the official WhatsApp message with credentials and direct access link for Operative Staff.
 */
export function buildEmployeeWhatsAppMessage(emp: {
  name: string;
  username?: string;
  password?: string;
  role?: string;
  assignedZone?: string;
  phone?: string;
  email?: string;
}): string {
  const finalUser = emp.username || emp.email || 'usuario_sers';
  const finalPass = emp.password || 'Sers#Segura2025!';
  const directLink = buildDirectAccessUrl('operative', finalUser, finalPass);

  return `👋 *¡Hola ${emp.name}!*
Te damos la bienvenida al equipo operativo de *${COMPANY_BRAND.name}*.

Tus credenciales de acceso al sistema son:
👤 *Usuario o Correo:* ${finalUser}
🔑 *Contraseña:* ${finalPass}
🛡️ *Rol:* ${emp.role || 'Técnico Operativo'}
📍 *Zona Asignada:* ${emp.assignedZone || 'Zona de Servicio'}

🚀 *Enlace de Acceso Directo a tu Rol (Operativo):*
${directLink}

_(Haz clic en el enlace para entrar directamente a tu agenda diaria, realizar check-in de insumos y registrar evidencias fotográficas antes/después)._`;
}

/**
 * Generates the official WhatsApp message with credentials and direct access link for Clients.
 */
export function buildClientWhatsAppMessage(client: {
  name: string;
  contactPerson?: string;
  username?: string;
  password?: string;
  phone?: string;
  email?: string;
  address?: string;
}): string {
  const contactName = client.contactPerson || client.name;
  const finalUser = client.username || client.email || 'cliente_sers';
  const finalPass = client.password || 'Sers#Cliente2025!';
  const directLink = buildDirectAccessUrl('client', finalUser, finalPass);

  return `🏢 *Estimado/a ${contactName}*,
Le damos la más cordial bienvenida a la plataforma de supervisión de *${COMPANY_BRAND.name}*.

Sus credenciales de acceso al Portal de Cliente son:
👤 *Usuario o Correo:* ${finalUser}
🔑 *Contraseña:* ${finalPass}
🏢 *Sede / Razón Social:* ${client.name}
🛡️ *Rol:* Portal de Cliente

🚀 *Enlace de Acceso Directo a su Portal:*
${directLink}

_(Al hacer clic accederá directamente al seguimiento fotográfico de servicios antes/después, reportes periódicos de 3 días y acuses de calidad de su sede)._`;
}

/**
 * Opens WhatsApp directly with pre-filled message and cleaned phone number.
 */
export function shareEmployeeViaWhatsApp(emp: {
  name: string;
  username?: string;
  password?: string;
  role?: string;
  assignedZone?: string;
  phone?: string;
  email?: string;
}): void {
  const text = buildEmployeeWhatsAppMessage(emp);
  const cleanPhone = cleanPhoneNumber(emp.phone);
  const url = cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Opens WhatsApp directly for a client with pre-filled message and cleaned phone number.
 */
export function shareClientViaWhatsApp(client: {
  name: string;
  contactPerson?: string;
  username?: string;
  password?: string;
  phone?: string;
  email?: string;
  address?: string;
}): void {
  const text = buildClientWhatsAppMessage(client);
  const cleanPhone = cleanPhoneNumber(client.phone);
  const url = cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
