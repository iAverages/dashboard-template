import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

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
});
