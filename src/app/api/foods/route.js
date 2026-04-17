import { NextResponse } from "next/server";
import connectDB from "@/lib/db";

export const dynamic = "force-dynamic"; // 🔥 MUST

import {
  MEAL_TIMING_OPTIONS,
  DIET_TYPE_OPTIONS,
  HEALTH_GOALS_OPTIONS,
  CUISINE_OPTIONS,
  MOOD_OPTIONS,
  WEATHER_OPTIONS,
  FOOD_STYLE_OPTIONS,
  INGREDIENT_RESTRICTION_OPTIONS,
  FOOD_TYPE_OPTIONS,
  SPICE_LEVEL_OPTIONS,
} from "@/lib/constants";

// Map field names to their valid options for validation/sanitization
const FIELD_VALIDATION = {
  foodStyle: FOOD_STYLE_OPTIONS,
  // spiceLevel: ["spicy", "mild", "normal"],
  mealTiming: MEAL_TIMING_OPTIONS,
  dietType: DIET_TYPE_OPTIONS,
  healthGoals: HEALTH_GOALS_OPTIONS,
  cuisine: CUISINE_OPTIONS,
  mood: MOOD_OPTIONS,
  weather: WEATHER_OPTIONS,
  foodType: FOOD_TYPE_OPTIONS,
  spiceLevel: SPICE_LEVEL_OPTIONS
};

const SYNONYM_MAP = {
  dietType: {
    'veg': ['veg', 'vegetarian'],
    'vegetarian': ['veg', 'vegetarian'],
    'pure-vegetarian': ['veg', 'vegetarian'],
    'non-veg': ['non-veg', 'non-vegetarian'],
    'non-vegetarian': ['non-veg', 'non-vegetarian'],
  },
  mood: {
    'happy': ['excited'],
  }
};

export async function POST(req) {
  try {
    await connectDB();
    const FoodModel = (await import("@/models/Food")).default;
    const body = await req.json();

    console.log("Incoming body:", body); 

    const arrayFields = ['mealTiming', 'dietType', 'healthGoals', 'cuisine', 'mood', 'weather', 'foodStyle', 'searchKeywords', 'ingredients', 'restrictedIngredients', 'foodType', 'spiceLevel'];
    
    arrayFields.forEach(field => {
      if (body[field]) {
        let values = [];
        if (Array.isArray(body[field])) {
          values = body[field].map(s => String(s).trim().toLowerCase());
        } else {
          values = String(body[field]).split(',').map(s => s.trim().toLowerCase());
        }
        
        if (field === 'dietType') {
          values = values.map(s => {
            if (['vegetarian', 'pure vegetarian', 'pure-vegetarian'].includes(s)) return 'veg';
            if (['non-vegetarian', 'non vegetarian'].includes(s)) return 'non-veg';
            return s;
          });
        }
        
        body[field] = values;
      }
    });

  const newFood = await FoodModel.create(body);

    return Response.json(newFood, { status: 201 });
  } catch (error) {
    console.error("POST ERROR:", error); // VERY IMPORTANT
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const FoodModel = (await import("@/models/Food")).default;

    const { searchParams } = req.nextUrl;
    const query = {};

    const processValues = (values) =>
      values
        .flatMap(value => String(value).split(','))
        .map(v => v.trim().toLowerCase())
        .filter(Boolean);

    for (const key of new Set(searchParams.keys())) {
      const values = searchParams.getAll(key);
      // 1. Handle Enum Fields
      if (FIELD_VALIDATION[key]) {
        const inputValues = processValues(values).map(v => v.replace(/\s+/g, '-'));
        const searchValues = new Set();

        inputValues.forEach(val => {
          if (SYNONYM_MAP[key] && SYNONYM_MAP[key][val]) {
            SYNONYM_MAP[key][val].forEach(s => searchValues.add(s));
          } else {
            searchValues.add(val);
          }
        });

        if (searchValues.size > 0) {
          query[key] = { $in: Array.from(searchValues) };
        }
      } else if (key === 'restrictedIngredients' || key === 'allergies') {
        const excludedItems = processValues(values).filter(
          (v) => !['no-allergies', 'no allergies', 'no'].includes(v),
        );

        if (excludedItems.length > 0) {
          const patterns = excludedItems.map((ing) => new RegExp(ing, 'i'));

          if (!query.ingredients) query.ingredients = {};
          if (!query.ingredients.$nin) query.ingredients.$nin = [];
          query.ingredients.$nin.push(...patterns);
        }
      } else if (key === 'ingredients') {
        const ingredientsList = processValues(values);
        if (ingredientsList.length > 0) {
          if (!query.ingredients) query.ingredients = {};
          query.ingredients.$all = ingredientsList.map((ing) => new RegExp(ing, 'i'));
        }
      } else if (key === 'search' || key === 'searchKeywords') {
        const searchTerms = processValues(values);

        const noIngredients = searchTerms
          .filter((searchTerm) => searchTerm.startsWith('no '))
          .map((searchTerm) => searchTerm.replace(/^no\s+/, '').trim());

        if (noIngredients.length > 0) {
          if (!query.ingredients) query.ingredients = {};
          if (!query.ingredients.$nin) query.ingredients.$nin = [];
          noIngredients.forEach((ingredient) => {
            if (ingredient) query.ingredients.$nin.push(new RegExp(ingredient, 'i'));
          });
        }

        const normalTerms = searchTerms.filter((searchTerm) => !searchTerm.startsWith('no '));
        if (normalTerms.length > 0) {
          query.$or = normalTerms.flatMap((searchTerm) => [
            { name: { $regex: searchTerm, $options: 'i' } },
            { searchKeywords: { $regex: searchTerm, $options: 'i' } },
            { ingredients: { $regex: searchTerm, $options: 'i' } },
          ]);
        }
      }
    }

     const projection = {
      name: 1,
      image: 1,
      description: 1,
      mealTiming: 1,
      dietType: 1,
      healthGoals: 1,
      cuisine: 1,
      mood: 1,
      weather: 1,
      foodStyle: 1,
      foodType: 1,
      ingredients: 1,
      nutrition: 1,
    };

    const foods = await FoodModel.find(query, projection).lean();
    // console.log("[API /api/foods] query=", JSON.stringify(query), "count=", foods.length);
    // console.log(
    //   "[API /api/foods] filtered foods=",
    //   JSON.stringify(
    //     foods.slice(0, 20).map((food) => ({
    //       name: food.name,
    //       dietType: food.dietType,
    //       mealTiming: food.mealTiming,
    //       ingredients: food.ingredients,
    //     })),
    //     null,
    //     2
    //   )
    // );
    // console.log("show all food after click model", foods);

    return NextResponse.json(foods, { status: 200 });
  } catch (error) {
    console.error("GET ERROR:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
