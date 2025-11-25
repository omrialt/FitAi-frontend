/**
 * Custom hook for exporting data to PDF and Excel
 */

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { TrainingPlan } from '../types/training-plan.types';

interface UseExportOptions {
  filename?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseExportReturn {
  exportToPDF: (data: TrainingPlan[], columns: string[]) => void;
  exportToExcel: (data: TrainingPlan[], columns: string[]) => void;
  isExporting: boolean;
  error: Error | null;
}

export function useExport(options: UseExportOptions = {}): UseExportReturn {
  const { filename = 'export', onSuccess, onError } = options;
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const exportToPDF = (data: TrainingPlan[], columns: string[]) => {
    try {
      setIsExporting(true);
      setError(null);

      // Create new PDF document
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.text('My Training Plans', 14, 20);

      // Add date
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 14, 28);

      // Prepare table data
      const headers = [columns];
      const body = data.map((training) => [
        training.title,
        training.difficulty || 'beginner',
        training.days?.length?.toString() || '0',
        training.isActive ? 'Active' : 'Inactive',
        training.focus || '-',
        training.difficulty || 'beginner',
        training.createdAt ? new Date(training.createdAt).toLocaleDateString('en-GB') : '-',
      ]);

      // Add table
      autoTable(doc, {
        head: headers,
        body: body,
        startY: 35,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [102, 126, 234] },
      });

      // Save PDF
      doc.save(`${filename}_${Date.now()}.pdf`);

      onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('PDF export failed');
      setError(error);
      onError?.(error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = (data: TrainingPlan[], columns: string[]) => {
    try {
      setIsExporting(true);
      setError(null);

      // Prepare data for Excel
      const worksheetData = [
        columns,
        ...data.map((training) => [
          training.title,
          training.difficulty || 'beginner',
          training.days?.length || 0,
          training.isActive ? 'Active' : 'Inactive',
          training.focus || '-',
          training.createdAt ? new Date(training.createdAt).toLocaleDateString('en-GB') : '-',
        ]),
      ];

      // Create worksheet and workbook
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Trainings');

      // Set column widths
      worksheet['!cols'] = [
        { wch: 30 }, // Name
        { wch: 15 }, // Type
        { wch: 12 }, // Workouts/Week
        { wch: 10 }, // Status
        { wch: 10 }, // Creator
        { wch: 10 }, // Difficulty
        { wch: 12 }, // Created At
      ];

      // Save Excel file
      XLSX.writeFile(workbook, `${filename}_${Date.now()}.xlsx`);

      onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Excel export failed');
      setError(error);
      onError?.(error);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToPDF,
    exportToExcel,
    isExporting,
    error,
  };
}
