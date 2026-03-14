/**
 * Custom hook for exporting nutrition plans to PDF and Excel
 */

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { NutritionPlan, Meal } from '../types/nutrition.types';
import type { UseNutritionExportOptions, UseNutritionExportReturn } from '../types/export.types';

export function useNutritionExport(options: UseNutritionExportOptions = {}): UseNutritionExportReturn {
  const { filename = 'nutrition-plan', onSuccess, onError } = options;
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const formatCreatorName = (plan: NutritionPlan): string => {
    if (typeof plan.userId === 'object' && plan.userId?.fullName) {
      return plan.userId.fullName;
    }
    return '-';
  };

  // Calculate total macros from meals
  const calculateMacros = (meals: Meal[]) => {
    return meals.reduce(
      (totals, meal) => {
        meal.foods.forEach(food => {
          totals.protein += food.protein;
          totals.carbs += food.carbs;
          totals.fat += food.fat;
        });
        return totals;
      },
      { protein: 0, carbs: 0, fat: 0 }
    );
  };

  const exportToPDF = (data: NutritionPlan[]) => {
    try {
      setIsExporting(true);
      setError(null);

      const doc = new jsPDF();

      data.forEach((plan, index) => {
        if (index > 0) doc.addPage();

        // Calculate macros from meals
        const macros = calculateMacros(plan.meals || []);

        // Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(plan.title, 14, 20);

        // Basic Info
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        let yPos = 30;

        const info = [
          ['Creator:', formatCreatorName(plan)],
          ['Target:', plan.target ? plan.target.toUpperCase() : '-'],
          ['Total Calories:', plan.totalCalories ? `${plan.totalCalories} kcal` : '-'],
          ['Total Protein:', `${macros.protein.toFixed(1)}g`],
          ['Total Carbs:', `${macros.carbs.toFixed(1)}g`],
          ['Total Fat:', `${macros.fat.toFixed(1)}g`],
          ['Average Rating:', plan.averageRating ? `${plan.averageRating.toFixed(1)} (${plan.totalRatings} ratings)` : 'Not rated'],
          ['Created:', plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('en-GB') : '-'],
          ['Updated:', plan.updatedAt ? new Date(plan.updatedAt).toLocaleDateString('en-GB') : '-'],
        ];

        if (plan.description) {
          info.splice(1, 0, ['Description:', plan.description]);
        }

        info.forEach(([label, value]) => {
          doc.setFont('helvetica', 'bold');
          doc.text(label, 14, yPos);
          doc.setFont('helvetica', 'normal');
          const valueText = value.length > 60 ? value.substring(0, 60) + '...' : value;
          doc.text(valueText, 55, yPos);
          yPos += 6;
        });

        // Meals
        yPos += 5;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Meals', 14, yPos);
        yPos += 8;

        if (plan.meals && plan.meals.length > 0) {
          plan.meals.forEach(meal => {
            // Check if we need a new page
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }

            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(meal.mealType.toUpperCase(), 14, yPos);
            yPos += 6;

            // Calculate meal totals
            const mealTotals = meal.foods.reduce(
              (acc, food) => ({
                calories: acc.calories + food.calories,
                protein: acc.protein + food.protein,
                carbs: acc.carbs + food.carbs,
                fat: acc.fat + food.fat,
              }),
              { calories: 0, protein: 0, carbs: 0, fat: 0 }
            );

            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.text(
              `Total: ${mealTotals.calories}kcal | Protein: ${mealTotals.protein}g | Carbs: ${mealTotals.carbs}g | Fat: ${mealTotals.fat}g`,
              14,
              yPos
            );
            yPos += 6;

            // Foods table
            const foodData = meal.foods.map(food => [
              food.name,
              food.quantity && food.unit ? `${food.quantity} ${food.unit}` : '-',
              food.calories.toString(),
              food.protein.toString(),
              food.carbs.toString(),
              food.fat.toString(),
            ]);

            autoTable(doc, {
              head: [['Food', 'Quantity', 'Cal', 'Protein', 'Carbs', 'Fat']],
              body: foodData,
              startY: yPos,
              styles: { fontSize: 8 },
              headStyles: { fillColor: [76, 175, 80] },
              margin: { left: 14 },
              didDrawPage: (data) => {
                yPos = data.cursor?.y || yPos;
              }
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            yPos = (doc as any).lastAutoTable.finalY + 8;
          });
        } else {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.text('No meals defined', 14, yPos);
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

  const exportToExcel = (data: NutritionPlan[]) => {
    try {
      setIsExporting(true);
      setError(null);

      const workbook = XLSX.utils.book_new();

      data.forEach((plan) => {
        // Calculate macros from meals
        const macros = calculateMacros(plan.meals || []);

        // Main sheet for each nutrition plan
        const mainData = [
          ['Nutrition Plan Details'],
          [],
          ['Title', plan.title],
          ['Creator', formatCreatorName(plan)],
          ['Description', plan.description || '-'],
          ['Target', plan.target ? plan.target.toUpperCase() : '-'],
          ['Total Calories', plan.totalCalories ? `${plan.totalCalories} kcal` : '-'],
          ['Total Protein', `${macros.protein.toFixed(1)}g`],
          ['Total Carbs', `${macros.carbs.toFixed(1)}g`],
          ['Total Fat', `${macros.fat.toFixed(1)}g`],
          ['Average Rating', plan.averageRating ? `${plan.averageRating.toFixed(1)} (${plan.totalRatings} ratings)` : 'Not rated'],
          ['Created', plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('en-GB') : '-'],
          ['Updated', plan.updatedAt ? new Date(plan.updatedAt).toLocaleDateString('en-GB') : '-'],
          [],
          ['Meals'],
          []
        ];

        // Add meals and foods
        if (plan.meals && plan.meals.length > 0) {
          plan.meals.forEach(meal => {
            mainData.push([meal.mealType.toUpperCase()]);
            mainData.push(['Food', 'Quantity', 'Calories', 'Protein', 'Carbs', 'Fat']);
            
            meal.foods.forEach(food => {
              mainData.push([
                food.name,
                food.quantity && food.unit ? `${food.quantity} ${food.unit}` : '-',
                food.calories.toString(),
                food.protein.toString(),
                food.carbs.toString(),
                food.fat.toString(),
              ]);
            });

            // Meal totals
            const mealTotals = meal.foods.reduce(
              (acc, food) => ({
                calories: acc.calories + food.calories,
                protein: acc.protein + food.protein,
                carbs: acc.carbs + food.carbs,
                fat: acc.fat + food.fat,
              }),
              { calories: 0, protein: 0, carbs: 0, fat: 0 }
            );

            mainData.push([
              'Meal Total',
              '',
              '',
              mealTotals.calories.toString(),
              mealTotals.protein.toString(),
              mealTotals.carbs.toString(),
              mealTotals.fat.toString(),
            ]);
            
            mainData.push([]);
          });
        } else {
          mainData.push(['No meals defined']);
        }

        const worksheet = XLSX.utils.aoa_to_sheet(mainData);

        // Set column widths
        worksheet['!cols'] = [
          { wch: 20 },
          { wch: 15 },
          { wch: 12 },
          { wch: 12 },
          { wch: 12 },
          { wch: 12 }
        ];

        // Add worksheet with nutrition plan title as sheet name
        const sheetName = plan.title.substring(0, 31); // Excel sheet name limit
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });

      // Summary sheet
      const summaryData = [
        ['Nutrition Plans Summary'],
        [],
        ['Title', 'Creator', 'Target', 'Total Calories', 'Protein', 'Carbs', 'Fat', 'Rating', 'Meals', 'Created'],
        ...data.map(plan => {
          const macros = calculateMacros(plan.meals || []);
          return [
            plan.title,
            formatCreatorName(plan),
            plan.target ? plan.target.toUpperCase() : '-',
            plan.totalCalories ? `${plan.totalCalories} kcal` : '-',
            `${macros.protein.toFixed(1)}g`,
            `${macros.carbs.toFixed(1)}g`,
            `${macros.fat.toFixed(1)}g`,
            plan.averageRating ? `${plan.averageRating.toFixed(1)} (${plan.totalRatings})` : 'Not rated',
            plan.meals?.length || 0,
            plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('en-GB') : '-'
          ];
        })
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      summarySheet['!cols'] = [
        { wch: 30 },
        { wch: 20 },
        { wch: 12 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
        { wch: 8 },
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
