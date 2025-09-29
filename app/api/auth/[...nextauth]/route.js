import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectToDB from "@/lib/mongodb";
import User from "@/models/User";

// Exported so getServerSession(authOptions) works across the app
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      await connectToDB();
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        await User.create({
          name: user.name,
          email: user.email,
          image: user.image,
          gender: null, // User needs to select gender after first login
        });
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // On sign in, fetch user data from database
      if (user) {
        await connectToDB();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.gender = dbUser.gender;
          token.role = dbUser.role;
        }
      }
      
      // Handle session updates (like when gender is updated)
      if (trigger === "update" && session) {
        await connectToDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.gender = dbUser.gender;
          token.role = dbUser.role;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      // Pass user data from JWT to session
      session.user.id = token.id;
      session.user.gender = token.gender;
      session.user.role = token.role;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
