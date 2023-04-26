import { AppProps, type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { Fragment } from "react";
import { NextPage } from "next";
import GlobalLayout from "~/components/layout";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    removeGlobalLayout?: boolean;
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

const MyApp: AppType<{ session: Session | null }> = ({
    Component,
    pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
    const Layout = Component.removeGlobalLayout || false ? GlobalLayout : Fragment;

    return (
        <SessionProvider session={session}>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </SessionProvider>
    );
};

export default api.withTRPC(MyApp);
