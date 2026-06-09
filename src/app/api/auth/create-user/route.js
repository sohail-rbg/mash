// import { NextResponse } from 'next/server';
// import { getAuth } from '@clerk/nextjs/server';
// import connectDB from '@/lib/db';
// import User from '@/models/Users';

// export async function POST(req) {
//   try {
//     const { userId } = getAuth(req, { acceptsToken: 'any' });
//     if (!userId) {
//       return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//     }

//     const { name, email, imageUrl } = await req.json();
//     if (!email) {
//       return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
//     }

//     await connectDB();

//     let user = await User.findOne({ clerkId: userId });
//     if (!user) {
//       user = await User.findOne({ email });
//     }

//     if (user) {
//       user.clerkId = userId;
//       user.name = name || user.name;
//       user.email = email || user.email;
//       user.image = imageUrl || user.image;
//       await user.save();
//     } else {
//       user = await User.create({
//         clerkId: userId,
//         name: name || 'Chef',
//         email,
//         image: imageUrl || '',
//         questionnaire: [],
//         profileComplete: false,
//       });
//     }

//     return NextResponse.json({ message: 'User created or updated.' }, { status: 200 });
//   } catch (error) {
//     console.error('Create user error:', error);
//     return NextResponse.json({ message: 'Unable to create user.' }, { status: 500 });
//   }
// }
