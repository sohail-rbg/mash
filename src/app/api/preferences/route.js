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

    const user = await User.findById(session.user.id);
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