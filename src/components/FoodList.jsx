"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FoodList({ initialFoods, isFiltered }) {
  const router = useRouter();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suggestedFood, setSuggestedFood] = useState(null);
  const [rejectedFoodIds, setRejectedFoodIds] = useState(new Set());
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    async function fetchFoods() {
      try {
        setLoading(true);
        const res = await fetch('/api/foods?fullImage=true'); // Request images for the list view specifically
        if (!res.ok) {
          throw new Error('Failed to fetch foods');
        }
        const data = await res.json();
        setFoods(data);
        console.log("Total Foods:", data.length);
        console.log("All Foods Data:", data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  

    if (initialFoods !== undefined) {
      // If parent provides data (even an empty array []), use it and stop loading.
      setFoods(initialFoods);
      setLoading(false);
    } else {
      // If parent does not provide data, fetch it.
      fetchFoods();
    }
  }, [initialFoods]);

  // Effect: Select a random food when the list updates
  useEffect(() => {
    if (foods.length > 0) {
      const randomIndex = Math.floor(Math.random() * foods.length);
      setSuggestedFood(foods[randomIndex]);
    } else {
      setSuggestedFood(null);
    }
     console.log("Updated Foods State:", foods);
    console.log("Total Foods:", foods.length);
    
  }, [foods]); // Only run when the core foods list changes

  const handleNextSuggestion = () => {
    if (isConfirmed || foods.length <= 1) return;

    // Add current suggestion to the rejected list
    const newRejectedIds = new Set(rejectedFoodIds);
    if (suggestedFood) {
      newRejectedIds.add(suggestedFood._id);
    }

    // Find available foods that haven't been rejected
    let availableFoods = foods.filter(food => !newRejectedIds.has(food._id));

    // If all foods have been rejected, reset the cycle
    if (availableFoods.length === 0) {
      const resetRejected = new Set();
      setRejectedFoodIds(resetRejected);
      // Pick any food except the current one
      availableFoods = foods.filter(f => f._id !== suggestedFood?._id);
      if (availableFoods.length === 0) availableFoods = foods; // Handle case with only 1 food
    }

    // Pick a new random food from the available ones
    const randomIndex = Math.floor(Math.random() * availableFoods.length);
    const newSuggestion = availableFoods[randomIndex];

    setSuggestedFood(newSuggestion);
    setRejectedFoodIds(newRejectedIds);
  };

  const handleConfirm = () => {
    if (suggestedFood) {
      setIsConfirmed(true); // This state is used to disable buttons and change styling
      alert(`You have confirmed: ${suggestedFood.name}!`);
    }
  };

  if (loading) return <p className="text-center">Loading food items...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  // VIEW 1: GRID VIEW (Jab koi filter nahi hai - All Foods)
  if (!isFiltered) {
    console.log("foods in grid view: ", foods);
    return (
      <div className="container mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">All Food Menu</h2> {/* Responsive font size */}
        {foods.length === 0 ? (
          <p className="text-center">No food items found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foods.map((food) => (
              <div key={food._id} className="glass-card p-5 transition-all duration-300 flex flex-col group hover:translate-y-[-5px]">
                <div className="relative overflow-hidden rounded-2xl">
                  <img src={food.image} alt={food.name} className="w-full h-48 object-cover rounded-md mb-4" />
                  {food.category && (
                    <span className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs sm:text-sm font-semibold px-2 py-1 rounded-full capitalize"> {/* Responsive font size */}
                      {food.category}
                    </span>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-green-400 transition-colors">{food.name}</h3>
                  </div>
                  {food.description && <p className="text-white/50 text-xs line-clamp-2 mb-4 font-dm leading-relaxed">{food.description}</p>}
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {food.cuisine?.map((c) => <span key={c} className="bg-white/5 border border-white/10 text-white/60 text-[9px] px-2 py-1 rounded-lg capitalize"> {c}</span>)}
                    {food.dietType?.map((d) => <span key={d} className="bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] px-2 py-1 rounded-lg capitalize"> {d}</span>)}
                    {food.healthGoals?.map((h) => (
                      <button
                        key={h}
                        onClick={() => router.push(`/all-foods?healthGoals=${encodeURIComponent(h)}`)}
                        className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[9px] px-2 py-1 rounded-lg capitalize hover:brightness-110"
                        title={`Filter all foods by ${h}`}
                      >
                        {h}
                      </button>
                    ))}
                    {food.mood?.map((m) => <span key={m} className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] px-2 py-1 rounded-lg capitalize"> {m}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // VIEW 2: SPLIT VIEW (Jab filter laga ho - Recommendation Mode)
  return (
    <div className="container mx-auto px-4 sm:px-0"> {/* Added responsive padding */}
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Recommended For You</h2> {/* Responsive font size */}
      
      {foods.length === 0 ? (
        <p className="text-center">No food available matching your preferences.</p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Food List */}
          <div className="w-full lg:w-1/2 h-[calc(100vh-200px)] lg:h-[800px] overflow-y-auto pr-2 space-y-3 custom-scrollbar"> {/* Responsive height */}
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md text-white py-2 z-10">Available Options ({foods.length})</h3> {/* Responsive font size */}
            {foods.map((food) => (
              <div 
                key={food._id} 
                onClick={() => !isConfirmed && setSuggestedFood(food)}
                className={`flex gap-4 border p-3 rounded-xl transition-all duration-300 
                  ${isConfirmed ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] hover:bg-white/5'}
                  ${suggestedFood?._id === food._id 
                    ? (isConfirmed ? 'border-green-500 bg-green-500/20 border-2' : 'border-green-400 bg-green-400/10') 
                    : (rejectedFoodIds.has(food._id) ? 'border-red-900/50 bg-red-900/10 hover:bg-red-900/20' : 'border-white/10 bg-white/5')}
                  ${isConfirmed && suggestedFood?._id !== food._id ? 'opacity-30' : ''}
                `}
              >
                <img src={food.image} alt={food.name} className="w-24 h-24 object-cover rounded-md flex-shrink-0" />
                <div className="flex-grow">
                  <div className="flex justify-between items-start text-base sm:text-lg"> {/* Responsive font size */}
                    <h4 className="font-bold">{food.name}</h4>
                  </div>
                  <p className="text-white/60 text-xs sm:text-sm line-clamp-2 mt-1">{food.description}</p> {/* Responsive font size */}
                  <div className="flex flex-wrap gap-1 mt-2">
                     {food.dietType?.map(d => <span key={d} className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full capitalize">{d}</span>)}
                     {food.cuisine?.map(c => <span key={c} className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full capitalize">{c}</span>)}
                     {food.mealTiming?.map(t => <span key={t} className="text-[10px] bg-white/10 text-white/60 border border-white/10 px-2 py-0.5 rounded-full capitalize">{t}</span>)}
                     {food.foodType?.map(ft => <span key={ft} className="text-[10px] bg-teal-500/20 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full capitalize">{ft}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Random Suggestion Card */}
          <div className="w-full lg:w-1/2">
            <div className="sticky top-8">
               <h3 className="text-xl font-semibold mb-4">Suggestion For You</h3>
               {suggestedFood && (
                 <div className="border border-white/10 rounded-2xl p-6 shadow-2xl bg-zinc-900/50 backdrop-blur-xl text-white">
                    <div className="relative">
                        <img src={suggestedFood.image} alt={suggestedFood.name} className="w-full h-64 object-cover rounded-lg mb-4" />
                        {suggestedFood.category && (
                            <span className="absolute top-4 right-4 bg-black bg-opacity-70 text-white text-sm font-semibold px-3 py-1 rounded-full capitalize">
                                {suggestedFood.category}
                            </span>
                        )}
                    </div>
                    
                    <h2 className="text-3xl font-bold mb-2">{suggestedFood.name}</h2>
                    <p className="text-white/70 mb-4 font-light leading-relaxed">{suggestedFood.description}</p>

                    <div className="space-y-4 mb-6 text-sm">
                        <div>
                            <span className="font-semibold block text-white/40 uppercase text-[10px] tracking-widest">Cuisine</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {suggestedFood.cuisine?.map(c => <span key={c} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded capitalize">{c}</span>)}
                            </div>
                        </div>
                        
                        <div>
                            <span className="font-semibold block text-white/40 uppercase text-[10px] tracking-widest">Diet Type</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {suggestedFood.dietType?.map(d => <span key={d} className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded capitalize">{d}</span>)}
                            </div>
                        </div>

                        <div>
                            <span className="font-semibold block text-white/40 uppercase text-[10px] tracking-widest">Mood</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {suggestedFood.mood?.map(m => <span key={m} className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded capitalize">{m}</span>)}
                            </div>
                        </div>

                        <div>
                            <span className="font-semibold block text-white/40 uppercase text-[10px] tracking-widest">Health Goals</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {suggestedFood.healthGoals?.map(h => (
                                  <button
                                    key={h}
                                    onClick={() => router.push(`/all-foods?healthGoals=${encodeURIComponent(h)}`)}
                                    className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded capitalize hover:brightness-110"
                                    title={`Filter all foods by ${h}`}
                                  >
                                    {h}
                                  </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <span className="font-semibold block text-white/40 uppercase text-[10px] tracking-widest">Food Style</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {suggestedFood.foodStyle?.map(fs => <span key={fs} className="bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2 py-1 rounded capitalize">{fs}</span>)}
                            </div>
                        </div>

                        <div>
                            <span className="font-semibold block text-white/40 uppercase text-[10px] tracking-widest">Weather</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {suggestedFood.weather?.map(w => <span key={w} className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded capitalize">{w}</span>)}
                            </div>
                        </div>
                        <div>
                            <span className="font-semibold block text-white/40 uppercase text-[10px] tracking-widest">Food Type</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {suggestedFood.foodType?.map(ft => <span key={ft} className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-1 rounded capitalize"> {ft}</span>)}
                            </div>
                        </div>

                        {suggestedFood.ingredients && suggestedFood.ingredients.length > 0 && (
                            <div>
                                <span className="font-semibold block text-white/40 uppercase text-[10px] tracking-widest">Ingredients</span>
                                <p className="mt-1 text-white/80 capitalize">{suggestedFood.ingredients.join(', ')}</p>
                            </div>
                        )}

                        {suggestedFood.nutrition && (
                            <div>
                                <span className="font-semibold block text-white/40 uppercase text-[10px] tracking-widest">Nutrition (per serving)</span>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-white/60">
                                    <span>Calories: {suggestedFood.nutrition.calories || 'N/A'}</span>
                                    <span>Protein: {suggestedFood.nutrition.protein || 'N/A'}g</span>
                                    <span>Carbs: {suggestedFood.nutrition.carbs || 'N/A'}g</span>
                                    <span>Fat: {suggestedFood.nutrition.fat || 'N/A'}g</span>
                                </div>
                            </div>
                        )}

                        {/* <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-semibold block text-gray-700">Meal Timing</span>
                                <div className="mt-1 text-gray-600 capitalize">{suggestedFood.mealTiming?.join(', ')}</div>
                            </div>
                        </div> */}
                    </div>

                    <div className="flex gap-4 mt-6">
                        <button 
                            onClick={handleConfirm}
                            disabled={isConfirmed}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isConfirmed ? 'Confirmed!' : 'Confirm Selection'}
                        </button>
                        <button 
                            onClick={handleNextSuggestion}
                            disabled={isConfirmed || foods.length <= 1}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors border border-gray-300 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            No, Change Food
                        </button>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}