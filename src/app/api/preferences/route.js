import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/Users';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req) {
  try {
    await connectDB();
    const { userId, answers } = await req.json();

    if (!userId || !answers) {
      return NextResponse.json({ message: "Missing userId or answers." }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== userId) {
      return NextResponse.json({ message: "Unauthorized to update these preferences." }, { status: 403 });
    }

    // session.user.id may be a MongoDB ObjectId string OR an OAuth provider id
    // Try to lookup by ObjectId first, then fall back to provider id or email
    let user = null;
    try {
      // Only attempt findById when id looks like a 24-char hex ObjectId
      if (session?.user?.id && /^[a-fA-F0-9]{24}$/.test(String(session.user.id))) {
        user = await User.findById(session.user.id);
      }
    } catch (err) {
      // ignore cast errors and continue to fallback lookups
      console.warn('findById failed, falling back to other lookups', err?.message || err);
    }

    if (!user) {
      // Try googleId (OAuth) or fallback to email-based lookup
      const lookupId = String(session?.user?.id || "");
      user = await User.findOne({ $or: [{ googleId: lookupId }, { email: session?.user?.email }] });
    }

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Save full questionnaire array
    user.questionnaire = answers;
    user.markModified('questionnaire');
    user.profileComplete = true;

    await user.save();

    return NextResponse.json({
      message: "Preferences Saved Successfully ✅",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image || null,
        profileComplete: user.profileComplete,
        questionnaire: user.questionnaire,
      },
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "An error occurred while saving preferences." }, { status: 500 });
  }
}