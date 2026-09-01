import { CleaningService, ClientProfile, EmployeeProfile, IncidentReport } from '../types';
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
 * Builds full WhatsApp message with photo evidences breakdown, signature and PDF link
 */
export function buildServiceReportWhatsAppMessageWithEvidences(
  service: CleaningService,
  client?: ClientProfile,
  incidents: IncidentReport[] = []
): string {
  const completedTasks = service.tasks.filter((t) => t.completed).length;
  const totalTasks = service.tasks.length || 1;
  const pct = Math.round((completedTasks / totalTasks) * 100);

  // Format photo evidences
  let evidencesSection = '';
  if (service.evidences.length > 0) {
    evidencesSection =
      `📸 *EVIDENCIAS FOTOGRÁFICAS ADJUNTAS (${service.evidences.length} Áreas):*\n` +
      service.evidences
        .map((ev, idx) => {
          let item = `📍 *${idx + 1}. Área: ${ev.area}* _(${ev.timestamp})_\n`;
          if (ev.beforePhotoUrl) {
            item += `   • 🟧 *Foto Antes:* ${ev.beforePhotoUrl}\n`;
          }
          if (ev.afterPhotoUrl) {
            item += `   • 🟩 *Foto Después:* ${ev.afterPhotoUrl}\n`;
          }
          if (ev.notes) {
            item += `   • 📝 *Notas:* ${ev.notes}\n`;
          }
          return item;
        })
        .join('\n') +
      '\n';
  } else {
    evidencesSection = '📸 *Evidencias Fotográficas:* En proceso de carga en plataforma.\n\n';
  }

  // Format signature
  const signatureSection = service.clientSignature
    ? `✍️ *Firma Digital de Conformidad:* ✅ REGISTRADA EN SITIO\n` +
      `   • *Firmado por:* ${service.clientSignature.signedBy}\n` +
      `   • *Fecha/Hora:* ${service.clientSignature.signedAt}\n` +
      (service.clientSignature.comments ? `   • *Comentarios:* "${service.clientSignature.comments}"\n` : '') +
      '\n'
    : `✍️ *Firma Digital de Conformidad:* ⏳ Pendiente de validación.\n\n`;

  // Related incidents for this service
  const relatedIncidents = incidents.filter((i) => i.serviceId === service.id || i.clientName === service.clientName);
  let incidentSection = '';
  if (relatedIncidents.length > 0) {
    incidentSection =
      `⚠️ *INCIDENCIAS / DAÑOS PREVIOS REPORTADOS:*\n` +
      relatedIncidents
        .map((i) => `   • [${i.id}] *${i.title}*: ${i.description} _(Estado: ${i.status.toUpperCase()})_`)
        .join('\n') +
      '\n\n';
  }

  return (
    `📋 *REPORTE OFICIAL DE SERVICIO Y AUDITORÍA DE CALIDAD*\n` +
    `🏢 *${COMPANY_BRAND.name.toUpperCase()} - ${COMPANY_BRAND.legalName}*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🔖 *Folio de Servicio:* ${service.id}\n` +
    `🏢 *Cliente / Sede:* ${service.clientName}\n` +
    `📅 *Fecha de Ejecución:* ${service.date}\n` +
    `⏰ *Horario:* ${service.timeSlot}\n` +
    `👷 *Técnico Responsable:* ${service.operativeName}\n` +
    `📊 *Estatus de Entrega:* ${service.status.toUpperCase()} (${completedTasks}/${totalTasks} tareas - ${pct}%)\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    evidencesSection +
    signatureSection +
    incidentSection +
    `📄 *EXPEDIENTE DE RESGUARDO HISTÓRICO:*\n` +
    `El expediente digital completo con fotografías en alta resolución, checklist auditado y firma electrónica queda resguardado de forma inmutable en nuestra plataforma para cualquier consulta o aclaración futura.\n\n` +
    `📞 *Atención Operativa:* ${COMPANY_BRAND.phone} | ✉️ *${COMPANY_BRAND.email}*`
  );
}

/**
 * Shares service report with photo evidences directly via WhatsApp
 */
export function shareServiceReportWithEvidencesViaWhatsApp(
  service: CleaningService,
  client?: ClientProfile,
  incidents: IncidentReport[] = []
): void {
  const message = buildServiceReportWhatsAppMessageWithEvidences(service, client, incidents);
  shareViaWhatsApp(message, client?.phone);
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

/**
 * Generates the full Historical Audit Dossier HTML (Expediente de Resguardo Inmutable para Aclaraciones/Reclamaciones)
 */
export function generateHistoricalAuditDossierHTML(
  service: CleaningService,
  client?: ClientProfile,
  incidents: IncidentReport[] = []
): string {
  const completedTasks = service.tasks.filter((t) => t.completed).length;
  const totalTasks = service.tasks.length || 1;
  const pct = Math.round((completedTasks / totalTasks) * 100);

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
            t.completed ? '#dcfce7; color: #166534;' : '#fef2f2; color: #991b1b;'
          }">
            ${t.completed ? 'VERIFICADO (100%)' : 'NO EJECUTADO'}
          </span>
        </td>
      </tr>
    `
    )
    .join('');

  // Evidences Gallery HTML
  let evidencesHtml = '';
  if (service.evidences.length > 0) {
    evidencesHtml = service.evidences
      .map(
        (ev, idx) => `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 14px; page-break-inside: avoid;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">
          <strong style="font-size: 13px; color: #0f172a;">Área ${idx + 1}: ${ev.area}</strong>
          <span style="font-size: 11px; color: #64748b; font-weight: 600;">Hora Registro: ${ev.timestamp}</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <div style="font-size: 11px; font-weight: bold; color: #ea580c; text-transform: uppercase; margin-bottom: 4px;">
              [1] Estado Inicial (ANTES)
            </div>
            ${
              ev.beforePhotoUrl
                ? `<img src="${ev.beforePhotoUrl}" alt="Antes - ${ev.area}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; border: 1px solid #fed7aa;" />`
                : `<div style="height: 160px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 11px;">Sin foto inicial</div>`
            }
          </div>
          <div>
            <div style="font-size: 11px; font-weight: bold; color: #16a34a; text-transform: uppercase; margin-bottom: 4px;">
              [2] Entrega Final (DESPUÉS)
            </div>
            ${
              ev.afterPhotoUrl
                ? `<img src="${ev.afterPhotoUrl}" alt="Después - ${ev.area}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; border: 1px solid #bbf7d0;" />`
                : `<div style="height: 160px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 11px;">Sin foto final</div>`
            }
          </div>
        </div>
        ${
          ev.notes
            ? `<div style="margin-top: 8px; font-size: 11.5px; color: #475569; background: #ffffff; padding: 6px 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <strong>Nota Técnica:</strong> ${ev.notes}
              </div>`
            : ''
        }
      </div>
    `
      )
      .join('');
  } else {
    evidencesHtml = `
      <div style="padding: 16px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; text-align: center; color: #64748b; font-size: 12px;">
        No se adjuntaron fotografías adicionales para este servicio.
      </div>
    `;
  }

  // Incidents HTML
  const relatedIncidents = incidents.filter((i) => i.serviceId === service.id || i.clientName === service.clientName);
  let incidentsHtml = '';
  if (relatedIncidents.length > 0) {
    incidentsHtml = `
      <div style="margin-top: 24px; page-break-inside: avoid;">
        <h3 style="font-size: 13px; font-weight: 800; color: #b45309; text-transform: uppercase; margin-bottom: 8px;">
          Acta de Incidencias y Daños Previos Registrados (Deslinde Operativo)
        </h3>
        ${relatedIncidents
          .map(
            (inc) => `
          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 10px 14px; margin-bottom: 8px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; color: #92400e; margin-bottom: 3px;">
              <span>[${inc.id}] ${inc.title} (${inc.type.replace('_', ' ').toUpperCase()})</span>
              <span>${inc.date} ${inc.time}</span>
            </div>
            <div style="color: #78350f;">${inc.description}</div>
            ${inc.adminResolution ? `<div style="margin-top: 4px; color: #166534; font-size: 11px;"><strong>Resolución:</strong> ${inc.adminResolution}</div>` : ''}
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Expediente Histórico de Auditoría y Resguardo - ${service.id}</title>
  <style>
    @page { size: letter; margin: 18mm 16mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; line-height: 1.5; font-size: 12.5px; padding: 24px; }
    .header-table { width: 100%; border-bottom: 3px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; }
    .brand-logo { width: 64px; height: 64px; object-fit: contain; }
    .badge-dossier { display: inline-block; background: #0f172a; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: bold; letter-spacing: 0.5px; }
    .grid-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 20px; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11.5px; }
    th { background: #0f172a; color: white; padding: 8px 10px; text-align: left; font-size: 10.5px; text-transform: uppercase; }
    .legal-clause { margin-top: 24px; padding: 12px 16px; background: #eff6ff; border-left: 4px solid #2563eb; border-radius: 0 10px 10px 0; font-size: 11px; color: #1e3a8a; }
    .signatures-box { margin-top: 26px; padding-top: 14px; border-top: 2px dashed #cbd5e1; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; page-break-inside: avoid; text-align: center; }
    .sig-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; background: #fafafa; min-height: 120px; display: flex; flex-direction: column; justify-content: flex-end; }
  </style>
</head>
<body>

  <!-- Header Membretado -->
  <table class="header-table">
    <tr>
      <td style="width: 70px; vertical-align: middle;">
        <img src="${COMPANY_BRAND.logoUrl}" alt="${COMPANY_BRAND.name}" class="brand-logo" />
      </td>
      <td style="vertical-align: middle; padding-left: 12px;">
        <div style="font-size: 18px; font-weight: 800; color: #0f172a;">${COMPANY_BRAND.legalName}</div>
        <div style="font-size: 11.5px; color: #475569;">Bóveda de Resguardo Histórico y Expediente de Conformidad</div>
        <div style="font-size: 10.5px; color: #94a3b8;">RFC: ${COMPANY_BRAND.taxId} • Tel: ${COMPANY_BRAND.phone} • ${COMPANY_BRAND.email}</div>
      </td>
      <td style="text-align: right; vertical-align: middle;">
        <span class="badge-dossier">EXPEDIENTE DE AUDITORÍA</span>
        <div style="font-size: 18px; font-weight: 900; color: #2563eb; margin-top: 3px;">FOLIO: ${service.id}</div>
        <div style="font-size: 11px; color: #64748b;">Fecha de Turno: ${service.date}</div>
      </td>
    </tr>
  </table>

  <!-- Resumen de Servicio -->
  <div class="grid-summary">
    <div>
      <div style="font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase;">Cliente / Instalaciones</div>
      <div style="font-size: 14px; font-weight: bold; color: #0f172a; margin-top: 2px;">${service.clientName}</div>
      <div style="color: #475569; margin-top: 2px;">📍 ${service.clientAddress}</div>
      ${client ? `<div style="color: #475569; margin-top: 1px;">👤 Contacto en Sede: ${client.contactPerson} (${client.phone})</div>` : ''}
    </div>
    <div>
      <div style="font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase;">Validación Operativa</div>
      <div style="font-size: 13px; font-weight: bold; color: #2563eb; margin-top: 2px;">👷 Técnico: ${service.operativeName}</div>
      <div style="color: #475569;">Horario: ${service.timeSlot} • Estado: <strong>${service.status.toUpperCase()}</strong></div>
      <div style="color: #166534; font-weight: 600; margin-top: 2px;">Cumplimiento: ${completedTasks}/${totalTasks} tareas (${pct}%)</div>
    </div>
  </div>

  <!-- Checklist Verificado -->
  <div style="margin-bottom: 20px;">
    <h3 style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 4px;">
      1. Protocolo y Checklist de Actividades Verificadas
    </h3>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Actividad Realizada</th>
          <th style="text-align: center;">Resultado</th>
        </tr>
      </thead>
      <tbody>
        ${tasksHtml}
      </tbody>
    </table>
  </div>

  <!-- Galería de Evidencias Antes y Después -->
  <div style="margin-bottom: 20px;">
    <h3 style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 8px;">
      2. Galería de Evidencias Fotográficas de Calidad (Antes / Después)
    </h3>
    ${evidencesHtml}
  </div>

  <!-- Incidencias Registradas -->
  ${incidentsHtml}

  <!-- Cláusula de Resguardo y Validez Legal -->
  <div class="legal-clause">
    <strong>Constancia de Entrega y Resguardo Inmutable:</strong> Este expediente digital certifica las condiciones de entrega del inmueble al momento del cierre de turno. Las evidencias fotográficas y la firma digital contenidas sirven como respaldo documental oficial ante cualquier auditoría o reclamación posterior.
  </div>

  <!-- Firmas de Conformidad -->
  <div class="signatures-box">
    <div class="sig-card">
      <div style="font-size: 12px; font-weight: bold; color: #0f172a;">${service.operativeName}</div>
      <div style="font-size: 10px; color: #64748b;">Técnico Operativo Certificado (${COMPANY_BRAND.name})</div>
    </div>
    <div class="sig-card">
      ${
        service.clientSignature?.signatureDataUrl
          ? `<img src="${service.clientSignature.signatureDataUrl}" style="max-height: 50px; object-fit: contain; margin: 0 auto 6px auto;" />`
          : ''
      }
      <div style="font-size: 12px; font-weight: bold; color: #0f172a;">
        ${service.clientSignature?.signedBy || client?.contactPerson || 'Representante del Cliente'}
      </div>
      <div style="font-size: 10px; color: #166534; font-weight: 600;">
        ${service.clientSignature ? `Firma Digital Registrada (${service.clientSignature.signedAt})` : 'Conformidad Validada en Sede'}
      </div>
      ${service.clientSignature?.comments ? `<div style="font-size: 9.5px; color: #64748b; font-style: italic; margin-top: 2px;">"${service.clientSignature.comments}"</div>` : ''}
    </div>
  </div>

</body>
</html>`;
}

/**
 * Downloads the Historical Audit Dossier as a printable PDF / HTML document
 */
export function downloadHistoricalAuditPDF(
  service: CleaningService,
  client?: ClientProfile,
  incidents: IncidentReport[] = []
): void {
  const html = generateHistoricalAuditDossierHTML(service, client, incidents);
  const cleanClient = service.clientName.replace(/\s+/g, '_');
  exportToHTMLPDF(`Expediente_Auditoria_${service.id}_${cleanClient}`, html);
}

