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

/**
 * Master flat ingredient list for the Add Food form.
 * Organized by category, deduplicated, clean IDs.
 */
export const FOOD_INGREDIENTS = [
  // Grains & Staples
  { id: "rice",          label: "Rice",                   category: "Grains" },
  { id: "wheat",         label: "Wheat / Atta",           category: "Grains" },
  { id: "suji",          label: "Suji (Rava)",            category: "Grains" },
  { id: "poha",          label: "Poha (Flattened Rice)",  category: "Grains" },
  { id: "oats",          label: "Oats",                   category: "Grains" },
  { id: "bread",         label: "Bread",                  category: "Grains" },
  { id: "maida",         label: "Maida (Refined Flour)",  category: "Grains" },
  { id: "cornflour",     label: "Cornflour",              category: "Grains" },
  { id: "murmura",       label: "Puffed Rice (Murmura)",  category: "Grains" },
  { id: "idli_batter",   label: "Idli / Dosa Batter",    category: "Grains" },
  { id: "noodles",       label: "Noodles / Pasta",        category: "Grains" },
  // Dal & Legumes
  { id: "dal",           label: "Dal (Lentils)",          category: "Dal & Legumes" },
  { id: "chana_dal",     label: "Chana Dal",              category: "Dal & Legumes" },
  { id: "moong_dal",     label: "Moong Dal",              category: "Dal & Legumes" },
  { id: "masoor_dal",    label: "Masoor Dal",             category: "Dal & Legumes" },
  { id: "urad_dal",      label: "Urad Dal",               category: "Dal & Legumes" },
  { id: "rajma",         label: "Rajma (Kidney Beans)",   category: "Dal & Legumes" },
  { id: "chole",         label: "Chole (Chickpeas)",      category: "Dal & Legumes" },
  { id: "soybean",       label: "Soya Chunks",            category: "Dal & Legumes" },
  { id: "besan",         label: "Besan (Gram Flour)",     category: "Dal & Legumes" },
  // Vegetables
  { id: "potato",        label: "Potato (Aloo)",          category: "Vegetables" },
  { id: "onion",         label: "Onion",                  category: "Vegetables" },
  { id: "tomato",        label: "Tomato",                 category: "Vegetables" },
  { id: "garlic",        label: "Garlic",                 category: "Vegetables" },
  { id: "ginger",        label: "Ginger",                 category: "Vegetables" },
  { id: "spinach",       label: "Spinach (Palak)",        category: "Vegetables" },
  { id: "cauliflower",   label: "Cauliflower (Gobi)",     category: "Vegetables" },
  { id: "peas",          label: "Green Peas (Matar)",     category: "Vegetables" },
  { id: "capsicum",      label: "Capsicum",               category: "Vegetables" },
  { id: "carrot",        label: "Carrot",                 category: "Vegetables" },
  { id: "brinjal",       label: "Brinjal (Baingan)",      category: "Vegetables" },
  { id: "corn",          label: "Corn",                   category: "Vegetables" },
  { id: "mushroom",      label: "Mushroom",               category: "Vegetables" },
  { id: "mixed_veg",     label: "Mixed Vegetables",       category: "Vegetables" },
  // Dairy
  { id: "milk",          label: "Milk",                   category: "Dairy" },
  { id: "curd",          label: "Curd (Dahi)",            category: "Dairy" },
  { id: "paneer",        label: "Paneer",                 category: "Dairy" },
  { id: "butter",        label: "Butter",                 category: "Dairy" },
  { id: "ghee",          label: "Ghee",                   category: "Dairy" },
  { id: "cream",         label: "Fresh Cream",            category: "Dairy" },
  { id: "cheese",        label: "Cheese",                 category: "Dairy" },
  // Non-Veg
  { id: "egg",           label: "Egg",                    category: "Non-Veg" },
  { id: "chicken",       label: "Chicken",                category: "Non-Veg" },
  { id: "mutton",        label: "Mutton / Lamb",          category: "Non-Veg" },
  { id: "fish",          label: "Fish",                   category: "Non-Veg" },
  { id: "prawn",         label: "Prawn / Shrimp",         category: "Non-Veg" },
  // Oils & Fats
  { id: "oil",           label: "Cooking Oil",            category: "Oils & Fats" },
  { id: "mustard_oil",   label: "Mustard Oil",            category: "Oils & Fats" },
  { id: "coconut_oil",   label: "Coconut Oil",            category: "Oils & Fats" },
  // Spices
  { id: "salt",          label: "Salt",                   category: "Spices" },
  { id: "turmeric",      label: "Turmeric (Haldi)",       category: "Spices" },
  { id: "red_chilli",    label: "Red Chilli Powder",      category: "Spices" },
  { id: "coriander_pwd", label: "Coriander Powder",       category: "Spices" },
  { id: "cumin",         label: "Cumin (Jeera)",          category: "Spices" },
  { id: "mustard_seeds", label: "Mustard Seeds (Rai)",    category: "Spices" },
  { id: "garam_masala",  label: "Garam Masala",           category: "Spices" },
  { id: "chaat_masala",  label: "Chaat Masala",           category: "Spices" },
  { id: "curry_leaves",  label: "Curry Leaves",           category: "Spices" },
  { id: "coriander_lf",  label: "Fresh Coriander",        category: "Spices" },
  // Fruits & Nuts
  { id: "banana",        label: "Banana",                 category: "Fruits & Nuts" },
  { id: "fruits",        label: "Mixed Fruits",           category: "Fruits & Nuts" },
  { id: "dry_fruits",    label: "Dry Fruits",             category: "Fruits & Nuts" },
  { id: "peanuts",       label: "Peanuts",                category: "Fruits & Nuts" },
  { id: "nuts",          label: "Nuts (Cashew/Almond)",   category: "Fruits & Nuts" },
  { id: "coconut",       label: "Coconut",                category: "Fruits & Nuts" },
  // Other
  { id: "tofu",          label: "Tofu",                   category: "Other" },
  { id: "sugar",         label: "Sugar / Jaggery",        category: "Other" },
  { id: "tamarind",      label: "Tamarind (Imli)",        category: "Other" },
  { id: "lemon",         label: "Lemon",                  category: "Other" },
  { id: "green_chilli",  label: "Green Chilli",           category: "Other" },
];

// export const MEAL_SPECIFIC_INGREDIENTS = { ... }  ← removed duplicate commented block

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

  { id: "fruits", label: "Fruits", diets: ["veg","vegan","jain","keto"] },
  { id: "dry_fruits", label: "Dry Fruits", diets: ["veg","vegan","jain","keto"] },

  { id: "idli_batter", label: "Idli/Dosa Batter", diets: ["veg","vegan","jain"] }
],

 lunch: [
  { id: "rice", label: "Rice", diets: ["veg","non-veg","vegan","jain"] },
  { id: "wheat", label: "Wheat (Atta)", diets: ["veg","non-veg","vegan","jain"] },

  { id: "dal", label: "Lentils (Dal)", diets: ["veg","vegan","jain"] },
  { id: "rajma", label: "Rajma", diets: ["veg","vegan","jain"] },
  { id: "chole", label: "Chickpeas", diets: ["veg","vegan","jain"] },

  { id: "paneer", label: "Paneer", diets: ["veg","keto"] },
  { id: "tofu", label: "Tofu", diets: ["vegan","keto"] },

  { id: "chicken", label: "Chicken", diets: ["non-veg","keto"] },
  { id: "fish", label: "Fish", diets: ["non-veg","keto"] },
  { id: "mutton", label: "Mutton", diets: ["non-veg"] },
  { id: "eggs", label: "Eggs", diets: ["non-veg","eggitarian","keto"] },

  { id: "vegetables", label: "Mixed Vegetables", diets: ["veg","vegan","jain","keto"] },
  { id: "potato", label: "Potato", diets: ["veg","vegan"] },

  { id: "curd", label: "Curd (Dahi)", diets: ["veg"] },
  { id: "butter", label: "Butter", diets: ["veg","keto"] },

  { id: "spices", label: "Spices", diets: ["veg","vegan","jain","keto"] },
  { id: "salt", label: "Salt", diets: ["veg","vegan","jain","keto"] },
  { id: "oil", label: "Cooking Oil", diets: ["veg","vegan","jain","keto"] }
],

 snacks: [
  { id: "potato", label: "Potato", diets: ["veg","vegan"] },
  { id: "besan", label: "Besan", diets: ["veg","vegan","jain"] },
  { id: "murmura", label: "Puffed Rice (Murmura)", diets: ["veg","vegan","jain"] },
  { id: "bread", label: "Bread", diets: ["veg","vegan"] },
  { id: "peanuts", label: "Peanuts", diets: ["veg","vegan","jain","keto"] },
  { id: "corn", label: "Corn", diets: ["veg","vegan","jain"] },

  { id: "egg", label: "Egg", diets: ["non-veg","eggitarian","keto"] },
  { id: "chicken", label: "Chicken", diets: ["non-veg","keto"] },

  { id: "cheese", label: "Cheese", diets: ["veg","keto"] },
  { id: "fruits", label: "Fruits", diets: ["veg","vegan","jain"] }
],

 dinner: [
  // Main Staples
  { id: "wheat",        label: "Roti / Aata",          diets: ["veg","non-veg","vegan","jain"] },
  { id: "rice",         label: "Rice (Chawal)",         diets: ["veg","non-veg","vegan","jain"] },
  { id: "dal",          label: "Dal",                   diets: ["veg","vegan","jain"] },
  // Protein
  { id: "paneer",       label: "Paneer",                diets: ["veg"] },
  { id: "egg",          label: "Egg",                   diets: ["non-veg","eggitarian"] },
  { id: "chicken",      label: "Chicken",               diets: ["non-veg"] },
  { id: "fish",         label: "Fish",                  diets: ["non-veg"] },
  { id: "mutton",       label: "Mutton",                diets: ["non-veg"] },
  // Vegetables
  { id: "potato",       label: "Potato (Aloo)",         diets: ["veg","vegan"] },
  { id: "spinach",      label: "Spinach (Palak)",       diets: ["veg","vegan","jain"] },
 { id: "soybean",       label: "Soybean / Soya",       diets: ["veg","vegan"] },
  { id: "okra",         label: "Okra (Bhindi)",         diets: ["veg","vegan","jain"] },
  { id: "peas",         label: "Peas (Matar)",          diets: ["veg","vegan","jain"] },
  { id: "cabbage/Cauliflower",      label: "Cabbage/Cauliflower",  diets: ["veg","vegan","jain"] },
  { id: "mixed_veg",    label: "Mixed Vegetables",      diets: ["veg","vegan","jain"] },
  // // Base Ingredients
  // { id: "onion",        label: "Onion (Pyaz)",          diets: ["veg","non-veg","vegan"] },
  // { id: "tomato",       label: "Tomato",                diets: ["veg","vegan","jain"] },
  // { id: "garlic",       label: "Garlic (Lehsun)",       diets: ["veg","non-veg","vegan"] },
  // { id: "ginger",       label: "Ginger (Adrak)",        diets: ["veg","non-veg","vegan","jain"] },
  // { id: "green_chilli", label: "Green Chilli",          diets: ["veg","non-veg","vegan","jain"] },
  // // Fats & Seasoning
  // { id: "ghee",         label: "Ghee",                  diets: ["veg","keto"] },
  // { id: "oil",          label: "Oil",                   diets: ["veg","vegan","jain"] },
  // { id: "salt",         label: "Salt",                  diets: ["veg","non-veg","vegan","jain"] },
  // { id: "turmeric",     label: "Haldi (Turmeric)",      diets: ["veg","non-veg","vegan","jain"] },
  // { id: "cumin",        label: "Jeera (Cumin)",         diets: ["veg","non-veg","vegan","jain"] },
  // { id: "garam_masala", label: "Garam Masala",          diets: ["veg","non-veg","vegan","jain"] },
  // Sides
  { id: "curd",         label: "Curd / Raita",          diets: ["veg"] },
],

 "late-night": [
  { id: "milk", label: "Milk", diets: ["veg"] },
  { id: "banana", label: "Banana", diets: ["veg","vegan","jain"] },
  { id: "fruits", label: "Fruits", diets: ["veg","vegan","jain"] },
  { id: "bread", label: "Bread", diets: ["veg","vegan"] },
  { id: "egg", label: "Egg", diets: ["non-veg","eggitarian","keto"] },
  { id: "nuts", label: "Nuts", diets: ["veg","vegan","jain","keto"] },
  { id: "cheese", label: "Cheese", diets: ["veg","keto"] }
]
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