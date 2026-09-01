import { COMPANY_BRAND } from '../constants/branding';
import { exportToHTMLPDF, shareViaWhatsApp, shareViaEmail } from './exportUtils';

/**
 * Generates an executive, client-ready printable HTML document describing the complete workflow of Sers Soluciones Operativas.
 */
export function generateSystemWorkflowHTML(clientName: string = 'Estimado Cliente'): string {
  const generatedDate = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Flujo de Trabajo y Protocolo Operativo - ${COMPANY_BRAND.name}</title>
  <style>
    @page {
      size: letter;
      margin: 18mm 16mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      line-height: 1.5;
      font-size: 13px;
      padding: 24px;
    }
    .header-table {
      width: 100%;
      border-bottom: 3px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .brand-logo {
      width: 70px;
      height: 70px;
      object-fit: contain;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      font-size: 12px;
      color: #475569;
      font-weight: 500;
      margin-top: 2px;
    }
    .doc-badge {
      display: inline-block;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .main-title {
      font-size: 22px;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 6px;
      letter-spacing: -0.5px;
    }
    .intro-box {
      background: #f8fafc;
      border-left: 4px solid #2563eb;
      padding: 14px 18px;
      border-radius: 0 12px 12px 0;
      margin-bottom: 24px;
      font-size: 12.5px;
      color: #334155;
    }
    .phase-card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 18px;
      margin-bottom: 16px;
      page-break-inside: avoid;
      background: #ffffff;
    }
    .phase-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .phase-number {
      background: #0f172a;
      color: #ffffff;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 12px;
      margin-right: 8px;
    }
    .phase-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      display: inline-flex;
      align-items: center;
    }
    .phase-tag {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 9999px;
      text-transform: uppercase;
    }
    .tag-blue { background: #dbeafe; color: #1e40af; }
    .tag-green { background: #dcfce7; color: #166534; }
    .tag-purple { background: #f3e8ff; color: #6b21a8; }
    .tag-amber { background: #fef3c7; color: #92400e; }
    .tag-slate { background: #f1f5f9; color: #334155; }

    .step-list {
      list-style: none;
      padding: 0;
    }
    .step-item {
      position: relative;
      padding-left: 20px;
      margin-bottom: 8px;
      font-size: 12px;
      color: #334155;
    }
    .step-item::before {
      content: "✓";
      position: absolute;
      left: 0;
      top: 0;
      color: #2563eb;
      font-weight: bold;
    }
    .sla-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
      margin-bottom: 24px;
      font-size: 11.5px;
    }
    .sla-table th {
      background: #0f172a;
      color: #ffffff;
      padding: 10px 12px;
      text-align: left;
      font-weight: 700;
    }
    .sla-table td {
      padding: 9px 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    .sla-table tr:nth-child(even) {
      background: #f8fafc;
    }
    .signatures-section {
      margin-top: 30px;
      padding-top: 18px;
      border-top: 2px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .sig-box {
      width: 46%;
      text-align: center;
      padding-top: 40px;
      border-top: 1px solid #64748b;
      font-size: 11px;
      color: #475569;
    }
    .footer-note {
      margin-top: 24px;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 12px;
    }
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #0f172a;
      color: #fff;
      padding: 10px 18px;
      border-radius: 8px;
      border: none;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    @media print {
      .print-btn { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>

  <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>

  <!-- Header Membretado -->
  <table class="header-table">
    <tr>
      <td style="width: 80px; vertical-align: middle;">
        <img src="${COMPANY_BRAND.logoUrl}" alt="${COMPANY_BRAND.name}" class="brand-logo" />
      </td>
      <td style="vertical-align: middle; padding-left: 14px;">
        <div class="brand-title">${COMPANY_BRAND.legalName}</div>
        <div class="brand-subtitle">${COMPANY_BRAND.tagline}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 3px;">
          RFC: ${COMPANY_BRAND.taxId} • Tel: ${COMPANY_BRAND.phone} • Correo: ${COMPANY_BRAND.email}
        </div>
      </td>
      <td style="text-align: right; vertical-align: middle;">
        <span class="doc-badge">DOCUMENTO OFICIAL</span>
        <div style="font-size: 12px; font-weight: bold; color: #0f172a;">FOLIO: FL-SERS-2026</div>
        <div style="font-size: 11px; color: #64748b;">Fecha: ${generatedDate}</div>
      </td>
    </tr>
  </table>

  <!-- Título Principal -->
  <div style="margin-bottom: 16px;">
    <h1 class="main-title">PROTOCOLO Y FLUJO DE TRABAJO OPERATIVO</h1>
    <div style="font-size: 13px; color: #475569;">
      Guía integral de operación, control de calidad, auditoría fotográfica y gestión transparente para el cliente: <strong>${clientName}</strong>
    </div>
  </div>

  <!-- Resumen Ejecutivo -->
  <div class="intro-box">
    <strong>Objetivo del Protocolo:</strong> Garantizar la máxima calidad y trazabilidad en los servicios de limpieza, sanitización y mantenimiento contratados con <strong>${COMPANY_BRAND.name}</strong>. A través de nuestra plataforma tecnológica, el cliente cuenta con supervisión en tiempo real, auditoría fotográfica antes/después, control estricto de consumibles y validación mediante firma electrónica de conformidad.
  </div>

  <!-- FASE 1 -->
  <div class="phase-card">
    <div class="phase-header">
      <div class="phase-title">
        <span class="phase-number">1</span>
        Fase 1: Programación, Asignación y Despacho Digital
      </div>
      <span class="phase-tag tag-blue">Despacho Inmediato</span>
    </div>
    <ul class="step-list">
      <li class="step-item"><strong>Calendarización de Turnos:</strong> La Dirección Operativa programa los servicios conforme al contrato y necesidades específicas de las instalaciones.</li>
      <li class="step-item"><strong>Asignación de Personal Certificado:</strong> Se designa un técnico operativo calificado y equipado con su kit de herramientas y equipo de protección personal (EPP).</li>
      <li class="step-item"><strong>Despacho Automatizado por WhatsApp:</strong> El técnico recibe en su teléfono la Orden de Servicio con ubicación exacta en Google Maps, horario, instrucciones especiales y checklist de tareas asignadas.</li>
    </ul>
  </div>

  <!-- FASE 2 -->
  <div class="phase-card">
    <div class="phase-header">
      <div class="phase-title">
        <span class="phase-number">2</span>
        Fase 2: Ejecución en Sitio y Control de Calidad
      </div>
      <span class="phase-tag tag-amber">En Campo</span>
    </div>
    <ul class="step-list">
      <li class="step-item"><strong>Check-In y Validación de Estatus:</strong> El técnico marca el inicio del turno ("En Proceso") en el sistema al arribar a las instalaciones.</li>
      <li class="step-item"><strong>Ejecución del Checklist Especializado:</strong> Desinfección de sanitarios, aspirado y abrillantado de pisos, limpieza de escritorios y cancelería, retiro y clasificación de residuos.</li>
      <li class="step-item"><strong>Auditoría Fotográfica (Antes y Después):</strong> Captura obligatoria de evidencias fotográficas en cada área clave con estampa de hora y fecha para auditoría de calidad.</li>
      <li class="step-item"><strong>Registro Inmediato de Incidencias:</strong> Si se detecta un daño previo en instalaciones (fugas, mobiliario dañado, cerraduras), se genera un Acta Digital con fotografía para deslinde y notificación inmediata al cliente.</li>
    </ul>
  </div>

  <!-- FASE 3 -->
  <div class="phase-card">
    <div class="phase-header">
      <div class="phase-title">
        <span class="phase-number">3</span>
        Fase 3: Firma Digital en Sitio y Envío Inmediato de Evidencias por WhatsApp
      </div>
      <span class="phase-tag tag-green">Validación y Notificación</span>
    </div>
    <ul class="step-list">
      <li class="step-item"><strong>Revisión con Responsable en Sitio:</strong> Al concluir las labores, el técnico solicita al supervisor o encargado del cliente la validación física del servicio.</li>
      <li class="step-item"><strong>Firma Electrónica en Pantalla:</strong> El cliente firma directamente en el dispositivo móvil, registrando nombre, cargo y comentarios de satisfacción.</li>
      <li class="step-item"><strong>Envío Inmediato por WhatsApp con Fotos Adjuntas:</strong> Al instante del cierre, el sistema genera y envía automáticamente al cliente el reporte ejecutivo por WhatsApp con las evidencias fotográficas de ANTES y DESPUÉS de cada área, checklist de cumplimiento y constancia de firma.</li>
    </ul>
  </div>

  <!-- FASE 4 -->
  <div class="phase-card">
    <div class="phase-header">
      <div class="phase-title">
        <span class="phase-number">4</span>
        Fase 4: Bóveda de Resguardo Histórico y Blindaje ante Reclamaciones Posteriores
      </div>
      <span class="phase-tag tag-purple">Resguardo Inmutable</span>
    </div>
    <ul class="step-list">
      <li class="step-item"><strong>Resguardo Inmutable de Evidencias:</strong> Toda fotografía, hora de ejecución, checklist verificado y firma electrónica queda archivada de forma permanente y no alterable en la Bóveda de Auditoría.</li>
      <li class="step-item"><strong>Solución Inmediata ante Reclamaciones (Ej. Reclamo de Viernes por Servicio de Lunes):</strong> Si días después surge alguna duda o reclamación sobre un área específica, tanto el cliente como la administración pueden consultar el Expediente Histórico Certificado en 1 clic, descargarlo en PDF oficial o reenviarlo por WhatsApp con las fotos fechadas para solventar cualquier aclaración con total transparencia y certeza técnica.</li>
      <li class="step-item"><strong>Portal del Cliente 24/7 y Control de Insumos:</strong> Acceso permanente a bitácoras, consumo de consumibles de higiene en ciclos de 3 días y módulo de reabastecimiento directo.</li>
    </ul>
  </div>

  <!-- FASE 5 -->
  <div class="phase-card">
    <div class="phase-header">
      <div class="phase-title">
        <span class="phase-number">5</span>
        Fase 5: Supervisión Ejecutiva y Reportes Consolidados
      </div>
      <span class="phase-tag tag-slate">Dirección y Mejora Continua</span>
    </div>
    <ul class="step-list">
      <li class="step-item"><strong>Reportes Mensuales en PDF y Excel:</strong> Envío de reportes consolidados de horas trabajadas, índice de cumplimiento de tareas y satisfacción.</li>
      <li class="step-item"><strong>Facturación Transparente:</strong> Conciliación de cuotas de mantenimiento mensual con respaldo de órdenes firmadas y auditadas.</li>
    </ul>
  </div>

  <!-- Acuerdos de Nivel de Servicio (SLA) -->
  <div style="margin-top: 24px; page-break-inside: avoid;">
    <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">
      MATRIZ DE COMPROMISOS Y TIEMPOS DE RESPUESTA (SLA)
    </h3>
    <table class="sla-table">
      <thead>
        <tr>
          <th>Concepto Operativo</th>
          <th>Compromiso / Estándar</th>
          <th>Canal de Atención</th>
          <th>Trazabilidad</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Puntualidad en Turnos</strong></td>
          <td>Arribo en ventana asignada (Tolerancia ±15 min)</td>
          <td>WhatsApp / Portal</td>
          <td>Check-in en tiempo real</td>
        </tr>
        <tr>
          <td><strong>Envío de Evidencias WhatsApp</strong></td>
          <td>Fotos antes/después enviadas al concluir turno</td>
          <td>WhatsApp Ejecutivo</td>
          <td>Reporte fotográfico interactivo</td>
        </tr>
        <tr>
          <td><strong>Atención a Reclamaciones</strong></td>
          <td>Expediente histórico descargable en segundos</td>
          <td>Bóveda de Auditoría</td>
          <td>Fotos fechadas + Firma electrónica</td>
        </tr>
        <tr>
          <td><strong>Atención de Incidencias</strong></td>
          <td>Notificación en &lt; 30 min y reporte formal</td>
          <td>WhatsApp / Email</td>
          <td>Acta fotográfica con Folio</td>
        </tr>
        <tr>
          <td><strong>Reposición de Insumos</strong></td>
          <td>Entrega en sede en 24 a 48 hrs hábiles</td>
          <td>Portal de Suministros</td>
          <td>Vale de almacén firmado</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Cuadro de Firmas -->
  <div class="signatures-section">
    <div class="sig-box">
      <strong>${COMPANY_BRAND.legalName}</strong><br>
      Dirección de Operaciones y Calidad<br>
      <em>Responsable Operativo Asignado</em>
    </div>
    <div class="sig-box">
      <strong>${clientName}</strong><br>
      Administración / Dirección de Mantenimiento<br>
      <em>Recepción y Aceptación de Protocolo</em>
    </div>
  </div>

  <!-- Pie de Página -->
  <div class="footer-note">
    Documento emitido por la Plataforma Digital de <strong>${COMPANY_BRAND.legalName}</strong> • ${COMPANY_BRAND.address} • Tel: ${COMPANY_BRAND.phone} • ${COMPANY_BRAND.email}
  </div>

</body>
</html>`;
}

/**
 * Downloads the workflow document as an HTML / PDF printable file.
 */
export function downloadSystemWorkflowPDF(clientName?: string): void {
  const finalClientName = clientName || 'Oficinas Corporativas SkyTower';
  const html = generateSystemWorkflowHTML(finalClientName);
  const cleanName = finalClientName.replace(/\s+/g, '_');
  exportToHTMLPDF(`Flujo_de_Trabajo_${COMPANY_BRAND.shortName}_${cleanName}`, html);
}

/**
 * Builds a WhatsApp formatted message with the workflow summary.
 */
export function buildWorkflowWhatsAppSummary(clientName?: string): string {
  const finalClient = clientName || 'Estimado Cliente';
  return `📋 *PROTOCOLO Y FLUJO DE TRABAJO OPERATIVO - ${COMPANY_BRAND.name.toUpperCase()}*\n` +
    `🏢 *Cliente:* ${finalClient}\n\n` +
    `Estimado cliente, compartimos el flujo operativo con el que garantizamos la calidad, supervisión y transparencia en sus instalaciones:\n\n` +
    `1️⃣ *Programación y Despacho Digital:* Asignación de técnicos certificados con despacho vía WhatsApp, ubicación GPS y checklist preconfigurado.\n` +
    `2️⃣ *Ejecución en Sitio:* Limpieza profunda y captura obligatoria de evidencias fotográficas *ANTES / DESPUÉS* con sellos de tiempo.\n` +
    `3️⃣ *Firma en Sitio y Envío por WhatsApp:* Validación física, firma electrónica en pantalla y envío automático del reporte con fotos adjuntas a su WhatsApp.\n` +
    `4️⃣ *Bóveda de Resguardo Histórico:* Archivo digital inmutable de fotos y firmas para resolver cualquier reclamación posterior con total certeza técnica.\n` +
    `5️⃣ *Portal del Cliente 24/7:* Monitoreo de insumos en ciclos de 3 días, bitácoras y solicitud de insumos en 1 clic.\n` +
    `6️⃣ *Supervisión y SLA:* Auditorías mensuales, reportes consolidados en PDF/Excel y atención prioritaria.\n\n` +
    `📄 *Documento oficial disponible para descarga en PDF.*\n` +
    `📞 *Atención:* ${COMPANY_BRAND.phone} | ✉️ *${COMPANY_BRAND.email}*`;
}

/**
 * Shares the workflow summary directly via WhatsApp.
 */
export function shareWorkflowViaWhatsApp(clientName?: string, phone?: string): void {
  const message = buildWorkflowWhatsAppSummary(clientName);
  shareViaWhatsApp(message, phone);
}
