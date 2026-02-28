import "server-only";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { logActivity } from "./activity-tracker";


export function getAuthOptions(): NextAuthOptions {
  return {
    secret: process.env.NEXTAUTH_SECRET,
    adapter: PrismaAdapter(prisma),
    providers: [
      CredentialsProvider({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email.toLowerCase().trim(),
            },
          });

          if (!user || !user.password) {
            console.log("User not found or no password");
            return null;
          }

          if (!user.isActive || user.deletedAt) {
            console.log("Account is deactivated. Email:", user.email);
            throw new Error("ACCOUNT_DEACTIVATED");
          }

          if (user.isSuspended) {
            if (user.suspendedUntil && new Date() < user.suspendedUntil) {
              console.log("Account is suspended until:", user.suspendedUntil);
              throw new Error("ACCOUNT_SUSPENDED");
            } else if (user.suspendedUntil && new Date() >= user.suspendedUntil) {
              await prisma.user.update({
                where: { id: user.id },
                data: { isSuspended: false, suspendedUntil: null },
              });
            }
          }

          if (user.isPermanentlyBanned) {
            console.log("Account is permanently banned:", user.email);
            throw new Error("ACCOUNT_BANNED");
          }

          if (!user.emailVerified) {
            console.log("Email not verified:", user.email);
            throw new Error("EMAIL_NOT_VERIFIED");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log("Invalid password");
            return null;
          }

          console.log("Login successful for:", user.email);

          await prisma.user.update({
            where: { id: user.id },
            data: { lastActive: new Date() },
          });

          await logActivity({
            userId: user.id,
            activityType: "login",
            metadata: {
              method: "credentials",
              email: user.email,
            },
          }).catch((err) => console.error("Failed to log login activity:", err));

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName,
            image: user.profileImage,
            isAdmin: user.isAdmin,
            role: user.role,
          } as any;
        },
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      }),
    ],
    session: {
      strategy: "jwt",
    },
    pages: {
      signIn: "/auth/signin",
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.firstName = (user as any).firstName;
          token.lastName = (user as any).lastName;
          token.isAdmin = (user as any).isAdmin;
          token.role = (user as any).role;
          token.image = user.image;
        }
        return token;
      },
      async session({ session, token }) {
        if (token) {
          session.user.id = token.id as string;
          session.user.firstName = token.firstName as string;
          session.user.lastName = token.lastName as string;
          session.user.isAdmin = token.isAdmin as boolean;
          session.user.role = token.role as string;
          session.user.image = token.image as string;
        }
        return session;
      },
      async signIn({ user, account, profile }) {
        if (account?.provider === "google") {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (existingUser) {
            if (!existingUser.isActive || existingUser.deletedAt) {
              throw new Error("ACCOUNT_DEACTIVATED");
            }

            if (existingUser.isSuspended) {
              if (existingUser.suspendedUntil && new Date() < existingUser.suspendedUntil) {
                throw new Error("ACCOUNT_SUSPENDED");
              } else if (existingUser.suspendedUntil && new Date() >= existingUser.suspendedUntil) {
                await prisma.user.update({
                  where: { id: existingUser.id },
                  data: { isSuspended: false, suspendedUntil: null },
                });
              }
            }

            if (existingUser.isPermanentlyBanned) {
              throw new Error("ACCOUNT_BANNED");
            }

            await prisma.user.update({
              where: { id: existingUser.id },
              data: { lastActive: new Date() },
            });

            await logActivity({
              userId: existingUser.id,
              activityType: "login",
              metadata: {
                method: "google",
                email: existingUser.email,
              },
            }).catch((err) => console.error("Failed to log login activity:", err));

          } else {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                firstName: (profile as any)?.given_name || user.name?.split(" ")[0],
                lastName: (profile as any)?.family_name || user.name?.split(" ")[1],
                profileImage: user.image,
                emailVerified: new Date(),
                isActive: true,
                civilityScore: 5.0,
              },
            });
          }
        }
        return true;
      },
    },
  };
}

export const authOptions = getAuthOptions();
