'use server';
import Header from "@/components/Header";
import FoodManagerClient from "./FoodManagerClient";



async function getAllFoods(page = 1, queryParams = {}) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
      fullImage: "true",
      ...queryParams,
    });
    const fetchUrl = `${baseUrl.replace(/\/$/, "")}/api/foods?${params.toString()}`;
    const res = await fetch(fetchUrl, { cache: "no-store" });
    if (!res.ok) return { foods: [], totalPages: 0, totalCount: 0 };
    return await res.json();
  } catch (error) {
    console.error("Error fetching all foods:", error);
    return { foods: [], totalPages: 0, totalCount: 0 };
  }
}

export default async function AllFoodsPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page) || 1;
  
  // Pass query params to API
  const queryParams = {};
  if (resolvedParams.cuisine) queryParams.cuisine = resolvedParams.cuisine;
  if (resolvedParams.healthGoals) queryParams.healthGoals = resolvedParams.healthGoals;
  if (resolvedParams.mealTiming) queryParams.mealTiming = resolvedParams.mealTiming;
  if (resolvedParams.dietType) queryParams.dietType = resolvedParams.dietType;
  if (resolvedParams.foodType) queryParams.foodType = resolvedParams.foodType;
  
  const { foods, totalPages, totalCount } = await getAllFoods(page, queryParams);

  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ background: "#000" }}
    >
      {/* ── Ambient glow blobs ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div style={{
          position: "absolute", top: "-20%", left: "10%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)",
          filter: "blur(80px)",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", right: "5%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)",
          filter: "blur(80px)",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 800, height: 400, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%)",
          filter: "blur(60px)",
        }} />
      </div>

      <div className="relative z-10">
        <Header />

        <div className="container mx-auto px-4 sm:px-6 py-10">
          {/* ── Page heading ── */}
          <div className="mb-10 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-green-400 mb-2">
              Admin Panel
            </p>
            <h1 className="font-syne text-5xl md:text-7xl font-black text-white mb-3 tracking-tighter">
              Full <span style={{
                background: "linear-gradient(90deg,#22c55e,#86efac,#22c55e)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>Menu</span>
            </h1>
            <p className="text-white/40 max-w-xl mx-auto text-sm">
              Manage, filter and edit every food item in the database.
            </p>
          </div>

          {/* ── Liquid glass container ── */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(48px) saturate(180%)",
            WebkitBackdropFilter: "blur(48px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 32,
            boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(255,255,255,0.04)",
            padding: "28px 20px",
          }}>
            <FoodManagerClient
              initialFoods={foods}
              totalPages={totalPages}
              currentPage={page}
              totalCount={totalCount}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
