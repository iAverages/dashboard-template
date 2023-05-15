import { Show } from "~/components/show";
import { api } from "~/utils/api";
import { TBody, THead, Table, Td, Tr } from "~/components/table";
import { Button } from "~/components/ui/button";
import useToggle from "~/hooks/useToggle";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { useState } from "react";
import { useToast } from "~/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useTenant from "~/hooks/useTenant";

const roles = () => {
    const [showCreateModal, toggleCreateModal] = useToggle(false);
    const { data: tenantData, isLoading: isLoadingSelectedTenant } = useTenant();
    const { data: rolesData, isLoading: isLoadingTenantRoles } = api.tenant.roles.useQuery(
        { tenantId: tenantData?.id ?? "" },
        { enabled: !!tenantData }
    );

    const isLoading = isLoadingSelectedTenant && isLoadingTenantRoles;

    return (
        <>
            <Show when={showCreateModal}>{(roles) => <></>}</Show>
            <Show when={!isLoading}>
                <Button onClick={toggleCreateModal} disabled={isLoading}>
                    Create Role
                </Button>
            </Show>
            <Show
                when={rolesData}
                fallback={
                    <>
                        {isLoading && <div>loading</div>}
                        {!isLoading && <CreateRoleModal />}
                    </>
                }
            >
                {(roles) => (
                    <>
                        <Table>
                            <THead>
                                <Tr>
                                    <Td>Name</Td>
                                </Tr>
                            </THead>
                            <TBody>
                                {roles.map((role) => (
                                    <Tr key={role.id}>
                                        <Td>{role.name}</Td>
                                        {/* <Td>{role.}</Td> */}
                                    </Tr>
                                ))}
                            </TBody>
                        </Table>
                    </>
                )}
            </Show>
        </>
    );
};

const NoRolesFound = () => {
    return <div>no roles found</div>;
};

type CreateRoleFormValues = {
    roleName: string;
};

const createRoleSchema = z.object({
    roleName: z.string().min(1),
});

const CreateRoleModal = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateRoleFormValues>({ resolver: zodResolver(createRoleSchema) });

    const [roleName, setRoleName] = useState("");
    const { data: tenantData, isLoading: isLoadingSelectedTenant } = useTenant();
    const { mutateAsync } = api.tenant.createRole.useMutation();
    const { toast } = useToast();

    const onSubmit = handleSubmit((data) => {
        if (!tenantData) return;
        mutateAsync({
            tenantId: tenantData?.id ?? "",
            name: data.roleName,
        });
    });

    return (
        <Dialog open={true}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create team</DialogTitle>
                    <DialogDescription>Add a new team to manage products and customers.</DialogDescription>
                </DialogHeader>
                <div>
                    <div className="space-y-4 py-2 pb-4">
                        <div className="space-y-2">
                            <form onSubmit={onSubmit}>
                                <Label {...register("roleName")}>Tenant name</Label>
                                <Input
                                    onChange={(e) => setRoleName(e.target.value)}
                                    id="name"
                                    placeholder={"New Role"}
                                    disabled={isLoadingSelectedTenant}
                                />
                            </form>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        onClick={() => {
                            toast({
                                title: "Role Created",
                            });
                        }}
                    >
                        Click
                    </Button>
                    {/* <Button variant="outline" onClick={() => setShowNewTeamDialog(false)} disabled={isCreatingTenant}>
                        Cancel
                    </Button>
                    <Button type="submit" onClick={handleCreateTenant} disabled={isCreatingTenant}>
                        Create
                    </Button> */}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
export default roles;
