import { type ComponentProps } from "react";
import {
    type FieldValues,
    FormProvider,
    type SubmitHandler,
    type UseFormReturn,
    useForm,
    type UseFormProps,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";

interface Props<T extends FieldValues> extends Omit<ComponentProps<"form">, "onSubmit"> {
    form: UseFormReturn<T>;
    onSubmit: SubmitHandler<T>;
}

const Form = <T extends FieldValues>({ form, onSubmit, children, ...props }: Props<T>) => (
    <FormProvider {...form}>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
            {/* <fieldset> passes the form's 'disabled' state to all of its elements,
            allowing us to handle disabled style variants with just css */}
            <fieldset disabled={form.formState.isSubmitting}>{children}</fieldset>
        </form>
    </FormProvider>
);

export default Form;

interface UseZodFormProps<S extends z.ZodSchema> extends Exclude<UseFormProps<z.infer<S>>, "resolver"> {
    schema: S;
}

export const useZodForm = <S extends z.ZodSchema>({ schema, ...formProps }: UseZodFormProps<S>) =>
    useForm({
        ...formProps,
        resolver: zodResolver(schema),
    });
