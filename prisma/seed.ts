import { PrismaClient, Role } from "@prisma/client";
import { GLOBAL_TENANT_ROLES } from "~/settings";

export const prisma = new PrismaClient();

(async () => {
    await prisma.$connect();
    GLOBAL_TENANT_ROLES.forEach(async (role) => {
        await prisma.role.upsert({
            where: { name_tenantId: { name: role, tenantId: "" } },
            update: { name: role },
            create: { name: role },
        });
    });
})();
