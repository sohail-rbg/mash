"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "./commen/Input";
import Button from "./commen/Button";
import { MEAL_SPECIFIC_INGREDIENTS } from "@/lib/utils";
import {
  MEAL_TIMING_OPTIONS,
  DIET_TYPE_OPTIONS,
  HEALTH_GOALS_OPTIONS,
  CUISINE_OPTIONS,
  WEATHER_OPTIONS,
  FOOD_TYPE_OPTIONS,
  SPICE_LEVEL_OPTIONS,
} from "@/lib/constants";

export default function AddFoodForm({ editId, onAdded }) {
  const isEditing = !!editId;
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    image: null,          
    imageUrl: "",        
    useUrl: false,         
    description: "",
    category: "",
    mealTiming: [],
    dietType: "",
    healthGoals: [],
    cuisine: [],
    weather: [],
    foodType: [],
    ingredients: [],
    spiceLevel: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    // occasion: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [existingImage, setExistingImage] = useState(null); // Store existing image for editing

  // Fetch food data for editing
  useEffect(() => {
    if (isEditing) {
      const fetchFood = async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/foods/${editId}`);
          if (!res.ok) {
            throw new Error('Failed to fetch food data');
          }
          const food = await res.json();
          console.log("Fetched food data:", food);
          console.log("Food image:", food.image);
          setForm({
            name: food.name || "",
            image: null, // Can't pre-fill file input
            imageUrl: "", // Don't pre-fill URL input when editing
            useUrl: false, // Default to upload mode when editing
            description: food.description || "",
            category: food.category || "",
            mealTiming: food.mealTiming || [],
            dietType: food.dietType ? food.dietType[0] : "", // Convert array to single value
            healthGoals: food.healthGoals || [],
            cuisine: food.cuisine || [],
            weather: food.weather || [],
            foodType: food.foodType || [],
            ingredients: food.ingredients || [],
            spiceLevel: food.spiceLevel ? food.spiceLevel[0] : "",
            calories: food.nutrition?.calories?.toString() || "",
            protein: food.nutrition?.protein?.toString() || "",
            carbs: food.nutrition?.carbs?.toString() || "",
            fat: food.nutrition?.fat?.toString() || "",
          });

          // Set existing image for preview
          if (food.image) {
            setExistingImage(food.image);
            setPreviewUrl(food.image);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchFood();
    }
  }, [isEditing, editId]);

  // Flatten ingredients for the dropdown
  const allIngredientsList = React.useMemo(() => {
    const map = new Map();
    Object.values(MEAL_SPECIFIC_INGREDIENTS).forEach((list) => {
      list.forEach((item) => {
        if (!map.has(item.id)) {
          map.set(item.id, item.label);
        }
      });
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, []);

  // Filtered list based on search and current selection
  const displayIngredients = React.useMemo(() => {
    const search = ingredientSearch.toLowerCase().trim();
    
    // 1. Predefined list items matching search
    const matchedPredefined = allIngredientsList.filter(item => 
      item.label.toLowerCase().includes(search)
    );

    // 2. Custom items that are already selected (important for Edit mode)
    const customCheckedItems = form.ingredients
      .filter(id => !allIngredientsList.some(i => i.id === id))
      .filter(id => id.toLowerCase().includes(search))
      .map(id => ({ id, label: id, isCustom: true }));

    return [...matchedPredefined, ...customCheckedItems];
  }, [allIngredientsList, ingredientSearch, form.ingredients]);

  const showAddCustom = ingredientSearch.trim() !== "" && 
    !allIngredientsList.some(i => i.label.toLowerCase() === ingredientSearch.toLowerCase().trim()) &&
    !form.ingredients.includes(ingredientSearch.toLowerCase().trim());

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: checked }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }

    // Update preview for URL changes
    if (name === "imageUrl") {
      setPreviewUrl(value || null);
    }
  };

  const toggleSelection = (name, value) => {
    setForm((f) => {
      const current = f[name] || [];
      if (current.includes(value)) {
        return { ...f, [name]: current.filter((item) => item !== value) };
      }
      return { ...f, [name]: [...current, value] };
    });
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  const renderMultiSelect = (label, name, options) => {
    const isOpen = activeDropdown === name;
    return (
      <div className="relative">
        <label className="block text-sm font-medium mb-1">{label}</label>
        <button
          type="button"
          onClick={() => setActiveDropdown(isOpen ? null : name)}
          className="block w-full border border-white/10 rounded-lg px-3 py-2 text-left bg-zinc-900 text-white min-h-[42px] flex justify-between items-center transition-all focus:ring-2 focus:ring-blue-500/50"
        >
          {form[name].length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {form[name].map((item) => (
                <span key={item} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-white/40">Select {label}...</span>
          )}
          <span className="text-xs ml-2">▼</span>
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
            <div className="absolute z-20 w-full bg-zinc-900 border border-white/20 rounded-xl shadow-2xl mt-2 max-h-60 overflow-y-auto p-2 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-2 p-1">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, [name]: options }));
                      // keep dropdown open
                      setActiveDropdown(name);
                    }}
                    className="text-sm text-green-400 hover:text-green-300 px-2 py-1 rounded"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, [name]: [] }));
                      // close dropdown after clearing
                      setActiveDropdown(null);
                    }}
                    className="text-sm text-red-400 hover:text-red-300 px-2 py-1 rounded"
                  >
                    Clear All
                  </button>
                </div>
                <span className="text-xs text-white/40">{form[name].length} selected</span>
              </div>
              {options.map((opt) => (
                <label key={opt} className="flex items-center space-x-2 p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors group">
                  <input
                    type="checkbox"
                    checked={form[name].includes(opt)}
                    onChange={() => toggleSelection(name, opt)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-white group-hover:text-blue-400">{opt}</span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body = {
      name: form.name,
      description: form.description,
    };

    if (form.category) body.category = form.category;

    const toArray = (str) => str ? str.split(",").map((s) => s.trim().toLowerCase()) : [];
    
    // Multi-select fields are already arrays
    if (form.mealTiming.length) body.mealTiming = form.mealTiming;
    if (form.dietType) body.dietType = [form.dietType];
    if (form.healthGoals.length) body.healthGoals = form.healthGoals;
    if (form.cuisine.length) body.cuisine = form.cuisine;
    if (form.weather.length) body.weather = form.weather;
    
    // New fields
    if (form.foodType.length) body.foodType = form.foodType;
    if (form.ingredients.length) body.ingredients = form.ingredients;
    if (form.spiceLevel) body.spiceLevel = [form.spiceLevel];

    body.nutrition = {
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
    };

    // if (form.occasion) body.occasion = toArray(form.occasion);

    // image handling: file -> base64, or if using URL use that directly, or keep existing
    if (form.useUrl && form.imageUrl) {
      body.image = form.imageUrl;
    } else if (form.image instanceof File) {
      body.image = await fileToBase64(form.image);
    } else if (isEditing && existingImage && !form.image && !form.imageUrl) {
      // Keep existing image if no new image provided
      body.image = existingImage;
    } else if (isEditing && originalFood?.image && !form.image) {
      // Preserve original image if editing and no new image provided
      body.image = originalFood.image;
    }

    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `/api/foods/${editId}` : "/api/foods";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || `Failed to ${isEditing ? 'update' : 'add'} food`);
      }

      const updatedFood = await res.json();

      if (!isEditing) {
        // Reset form only when adding new food
        setForm({
          name: "", // Reset form fields
          image: null,
          imageUrl: "",
          useUrl: false,
          description: "",
          category: "",
          mealTiming: [],
          dietType: "",
          healthGoals: [],
          cuisine: [],
          weather: [],
          foodType: [],
          ingredients: [],
          spiceLevel: "",
          calories: "",
          protein: "",
          carbs: "",
          fat: "",
          // occasion: "",
        });
        setPreviewUrl(null);
      }

      if (onAdded) onAdded(updatedFood);
      if (isEditing) {
        // Go back to all-foods and highlight the edited food
        router.push(`/all-foods?highlight=${updatedFood._id}`);
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  console.log("Form state:", form);

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4">
      <h2 className="text-xl font-semibold">{isEditing ? "Edit Food" : "Add New Food"}</h2>

      <Input
        label="Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
      />

      <Input
        label="Category"
        name="category"
        value={form.category}
        onChange={handleChange}
      />

      <div>
        <label className="block text-sm font-medium" htmlFor="useUrl">
          Image source
        </label>
        <div className="flex items-center space-x-4 mt-1">
          <label className="flex items-center space-x-1">
            <input
              type="radio"
              name="useUrl"
              value={true}
              checked={form.useUrl}
              onChange={() => setForm((f) => ({ ...f, useUrl: true }))}
            />
            <span className="text-sm">URL</span>
          </label>
          <label className="flex items-center space-x-1">
            <input
              type="radio"
              name="useUrl"
              value={false}
              checked={!form.useUrl}
              onChange={() => {
                setForm((f) => ({ ...f, useUrl: false, imageUrl: "" }));
                // Show existing image if editing, otherwise clear preview
                setPreviewUrl(isEditing && existingImage ? existingImage : null);
              }}
            />
            <span className="text-sm">Upload</span>
          </label>
        </div>
      </div>
      {form.useUrl ? (
        <>
          <Input
            label="Image URL"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            required
          />
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt="preview"
              className="mt-2 w-32 h-32 object-cover rounded"
            />
          )}
        </>
      ) : (
        <div>
          <label className="block text-sm font-medium" htmlFor="imageFile">
            {isEditing ? "Upload New Image (leave empty to keep existing)" : "Upload Image"}
          </label>
          <input
            id="imageFile"
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                setForm((f) => ({ ...f, image: e.target.files[0] }));
                setPreviewUrl(URL.createObjectURL(e.target.files[0]));
              } else {
                // If no file selected, show existing image again
                setForm((f) => ({ ...f, image: null }));
                setPreviewUrl(existingImage);
              }
            }}
            className="mt-1"
          />
          {previewUrl && (
            <div className="mt-2">
              <img
                src={previewUrl}
                alt="preview"
                className="w-32 h-32 object-cover rounded"
              />
              {isEditing && existingImage === previewUrl && (
                <p className="text-xs text-gray-500 mt-1">Current image</p>
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          className="mt-1 block w-full border rounded px-2 py-1"
        />
      </div>

      {/* Food Type */}
      <div>
        {renderMultiSelect("Food Type", "foodType", FOOD_TYPE_OPTIONS || ["online", "self-cooking"])}
      </div>

      {/* Ingredients Multi-select */}
      <div className="relative">
        <label className="block text-sm font-medium mb-1">Ingredients</label>
        <button
          type="button"
          onClick={() => setActiveDropdown(activeDropdown === 'ingredients' ? null : 'ingredients')}
          className="block w-full border rounded px-2 py-2 text-left bg-gray min-h-[38px] flex justify-between items-center"
        >
          {form.ingredients.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {form.ingredients.map((id) => {
                const item = allIngredientsList.find((i) => i.id === id);
                return (
                  <span key={id} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                    {item ? item.label : id}
                  </span>
                );
              })}
            </div>
          ) : (
            <span className="text-gray-400">Select ingredients...</span>
          )}
          <span className="text-xs ml-2">▼</span>
        </button>

        {activeDropdown === 'ingredients' && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => { setActiveDropdown(null); setIngredientSearch(""); }} />
            <div className="absolute z-20 w-full bg-black border border-white/20 rounded shadow-lg mt-1 max-h-72 flex flex-col">
              {/* Search Box */}
              <div className="p-2 border-b border-white/10 sticky top-0 bg-black z-30">
                <input
                  type="text"
                  placeholder="Search or type to add..."
                  value={ingredientSearch}
                  onChange={(e) => setIngredientSearch(e.target.value)}
                  className="w-full bg-zinc-800 text-white text-xs border border-white/10 rounded px-2 py-2 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>
              
              <div className="overflow-y-auto p-1 max-h-60">
                {displayIngredients.map((item) => (
                  <label key={item.id} className={`flex items-center space-x-2 p-2 hover:bg-white/5 rounded cursor-pointer group ${item.isCustom ? 'text-blue-400 italic' : 'text-white'}`}>
                    <input
                      type="checkbox"
                      checked={form.ingredients.includes(item.id)}
                      onChange={() => toggleSelection('ingredients', item.id)}
                      className="rounded text-blue-600 focus:ring-blue-500 bg-transparent border-white/20"
                    />
                    <span className="text-sm group-hover:text-blue-400 transition-colors">{item.label}</span>
                  </label>
                ))}

                {showAddCustom && (
                  <button
                    type="button"
                    onClick={() => {
                      toggleSelection('ingredients', ingredientSearch.toLowerCase().trim());
                      setIngredientSearch("");
                    }}
                    className="w-full text-left p-2 text-xs font-bold text-green-400 hover:bg-green-500/10 rounded border border-dashed border-green-500/30 mt-1"
                  >
                    + Add custom: "{ingredientSearch}"
                  </button>
                )}

                {displayIngredients.length === 0 && !showAddCustom && (
                  <div className="p-4 text-center text-xs text-white/40 italic">No matches found.</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium" htmlFor="dietType">
            Diet Type
          </label>
          <select
            id="dietType"
            name="dietType"
            value={form.dietType}
            onChange={handleChange}
            className="mt-1 block w-full border border-white rounded px-2 py-1 bg-black text-white"
          >
            <option value="">-- choose --</option>
            {DIET_TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div>
          {renderMultiSelect("Health Goals", "healthGoals", HEALTH_GOALS_OPTIONS)}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          {renderMultiSelect("Cuisine", "cuisine", CUISINE_OPTIONS)}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          {renderMultiSelect("Meal Timing", "mealTiming", MEAL_TIMING_OPTIONS)}
        </div>
        <div>
          {renderMultiSelect("Weather", "weather", WEATHER_OPTIONS)}
        </div>
        {/* <div>
          <label className="block text-sm font-medium" htmlFor="occasion">
            Occasion
          </label>
          <select
            id="occasion"
            name="occasion"
            value={form.occasion}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-2 py-1"
          >
            <option value="">-- choose --</option>
            {OCCASION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div> */}
      </div>

      {/* Spice Level */}
      <div>
        <label className="block text-sm font-medium" htmlFor="spiceLevel">
          Spice Level
        </label>
        <select
          id="spiceLevel"
          name="spiceLevel"
          value={form.spiceLevel}
          onChange={handleChange}
          className="mt-1 block w-full border border-white rounded px-2 py-1 bg-black text-white"
        >
          <option value="">-- choose --</option>
          {SPICE_LEVEL_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Nutrition Fields */}
      {/* <div className="border p-3 rounded bg-gray-50">
        <h3 className="text-sm font-medium mb-2">Nutrition (Per Serving)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Input
            label="Calories"
            name="calories"
            type="number"
            value={form.calories}
            onChange={handleChange}
            placeholder="e.g. 650"
          />
          <Input
            label="Protein (g)"
            name="protein"
            type="number"
            value={form.protein}
            onChange={handleChange}
            placeholder="e.g. 22"
          />
          <Input
            label="Carbs (g)"
            name="carbs"
            type="number"
            value={form.carbs}
            onChange={handleChange}
            placeholder="e.g. 60"
          />
          <Input
            label="Fat (g)"
            name="fat"
            type="number"
            value={form.fat}
            onChange={handleChange}
            placeholder="e.g. 35"
          />
        </div>
      </div> */}

      {error && <p className="text-red-600">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : (isEditing ? "Update Food" : "Add Food")}
      </Button>
    </form>
  );
}