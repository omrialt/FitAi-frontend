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
  exportToPDF: (data: TrainingPlan[]) => void;
  exportToExcel: (data: TrainingPlan[]) => void;
  isExporting: boolean;
  error: Error | null;
}

export function useExport(options: UseExportOptions = {}): UseExportReturn {
  const { filename = 'export', onSuccess, onError } = options;
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const formatTrainerName = (training: TrainingPlan): string => {
    if (typeof training.trainerId === 'object' && training.trainerId?.fullName) {
      return training.trainerId.fullName;
    }
    return '-';
  };


  const exportToPDF = (data: TrainingPlan[]) => {
    try {
      setIsExporting(true);
      setError(null);

      const doc = new jsPDF();

      data.forEach((training, index) => {
        if (index > 0) doc.addPage();

        // Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(training.title, 14, 20);

        // Basic Info
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        let yPos = 30;

        const info = [
          ['Trainer:', formatTrainerName(training)],
          ['Difficulty:', (training.difficulty || 'beginner').toUpperCase()],
          ['Focus:', training.focus || '-'],
          ['Program Type:', training.programType || '-'],
          ['Estimated Duration:', training.estimatedDuration ? `${training.estimatedDuration} minutes` : '-'],
          ['Estimated Calories:', training.estimatedCalories ? `${training.estimatedCalories} kcal` : '-'],
          ['Rotation Cycle:', training.rotationCycleLength ? `${training.rotationCycleLength} days` : '-'],
          ['Created:', training.createdAt ? new Date(training.createdAt).toLocaleDateString('en-GB') : '-'],
          ['Updated:', training.updatedAt ? new Date(training.updatedAt).toLocaleDateString('en-GB') : '-'],
        ];

        info.forEach(([label, value]) => {
          doc.setFont('helvetica', 'bold');
          doc.text(label, 14, yPos);
          doc.setFont('helvetica', 'normal');
          doc.text(value, 55, yPos);
          yPos += 6;
        });

        // Training Days
        yPos += 5;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Training Days', 14, yPos);
        yPos += 8;

        if (training.days && training.days.length > 0) {
          training.days.forEach(day => {
            // Check if we need a new page
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }

            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(`${day.dayName}`, 14, yPos);
            yPos += 6;

          
            // Exercises table
            const exerciseData = day.exercises.map(ex => [
              ex.name,
              ex.muscleGroup,
              ex.type,
              ex.sets.length.toString(),
              ex.notes || '-'
            ]);

            autoTable(doc, {
              head: [['Exercise', 'Muscle Group', 'Type', 'Sets', 'Notes']],
              body: exerciseData,
              startY: yPos,
              styles: { fontSize: 8 },
              headStyles: { fillColor: [102, 126, 234] },
              margin: { left: 14 },
              didDrawPage: (data) => {
                yPos = data.cursor?.y || yPos;
              }
            });

            yPos = (doc as any).lastAutoTable.finalY + 8;
          });
        } else {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.text('No training days defined', 14, yPos);
        }
      });

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

  const exportToExcel = (data: TrainingPlan[]) => {
    try {
      setIsExporting(true);
      setError(null);

      const workbook = XLSX.utils.book_new();

      data.forEach((training) => {
        // Main sheet for each training
        const mainData = [
          ['Training Plan Details'],
          [],
          ['Title', training.title],
          ['Trainer', formatTrainerName(training)],
          ['Difficulty', (training.difficulty || 'beginner').toUpperCase()],
          ['Focus', training.focus || '-'],
          ['Program Type', training.programType || '-'],
          ['Estimated Duration', training.estimatedDuration ? `${training.estimatedDuration} weeks` : '-'],
          ['Estimated Calories', training.estimatedCalories ? `${training.estimatedCalories} kcal` : '-'],
          ['Rotation Cycle', training.rotationCycleLength ? `${training.rotationCycleLength} days` : '-'],
          ['Created', training.createdAt ? new Date(training.createdAt).toLocaleDateString('en-GB') : '-'],
          ['Updated', training.updatedAt ? new Date(training.updatedAt).toLocaleDateString('en-GB') : '-'],
          [],
          ['Training Days'],
          []
        ];

        // Add days and exercises
        if (training.days && training.days.length > 0) {
          training.days.forEach(day => {
            mainData.push([day.dayName]);
            if (day.plannedDate) {
              mainData.push(['Planned Date', new Date(day.plannedDate).toLocaleDateString('en-GB')]);
            }
            mainData.push(['Exercise', 'Muscle Group', 'Type', 'Sets', 'Notes']);
            
            day.exercises.forEach(ex => {
              mainData.push([
                ex.name,
                ex.muscleGroup,
                ex.type,
                ex.sets.length.toString(),
                ex.notes || '-'
              ]);
            });
            
            mainData.push([]);
          });
        } else {
          mainData.push(['No training days defined']);
        }

        const worksheet = XLSX.utils.aoa_to_sheet(mainData);

        // Set column widths
        worksheet['!cols'] = [
          { wch: 20 },
          { wch: 35 },
          { wch: 15 },
          { wch: 10 },
          { wch: 30 }
        ];

        // Add worksheet with training title as sheet name
        const sheetName = training.title.substring(0, 31); // Excel sheet name limit
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });

      // Summary sheet
      const summaryData = [
        ['Training Plans Summary'],
        [],
        ['Title', 'Trainer', 'Difficulty', 'Focus', 'Days', 'Program Type', 'Created'],
        ...data.map(training => [
          training.title,
          formatTrainerName(training),
          (training.difficulty || 'beginner').toUpperCase(),
          training.focus || '-',
          training.days?.length || 0,
          training.programType || '-',
          training.createdAt ? new Date(training.createdAt).toLocaleDateString('en-GB') : '-'
        ])
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      summarySheet['!cols'] = [
        { wch: 30 },
        { wch: 20 },
        { wch: 15 },
        { wch: 20 },
        { wch: 8 },
        { wch: 15 },
        { wch: 12 }
      ];

      // Insert summary sheet at the beginning
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

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
