import { da } from "date-fns/locale";
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
    const { data, mutate, isLoading } = api.self.defaultTenant.useMutation();

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            void signIn();
            return;
        }

        if (status === "authenticated" && router.pathname === "/") {
            if (data === undefined) {
                mutate();
                return;
            }

            if (data === null) {
                void router.push("/getting-started");
                return;
            }

            void router.push(`/${data.id}/dashboard`);
        }
    }, [status, router, data, mutate]);

    if (isLoading) return null;

    if (status === "authenticated") return <Navigation>{children}</Navigation>;

    return null;
};

export default Layout;
