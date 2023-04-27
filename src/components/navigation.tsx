import { Activity, CreditCard, DollarSign, Download, Users } from "lucide-react";
import { ReactNode } from "react";
import TeamSwitcher from "~/components/tenantSwitcher";
import { ThemeToggle } from "~/components/themeSwitcher";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

type NavigationProps = {
    children: ReactNode;
};

const Navigation = ({ children }: NavigationProps) => {
    return (
        <div className="hidden flex-col md:flex">
            <div className="border-b">
                <div className="flex h-16 items-center px-4">
                    <TeamSwitcher />
                    {/* <MainNav className="mx-6" /> */}
                    <div className="ml-auto flex items-center space-x-4">
                        {/* <Search />
                        <UserNav /> */}
                        <ThemeToggle />
                    </div>
                </div>
            </div>
            {children}
        </div>
    );
};

export default Navigation;
