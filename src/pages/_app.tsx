import { AppProps, type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

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
    const Layout = Component.removeGlobalLayout || false ? Fragment : GlobalLayout;

    return (
        <SessionProvider session={session}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </ThemeProvider>
        </SessionProvider>
    );
};

export default api.withTRPC(MyApp);
