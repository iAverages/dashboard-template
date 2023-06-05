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
import { useToast } from "~/components/ui/use-toast";
import { z } from "zod";
import useTenant from "~/hooks/useTenant";
import { Input } from "~/components/ui/input";
import Form, { useZodForm } from "~/components/form";

const Roles = () => {
    const createModalToggle = useToggle(false);
    const { data: tenantData, isLoading: isLoadingSelectedTenant } = useTenant();
    const { data: rolesData, isLoading: isLoadingTenantRoles } = api.tenant.roles.useQuery(
        { tenantId: tenantData?.id ?? "" },
        { enabled: !!tenantData }
    );

    const isLoading = isLoadingSelectedTenant && isLoadingTenantRoles;

    return (
        <>
            <Show when={!isLoading && createModalToggle[1]}>
                <CreateRoleModal toggle={createModalToggle} />
            </Show>
            <Show when={!isLoading}>
                <Button onClick={createModalToggle[1]} disabled={isLoading}>
                    Create Role
                </Button>
            </Show>
            <Show when={rolesData} fallback={<>{isLoading && <div>loading</div>}</>}>
                {(roles) => (
                    <>
                        <Table>
                            <THead>
                                <Tr>
                                    <Td>Id</Td>
                                    <Td>Name</Td>
                                </Tr>
                            </THead>
                            <TBody>
                                {roles.map((role) => (
                                    <Tr key={role.id}>
                                        <Td>{role.id}</Td>
                                        <Td>{role.name}</Td>
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

const CreateRoleModal = ({ toggle: toggleable }: { toggle: ReturnType<typeof useToggle> }) => {
    const tCtx = api.useContext();
    const { data: tenantData } = useTenant();
    const { mutateAsync } = api.tenant.createRole.useMutation({
        onMutate: async (data) => {
            await tCtx.tenant.roles.invalidate({ tenantId: tenantData?.id ?? "" });
            const prev = tCtx.tenant.roles.getData({ tenantId: tenantData?.id ?? "" });
            tCtx.tenant.roles.setData({ tenantId: tenantData?.id ?? "" }, (old) => {
                return [...(old ?? []), { ...data, id: "temp-id" }];
            });

            return { prev };
        },
        onError: (_, __, context) => {
            if (!context?.prev) return;
            tCtx.tenant.roles.setData({ tenantId: tenantData?.id ?? "" }, context.prev);
        },
        onSettled: () => {
            void tCtx.tenant.roles.invalidate({ tenantId: tenantData?.id ?? "" });
        },
    });
    const { toast } = useToast();
    const [isOpen, toggle] = toggleable;
    const form = useZodForm({
        schema: createRoleSchema,
    });

    const onSubmit = async (data: CreateRoleFormValues) => {
        if (!tenantData) return;
        await mutateAsync({
            tenantId: tenantData?.id ?? "",
            name: data.roleName,
        });
        toast({
            title: "Role Created",
        });
        toggle();
    };

    return (
        <Dialog open={isOpen} onOpenChange={toggle}>
            <DialogContent>
                <Form form={form} onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create a Role</DialogTitle>
                        <DialogDescription>
                            A role can been assigned to users, roles can group sets of permissions togeather
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <div className="space-y-4 py-2 pb-4">
                            <Label>Role Name</Label>
                            <Input {...form.register("roleName")} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Create</Button>
                    </DialogFooter>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default Roles;
