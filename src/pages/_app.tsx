import { type AppProps, type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { Fragment } from "react";
import { type NextPage } from "next";
import GlobalLayout from "~/components/layout";
import { ToastProvider } from "~/components/ui/toast";
import { Toaster } from "~/components/ui/toaster";

// eslint-disable-next-line @typescript-eslint/ban-types
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    removeGlobalLayout?: boolean;
};

type PageProps = { session: Session | null };

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
    pageProps: PageProps;
};

const MyApp: AppType<PageProps> = ({ Component, pageProps: { session, ...pageProps } }: AppPropsWithLayout) => {
    const Layout = Component.removeGlobalLayout || false ? Fragment : GlobalLayout;

    return (
        // not sure why the types are broken tbh
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        <SessionProvider session={session}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <ToastProvider>
                    <Layout>
                        <Component {...pageProps} />
                        <Toaster />
                    </Layout>
                </ToastProvider>
            </ThemeProvider>
        </SessionProvider>
    );
};

export default api.withTRPC(MyApp);
