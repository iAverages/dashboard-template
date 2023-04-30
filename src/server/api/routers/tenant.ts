import { z } from "zod";
import { createTRPCRouter, tenantProcedure } from "~/server/api/trpc";

export const tenantRouter = createTRPCRouter({
    create: tenantProcedure
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
                            roleId: ctx.globalMeta.roles.tenantOwner.id,
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

    getMembers: tenantProcedure
        .input(
            z.object({
                tenantId: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            return ctx.prisma.membership.findMany({
                where: {
                    tenantId: input.tenantId,
                },
                select: {
                    user: true,
                },
            });
        }),
});
