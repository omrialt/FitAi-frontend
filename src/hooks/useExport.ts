/**
 * Custom hook for exporting data to PDF and Excel
 */

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Training } from '../types/training.types';

interface UseExportOptions {
  filename?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseExportReturn {
  exportToPDF: (data: Training[], columns: string[]) => void;
  exportToExcel: (data: Training[], columns: string[]) => void;
  isExporting: boolean;
  error: Error | null;
}

export function useExport(options: UseExportOptions = {}): UseExportReturn {
  const { filename = 'export', onSuccess, onError } = options;
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const exportToPDF = (data: Training[], columns: string[]) => {
    try {
      setIsExporting(true);
      setError(null);

      // Create new PDF document
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.text('My Trainings', 14, 20);

      // Add date
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

      // Prepare table data
      const headers = [columns];
      const body = data.map((training) => [
        training.name,
        training.trainingType,
        training.workoutsPerWeek.toString(),
        training.status,
        training.creator,
        training.difficulty,
        new Date(training.createdAt).toLocaleDateString(),
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

  const exportToExcel = (data: Training[], columns: string[]) => {
    try {
      setIsExporting(true);
      setError(null);

      // Prepare data for Excel
      const worksheetData = [
        columns,
        ...data.map((training) => [
          training.name,
          training.trainingType,
          training.workoutsPerWeek,
          training.status,
          training.creator,
          training.difficulty,
          new Date(training.createdAt).toLocaleDateString(),
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
