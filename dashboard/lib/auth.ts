import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Demo users for credentials provider (in production, use a database)
const demoUsers = [
  {
    id: "1",
    email: "admin@dashboard.local",
    name: "Admin User",
    // Password: "admin123" (hashed with bcrypt)
    password: "$2b$10$oC5gWoTLJMbIh1J1iNO/o.0oEX.6QpK6n6zLjUIGC/JPLD8tnD.Bu",
  },
  {
    id: "2",
    email: "demo@dashboard.local",
    name: "Demo User",
    // Password: "demo123" (hashed with bcrypt)
    password: "$2b$10$q9ZToDrr0VD6pSPZ2vcpfuGlqa5sQr.jVxsy0MyGKfGsm8f3Wkx3a",
  },
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // GitHub OAuth Provider (primary)
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    // Credentials Provider (backup)
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "admin@dashboard.local",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Find user by email
        const user = demoUsers.find((u) => u.email === email);

        if (!user) {
          return null;
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAuthPage = nextUrl.pathname.startsWith("/auth/");

      if (isOnAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true; // Allow access to auth pages
      }

      if (!isLoggedIn) {
        return false; // Redirect to sign-in
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
