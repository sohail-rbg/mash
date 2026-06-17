import Image from 'next/image';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import FoodModel from '@/models/Food';

export const dynamic = 'force-dynamic';

export default async function ShareFoodPage({ params }) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect(`/sign-in?redirect=${encodeURIComponent(`/share/${id}`)}`);
  }

  await connectDB();

  const food = await FoodModel.findById(id);

  if (!food) {
    return (
      <main className="min-h-screen bg-[#111827] px-4 py-12 text-white">
        <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
          <h1 className="text-2xl font-bold">Food not found</h1>
        </div>
      </main>
    );
  }

  const foodName = food.name || 'Delicious Food';
  const foodDescription = food.description || 'A tasty food card shared from Mash';
  const foodImage =
    food.image ||
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800';

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fb923c_0%,#111827_58%)] px-4 py-12 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl">
        <div className="overflow-hidden rounded-[28px] bg-black/10">
          <div className="relative aspect-[4/5] w-full overflow-hidden">
            <Image
              src={foodImage}
              alt={foodName}
              fill
              sizes="(max-width: 768px) 100vw, 420px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="mb-2 inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-orange-200 backdrop-blur-md">
                Shared from Mash
              </p>
              <h1 className="text-3xl font-black leading-tight text-white">{foodName}</h1>
              <p className="mt-2 text-sm text-white/80">{foodDescription}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
