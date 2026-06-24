import { clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import User from '@/models/Users';

const PREFERENCE_KEYS = [
  'dietType',
  'allergies',
  'healthGoals',
  'cuisine',
  'preferenceSkipped',
];

function normalizePreferenceAnswer(item) {
  if (!item || typeof item !== 'object') return null;
  const { questionId, answer } = item;
  if (!questionId) return null;
  if (!Array.isArray(answer) || answer.length === 0) {
    return null;
  }

  if (questionId === 'preferenceSkipped') {
    return answer.some((value) => String(value).toLowerCase() === 'true');
  }

  return answer.length === 1 ? answer[0] : answer;
}

export function buildPreferenceMetadata(answers = []) {
  const metadata = {};
  PREFERENCE_KEYS.forEach((key) => {
    metadata[key] = null;
  });

  answers.forEach((item) => {
    if (!item || !item.questionId) return;
    metadata[item.questionId] = normalizePreferenceAnswer(item);
  });

  return metadata;
}

export function buildQuestionnaireWithNulls(answers = []) {
  const answerMap = new Map();
  answers.forEach((item) => {
    if (!item || !item.questionId) return;
    answerMap.set(item.questionId, normalizePreferenceAnswer(item));
  });

  const questionIds = new Set([...PREFERENCE_KEYS, ...answerMap.keys()]);
  return [...questionIds].map((questionId) => ({
    questionId,
    answer: answerMap.has(questionId) ? answerMap.get(questionId) : null,
  }));
}

export async function createUserIfMissing(userId) {
  await connectDB();
  let user = await User.findOne({ clerkId: userId }).select('-password');
  if (user) return user;

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  if (!clerkUser) return null;

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ||
    clerkUser.emailAddresses?.[0]?.emailAddress ||
    '';

  if (email) {
    user = await User.findOne({ email }).select('-password');
  }

  if (user) {
    if (!user.clerkId) user.clerkId = userId;
    user.name = clerkUser.fullName || clerkUser.firstName || user.name || 'Chef';
    user.image = clerkUser.imageUrl || user.image || '';
    await user.save();
    return user;
  }

  user = await User.create({
    clerkId: userId,
    name: clerkUser.fullName || clerkUser.firstName || 'Chef',
    email,
    image: clerkUser.imageUrl || '',
    questionnaire: [],
    profileComplete: false,
  });

  return user;
}

async function mergePublicMetadata(userId, partialMetadata) {
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  if (!clerkUser) return null;

  const current = clerkUser.publicMetadata || {};
  return client.users.updateUser(userId, {
    publicMetadata: {
      ...current,
      ...partialMetadata,
    },
  });
}

export async function syncPreferencesToClerk(userId, answers = []) {
  const preferences = buildPreferenceMetadata(answers);
  return mergePublicMetadata(userId, { preferences });
}

export async function syncProfileToClerk(userId, profileData = {}) {
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  if (!clerkUser) return null;

  const current = clerkUser.publicMetadata || {};
  const existingProfile = current.profile || {};

  return client.users.updateUser(userId, {
    publicMetadata: {
      ...current,
      profile: {
        ...existingProfile,
        ...profileData,
      },
    },
  });
}
