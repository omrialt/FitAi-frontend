/**
 * Helper functions to calculate health metric ranges
 */

export interface RangeSegment {
  label: string;
  min: number;
  max: number;
  color: string;
}

export interface BMIRanges {
  ranges: RangeSegment[];
  explanation: string;
}

export interface WeightRanges {
  minWeight: number;
  maxWeight: number;
  ranges: RangeSegment[];
  explanation: string;
}

export interface BodyFatRanges {
  ranges: RangeSegment[];
  explanation: string;
}

/**
 * Calculate BMI ranges (same for all genders)
 */
export function calculateBMIRanges(): BMIRanges {
  return {
    ranges: [
      { label: 'Underweight', min: 0, max: 18.5, color: '#4dabf7' }, // blue
      { label: 'Normal', min: 18.5, max: 24.9, color: '#51cf66' }, // green
      { label: 'Overweight', min: 25, max: 29.9, color: '#ffd43b' }, // yellow
      { label: 'Obese', min: 30, max: 40, color: '#ff6b6b' }, // red
    ],
    explanation: 'Body Mass Index (BMI) is an epidemiological metric used to assess the relationship between body weight and height. Although BMI does not measure body composition, it provides a broad classification of weight categories (underweight, normal, overweight, and obese) based on large-scale population studies. While it does not account for muscle mass, body structure, or gender differences, BMI remains an effective and widely used screening tool for identifying general health risks related to weight.',
  };
}

/**
 * Calculate healthy weight range based on height
 */
export function calculateWeightRanges(heightCm: number): WeightRanges {
  const heightMeters = heightCm / 100;
  const minWeight = 18.5 * Math.pow(heightMeters, 2);
  const maxWeight = 24.9 * Math.pow(heightMeters, 2);

  return {
    minWeight: parseFloat(minWeight.toFixed(1)),
    maxWeight: parseFloat(maxWeight.toFixed(1)),
    ranges: [
      { label: 'Below Healthy', min: 0, max: minWeight, color: '#4dabf7' }, // blue
      { label: 'Healthy Range', min: minWeight, max: maxWeight, color: '#51cf66' }, // green
      { label: 'Above Healthy', min: maxWeight, max: 200, color: '#ff6b6b' }, // red
    ],
    explanation: 'Body weight reflects the total mass of the body, including muscle, fat, water, bone, and other tissues. The healthy weight range is derived using BMI calculations that adjust for height to estimate whether an individual\'s weight falls within a metabolically safe range. Since weight alone does not determine true health status, it should always be evaluated alongside additional indicators such as body fat percentage, muscle mass, and long-term trends over time.',
  };
}

/**
 * Calculate body fat percentage ranges based on gender and age
 */
export function calculateBodyFatRanges(gender: string, age: number): BodyFatRanges {
  const isMale = gender.toLowerCase() === 'male';

  if (isMale) {
    // Men ranges
    if (age >= 20 && age <= 39) {
      return {
        ranges: [
          { label: 'Essential Fat', min: 0, max: 5, color: '#e03131' }, // red - too low is dangerous
          { label: 'Athletes', min: 6, max: 13, color: '#51cf66' }, // green - healthy/athletic
          { label: 'Fitness', min: 14, max: 17, color: '#40c057' }, // darker green - healthy
          { label: 'Average', min: 18, max: 24, color: '#ffd43b' }, // yellow - acceptable
          { label: 'Obese', min: 25, max: 40, color: '#ff6b6b' }, // red - too high
        ],
        explanation: 'Body Fat Percentage (BF%) represents the proportion of a person\'s total body mass that is composed of fat tissue. Unlike BMI, this metric provides a more accurate assessment of body composition and serves as a strong indicator of metabolic health, athletic performance, and overall fitness level. Healthy ranges vary based on age and gender because men and women have different essential fat requirements, and hormonal and metabolic changes naturally shift body fat levels as people age. Body fat percentage is considered a significantly more precise predictor of health risk compared to body weight or BMI alone.',
      };
    } else if (age >= 40 && age <= 59) {
      return {
        ranges: [
          { label: 'Essential Fat', min: 0, max: 5, color: '#e03131' },
          { label: 'Athletes', min: 6, max: 13, color: '#51cf66' },
          { label: 'Fitness', min: 14, max: 17, color: '#40c057' },
          { label: 'Average', min: 18, max: 26, color: '#ffd43b' },
          { label: 'Obese', min: 27, max: 42, color: '#ff6b6b' },
        ],
        explanation: 'Body Fat Percentage (BF%) represents the proportion of a person\'s total body mass that is composed of fat tissue. Unlike BMI, this metric provides a more accurate assessment of body composition and serves as a strong indicator of metabolic health, athletic performance, and overall fitness level. Healthy ranges vary based on age and gender because men and women have different essential fat requirements, and hormonal and metabolic changes naturally shift body fat levels as people age. Body fat percentage is considered a significantly more precise predictor of health risk compared to body weight or BMI alone.',
      };
    } else {
      // age >= 60
      return {
        ranges: [
          { label: 'Essential Fat', min: 0, max: 5, color: '#e03131' },
          { label: 'Athletes', min: 6, max: 13, color: '#51cf66' },
          { label: 'Fitness', min: 14, max: 17, color: '#40c057' },
          { label: 'Average', min: 18, max: 27, color: '#ffd43b' },
          { label: 'Obese', min: 28, max: 43, color: '#ff6b6b' },
        ],
        explanation: 'Body Fat Percentage (BF%) represents the proportion of a person\'s total body mass that is composed of fat tissue. Unlike BMI, this metric provides a more accurate assessment of body composition and serves as a strong indicator of metabolic health, athletic performance, and overall fitness level. Healthy ranges vary based on age and gender because men and women have different essential fat requirements, and hormonal and metabolic changes naturally shift body fat levels as people age. Body fat percentage is considered a significantly more precise predictor of health risk compared to body weight or BMI alone.',
      };
    }
  } else {
    // Women ranges
    if (age >= 20 && age <= 39) {
      return {
        ranges: [
          { label: 'Essential Fat', min: 0, max: 13, color: '#e03131' },
          { label: 'Athletes', min: 14, max: 20, color: '#51cf66' },
          { label: 'Fitness', min: 21, max: 24, color: '#40c057' },
          { label: 'Average', min: 25, max: 31, color: '#ffd43b' },
          { label: 'Obese', min: 32, max: 47, color: '#ff6b6b' },
        ],
        explanation: 'Body Fat Percentage (BF%) represents the proportion of a person\'s total body mass that is composed of fat tissue. Unlike BMI, this metric provides a more accurate assessment of body composition and serves as a strong indicator of metabolic health, athletic performance, and overall fitness level. Healthy ranges vary based on age and gender because men and women have different essential fat requirements, and hormonal and metabolic changes naturally shift body fat levels as people age. Body fat percentage is considered a significantly more precise predictor of health risk compared to body weight or BMI alone.',
      };
    } else if (age >= 40 && age <= 59) {
      return {
        ranges: [
          { label: 'Essential Fat', min: 0, max: 13, color: '#e03131' },
          { label: 'Athletes', min: 14, max: 20, color: '#51cf66' },
          { label: 'Fitness', min: 21, max: 24, color: '#40c057' },
          { label: 'Average', min: 25, max: 33, color: '#ffd43b' },
          { label: 'Obese', min: 34, max: 49, color: '#ff6b6b' },
        ],
        explanation: 'Body Fat Percentage (BF%) represents the proportion of a person\'s total body mass that is composed of fat tissue. Unlike BMI, this metric provides a more accurate assessment of body composition and serves as a strong indicator of metabolic health, athletic performance, and overall fitness level. Healthy ranges vary based on age and gender because men and women have different essential fat requirements, and hormonal and metabolic changes naturally shift body fat levels as people age. Body fat percentage is considered a significantly more precise predictor of health risk compared to body weight or BMI alone.',
      };
    } else {
      // age >= 60
      return {
        ranges: [
          { label: 'Essential Fat', min: 0, max: 13, color: '#e03131' },
          { label: 'Athletes', min: 14, max: 20, color: '#51cf66' },
          { label: 'Fitness', min: 21, max: 24, color: '#40c057' },
          { label: 'Average', min: 25, max: 35, color: '#ffd43b' },
          { label: 'Obese', min: 36, max: 51, color: '#ff6b6b' },
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
