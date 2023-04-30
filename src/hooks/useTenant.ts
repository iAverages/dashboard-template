import { Tenant } from "@prisma/client";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import useLocalStorage from "~/hooks/useLocalStorage";
import { api } from "~/utils/api";

const selectedTenant = atom<Tenant>({ id: "", name: "" });

const useTenant = (def?: Tenant) => {
    const [tenant, setTenant] = useAtom(selectedTenant);
    const [lastSelectedTenantId, setLastSelectedTenantId] = useLocalStorage("tenant", "");
    const { data, isLoading: isLoadingTenantData } = api.tenant.get.useQuery(
        { id: lastSelectedTenantId },
        { enabled: lastSelectedTenantId !== "" && tenant.id === "" }
    );

    const selectTenant = (tenant: Tenant) => {
        setTenant(tenant);
        setLastSelectedTenantId(tenant.id);
    };

    useEffect(() => {
        if (def) {
            setTenant(def);
        }
    }, [def]);

    useEffect(() => {
        if (tenant.id === "") {
            if (lastSelectedTenantId !== "" && !isLoadingTenantData) {
                if (data) {
                    setTenant(data);
                }
            }
        }
    }, [isLoadingTenantData, lastSelectedTenantId, tenant.id]);

    return [tenant, selectTenant, lastSelectedTenantId] as const;
};

export default useTenant;
