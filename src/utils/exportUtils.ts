// Centralized export and sharing utilities for Excel (CSV), PDF, WhatsApp, and Email

/**
 * Exports tabular data to an Excel-compatible CSV file with UTF-8 BOM encoding.
 */
export function exportToExcel(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): void {
  const sanitizeCell = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const stringVal = String(val).replace(/"/g, '""');
    return `"${stringVal}"`;
  };

  const csvContent =
    '\uFEFF' +
    [
      headers.map(sanitizeCell).join(','),
      ...rows.map((row) => row.map(sanitizeCell).join(','))
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a structured HTML printable document or triggers print dialog for PDF generation.
 */
export function exportToHTMLPDF(
  filename: string,
  htmlContent: string
): void {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Cleans a phone number for WhatsApp URL (removes spaces, +, -, etc.)
 */
export function cleanPhoneNumber(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '');
}

/**
 * Opens WhatsApp Web or WhatsApp Mobile App with pre-filled message text.
 */
export function shareViaWhatsApp(text: string, phone?: string): void {
  const cleanPhone = cleanPhoneNumber(phone);
  let whatsappUrl = '';
  if (cleanPhone) {
    whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
  } else {
    whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  }
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Opens the native email client via mailto:
 */
export function shareViaEmail(recipient: string, subject: string, body: string): void {
  const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
}
