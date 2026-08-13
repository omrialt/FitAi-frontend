/**
 * Helper functions to calculate health metric ranges
 */

import type { RangeSegment, BMIRanges, WeightRanges, BodyFatRanges } from '../../../../types/physical-data.types';
export type { RangeSegment, BMIRanges, WeightRanges, BodyFatRanges };

/**
 * Calculate BMI ranges (same for all genders)
 *
 * Bands are half-open — a value belongs to the band where `min <= v < max`, so
 * each band's `max` is the next band's `min` and no value can fall between two
 * of them. The clinical tables are usually written "18.5-24.9, 25-29.9", which
 * reads well on paper but leaves 24.9 < v < 25 belonging to nothing; a BMI of
 * 24.95 landed in no band and rendered with no label or colour.
 *
 * These boundaries now match what the backend already does when it labels a
 * BMI (`physical-data.controller.ts`: < 18.5, < 25, < 30, else obese), so the
 * two cannot disagree about a value on a boundary.
 */
export function calculateBMIRanges(): BMIRanges {
  return {
    ranges: [
      { label: 'Underweight', min: 0, max: 18.5, color: 'var(--color-info)' }, // blue
      { label: 'Normal', min: 18.5, max: 25, color: 'var(--color-success)' }, // green
      { label: 'Overweight', min: 25, max: 30, color: 'var(--color-warning)' }, // yellow
      { label: 'Obese', min: 30, max: 40, color: 'var(--color-danger)' }, // red
    ],
    explanation: 'Body Mass Index (BMI) is an epidemiological metric used to assess the relationship between body weight and height. Although BMI does not measure body composition, it provides a broad classification of weight categories (underweight, normal, overweight, and obese) based on large-scale population studies. While it does not account for muscle mass, body structure, or gender differences, BMI remains an effective and widely used screening tool for identifying general health risks related to weight.',
  };
}

/**
 * Calculate healthy weight range based on height
 */
export function calculateWeightRanges(heightCm: number): WeightRanges {
  const heightMeters = heightCm / 100;
  // The healthy window is the Normal BMI band expressed in kilograms, so these
  // two multipliers have to be that band's bounds. The upper one was 24.9
  // while the BMI table's Normal band now ends at 25, which would have shown a
  // weight as "above healthy" and the BMI it implies as "normal" on the same
  // screen. At 175cm this moves the top of the window 76.3kg -> 76.6kg.
  const minWeight = 18.5 * Math.pow(heightMeters, 2);
  const maxWeight = 25 * Math.pow(heightMeters, 2);

  return {
    minWeight: parseFloat(minWeight.toFixed(1)),
    maxWeight: parseFloat(maxWeight.toFixed(1)),
    ranges: [
      { label: 'Below Healthy', min: 0, max: minWeight, color: 'var(--color-info)' }, // blue
      { label: 'Healthy Range', min: minWeight, max: maxWeight, color: 'var(--color-success)' }, // green
      { label: 'Above Healthy', min: maxWeight, max: 200, color: 'var(--color-danger)' }, // red
    ],
    explanation: 'Body weight reflects the total mass of the body, including muscle, fat, water, bone, and other tissues. The healthy weight range is derived using BMI calculations that adjust for height to estimate whether an individual\'s weight falls within a metabolically safe range. Since weight alone does not determine true health status, it should always be evaluated alongside additional indicators such as body fat percentage, muscle mass, and long-term trends over time.',
  };
}

/**
 * Calculate body fat percentage ranges based on gender and age
 *
 * Half-open like the BMI bands above, and for the same reason: written as
 * "6-13, 14-17" these tables left every fractional value between them
 * unlabelled, so a body fat of 13.5% belonged to no band at all. Four gaps per
 * table across six tables — the same defect as the BMI one recorded in the gap
 * analysis, which only named BMI.
 */
export function calculateBodyFatRanges(gender: string, age: number): BodyFatRanges {
  const isMale = gender.toLowerCase() === 'male';

  if (isMale) {
    // Men ranges
    if (age >= 20 && age <= 39) {
      return {
        ranges: [
          { label: 'Essential Fat', min: 0, max: 6, color: 'var(--color-danger)' }, // red - too low is dangerous
          { label: 'Athletes', min: 6, max: 14, color: 'var(--color-success)' }, // green - healthy/athletic
          { label: 'Fitness', min: 14, max: 18, color: 'var(--color-success)' }, // darker green - healthy
          { label: 'Average', min: 18, max: 25, color: 'var(--color-warning)' }, // yellow - acceptable
          { label: 'Obese', min: 25, max: 40, color: 'var(--color-danger)' }, // red - too high
        ],
        explanation: 'Body Fat Percentage (BF%) represents the proportion of a person\'s total body mass that is composed of fat tissue. Unlike BMI, this metric provides a more accurate assessment of body composition and serves as a strong indicator of metabolic health, athletic performance, and overall fitness level. Healthy ranges vary based on age and gender because men and women have different essential fat requirements, and hormonal and metabolic changes naturally shift body fat levels as people age. Body fat percentage is considered a significantly more precise predictor of health risk compared to body weight or BMI alone.',
      };
    } else if (age >= 40 && age <= 59) {
      return {
        ranges: [
          { label: 'Essential Fat', min: 0, max: 6, color: 'var(--color-danger)' },
          { label: 'Athletes', min: 6, max: 14, color: 'var(--color-success)' },
          { label: 'Fitness', min: 14, max: 18, color: 'var(--color-success)' },
          { label: 'Average', min: 18, max: 27, color: 'var(--color-warning)' },
          { label: 'Obese', min: 27, max: 42, color: 'var(--color-danger)' },
        ],
        explanation: 'Body Fat Percentage (BF%) represents the proportion of a person\'s total body mass that is composed of fat tissue. Unlike BMI, this metric provides a more accurate assessment of body composition and serves as a strong indicator of metabolic health, athletic performance, and overall fitness level. Healthy ranges vary based on age and gender because men and women have different essential fat requirements, and hormonal and metabolic changes naturally shift body fat levels as people age. Body fat percentage is considered a significantly more precise predictor of health risk compared to body weight or BMI alone.',
      };
    } else {
      // age >= 60
      return {
        ranges: [
          { label: 'Essential Fat', min: 0, max: 6, color: 'var(--color-danger)' },
          { label: 'Athletes', min: 6, max: 14, color: 'var(--color-success)' },
          { label: 'Fitness', min: 14, max: 18, color: 'var(--color-success)' },
          { label: 'Average', min: 18, max: 28, color: 'var(--color-warning)' },
          { label: 'Obese', min: 28, max: 43, color: 'var(--color-danger)' },
        ],
        explanation: 'Body Fat Percentage (BF%) represents the proportion of a person\'s total body mass that is composed of fat tissue. Unlike BMI, this metric provides a more accurate assessment of body composition and serves as a strong indicator of metabolic health, athletic performance, and overall fitness level. Healthy ranges vary based on age and gender because men and women have different essential fat requirements, and hormonal and metabolic changes naturally shift body fat levels as people age. Body fat percentage is considered a significantly more precise predictor of health risk compared to body weight or BMI alone.',
      };
    }
  } else {
    // Women ranges
    if (age >= 20 && age <= 39) {
      return {
        ranges: [
          { label: 'Essential Fat', min: 0, max: 14, color: 'var(--color-danger)' },
          { label: 'Athletes', min: 14, max: 21, color: 'var(--color-success)' },
          { label: 'Fitness', min: 21, max: 25, color: 'var(--color-success)' },
          { label: 'Average', min: 25, max: 32, color: 'var(--color-warning)' },
          { label: 'Obese', min: 32, max: 47, color: 'var(--color-danger)' },
        ],
        explanation: 'Body Fat Percentage (BF%) represents the proportion of a person\'s total body mass that is composed of fat tissue. Unlike BMI, this metric provides a more accurate assessment of body composition and serves as a strong indicator of metabolic health, athletic performance, and overall fitness level. Healthy ranges vary based on age and gender because men and women have different essential fat requirements, and hormonal and metabolic changes naturally shift body fat levels as people age. Body fat percentage is considered a significantly more precise predictor of health risk compared to body weight or BMI alone.',
      };
    } else if (age >= 40 && age <= 59) {
      return {
        ranges: [
          { label: 'Essential Fat', min: 0, max: 14, color: 'var(--color-danger)' },
          { label: 'Athletes', min: 14, max: 21, color: 'var(--color-success)' },
          { label: 'Fitness', min: 21, max: 25, color: 'var(--color-success)' },
          { label: 'Average', min: 25, max: 34, color: 'var(--color-warning)' },
          { label: 'Obese', min: 34, max: 49, color: 'var(--color-danger)' },
        ],
        explanation: 'Body Fat Percentage (BF%) represents the proportion of a person\'s total body mass that is composed of fat tissue. Unlike BMI, this metric provides a more accurate assessment of body composition and serves as a strong indicator of metabolic health, athletic performance, and overall fitness level. Healthy ranges vary based on age and gender because men and women have different essential fat requirements, and hormonal and metabolic changes naturally shift body fat levels as people age. Body fat percentage is considered a significantly more precise predictor of health risk compared to body weight or BMI alone.',
      };
    } else {
      // age >= 60
      return {
        ranges: [
          { label: 'Essential Fat', min: 0, max: 14, color: 'var(--color-danger)' },
          { label: 'Athletes', min: 14, max: 21, color: 'var(--color-success)' },
          { label: 'Fitness', min: 21, max: 25, color: 'var(--color-success)' },
          { label: 'Average', min: 25, max: 36, color: 'var(--color-warning)' },
          { label: 'Obese', min: 36, max: 51, color: 'var(--color-danger)' },
        ],
        explanation: 'Body Fat Percentage (BF%) represents the proportion of a person\'s total body mass that is composed of fat tissue. Unlike BMI, this metric provides a more accurate assessment of body composition and serves as a strong indicator of metabolic health, athletic performance, and overall fitness level. Healthy ranges vary based on age and gender because men and women have different essential fat requirements, and hormonal and metabolic changes naturally shift body fat levels as people age. Body fat percentage is considered a significantly more precise predictor of health risk compared to body weight or BMI alone.',
      };
    }
  }
}

/**
 * Calculate age from birth date string
 */
export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}
