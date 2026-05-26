// Professional Clinical Utility Helper Functions

/**
 * Calculates Body Mass Index (BMI) based on weight (kg) and height (cm)
 */
export const calculateBMI = (weight, height) => {
  if (!weight || !height) return 0;
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
};

/**
 * Categorizes BMI value into clinical ranges
 */
export const getBMICategory = (bmi) => {
  const numBmi = parseFloat(bmi);
  if (numBmi < 18.5) return { label: 'Underweight', color: 'text-amber-500 bg-amber-50' };
  if (numBmi < 25.0) return { label: 'Normal', color: 'text-emerald-500 bg-emerald-50' };
  if (numBmi < 30.0) return { label: 'Overweight', color: 'text-amber-600 bg-amber-50' };
  return { label: 'Obese', color: 'text-rose-600 bg-rose-50' };
};

/**
 * Returns premium clinical risk badges based on risk level
 */
export const getRiskBadge = (level) => {
  switch (level?.toLowerCase()) {
    case 'high':
      return { label: 'High Risk', color: 'text-rose-600 bg-rose-50 border-rose-100' };
    case 'moderate':
      return { label: 'Moderate Risk', color: 'text-amber-600 bg-amber-50 border-amber-100' };
    case 'low':
    default:
      return { label: 'Low Risk', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
  }
};

/**
 * Formats calorie count nicely with comma separators
 */
export const formatCalories = (cals) => {
  return new Intl.NumberFormat('en-US').format(cals);
};
