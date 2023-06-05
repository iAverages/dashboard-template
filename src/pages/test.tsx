import Layout from "~/components/layout";
import { Show } from "~/components/show";
import { api } from "~/utils/api";

const Test = () => {
    const { data, isLoading, isError } = api.example.test.useQuery({ tenantId: "clh5ftnnf0000rh01996zdnax" });

    return (
        <>
            <h1>Testing page</h1>
            <Show when={isLoading}>
                <>Loading...</>
            </Show>
            <Show when={isError}>
                <>Errored</>
            </Show>

            <Show when={data}>{(data) => <>{data}</>}</Show>
        </>
    );
};

export default Test;
