import { 
  DIET_TYPE_OPTIONS, 
  HEALTH_GOALS_OPTIONS, 
  CUISINE_OPTIONS as CONST_CUISINES,
  INGREDIENT_RESTRICTION_OPTIONS 
} from "./constants";

const formatLabel = (str) => {
  if (!str) return "";
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const DIET_OPTIONS = [
  { value: "veg", label: "Vegetarian" },
  { value: "non-veg", label: "Non-Vegetarian" },
  ...DIET_TYPE_OPTIONS
    .filter(opt => opt !== 'veg' && opt !== 'non-veg')
    .map(opt => ({ value: opt, label: formatLabel(opt) }))
];

export const ALLERGY_OPTIONS = INGREDIENT_RESTRICTION_OPTIONS.map(opt => ({
  value: opt,
  label: formatLabel(opt)
}));

export const GOAL_OPTIONS = HEALTH_GOALS_OPTIONS.map(opt => ({
  value: opt,
  label: formatLabel(opt)
}));

export const CUISINE_OPTIONS = CONST_CUISINES.map(opt => ({
  value: opt,
  label: formatLabel(opt)
}));

export const OPTIONS_MAP = {
  dietType: DIET_OPTIONS,
  allergies: ALLERGY_OPTIONS,
  healthGoals: GOAL_OPTIONS,
  cuisine: CUISINE_OPTIONS,
};