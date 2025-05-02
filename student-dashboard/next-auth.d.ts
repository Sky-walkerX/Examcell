import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  // Extend the Session type to include custom properties
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"]; // Include default user properties (name, email, image)
    accessToken: string; // Define accessToken as a required string (remove optional ? if always present)
  }

  // Extend the User type (returned by authorize, passed to jwt callback on sign-in)
  interface User extends DefaultUser {
    role: string;
    accessToken: string; // Match the type used in AuthorizeUser
  }
}

declare module "next-auth/jwt" {
  // Extend the JWT type (used in jwt and session callbacks)
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    accessToken: string; // Match the type used in the token
  }
}