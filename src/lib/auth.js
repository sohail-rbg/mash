import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/Users";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();

        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("No user found with this email");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Incorrect password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image || null,
          profileComplete: user.profileComplete || false,
          questionnaire: user.questionnaire || [],
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          // First-time Google sign-in: create a new user
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            googleId: user.id,
            profileComplete: false,
            questionnaire: [],
          });
        } else {
          // Existing email user: link Google account if not already linked
          if (!existingUser.googleId) {
            existingUser.googleId = user.id;
            if (!existingUser.image) existingUser.image = user.image;
            await existingUser.save();
          }
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session, account }) {
      // Initial sign-in — populate token from user object
      if (user) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.image = dbUser.image || null;
          token.profileComplete = dbUser.profileComplete || false;
          token.questionnaire = dbUser.questionnaire || [];
        }
      }

      // Session update triggered by client (e.g. after saving preferences)
      // useSession().update(newData) → trigger === "update"
      if (trigger === "update" && session) {
        if (session.questionnaire !== undefined) token.questionnaire = session.questionnaire;
        if (session.name !== undefined) token.name = session.name;
        if (session.email !== undefined) token.email = session.email;
        if (session.image !== undefined) token.image = session.image;
        if (session.profileComplete !== undefined) token.profileComplete = session.profileComplete;
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.image || null;
      session.user.profileComplete = token.profileComplete || false;
      session.user.questionnaire = token.questionnaire || [];
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};