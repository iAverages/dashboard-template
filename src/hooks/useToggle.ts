import { useCallback, useState } from "react";

const useToggle = (def: boolean = false) => {
    const [value, setValue] = useState(def);
    const toggle = useCallback(() => {
        setValue((value) => !value);
    }, []);

    return [value, toggle] as const;
};

export default useToggle;
