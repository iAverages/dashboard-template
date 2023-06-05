import { Show } from "~/components/show";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import useTenant from "~/hooks/useTenant";
import { api } from "~/utils/api";

const Users = () => {
    const { data: tenantData } = useTenant();
    const { data: statisticsData } = api.tenant.statistics.useQuery(
        { tenantId: tenantData?.id ?? "" },
        { enabled: !!tenantData }
    );

    return (
        <Show when={[tenantData, statisticsData] as const}>
            {([_tenant, statistics]) => (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.members}</div>
                            {/* <p className="text-xs text-muted-foreground">+180.1% from last month</p> */}
                        </CardContent>
                    </Card>
                </div>
            )}
        </Show>
    );
};

export default Users;
