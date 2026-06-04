import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/Users";

function getBaseUrl(req) {
  if (!req) return process.env.NEXTAUTH_URL || "http://localhost:3000";
  const proto = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          await connectDB();
          const user = await User.findOne({ email });
          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (!passwordsMatch) return null;

          return user;
        } catch (error) {
          console.log("Error: ", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture || token.image;
        session.user.profileComplete = token.profileComplete;
        session.user.questionnaire = token.questionnaire;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        if (session.user) {
          token.name = session.user.name || token.name;
          token.email = session.user.email || token.email;
          token.picture = session.user.image || token.picture;
          token.profileComplete = session.user.profileComplete !== undefined
            ? session.user.profileComplete
            : token.profileComplete;
          token.questionnaire = session.user.questionnaire || token.questionnaire;
        }
        return token;
      }

      if (user) {
        await connectDB();
        const dbUser = await User.findOne({
          $or: [
            { googleId: user.id },
            { googleId: token?.sub },
            { email: user.email },
          ],
        }).select("-password");

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.picture = dbUser.image || user.image;
          token.profileComplete = dbUser.profileComplete;
          token.questionnaire = dbUser.questionnaire;
        }
      }
      return token;
    },
    async signIn({ user, account }) {
      if (account.provider === "google") {
        const { name, email, id, image } = user;
        try {
          await connectDB();
          let userExists = await User.findOne({ googleId: id });
          if (userExists) return true;

          userExists = await User.findOne({ email });
          if (userExists) {
            userExists.googleId = id;
            if (!userExists.image) userExists.image = image;
            await userExists.save();
          } else {
            await User.create({ name, email, googleId: id, image });
          }
          return true;
        } catch (error) {
          console.log("Error saving user from Google OAuth: ", error);
          return false;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl, req }) {
      const dynamicBaseUrl = getBaseUrl(req);
      if (url) {
        return url.startsWith("/") ? `${dynamicBaseUrl}${url}` : url;
      }
      return dynamicBaseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
  },
};
