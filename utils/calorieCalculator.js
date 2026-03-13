const activityFactors = {
  Sedentary: 1.2,
  "Light Active": 1.37,
  "Moderate Active": 1.55,
  "Heavy Active": 1.72
};

const medicationFactors = {
  Metformin: 0.925,
  Insulin: 0.7
};

const calculateCalories = (profile) => {

  const { sex, weight, height, age, medication, jobType } = profile;

  let BMR;

  if (sex === "male") {
    BMR = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    BMR = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const activityFactor = activityFactors[jobType] || 1.2;
  const medicationFactor = medicationFactors[medication] || 1;

  let dailyCalories = BMR * activityFactor * medicationFactor;

  dailyCalories = Math.round(dailyCalories / 10) * 10;

  return {
    dailyCalories,
    mealBudget: {
      breakfast: Math.round(dailyCalories * 0.25),
      lunch: Math.round(dailyCalories * 0.35),
      snack: Math.round(dailyCalories * 0.10),
      dinner: Math.round(dailyCalories * 0.30)
    }
  };
};

module.exports = calculateCalories;