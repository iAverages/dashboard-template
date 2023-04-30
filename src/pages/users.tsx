import { useSession } from "next-auth/react";
import { TBody, THead, Table, Td, Tr } from "~/components/table";
import useTenant from "~/hooks/useTenant";
import { api } from "~/utils/api";

const Users = () => {
    const [tenant] = useTenant();
    const { data: users } = api.tenant.getMembers.useQuery({ tenantId: tenant.id });

    const { data } = useSession();
    return (
        <>
            users
            {JSON.stringify(data)}
            <div>
                <Table>
                    <THead>
                        <Tr>
                            <Td>Name</Td>
                            <Td>Email</Td>
                        </Tr>
                    </THead>
                    <TBody>
                        {users?.map(({ user }) => (
                            <Tr key={user?.id}>
                                <Td>{user?.name}</Td>
                                <Td>{user?.email}</Td>
                            </Tr>
                        ))}
                    </TBody>
                </Table>
            </div>
        </>
    );
};

export default Users;
