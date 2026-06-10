import { redirect } from "next/navigation";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/auth";
import { getAutoMealTiming, getAutoWeatherCondition } from "@/lib/utils";
import FoodSpin from "@/components/FoodSpin";
import LogoutButton from "@/components/LogoutButton";
import { cookies } from "next/headers";
import RefreshButton from "@/components/RefreshButton";
import PreferenceReminder from "@/components/PreferenceReminder";
import Link from "next/link";
import Image from "next/image";

import { auth as clerkAuth } from "@clerk/nextjs/server";
import { createUserIfMissing } from "@/lib/clerkHelpers";
import User from "@/models/Users";
import connectDB from "@/lib/db";

async function getFoods(queryString = "") {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const url = new URL("/api/foods", baseUrl);
    if (queryString) url.search = queryString;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased timeout to 30s to prevent AbortError

    const res = await fetch(url.toString(), { cache: "no-store", signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      console.error(`API ERROR: ${res.status} ${res.statusText}`);
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error("FETCH ERROR:", error);
    return [];
  }
}

export default async function Home() {
  // const session = await getServerSession(authOptions);
  // const user = session?.user;
  const { userId } = await clerkAuth();

  await connectDB();

  let user = null;

  // If authenticated, get user data
  if (userId) {
    user = await User.findOne({ clerkId: userId });

    if (!user) {
      try {
        user = await createUserIfMissing(userId);
      } catch (error) {
        console.error("Unable to create DB user for Clerk user:", error);
      }
    }
  }

  const userQuestionnaire = user?.questionnaire || [];
  const hasPreferenceData = userQuestionnaire.some(
    (pref) => pref.questionId !== 'preferenceSkipped' && Array.isArray(pref.answer) && pref.answer.length > 0,
  );

  // Show a reminder only if the user is logged in AND has no questionnaire data at all.
  // If they have any questionnaire data (even 'preferenceSkipped'), we assume they've
  // been through the onboarding once and should not be redirected or shown a reminder.
  const needsReminder = !!userId && userQuestionnaire.length === 0;

  const cookieStore = await cookies();
  const tempFilters = cookieStore.get("temp_filters");

  const userAllergies = (user?.questionnaire || [])
    .find((item) => item.questionId === "allergies")
    ?.answer || [];

  const defaultParams = new URLSearchParams();
  const FIELD_MAP = {
    healthSuggestions: "healthGoals",
    allergies: "restrictedIngredients",
    weightGoal: "healthGoals",
  };

  if (user?.questionnaire) {
    user.questionnaire.forEach((pref) => {
      if (pref.questionId === "preferenceSkipped") return;

      const apiField = FIELD_MAP[pref.questionId] || pref.questionId;
      const values = pref.answer;
      const firstValue = Array.isArray(values) && typeof values[0] === "string"
        ? values[0].toLowerCase().trim()
        : "";

      if (!values || values.length === 0 || firstValue === "") return;

      if (
        (apiField === "restrictedIngredients" &&
          ["no allergies", "no-allergies", "no"].includes(firstValue)) ||
        (apiField === "healthGoals" &&
          pref.questionId === "healthSuggestions" &&
          firstValue === "no")
      )
        return;

      let formattedValues = values
        .filter((v) => typeof v === "string")
        .map((v) => v.toLowerCase().replace(/\s+/g, "-"));

      if (apiField === "dietType") {
        formattedValues = formattedValues.map((v) =>
          v === "vegetarian"
            ? "veg"
            : v === "non-vegetarian"
            ? "non-veg"
            : v
        );
      }

      if (apiField === "foodType") return;

      defaultParams.append(apiField, formattedValues.join(","));
    });
  }

  if (!defaultParams.has("mealTiming"))
    defaultParams.set("mealTiming", getAutoMealTiming());

  if (!defaultParams.has("weather"))
    defaultParams.set("weather", getAutoWeatherCondition());

  // Do NOT request images here. It causes the 60s timeout crash.
  // FoodSpin and FoodList will fetch images separately on the client side.

  const defaultQueryString = defaultParams.toString();
  let queryString = defaultQueryString;

  if (tempFilters) {
    const tempParams = new URLSearchParams(tempFilters.value);
    
    // Remove restrictedIngredients filter if user has no allergies 
    // or if the value is explicitly "no-allergies"
    const hasNoAllergies = !Array.isArray(userAllergies) || userAllergies.length === 0;
    if (hasNoAllergies) tempParams.delete("restrictedIngredients");

    queryString = tempParams.toString();
  }

  const foodData = await getFoods(queryString);
  // Fix: Handle both { foods: [...] } and raw [...] responses
  const foods = Array.isArray(foodData) ? foodData : (foodData?.foods || []);

  const finalParams = new URLSearchParams(queryString);
  const mealTimingForComponent =
    finalParams.get("mealTiming")?.split(",")[0] || "Lunch";
  const baseParams = defaultQueryString;

  return (
    <div className="h-screen w-screen overflow-hidden relative transition-colors duration-500"
      style={{ background: "#000" }}
    >
      {/* ── Background image — desktop only (hidden on mobile) ── */}
      <div className="absolute inset-0 z-0 hidden md:block">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/assets/bg-img.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "grayscale(15%) brightness(0.55) saturate(1.1)",
          }}
        />
        {/* Frosted glass overlay — makes the bg feel filtered/blurred */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.6) 100%)",
          backdropFilter: "blur(1px)",
        }} />
      </div>

      {/* ── LAYER 4: Header ── */}
      <header className="absolute top-0 left-0 w-full flex items-center justify-between px-4 pt-3 pb-2 z-20 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)",
        }}
      >

      <div className="flex items-center gap-2 pointer-events-auto">
          <Link href="/" className=" flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
          <Image src="/assets/logo.png" alt="Logo" width={100} height={100} className="rounded-xl" />
        </Link>
        </div>
        {/* Right Side: Login Button or Profile */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <RefreshButton />
          {/* <ThemeToggle /> */}
          {userId ? (
            <>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/sign-in"
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300"
            >
              Login
            </Link>
          )}
        </div>
      </header>

      <PreferenceReminder visible={needsReminder} />

      {/* ── FoodSpin ── */}
      <div className="absolute inset-0 z-10 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center py-0 px-2">
          <div className="pointer-events-auto w-full flex justify-center">
            <FoodSpin
              initialFoods={foods}
              isFiltered={queryString.length > 0}
              mealTiming={mealTimingForComponent}
              baseParams={baseParams}
              activeQueryString={queryString}
              isGuest={!userId}
            />
          </div>
        </div>
      </div>

    </div>
  );
}