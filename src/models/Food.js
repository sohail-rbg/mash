import mongoose from "mongoose";
import {
  MEAL_TIMING_OPTIONS,
  DIET_TYPE_OPTIONS,
  CUISINE_OPTIONS,
  WEATHER_OPTIONS,
  INGREDIENT_RESTRICTION_OPTIONS,
  FOOD_TYPE_OPTIONS,
  SPICE_LEVEL_OPTIONS,
  HEALTH_GOALS_OPTIONS,
} from "@/lib/constants";

const FoodSchema = new mongoose.Schema(
{
  // BASIC INFO
  name: { type: String, required: true, trim: true },
  image: { type: String, required: true },
  description: String,

  // CATEGORY
  category: {
    type: String
  },

  // MEAL TIMING
  mealTiming: {
    type: [String],
    enum: MEAL_TIMING_OPTIONS
  },

  // DIET TYPE
  dietType: {
    type: [String],
    enum: DIET_TYPE_OPTIONS
  },

  // HEALTH GOALS
  healthGoals: {
    type: [String],
    enum: HEALTH_GOALS_OPTIONS
  },

  //spice level
  spiceLevel: {
    type: [String],
    enum: SPICE_LEVEL_OPTIONS
  },
  // CUISINE
  cuisine: {
    type: [String],
    enum: CUISINE_OPTIONS
  },

  // INGREDIENTS
  ingredients: [String],

  // INGREDIENT RESTRICTIONS
  restrictedIngredients: {
    type: [String],
    enum: INGREDIENT_RESTRICTION_OPTIONS
  },

  // WEATHER
  weather: {
    type: [String],
    enum: WEATHER_OPTIONS
  },

  // Food Type
  foodType: {
    type: [String],
    enum: FOOD_TYPE_OPTIONS
  },
},
{ timestamps: true }
);

// Add Indexes to speed up queries (especially for the Home page filters)
FoodSchema.index({ dietType: 1 });
FoodSchema.index({ healthGoals: 1 });
FoodSchema.index({ cuisine: 1 });
FoodSchema.index({ mealTiming: 1 });
FoodSchema.index({ weather: 1 });
FoodSchema.index({ foodType: 1 });
FoodSchema.index({ ingredients: 1 });
// Compound index for common filter combinations
FoodSchema.index({ dietType: 1, mealTiming: 1, foodType: 1 });

export default (mongoose.models.Food && 
  // Validate cached model has current enum length — recompile if stale
  mongoose.models.Food.schema.path('healthGoals').enumValues?.includes('energy')
    ? mongoose.models.Food
    : (() => { delete mongoose.models.Food; return mongoose.model("Food", FoodSchema); })()
);