/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type Session } from "next-auth";

import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

type CreateContextOptions = {
    session: Session | null;
};

type GlobalTenantRoles = (typeof GLOBAL_TENANT_ROLES)[number];

let roleCache: Record<GlobalTenantRoles, string> | null = null;

const getGlobalMeta = async () => {
    if (roleCache === null) {
        const roles = await prisma.role.findMany({
            where: {
                name: {
                    in: [...GLOBAL_TENANT_ROLES],
                },
                tenantId: null,
            },
            select: {
                id: true,
                name: true,
            },
        });

        if (roles === null) {
            throw new Error("Could not find global roles");
        }

        roleCache = roles.reduce((acc, role) => {
            acc[role.name as GlobalTenantRoles] = role.id;
            return acc;
        }, {} as Record<GlobalTenantRoles, string>);
    }

    return { roles: roleCache };
};

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
const createInnerTRPCContext = async (opts: CreateContextOptions) => {
    console.log(await getGlobalMeta());
    return {
        session: opts.session,
        prisma,
        globalMeta: await getGlobalMeta(),
    };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
    const { req, res } = opts;

    // Get the session from the server using the getServerSession wrapper function
    const session = await getServerAuthSession({ req, res });

    return createInnerTRPCContext({
        session,
    });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z, ZodError } from "zod";
import { GLOBAL_TENANT_ROLES, Permission } from "~/settings";
import { GlobalRole } from "@prisma/client";

interface Meta {
    permissions: Permission[];
}

const t = initTRPC
    .context<typeof createTRPCContext>()
    .meta<Meta>()
    .create({
        transformer: superjson,
        errorFormatter({ shape, error }) {
            return {
                ...shape,
                data: {
                    ...shape.data,
                    zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
                },
            };
        },
    });

export const trpc = t;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/** Reusable middleware that enforces users are logged in before running the procedure. */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
        ctx: {
            // infers the `session` as non-nullable
            session: { ...ctx.session, user: ctx.session.user },
        },
    });
});

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

export const tenantProcedure = t.procedure
    .use(enforceUserIsAuthed)
    .input(
        z.object({
            tenantId: z.string(),
        })
    )
    .use(async ({ ctx, input, next, meta }) => {
        if (ctx.session.user.globalRole === GlobalRole.SUPERADMIN) {
            const tenant = await ctx.prisma.tenant.findFirst({
                where: {
                    id: input.tenantId,
                },
            });
            if (tenant === null) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Tenant not found" });
            }
            return next({
                ctx: {
                    ...ctx,
                    membership: {
                        tenant,
                        role: {
                            name: "Tenant Owner",
                            id: ctx.globalMeta.roles["Tenant Owner"],
                            tenantId: null,
                        },
                    },
                },
            });
        }

        const membership = await ctx.prisma.membership.findFirst({
            where: {
                userId: ctx.session.user.id,
                tenantId: input.tenantId,
            },
            select: {
                tenant: true,
                role: true,
            },
        });

        if (membership === null) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not a member of this tenant" });
        }

        // Route has permissions, check if user has permission
        if (meta?.permissions) {
            const role = membership.role;
            // Tenant owner has all permissions
            if (role.id !== ctx.globalMeta.roles["Tenant Owner"]) {
                const permissions = await ctx.prisma.permission.findMany({
                    where: {
                        roleId: role.id,
                        name: {
                            in: meta.permissions,
                        },
                    },
                });
                if (!permissions || permissions.length === 0) {
                    throw new TRPCError({ code: "UNAUTHORIZED", message: "You do not have permission to access this" });
                }
            }
        }

        return next({ ctx: { ...ctx, membership } });
    });
