import { useRouter } from "next/router";

const useTenantId = () => {
    const router = useRouter();
    return (router.query.tenantId as string) ?? "";
};

export default useTenantId;
