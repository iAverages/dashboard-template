import { z } from "zod";
import { createTRPCRouter, protectedProcedure, tenantProcedure } from "~/server/api/trpc";

export const tenantRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                name: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.tenant.create({
                data: {
                    name: input.name,
                    memberships: {
                        create: {
                            userId: ctx.session.user.id,
                            roleId: ctx.globalMeta.roles["Tenant Owner"],
                        },
                    },
                },
            });
        }),

    get: tenantProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
        return ctx.prisma.tenant.findFirst({
            where: {
                id: input.id,
                memberships: {
                    some: {
                        userId: ctx.session.user.id,
                    },
                },
            },
        });
    }),

    getMembers: tenantProcedure.query(async ({ ctx, input }) => {
        return ctx.prisma.membership.findMany({
            where: {
                tenantId: input.tenantId,
            },
            select: {
                user: true,
            },
        });
    }),

    statistics: tenantProcedure.query(async ({ ctx, input }) => {
        const members = await ctx.prisma.membership.count({
            where: {
                tenantId: input.tenantId,
            },
        });

        return {
            members,
        };
    }),
});
