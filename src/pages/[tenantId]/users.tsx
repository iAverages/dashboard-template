import { useRouter } from "next/router";
import { Show } from "~/components/show";
import { TBody, THead, Table, Td, Tr } from "~/components/table";
import { Button } from "~/components/ui/button";
import useTenant from "~/hooks/useTenant";
import { api } from "~/utils/api";

const Users = () => {
    const { data: tenant } = useTenant();
    const { data: users } = api.tenant.getMembers.useQuery({ tenantId: tenant?.id ?? "" }, { enabled: !!tenant });

    const router = useRouter();
    return (
        <Show when={[tenant, users] as const}>
            {([t, u]) => (
                <>
                    <h1>users</h1>
                    <div>
                        <Button onClick={() => void router.push(`/${t.id}/roles`)}>Manage Roles</Button>
                    </div>
                    <div>
                        <Table>
                            <THead>
                                <Tr>
                                    <Td>Name</Td>
                                    <Td>Email</Td>
                                </Tr>
                            </THead>
                            <TBody>
                                {u.map(({ user }) => (
                                    <Tr key={user?.id}>
                                        <Td>{user?.name}</Td>
                                        <Td>{user?.email}</Td>
                                    </Tr>
                                ))}
                            </TBody>
                        </Table>
                    </div>
                </>
            )}
        </Show>
    );
};

export default Users;
