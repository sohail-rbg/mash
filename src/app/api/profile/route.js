import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import {
  createUserIfMissing,
  syncProfileToClerk,
} from '@/lib/clerkHelpers';
import User from '@/models/Users';

export async function PUT(req) {
  try {
    const { userId } = getAuth(req, { acceptsToken: 'any' });
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, image } = await req.json();




    // const userId = session.user.id;

    // if (!userId) {
    //   return NextResponse.json({ message: "User ID not found in session" }, { status: 400 });
    // }

    // // Robust lookup: support ObjectId _id or OAuth provider id (googleId) or email
    // let existingUser = null;
    // try {
    //   if (/^[a-fA-F0-9]{24}$/.test(String(userId))) {
    //     existingUser = await User.findById(userId);
    //   }
    // } catch (err) {
    //   console.warn('findById failed on profile update, falling back', err?.message || err);
    // }
    const existingUser = await createUserIfMissing(userId);
    if (!existingUser) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      existingUser._id,
      { name, email, image },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    await syncProfileToClerk(userId, {
      name: updatedUser.name,
      image: updatedUser.image,
    }).catch((error) => {
      console.error('Failed to sync profile to Clerk:', error);
    });

    return NextResponse.json({
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        profileComplete: updatedUser.profileComplete,
        questionnaire: updatedUser.questionnaire,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ message: 'An error occurred while updating profile.' }, { status: 500 });
  }
}
