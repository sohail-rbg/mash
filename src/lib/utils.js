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
  const allergiesArray = Array.isArray(userAllergies) 
    ? userAllergies 
    : (typeof userAllergies === 'string' ? userAllergies.split(',').filter(Boolean) : []);

  if (allergiesArray.length === 0) return true;

  const clean = (s) => String(s || "").toLowerCase().trim().replace(/[\s\-_]/g, "");

  const foodIngredients = (food.ingredients || []).map(i => {
    if (typeof i === 'string') return clean(i);
    return clean(i?.id || i?.label || i?.ingredient || i?.name || "");
  }).filter(Boolean);

  const searchableText = clean((food.name || "") + " " + (food.description || ""));
  
  const hasAllergen = allergiesArray.some(allergy => {
    const restricted = clean(allergy);
    if (!restricted) return false;

    const inIngredients = foodIngredients.some(ing => ing.includes(restricted));
    const inText = searchableText.includes(restricted);
    return inIngredients || inText;
  });

  return !hasAllergen;
}

/**
 * Checks if a food item matches the user's health goal.
 * @param {Object} food - The food object.
 * @param {string} userGoal - The selected health goal (e.g., "weight-loss", "No Goal").
 * @returns {boolean} - True if the food matches the criteria.
 */
export function isFoodMatchingGoal(food, userGoal) {
  if (!userGoal || userGoal === "No Goal") return true;

  const clean = (s) => String(s || "").toLowerCase().trim().replace(/[\s\-_]/g, "");
  const target = clean(userGoal);
  
  const foodGoals = (food.healthGoals || []).map(clean);
  return foodGoals.includes(target);
}

/**
 * Master flat ingredient list for the Add Food form.
 * Organized by category, deduplicated, clean IDs.
 */
export const FOOD_INGREDIENTS = [
  // Grains & Staples
  { id: "rice",          label: "Rice",                   category: "Grains" },
  // { id: "onion",         label: "Onion",                  category: "Grains" },
  { id: "wheat",         label: "Wheat / Atta",           category: "Grains" },
  { id: "rava",          label: "Rava ",            category: "Grains" },
  { id: "poha",          label: "Poha (Flattened Rice)",  category: "Grains" },
  { id: "oats",          label: "Oats",                   category: "Grains" },
  { id: "upma",          label: "Upma",                   category: "Grains" },
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
  { id: "rajma",         label: "Rajma ",   category: "Dal & Legumes" },
  { id: "chole",         label: "Chole (Chickpeas)",      category: "Dal & Legumes" },
  { id: "soybean",       label: "Soya Chunks",            category: "Dal & Legumes" },
  { id: "besan",         label: "Besan",     category: "Dal & Legumes" },
  // Vegetables
  { id: "potato",        label: "Potato",          category: "Vegetables" },
  { id: "onion",         label: "Onion",           category: "Vegetables" },
  { id: "tomato",        label: "Tomato",                 category: "Vegetables" },
  { id: "garlic",        label: "Garlic",                 category: "Vegetables" },
  { id: "ginger",        label: "Ginger",                 category: "Vegetables" },
  { id: "spinach",       label: "Spinach (Palak)",        category: "Vegetables" },
  { id: "cauliflower",   label: "Cauliflower (Gobi)",     category: "Vegetables" },
  { id: "peas",          label: "Green Peas",     category: "Vegetables" },
  { id: "capsicum",      label: "Capsicum",               category: "Vegetables" },
  { id: "carrot",        label: "Carrot",                 category: "Vegetables" },
  { id: "brinjal",       label: "Brinjal (Baingan)",      category: "Vegetables" },
  { id: "corn",          label: "Corn",                   category: "Vegetables" },
  { id: "mushroom",      label: "Mushroom",               category: "Vegetables" },
  { id: "mixed_veg",     label: "Mixed Vegetables",       category: "Vegetables" },
  { id: "pasta",         label: "Pasta",                  category: "Vegetables" },
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
  { id: "pizza_base",    label: "Pizza Base",             category: "Spices" },
  // Fruits & Nuts
  { id: "banana",        label: "Banana",                 category: "Fruits & Nuts" },
  { id: "fruits",        label: "Mixed Fruits",           category: "Fruits & Nuts" },
  { id: "dry_fruits",    label: "Dry Fruits",             category: "Fruits & Nuts" },
  { id: "peanuts",       label: "Peanuts",                category: "Fruits & Nuts" },
  { id: "nuts",          label: "Nuts",   category: "Fruits & Nuts" },
{ id: "honey",         label: "Honey",                  category: "Fruits & Nuts" },
  { id: "coconut",       label: "Coconut",                category: "Fruits & Nuts" },
  // Other
  { id: "tofu",          label: "Tofu",                   category: "Other" },
  { id: "sugar",         label: "Sugar / Jaggery",        category: "Other" },
  { id: "tamarind",      label: "Tamarind (Imli)",        category: "Other" },
  { id: "lemon",         label: "Lemon",                  category: "Other" },
  { id: "green_chilli",  label: "Green Chilli",           category: "Other" },
  {id: "mongdal",         label: "Mong Dal",              category: "Dal & Legumes" },
];

export const MEAL_SPECIFIC_INGREDIENTS = {};

// export const MEAL_SPECIFIC_INGREDIENTS = {
//  breakfast: [
//   { id: "upma", label: "Upma", diets: ["veg"] },
//   { id: "besan", label: "Besan", diets: ["veg"] },

//   { id: "bread", label: "Bread", diets: ["veg"] },
//   { id: "oats", label: "Oats", diets: ["veg"] },
//   {id: "potato", label: "Potato", diets: ["veg"] },

//   { id: "paneer", label: "Paneer", diets: ["veg"] },
//   { id: "milk", label: "Milk", diets: ["veg"] },

//   { id: "fruits", label: "Fruits", diets: ["veg"] },
//   { id: "dry_fruits", label: "Dry Fruits", diets: ["veg"] },
//   { id: "rava", label: "Rava", diets: ["veg"] },

//   { id: "egg", label: "Egg", diets: ["non-veg"] },
//   { id: "chicken", label: "Chicken", diets: ["non-veg"] },
//   { id: "omelette", label: "Omelette", diets: ["non-veg"] },
//   { id: "chicken-pasta", label: "Chicken Pasta", diets: ["non-veg"] },
  
// ],

//  lunch: [
//   { id: "rice", label: "Rice", diets: ["veg","non-veg"] },
//   { id: "wheat", label: "Wheat", diets: ["veg","non-veg"] },
//   { id: "paneer", label: "Paneer", diets: ["veg"] },

//   { id: "dal", label: "Lentils (Dal)", diets: ["veg"] },
//   { id: "rajma", label: "Rajma", diets: ["veg"] },
//   { id: "chole", label: "Chole", diets: ["veg"] },

//   { id: "chicken", label: "Chicken", diets: ["non-veg"] },
//   { id: "fish", label: "Fish", diets: ["non-veg"] },
//   { id: "mutton", label: "Mutton", diets: ["non-veg"] },
//   { id: "eggs", label: "Eggs", diets: ["non-veg"] },

//   { id: "mixed_veg", label: "Mixed Vegetables", diets: ["veg"] },
//   { id: "potato", label: "Potato", diets: ["veg"] },

//   { id: "curd", label: "Curd", diets: ["veg"] },
//    { id: "cruciferous",      label: "Cruciferous",  diets: ["veg"] },

//   {id: "Besan", label: "Besan", diets: ["veg"] }
// ],

//  snacks: [
//   { id: "potato", label: "Potato", diets: ["veg"] },
//   {id : "carrot", label: "Carrot", diets: ["veg"] },
//   { id: "noodles", label: "Noodles", diets: ["veg"] },
//   { id: "maggi", label: "Maggi", diets: ["veg"] },
//   { id: "pasta", label: "Pasta", diets: ["veg"] },
//   { id: "corn", label: "Corn", diets: ["veg"] },
  
//   { id: "tomato", label: "Tomato", diets: ["veg"] },
//   { id: "dry-fruits", label: "Dry Fruits", diets: ["veg"] },
//   { id: "egg", label: "Egg", diets: ["non-veg"] },
//   { id: "chicken", label: "Chicken", diets: ["non-veg"] },

//   { id: "cheese", label: "Cheese", diets: ["veg"] },
//   { id: "fruits", label: "Fruits", diets: ["veg"] }
// ],

//  dinner: [
//   // Main Staples
//   { id: "wheat",        label: "Wheat",          diets: ["veg"] },
//   { id: "rice",         label: "Rice",         diets: ["veg"] },
//   { id: "dal",          label: "Dal",                   diets: ["veg"] },
//   // Protein
//   { id: "paneer",       label: "Paneer",                diets: ["veg"] },
//   { id: "egg",          label: "Egg",                   diets: ["non-veg"] },
//   { id: "chicken",      label: "Chicken",               diets: ["non-veg"] },
//   { id: "fish",         label: "Fish",                  diets: ["non-veg"] },
//   { id: "mutton",       label: "Mutton",                diets: ["non-veg"] },
//   // Vegetables
//   { id: "potato",       label: "Potato",         diets: ["veg"] },
//   { id: "spinach",      label: "Spinach",       diets: ["veg"] },
//  { id: "soybean",       label: " Soya",       diets: ["veg"] },
//   { id: "okra",         label: "lady-finger",         diets: ["veg"] },
//   { id: "peas",         label: "Green-Peas",          diets: ["veg"] },
//   { id: "cruciferous",      label: "Cruciferous",  diets: ["veg"] },
//   { id: "mixed_veg",    label: "Mixed Vegetables",      diets: ["veg"] },
//   // Sides
//   { id: "curd",         label: "Curd",          diets: ["veg"] },
// ],

//  "late-night": [
//   { id: "milk", label: "Milk", diets: ["veg"] },
//   { id: "banana", label: "Banana", diets: ["veg"] },
//   { id: "fruits", label: "Fruits", diets: ["veg"] },
//   { id: "bread", label: "Bread", diets: ["veg"] },
//   { id: "egg", label: "Egg", diets: ["non-veg"] },
//   { id: "nuts", label: "Nuts", diets: ["veg"] },
//   { id: "cheese", label: "Cheese", diets: ["veg"] }
// ]
// };
/**
 * Filter ingredients by meal timing AND diet type.
 * If no dietType provided, returns all ingredients for that meal.
 */
export function getFilteredIngredients(mealTiming, dietType = null) {
  const all = MEAL_SPECIFIC_INGREDIENTS[mealTiming] || FOOD_INGREDIENTS;
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

export function normalizeIngredientId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function buildIngredientOptionsFromFoods(foods = []) {
  const seen = new Set();
  const options = [];

  foods.forEach((food) => {
    if (!Array.isArray(food.ingredients)) return;
    food.ingredients.forEach((rawIngredient) => {
      const label = String(rawIngredient || "").trim();
      if (!label) return;

      const id = normalizeIngredientId(label);
      if (!id || seen.has(id)) return;
      seen.add(id);
      options.push({ id, label });
    });
  });

  return options.sort((a, b) => a.label.localeCompare(b.label));
}
