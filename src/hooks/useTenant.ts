import { useRouter } from "next/router";
import { ReactQueryOptions, RouterInputs, api } from "~/utils/api";

const useTenant = (opts?: ReactQueryOptions["tenant"]["get"]) => {
    const router = useRouter();
    const tenantId = router.query.tenantId as string | undefined;

    return api.tenant.get.useQuery(
        {
            tenantId: tenantId ?? "",
        },
        { enabled: !!tenantId, ...opts }
    );
};

export default useTenant;
