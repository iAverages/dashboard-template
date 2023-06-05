import Link from "next/link";
import { useRouter } from "next/router";
import { type ReactNode, useCallback } from "react";
import TeamSwitcher from "~/components/tenantSwitcher";
import { ThemeToggle } from "~/components/themeSwitcher";
import useTenantId from "~/hooks/useTenantId";
import { cn } from "~/lib/utils";

type NavigationProps = {
    children: ReactNode;
};

type NavLinkProps = {
    name: string;
    href: string;
};

const NavLink = ({ href, name }: NavLinkProps) => {
    const tenantId = useTenantId();
    const { pathname } = useRouter();

    const getUrl = useCallback((url: string) => {
        const urlSplit = url.split("/");
        urlSplit.shift();
        urlSplit.shift();
        const a = urlSplit.join("/");
        return a;
    }, []);

    return (
        <Link
            href={`/${tenantId}/${href}`}
            className={cn(
                "transition-colors hover:text-foreground/80",
                getUrl(pathname).startsWith(href) ? "text-foreground" : "text-foreground/60"
            )}
        >
            {name}
        </Link>
    );
};

const links: NavLinkProps[] = [
    {
        href: "dashboard",
        name: "Dashboard",
    },
    {
        href: "users",
        name: "Manage Users",
    },
    {
        href: "settings",
        name: "Settings",
    },
];

const Navigation = ({ children }: NavigationProps) => {
    return (
        <div className="hidden flex-col md:flex">
            <div className="border-b">
                <div className="flex h-16 items-center px-4">
                    <TeamSwitcher />
                    <div className="mr-4 hidden md:flex">
                        <nav className="flex items-center space-x-6 text-sm font-medium">
                            {links.map((link, idx) => (
                                <NavLink key={`${idx}-${link.href}`} {...link} />
                            ))}
                        </nav>
                    </div>
                    <div className="ml-auto flex items-center space-x-4">
                        <ThemeToggle />
                    </div>
                </div>
            </div>
            {children}
        </div>
    );
};

export default Navigation;
