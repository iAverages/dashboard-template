import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, tenantProcedure } from "~/server/api/trpc";

export const selfRouter = createTRPCRouter({
    tenants: protectedProcedure.query(({ ctx }) => {
        return ctx.prisma.membership.findMany({
            where: {
                userId: ctx.session.user.id,
            },
            select: {
                tenant: true,
            },
        });
    }),

    get: protectedProcedure.query(async ({ ctx }) => {
        return ctx.prisma.user.findUnique({
            where: {
                id: ctx.session.user.id,
            },
        });
    }),

    defaultTenant: protectedProcedure.mutation(async ({ ctx }) => {
        const membership = await ctx.prisma.membership.findFirst({
            where: {
                userId: ctx.session.user.id,
            },
            select: {
                tenant: true,
            },
        });

        return membership?.tenant || null;
    }),
    // selectedTenant: protectedProcedure.query(async ({ ctx }) => {
    //     const selected = await ctx.prisma.membership.findFirst({
    //         where: {
    //             userId: ctx.session.user.id,
    //             selected: true,
    //         },
    //         select: {
    //             tenant: true,
    //         },
    //     });

    //     if (selected) {
    //         return selected.tenant;
    //     }

    //     const first = await ctx.prisma.membership.findFirst({
    //         where: {
    //             userId: ctx.session.user.id,
    //         },
    //         select: {
    //             tenant: true,
    //             id: true,
    //         },
    //     });

    //     if (!first) {
    //         throw new TRPCError({ code: "BAD_REQUEST", message: "You are not a member of any tenants." });
    //     }

    //     ctx.prisma.$transaction([
    //         ctx.prisma.membership.update({
    //             where: {
    //                 id: first.id,
    //             },
    //             data: {
    //                 selected: true,
    //             },
    //         }),
    //     ]);

    //     return first.tenant;
    // }),

    // switchTenants: tenantProcedure.mutation(async ({ ctx, input }) => {
    //     await ctx.prisma.membership.updateMany({
    //         where: {
    //             userId: ctx.session.user.id,
    //         },
    //         data: {
    //             selected: false,
    //         },
    //     });

    //     return ctx.prisma.membership.updateMany({
    //         where: {
    //             userId: ctx.session.user.id,
    //             tenantId: input.tenantId,
    //         },
    //         data: {
    //             selected: true,
    //         },
    //     });
    // }),
});
