import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Navigation from "~/components/navigation";
import { api } from "~/utils/api";

type LayoutProps = {
    children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
    const { status } = useSession();
    const router = useRouter();
    const { data } = api.self.selectedTenant.useQuery(undefined, {
        enabled: status === "authenticated",
    });

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            signIn();
            return;
        }

        if (status === "authenticated" && router.pathname === "/" && data) {
            router.push(`/${data.id}/dashboard`);
        }
    }, [status, router, data]);

    if (status === "authenticated") return <Navigation>{children}</Navigation>;

    return null;
};

export default Layout;
