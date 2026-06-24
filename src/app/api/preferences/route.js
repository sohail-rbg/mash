import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import {
  buildQuestionnaireWithNulls,
  createUserIfMissing,
  syncPreferencesToClerk,
} from '@/lib/clerkdata';
import User from '@/models/Users';

export async function POST(req) {
  try {
    const { userId } = getAuth(req, { acceptsToken: 'any' });
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { answers } = await req.json();
    if (!answers) {
      return NextResponse.json({ message: "Missing answers." }, { status: 400 });
    }

    let user = await createUserIfMissing(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    user.questionnaire = buildQuestionnaireWithNulls(answers);
    user.markModified('questionnaire');
    user.profileComplete = true;

    await user.save();

    await syncPreferencesToClerk(userId, answers).catch((error) => {
      console.error('Failed to sync preferences to Clerk:', error);
    });

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