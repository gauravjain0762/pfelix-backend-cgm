const { medications, jobTypes } = require("../config/constants");

const getMealSplit = (profile) => {

  const { hba1c, bmi, medication } = profile;

  let split;

  // HbA1c based distribution
  if (hba1c <= 6.5) {
    split = { breakfast: 0.25, lunch: 0.35, snack: 0.10, dinner: 0.30 };
  } 
  else if (hba1c <= 8) {
    split = { breakfast: 0.20, lunch: 0.35, snack: 0.15, dinner: 0.30 };
  } 
  else {
    split = { breakfast: 0.15, lunch: 0.35, snack: 0.20, dinner: 0.30 };
  }

  // BMI adjustment
  if (bmi > 30) {
    split.breakfast -= 0.02;
    split.lunch += 0.02;
  }

  // Insulin users distribute carbs more evenly
  if (medication === "Insulin") {
    split.breakfast += 0.03;
    split.snack += 0.02;
    split.lunch -= 0.03;
    split.dinner -= 0.02;
  }

  return split;
};

const calculateCalories = (profile) => {

  const { sex, weight, height, age, medication, jobType } = profile;

  let BMR;

  if (sex === "male") {
    BMR = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    BMR = 10 * weight + 6.25 * height - 5 * age - 161;
  }

const activityFactor = jobTypes[profile.jobTypeId]?.factor || 1.2;
const medicationFactor = medications[profile.medicationId]?.factor || 1;

  let dailyCalories = BMR * activityFactor * medicationFactor;

  dailyCalories = Math.round(dailyCalories / 10) * 10;

  const split = getMealSplit(profile);

  return {
    dailyCalories,
    mealBudget: {
      breakfast: Math.round(dailyCalories * split.breakfast),
      lunch: Math.round(dailyCalories * split.lunch),
      snack: Math.round(dailyCalories * split.snack),
      dinner: Math.round(dailyCalories * split.dinner)
    }
  };
};

module.exports = calculateCalories;