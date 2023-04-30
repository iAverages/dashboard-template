import { type GetServerSidePropsContext } from "next";
import { getServerSession, type NextAuthOptions, type DefaultSession } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { Role } from "@prisma/client";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            globalRole: Role;
        } & DefaultSession["user"];
    }

    interface User {
        role: Role;
    }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
    events: {
        createUser: async ({ user }) => {
            if (!user.email) {
                throw new Error("User email is missing");
            }

            // Check if the user being created was invited to a tenant.
            const invited = await prisma.membership.findMany({
                where: {
                    invitedEmail: user.email,
                },
                take: 1,
            });

            // Update membership to associate the user with the tenant.
            if (invited.length > 0 || invited[0] != null) {
                const tenant = invited[0]!;
                await prisma.membership.update({
                    where: {
                        tenantId_invitedEmail: {
                            invitedEmail: user.email,
                            tenantId: tenant.tenantId,
                        },
                    },
                    data: {
                        userId: user.id,
                    },
                });
                return;
            }

            // Default role built in, every tenant has access to this role.
            const tenantOwnerRole = await prisma.role.findFirst({
                where: {
                    name: "Tenant Owner",
                    tenantId: null,
                },
                select: {
                    id: true,
                },
            });

            if (!tenantOwnerRole) {
                throw new Error("Application is not configured correctly.");
            }

            // Otherwise, create a new tenant for the user.
            await prisma.tenant.create({
                data: {
                    name: `${user.name}'s Tenant`,
                    memberships: {
                        create: {
                            roleId: tenantOwnerRole.id,
                            userId: user.id,
                        },
                    },
                },
            });
        },
    },
    callbacks: {
        session: ({ session, user }) => ({
            ...session,
            user: {
                ...session.user,
                globalRole: user.role,
                id: user.id,
            },
        }),
    },
    adapter: PrismaAdapter(prisma),
    providers: [
        DiscordProvider({
            clientId: env.DISCORD_CLIENT_ID,
            clientSecret: env.DISCORD_CLIENT_SECRET,
        }),
        /**
         * ...add more providers here.
         *
         * Most other providers require a bit more work than the Discord provider. For example, the
         * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
         * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
         *
         * @see https://next-auth.js.org/providers/github
         */
    ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
    req: GetServerSidePropsContext["req"];
    res: GetServerSidePropsContext["res"];
}) => {
    return getServerSession(ctx.req, ctx.res, authOptions);
};
