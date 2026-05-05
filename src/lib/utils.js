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
 * @param {Object} food - The food object.
 * @param {Array} userAllergies - Array of strings (e.g., ["nuts", "dairy"]).
 * @returns {boolean} - True if the food does NOT contain any of the user's allergens.
 */
export function isFoodSafeForUser(food, userAllergies = []) {
  if (!userAllergies || userAllergies.length === 0) return true;
  const foodIngredients = (food.ingredients || []).map(i => i.toLowerCase());
  // Food is safe if none of the user's allergens appear in the food's ingredients
  return !userAllergies.some(allergy =>
    foodIngredients.includes(allergy.toLowerCase())
  );
}

export const MEAL_SPECIFIC_INGREDIENTS = {
 breakfast: [
  { id: "poha_base", label: "Poha (Flattened Rice)", diets: ["veg","vegan","jain"] },
  { id: "suji", label: "Suji (Rava)", diets: ["veg","vegan","jain"] },
  { id: "besan", label: "Besan", diets: ["veg","vegan","jain"] },
  { id: "wheat", label: "Wheat (Atta)", diets: ["veg","vegan","jain"] },

  { id: "oats", label: "Oats", diets: ["veg","vegan"] },
  { id: "bread", label: "Bread", diets: ["veg","vegan"] },

  { id: "paneer", label: "Paneer", diets: ["veg","keto"] },
  { id: "curd", label: "Curd (Dahi)", diets: ["veg"] },
  { id: "milk", label: "Milk", diets: ["veg"] },

  { id: "egg", label: "Egg", diets: ["non-veg","eggitarian","keto"] },
  { id: "chicken", label: "Chicken", diets: ["non-veg","keto"] },

  { id: "butter", label: "Butter", diets: ["veg","keto"] },
  // { id: "ghee", label: "Ghee", diets: ["veg","keto"] },

  { id: "fruits", label: "Fruits", diets: ["veg","vegan","jain","keto"] },
  { id: "dry_fruits", label: "Dry Fruits", diets: ["veg","vegan","jain","keto"] },

  { id: "idli_batter", label: "Idli/Dosa Batter", diets: ["veg","vegan","jain"] }
],
lunch: [
  { id: "rice", label: "Rice", diets: ["veg","non-veg","vegan","jain"] },
  { id: "wheat", label: "Wheat (Atta)", diets: ["veg","non-veg","vegan","jain"] },

  { id: "dal", label: "Lentils (Dal)", diets: ["veg","vegan","jain"] },
  { id: "legumes", label: "Legumes (Rajma, Chole)", diets: ["veg","vegan","jain"] },

  { id: "paneer", label: "Paneer", diets: ["veg","keto"] },
  { id: "tofu", label: "Tofu", diets: ["vegan","keto"] },

  { id: "chicken", label: "Chicken", diets: ["non-veg","keto"] },
  { id: "fish", label: "Fish", diets: ["non-veg","keto"] },
  { id: "mutton", label: "Mutton", diets: ["non-veg"] },
  { id: "egg", label: "Egg", diets: ["non-veg","eggitarian","keto"] },

  { id: "vegetables", label: "Mixed Vegetables", diets: ["veg","vegan","jain","keto"] },
  { id: "potato", label: "Potato", diets: ["veg","vegan"] },

  { id: "curd", label: "Curd (Dahi)", diets: ["veg"] },
  { id: "butter", label: "Butter", diets: ["veg","keto"] },
  { id: "ghee", label: "Ghee", diets: ["veg","keto"] },

  { id: "spices", label: "Indian Spices", diets: ["veg","vegan","jain","keto"] }
],
 snacks: [
  { id: "potato", label: "Potato", diets: ["veg","vegan"] },

  { id: "besan", label: "Besan", diets: ["veg","vegan","jain"] }, // pakora base

  { id: "murmura", label: "Puffed Rice (Murmura)", diets: ["veg","vegan","jain"] }, // bhel puri base

  { id: "bread", label: "Bread", diets: ["veg","vegan"] },

  { id: "peanuts", label: "Peanuts", diets: ["veg","vegan","jain","keto"] },
  { id: "corn", label: "Corn", diets: ["veg","vegan","jain"] },

  { id: "egg", label: "Egg", diets: ["non-veg","eggitarian","keto"] },
  { id: "chicken", label: "Chicken", diets: ["non-veg","keto"] },

  { id: "cheese", label: "Cheese", diets: ["veg","keto"] },
  { id: "fruits", label: "Fruits", diets: ["veg","vegan","jain"] },
  { id: "icecream", label: "Ice Cream", diets: ["veg"] }
],
 dinner: [
  { id: "wheat", label: "Wheat (Atta)", diets: ["veg","non-veg","vegan","jain"] },
  { id: "rice", label: "Rice", diets: ["veg","non-veg","vegan","jain"] },
  { id: "dal", label: "Dal", diets: ["veg","vegan","jain"] },

  { id: "paneer", label: "Paneer", diets: ["veg"] },
  { id: "chicken", label: "Chicken", diets: ["non-veg"] },
  { id: "egg", label: "Egg", diets: ["non-veg","eggitarian"] },

  { id: "vegetables", label: "Mix Vegetables", diets: ["veg","vegan","jain"] },

  { id: "soup", label: "Soup", diets: ["veg","vegan","jain","keto"] },
  { id: "salad", label: "Salad", diets: ["veg","vegan","jain","keto"] },
  { id: "khichdi", label: "Khichdi", diets: ["veg","vegan","jain"] },

  { id: "onion", label: "Onion", diets: ["veg","non-veg","vegan"] },
  { id: "tomato", label: "Tomato", diets: ["veg","vegan","jain"] },
  { id: "oil", label: "Cooking Oil", diets: ["veg","vegan","jain"] }
],
 "late-night": [
  { id: "milk", label: "Milk", diets: ["veg"] },

  { id: "banana", label: "Banana", diets: ["veg","vegan","jain"] },
  { id: "fruits", label: "Fruits", diets: ["veg","vegan","jain"] },

  { id: "bread", label: "Bread", diets: ["veg","vegan"] },

  { id: "egg", label: "Egg", diets: ["non-veg","eggitarian","keto"] },

  { id: "nuts", label: "Nuts", diets: ["veg","vegan","jain","keto"] },

  { id: "cheese", label: "Cheese", diets: ["veg","keto"] }
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