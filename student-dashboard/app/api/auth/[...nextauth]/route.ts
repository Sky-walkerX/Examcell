import NextAuth, { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Define a type for the user object returned by your Spring Boot API login
interface BackendUser {
  token: string;
  id: string;
  name: string;
  email: string;
  role: string;
}

// Define the shape of the User object expected by NextAuth's authorize return
interface AuthorizeUser extends NextAuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  accessToken: string; // Store the JWT from Spring Boot
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials): Promise<AuthorizeUser | null> {
        if (!credentials?.email || !credentials?.password || !credentials?.role) {
          console.error("NextAuth Authorize: Missing credentials");
          throw new Error("Email, password, and role are required.");
        }

        const backendLoginUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api") + "/auth/login";
        console.log(`NextAuth Authorize: Attempting login via backend: ${backendLoginUrl} for role: ${credentials.role}`);

        try {
          const res = await fetch(backendLoginUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              role: credentials.role,
            }),
          });

          if (!res.ok) {
            let errorMsg = `Login failed. Status: ${res.status}`;
            try {
              const errorBody = await res.json();
              errorMsg = errorBody.message || errorMsg;
            } catch (e) {
              console.warn("Could not parse error response body as JSON.");
              try {
                const textError = await res.text();
                if (textError) errorMsg += ` - ${textError}`;
              } catch (textErr) {
                // Ignore if reading text also fails
              }
            }
            console.error("NextAuth Authorize: Backend login failed:", errorMsg);
            throw new Error(errorMsg);
          }

          const backendUser: BackendUser = await res.json();
          console.log("NextAuth Authorize: Backend login successful for:", backendUser.email);

          if (backendUser && backendUser.token && backendUser.id) {
            return {
              id: backendUser.id,
              email: backendUser.email,
              name: backendUser.name,
              role: backendUser.role,
              accessToken: backendUser.token,
            };
          } else {
            console.error("NextAuth Authorize: Backend login response was successful but missing required data (token/id).");
            throw new Error("Invalid response received from authentication server.");
          }
        } catch (error: any) {
          console.error("NextAuth Authorize: Error during authorization process:", error);
          throw new Error(error.message || "Authentication failed due to an unexpected server error.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authorizeUser = user as AuthorizeUser;
        token.id = authorizeUser.id;
        token.email = authorizeUser.email;
        token.name = authorizeUser.name;
        token.role = authorizeUser.role;
        token.accessToken = authorizeUser.accessToken;
        console.log("JWT Callback: Token populated on sign-in for", token.email);
      }
      return token; // TypeScript will infer this as the extended JWT type
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };