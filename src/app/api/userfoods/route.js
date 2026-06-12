import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/models/Users";

export async function POST(req) {
  // auth() ko await karna zaroori hai
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const { food, mealTiming, dietType } = await req.json();

    if (!food || !food.name) {
      return NextResponse.json({ message: "Food name is required" }, { status: 400 });
    }

    const currentUser = await User.findOne({ clerkId: userId });

    if (!currentUser) {
      return NextResponse.json({ message: "User not found in database" }, { status: 404 });
    }

    const newFoodEntry = {
      foodName: food.name,
      foodImage: food.image || null,
      foodCategory: food.category || null,
      dietType: dietType || null,
      mealTiming: mealTiming || null,
      savedAt: new Date(),
    };

    // User ke savedFoods array mein naya entry push karein
    currentUser.savedFoods.push(newFoodEntry);
    await currentUser.save();

    return NextResponse.json({ message: "Food saved successfully", user: currentUser }, { status: 201 });
  } catch (error) {
    console.error("Error saving user food:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}