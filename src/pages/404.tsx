const NotFound = () => {
    return (
        <div className={"flex h-screen w-full items-center justify-center gap-4"}>
            <h1>404</h1>
            <p>Page not found</p>
        </div>
    );
};

NotFound.removeGlobalLayout = true;

export default NotFound;
