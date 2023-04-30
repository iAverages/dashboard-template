import { ReactElement, ReactNode } from "react";

type ShowProps<T> = {
    when: T | undefined | null | false;
    keyed?: boolean;
    fallback?: ReactElement;
    children: (item: NonNullable<T>) => ReactElement;
};

export function Show<T>({ when, fallback, children }: ShowProps<T>) {
    if (!when) {
        return fallback ?? null;
    }

    return children(when as NonNullable<T>);
}
