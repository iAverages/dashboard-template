import Navigation from "~/components/navigation";

type LayoutProps = {
    children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
    return <Navigation>{children}</Navigation>;
};

export default Layout;
