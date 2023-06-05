import { Role } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure, tenantProcedure } from "~/server/api/trpc";

export const exampleRouter = createTRPCRouter({
    hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => {
        return {
            greeting: `Hello ${input.text}`,
        };
    }),

    getSecretMessage: protectedProcedure.query(({ ctx }) => {
        return "you can now see this secret message!";
    }),

    // test: protectedProcedure.use(hasPermission(["TEST"])).query(() => {}),
    test: tenantProcedure.meta({ permissions: ["CREATE_TENANT"] }).query(({ ctx, input }) => {
        return `You are a member of ${ctx.membership.tenant.name} | ${ctx.session.user.globalRole} | ${ctx.membership.role.name}`;
    }),
});
