export function getAutoMealTiming(hour = new Date().getHours()) {

  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 16) return "lunch";
  if (hour >= 16 && hour < 19) return "snacks";
  if (hour >= 19 && hour < 23) return "dinner";
  return "late-night";
}

export function getAutoWeatherCondition(month = new Date().getMonth()) {
  // month is 0-11 (Jan-Dec)
  if (month === 11 || month === 0 || month === 1) { // Dec, Jan, Feb
    return "winter";
  }
  if (month >= 2 && month <= 5) { // Mar, Apr, May, Jun
    return "summer";
  }
  if (month >= 6 && month <= 8) { // Jul, Aug, Sep
    return "rainy";
  }
  // Oct, Nov
  return "all-season";
}

/**
 * Checks if a food item is safe for the user based on their allergies.
 * @param {Object} food - The food object containing restrictedIngredients array.
 * @param {Array} userAllergies - Array of strings (e.g., ["nuts", "dairy"]).
 * @returns {boolean} - True if the food avoids all ingredients the user is allergic to.
 */
export function isFoodSafeForUser(food, userAllergies = []) {
  if (!userAllergies || userAllergies.length === 0) return true;
  
  // The food is safe if EVERY allergy the user has is listed 
  // in the food's "restrictedIngredients" (meaning the food avoids them).
  return userAllergies.every(allergy => 
    food.restrictedIngredients?.includes(allergy)
  );
}

export const MEAL_SPECIFIC_INGREDIENTS = {
  breakfast: [
    { id: "poha",       label: "Poha",          diets: ["veg","vegan","jain"] },
    { id: "bread",      label: "Bread",          diets: ["veg","vegan","jain","keto"] },
    { id: "eggs",       label: "Eggs",           diets: ["non-veg","eggitarian","keto"] },
    { id: "dosa",       label: "Dosa",           diets: ["veg","vegan","jain"] },
    { id: "idli",       label: "Idli",           diets: ["veg","vegan","jain"] },
    { id: "onion",      label: "Onion",          diets: ["veg","non-veg","eggitarian","vegan","keto"] },
    { id: "oats",       label: "Oats",           diets: ["veg","vegan","keto"] },
    { id: "paneer",     label: "Paneer",         diets: ["veg","keto"] },
    { id: "upma",       label: "Upma",           diets: ["veg","vegan","jain"] },
    { id: "paratha",    label: "Paratha",        diets: ["veg","jain"] },
    { id: "chicken",    label: "Chicken",        diets: ["non-veg","keto"] },
    { id: "avocado",    label: "Avocado",        diets: ["vegan","keto"] },
    { id: "tofu",       label: "Tofu",           diets: ["vegan","keto"] },
  ],
  lunch: [
    { id: "dal",        label: "Dal",            diets: ["veg","vegan","jain"] },
    { id: "chawal",     label: "Chawal (Rice)",  diets: ["veg","non-veg","eggitarian","vegan","jain"] },
    { id: "roti",       label: "Roti",           diets: ["veg","non-veg","eggitarian","vegan","jain"] },
    { id: "paneer",     label: "Paneer",         diets: ["veg","keto"] },
    { id: "chicken",    label: "Chicken",        diets: ["non-veg","keto"] },
    { id: "fish",       label: "Fish",           diets: ["non-veg","keto"] },
    { id: "tofu",       label: "Tofu",           diets: ["vegan","keto"] },
    { id: "rajma",      label: "Rajma",          diets: ["veg","vegan","jain"] },
    { id: "chole",      label: "Chole",          diets: ["veg","vegan","jain"] },
    { id: "salad",      label: "Salad",          diets: ["veg","vegan","jain","keto"] },
    { id: "egg-curry",  label: "Egg Curry",      diets: ["eggitarian"] },
    { id: "mutton",     label: "Mutton",         diets: ["non-veg"] },
  ],
  snacks: [
    { id: "samosa",     label: "Samosa",         diets: ["veg","jain"] },
    { id: "maggi",      label: "Maggi",          diets: ["veg","non-veg","eggitarian"] },
    { id: "pakora",     label: "Pakora",         diets: ["veg","jain"] },
    { id: "bhel",       label: "Bhel Puri",      diets: ["veg","jain"] },
    { id: "fries",      label: "Fries",          diets: ["veg","vegan","jain","keto"] },
    { id: "nuts",       label: "Nuts",           diets: ["veg","vegan","jain","keto"] },
    { id: "fruit",      label: "Fruit",          diets: ["veg","vegan","jain"] },
    { id: "eggs",       label: "Boiled Eggs",    diets: ["non-veg","eggitarian","keto"] },
    { id: "chicken-tikka", label: "Chicken Tikka", diets: ["non-veg","keto"] },
    { id: "cheese",     label: "Cheese",         diets: ["veg","keto"] },
  ],
  dinner: [
    { id: "chicken",    label: "Chicken",        diets: ["non-veg","keto"] },
    { id: "paneer",     label: "Paneer",         diets: ["veg","keto"] },
    { id: "dal",        label: "Dal Makhani",    diets: ["veg","jain"] },
    { id: "roti",       label: "Roti",           diets: ["veg","non-veg","eggitarian","vegan","jain"] },
    { id: "biryani",    label: "Biryani",        diets: ["non-veg","veg"] },
    { id: "fish",       label: "Fish",           diets: ["non-veg","keto"] },
    { id: "tofu",       label: "Tofu",           diets: ["vegan","keto"] },
    { id: "salad",      label: "Salad",          diets: ["veg","vegan","jain","keto"] },
    { id: "soup",       label: "Soup",           diets: ["veg","vegan","jain","keto"] },
    { id: "mutton",     label: "Mutton",         diets: ["non-veg"] },
    { id: "egg-curry",  label: "Egg Curry",      diets: ["eggitarian"] },
    { id: "khichdi",    label: "Khichdi",        diets: ["veg","vegan","jain"] },
  ],
  'late-night': [
    { id: "maggi",      label: "Maggi",          diets: ["veg","non-veg","eggitarian"] },
    { id: "popcorn",    label: "Popcorn",        diets: ["veg","vegan","jain"] },
    { id: "eggs",       label: "Scrambled Eggs", diets: ["non-veg","eggitarian","keto"] },
    { id: "nuts",       label: "Nuts",           diets: ["veg","vegan","jain","keto"] },
    { id: "cheese",     label: "Cheese Toast",   diets: ["veg","keto"] },
  ],
};

/**
 * Filter ingredients by meal timing AND diet type.
 * If no dietType provided, returns all ingredients for that meal.
 */
export function getFilteredIngredients(mealTiming, dietType = null) {
  const all = MEAL_SPECIFIC_INGREDIENTS[mealTiming] || [];
  if (!dietType) return all;

  // Normalize diet type — handle both "vegetarian"→"veg", "non-vegetarian"→"non-veg" etc.
  const raw = dietType.toLowerCase().trim();
  const diet = raw === "vegetarian" ? "veg"
    : raw === "non-vegetarian" ? "non-veg"
    : raw === "eggetarian" || raw === "eggitarian" ? "eggitarian"
    : raw;

  const filtered = all.filter(item =>
    !item.diets || item.diets.length === 0 || item.diets.includes(diet)
  );

  // Safety: if filter returns nothing (unknown diet), return all
  return filtered.length > 0 ? filtered : all;
}