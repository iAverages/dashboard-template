import { ReactElement } from "react";

type MapNonNullable<T> = {
    [K in keyof T]: NonNullable<T[K]>;
};

type ShowProps<T> = {
    when: T | undefined | null | false;
    keyed?: boolean;
    fallback?: ReactElement;
    children: (item: T extends ReadonlyArray<any> ? MapNonNullable<T> : NonNullable<T>) => ReactElement;
};

export function Show<T>({ when, fallback, children }: ShowProps<T>) {
    if (!when) {
        return fallback ?? null;
    }

    if (Array.isArray(when)) {
        if (when.length === 0) {
            return fallback ?? null;
        }

        const allTrue = when.every((item) => !!item);
        if (allTrue) {
            return children(when as any);
        }
        return fallback ?? null;
    }

    return children(when as any);
}
