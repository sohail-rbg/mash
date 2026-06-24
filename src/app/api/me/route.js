import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createUserIfMissing } from '@/lib/clerkdata';
// import User from '@/models/Users';

export async function GET(req) {
  try {
    const { userId } = getAuth(req, { acceptsToken: 'any' });
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await createUserIfMissing(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image || null,
      profileComplete: user.profileComplete,
      questionnaire: user.questionnaire || [],
    });
  } catch (error) {
    console.error('Fetch current user error:', error);
    return NextResponse.json({ message: 'Unable to load user.' }, { status: 500 });
  }
}
