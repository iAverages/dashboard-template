import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";

import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "~/components/ui/command";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { useEffect, useRef, useState } from "react";
import { api } from "~/utils/api";
import { Show } from "~/components/show";
import { useSession } from "next-auth/react";
import useTenant from "~/hooks/useTenant";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>;

interface TeamSwitcherProps extends PopoverTriggerProps {}

export default function TeamSwitcher({ className }: TeamSwitcherProps) {
    const isFirstLoad = useRef(true);
    const { data: tenantData } = api.self.tenants.useQuery();
    const { mutateAsync: createTenant, isLoading: isCreatingTenant } = api.tenant.create.useMutation();
    const [open, setOpen] = useState(false);
    const [showNewTeamDialog, setShowNewTeamDialog] = useState(false);
    const [tenantCreateName, setTenantCreateName] = useState("");
    const [selectedTenant, setSelectedTenant] = useTenant();
    const { data: sessionData } = useSession();

    const handleCreateTenant = async () => {
        const data = await createTenant({
            name: tenantCreateName,
        });
        setSelectedTenant(data);
        setShowNewTeamDialog(false);
    };

    useEffect(() => {
        if (isFirstLoad.current && tenantData && tenantData.length > 0) {
            setSelectedTenant(tenantData[0]!.tenant);
            isFirstLoad.current = false;
        }
    }, [tenantData]);

    return (
        <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        role="combobox"
                        aria-expanded={open}
                        aria-label="Select a team"
                        className={cn("w-[200px] justify-between", className)}
                    >
                        <Avatar className="mr-2 h-5 w-5">
                            <AvatarImage
                                src={`https://avatar.vercel.sh/${selectedTenant?.name}.png`}
                                alt={selectedTenant?.name}
                            />
                            <AvatarFallback>SC</AvatarFallback>
                        </Avatar>
                        {selectedTenant?.name}
                        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandList>
                            <CommandInput placeholder="Search team..." />
                            <CommandEmpty>No team found.</CommandEmpty>
                            <Show when={tenantData}>
                                {(tenants) => (
                                    <CommandGroup key={"tenants"} heading={"Your Tenants"}>
                                        {tenants.map(({ tenant }) => (
                                            <CommandItem
                                                key={tenant.id}
                                                onSelect={() => {
                                                    setSelectedTenant(tenant);
                                                    setOpen(false);
                                                }}
                                                className="text-sm"
                                            >
                                                <Avatar className="mr-2 h-5 w-5">
                                                    <AvatarImage
                                                        src={`https://avatar.vercel.sh/${tenant.name}.png`}
                                                        alt={tenant.name}
                                                    />
                                                    <AvatarFallback>SC</AvatarFallback>
                                                </Avatar>
                                                {tenant.name}
                                                <Check
                                                    className={cn(
                                                        "ml-auto h-4 w-4",
                                                        selectedTenant?.id === tenant.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )}
                            </Show>
                        </CommandList>
                        <CommandSeparator />
                        <CommandList>
                            <CommandGroup>
                                <DialogTrigger asChild>
                                    <CommandItem
                                        onSelect={() => {
                                            setOpen(false);
                                            setShowNewTeamDialog(true);
                                        }}
                                    >
                                        <PlusCircle className="mr-2 h-5 w-5" />
                                        Create Team
                                    </CommandItem>
                                </DialogTrigger>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create team</DialogTitle>
                    <DialogDescription>Add a new team to manage products and customers.</DialogDescription>
                </DialogHeader>
                <div>
                    <div className="space-y-4 py-2 pb-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Tenant name</Label>
                            <Input
                                onChange={(e) => setTenantCreateName(e.target.value)}
                                id="name"
                                placeholder={
                                    sessionData?.user.name ? `${sessionData?.user.name}'s Tenant` : "New Tenant"
                                }
                                disabled={isCreatingTenant}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewTeamDialog(false)} disabled={isCreatingTenant}>
                        Cancel
                    </Button>
                    <Button type="submit" onClick={handleCreateTenant} disabled={isCreatingTenant}>
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
