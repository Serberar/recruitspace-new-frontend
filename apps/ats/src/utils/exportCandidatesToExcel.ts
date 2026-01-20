/**
 * Utilidad para exportar candidatos de un proceso de seleccion a Excel
 * Usa la libreria xlsx que es ligera y genera el archivo en el cliente
 */
import * as XLSX from 'xlsx';
import type { SelectionProcess, ProcessStatus } from '@/types';

interface ExportOptions {
  offerTitle: string;
  processes: SelectionProcess[];
  statuses: ProcessStatus[];
}

/**
 * Exporta los candidatos de una oferta a un archivo Excel
 * Se ejecuta completamente en el cliente, sin carga al servidor
 */
export function exportCandidatesToExcel({ offerTitle, processes, statuses }: ExportOptions): void {
  // Crear mapa de estados para lookup rapido
  const statusMap = new Map(statuses.map(s => [s.id, s.name]));

  // Preparar datos para el Excel
  const data = processes.map(process => {
    const candidate = process.candidate;
    if (!candidate) return null;

    // Formatear experiencia
    const experienceText = candidate.experience
      ?.map(exp => {
        const parts = [];
        if (exp.role) parts.push(exp.role);
        if (exp.company) parts.push(`en ${exp.company}`);
        if (exp.startDate || exp.endDate) {
          parts.push(`(${exp.startDate || '?'} - ${exp.endDate || 'Presente'})`);
        }
        return parts.join(' ');
      })
      .join('\n') || '';

    // Formatear educacion
    const educationText = candidate.education
      ?.map(edu => {
        const parts = [];
        if (edu.degree) parts.push(edu.degree);
        if (edu.field) parts.push(`en ${edu.field}`);
        if (edu.institution) parts.push(`- ${edu.institution}`);
        if (edu.startDate || edu.endDate) {
          parts.push(`(${edu.startDate || '?'} - ${edu.endDate || 'Presente'})`);
        }
        return parts.join(' ');
      })
      .join('\n') || '';

    return {
      'Nombre': candidate.fullName || '',
      'Email': candidate.email || '',
      'Telefono': candidate.phone || '',
      'LinkedIn': candidate.linkedinUrl || '',
      'Estado': statusMap.get(process.statusId) || '',
      'Resumen': candidate.summary || '',
      'Habilidades': candidate.skills?.join(', ') || '',
      'Idiomas': (candidate as { languages?: string[] }).languages?.join(', ') || '',
      'Experiencia': experienceText,
      'Formacion': educationText,
      'Fecha aplicacion': process.createdAt ? new Date(process.createdAt).toLocaleDateString('es-ES') : '',
    };
  }).filter(Boolean);

  if (data.length === 0) {
    return;
  }

  // Crear workbook y worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Ajustar anchos de columna
  const columnWidths = [
    { wch: 25 },  // Nombre
    { wch: 30 },  // Email
    { wch: 15 },  // Telefono
    { wch: 35 },  // LinkedIn
    { wch: 15 },  // Estado
    { wch: 50 },  // Resumen
    { wch: 40 },  // Habilidades
    { wch: 25 },  // Idiomas
    { wch: 50 },  // Experiencia
    { wch: 50 },  // Formacion
    { wch: 15 },  // Fecha aplicacion
  ];
  worksheet['!cols'] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidatos');

  // Generar nombre de archivo seguro
  const safeTitle = offerTitle
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
  const date = new Date().toISOString().split('T')[0];
  const filename = `Candidatos_${safeTitle}_${date}.xlsx`;

  // Descargar archivo
  XLSX.writeFile(workbook, filename);
}
