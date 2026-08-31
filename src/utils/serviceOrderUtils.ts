import { CleaningService, ClientProfile, EmployeeProfile } from '../types';
import { COMPANY_BRAND } from '../constants/branding';
import { shareViaWhatsApp, exportToHTMLPDF } from './exportUtils';

export interface TaskTemplate {
  name: string;
  category: string;
}

export const SERVICE_TASK_PRESETS: { [key: string]: TaskTemplate[] } = {
  'Oficinas y Corporativo': [
    { name: 'Limpieza y aspirado de alfombras y pisos duros', category: 'Pisos' },
    { name: 'Desinfección de escritorios y estaciones de trabajo', category: 'Mobiliario' },
    { name: 'Limpieza profunda y sanitización de baños', category: 'Sanitarios' },
    { name: 'Vaciado y desinfección de cestos de basura', category: 'Residuos' },
    { name: 'Limpieza de cristales interiores y puertas de vidrio', category: 'Cristales' },
    { name: 'Aromatización y reposición de consumibles de higiene', category: 'Insumos' }
  ],
  'Industrial y Bodegas': [
    { name: 'Barrer y mapear pasillos industriales con barredora', category: 'Pisos' },
    { name: 'Desengrase y limpieza de bahías de carga', category: 'Zonas Comunes' },
    { name: 'Limpieza de lockers y vestidores del personal', category: 'Sanitarios' },
    { name: 'Recolección y compactación de cartón y plásticos', category: 'Residuos' },
    { name: 'Desinfección de comedores y áreas de descanso', category: 'Comedor' }
  ],
  'Vidrios y Alturas': [
    { name: 'Limpieza de fachadas y ventanales exteriores', category: 'Exterior' },
    { name: 'Eliminación de manchas de agua dura en cancelería', category: 'Cristales' },
    { name: 'Limpieza de canceles templados y barandales', category: 'Estructura' },
    { name: 'Revisión y protocolo de arnés y línea de vida', category: 'Seguridad' }
  ],
  'Clínico / Desinfección Profunda': [
    { name: 'Desinfección de grado hospitalario con sales cuaternarias', category: 'Desinfección' },
    { name: 'Esterilización de manijas, apagadores y superficies de contacto', category: 'Superficies' },
    { name: 'Manejo especial de residuos biológicos según norma', category: 'Residuos' },
    { name: 'Desinfección de consultorios y salas de espera', category: 'Áreas Críticas' }
  ]
};

/**
 * Builds standard WhatsApp dispatch text for the technician
 */
export function buildServiceOrderWhatsAppMessage(
  service: CleaningService,
  client?: ClientProfile,
  employee?: EmployeeProfile
): string {
  const gmapsLink = `https://maps.google.com/?q=${encodeURIComponent(service.clientAddress || service.clientName)}`;
  const tasksList = service.tasks
    .map((t, idx) => `  ${idx + 1}. [${t.completed ? 'x' : ' '}] ${t.name} _(${t.category})_`)
    .join('\n');

  return (
    `📋 *ORDEN DE SERVICIO OFICIAL - ${COMPANY_BRAND.name.toUpperCase()}*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🔖 *Folio:* ${service.id}\n` +
    `👷 *Técnico Asignado:* ${service.operativeName}\n` +
    `🏢 *Cliente / Sede:* ${service.clientName}\n` +
    `📅 *Fecha de Turno:* ${service.date}\n` +
    `⏰ *Horario:* ${service.timeSlot}\n` +
    `📍 *Dirección:* ${service.clientAddress}\n` +
    `🗺️ *Ubicación en Google Maps:* ${gmapsLink}\n` +
    (client ? `👤 *Contacto en Sitio:* ${client.contactPerson} (${client.phone})\n` : '') +
    `━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📝 *CHECKLIST DE TAREAS PROGRAMADAS:*\n${tasksList}\n\n` +
    (service.specialInstructions ? `⚠️ *Instrucciones Especiales:*\n"${service.specialInstructions}"\n\n` : '') +
    `📲 *Protocolo en Campo:*\n` +
    `1. Marca "En Proceso" al iniciar.\n` +
    `2. Toma fotos de evidencia de ANTES y DESPUÉS.\n` +
    `3. En caso de daño previo, levanta tu acta de incidencia.\n` +
    `4. Pide la firma digital de conformidad al cliente al concluir.\n\n` +
    `🏢 *${COMPANY_BRAND.legalName}*`
  );
}

/**
 * Dispatches service order directly to assigned employee's WhatsApp
 */
export function sendServiceOrderToEmployee(
  service: CleaningService,
  client?: ClientProfile,
  employee?: EmployeeProfile
): void {
  const text = buildServiceOrderWhatsAppMessage(service, client, employee);
  shareViaWhatsApp(text, employee?.phone || client?.assignedEmployeePhone);
}

/**
 * Generates an official printable PDF Order for the client & technician
 */
export function generateServiceOrderHTML(
  service: CleaningService,
  client?: ClientProfile
): string {
  const tasksHtml = service.tasks
    .map(
      (t, idx) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; width: 40px; font-weight: bold;">
          ${idx + 1}
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
          <span style="font-weight: 600; color: #0f172a;">${t.name}</span>
          <span style="display: block; font-size: 11px; color: #64748b;">Categoría: ${t.category}</span>
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; width: 120px;">
          <span style="display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; background: ${
            t.completed ? '#dcfce7; color: #166534;' : '#f1f5f9; color: #475569;'
          }">
            ${t.completed ? 'COMPLETADO' : 'PROGRAMADO'}
          </span>
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Orden de Servicio - ${service.id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 35px; color: #0f172a; line-height: 1.5; }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .brand-flex { display: flex; align-items: center; gap: 14px; }
    .logo-img { width: 56px; height: 56px; object-fit: contain; }
    .title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; }
    .grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; margin-bottom: 20px; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
    th { background: #0f172a; color: white; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; text-align: center; }
    .sig-box { border: 1px dashed #94a3b8; border-radius: 12px; height: 110px; display: flex; flex-direction: column; justify-content: flex-end; padding: 10px; background: #fafafa; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand-flex">
      <img src="${COMPANY_BRAND.logoUrl}" alt="${COMPANY_BRAND.name}" class="logo-img" />
      <div>
        <h1 class="title">${COMPANY_BRAND.legalName}</h1>
        <div style="font-size: 12px; color: #64748b;">Orden Oficial de Servicio y Asignación Operativa</div>
        <div style="font-size: 11px; color: #94a3b8;">RFC: ${COMPANY_BRAND.taxId} • ${COMPANY_BRAND.address}</div>
      </div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 11px; color: #64748b; font-weight: bold;">FOLIO DE ORDEN</div>
      <div style="font-size: 20px; font-weight: 900; color: #2563eb;">${service.id}</div>
      <div style="font-size: 11px; color: #475569;">Fecha: ${service.date} (${service.timeSlot})</div>
    </div>
  </div>

  <div class="grid-info">
    <div>
      <div style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Datos del Cliente / Sede</div>
      <div style="font-size: 15px; font-weight: bold; color: #0f172a;">${service.clientName}</div>
      <div style="color: #475569; margin-top: 2px;">📍 ${service.clientAddress}</div>
      ${client ? `<div style="color: #475569; margin-top: 2px;">👤 Contacto: ${client.contactPerson} (${client.phone})</div>` : ''}
    </div>
    <div>
      <div style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Personal Técnico Asignado</div>
      <div style="font-size: 15px; font-weight: bold; color: #2563eb;">👷 ${service.operativeName}</div>
      <div style="color: #475569; margin-top: 2px;">Estado de Orden: <strong>${service.status.toUpperCase()}</strong></div>
      ${service.specialInstructions ? `<div style="color: #d97706; margin-top: 4px; font-size: 12px;"><strong>Instrucciones:</strong> ${service.specialInstructions}</div>` : ''}
    </div>
  </div>

  <div style="margin-top: 20px;">
    <h3 style="font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 8px;">Checklist y Actividades del Servicio</h3>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Descripción de la Tarea</th>
          <th style="text-align: center;">Estado</th>
        </tr>
      </thead>
      <tbody>
        ${tasksHtml}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <div>
      <div class="sig-box">
        <div style="font-size: 12px; font-weight: bold; color: #0f172a;">${service.operativeName}</div>
        <div style="font-size: 10px; color: #64748b;">Firma del Técnico Operativo</div>
      </div>
    </div>
    <div>
      <div class="sig-box">
        ${
          service.clientSignature?.signatureDataUrl
            ? `<img src="${service.clientSignature.signatureDataUrl}" style="max-height: 55px; object-fit: contain; margin: 0 auto;" />`
            : ''
        }
        <div style="font-size: 12px; font-weight: bold; color: #0f172a;">
          ${service.clientSignature?.signedBy || client?.contactPerson || 'Responsable de Sede'}
        </div>
        <div style="font-size: 10px; color: #64748b;">Firma de Conformidad del Cliente en Sitio</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
