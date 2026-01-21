import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SnackbarProvider, useSnackbar, type SnackInput } from "./SnackbarProvider";

function SnackPlayground(props: SnackInput & { buttonLabel?: string }) {
    const snackbar = useSnackbar();
    const { buttonLabel = "Show snackbar", ...snack } = props;

    return (
        <div className="flex flex-col gap-3">
            <button
                className="inline-flex items-center gap-2 rounded-[var(--radius-xl2)] px-4 py-2 text-sm font-medium
                   bg-brand text-on-brand hover:bg-brand-600 focus-visible:outline-none
                   focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2
                   focus-visible:ring-offset-[color:var(--color-bg)]"
                onClick={() => snackbar.show(snack)}
            >
                {buttonLabel}
            </button>
        </div>
    );
}

function StackingDemo() {
    const snackbar = useSnackbar();
    const [count, setCount] = useState(0);

    const fire = () => {
        const n = count + 1;
        setCount(n);
        snackbar.show({
            message: `Notificação #${n}`,
            variant: (["success", "error", "warning", "info"] as const)[n % 4],
        });
    };

    return (
        <div className="flex items-center gap-3">
            <button
                className="rounded-[var(--radius-xl2)] px-4 py-2 text-sm font-medium
                   bg-surface-50 hover:bg-surface-100 text-on-surface
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                onClick={fire}
            >
                Add notification
            </button>
            <button
                className="rounded-[var(--radius-xl2)] px-3 py-2 text-sm font-medium
                   bg-[color:var(--color-danger)] text-white hover:bg-[color:var(--color-danger)]/90
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-danger)]/45"
                onClick={() => snackbar.dismissAll()}
            >
                Dismiss all
            </button>
        </div>
    );
}

const meta = {
    title: "Design System/Snackbar",
    decorators: [
        (Story) => (
            <SnackbarProvider>
                <div className="p-6 bg-surface min-h-[60vh] text-on-surface">
                    <Story />
                </div>
            </SnackbarProvider>
        ),
    ],
    parameters: {
        layout: "centered",
    },
    argTypes: {
        variant: {
            control: "inline-radio",
            options: ["success", "error", "info", "warning"],
        },
        duration: {
            control: { type: "number", min: 1000, step: 500 },
        },
        actionLabel: { control: "text" },
        message: { control: "text" },
    },
} satisfies Meta<typeof SnackPlayground>;

export default meta;

// ---- Stories ----
export const Playground: StoryObj<typeof SnackPlayground> = {
    render: (args) => <SnackPlayground {...args} />,
    args: {
        message: "Transação criada com sucesso!",
        variant: "success",
        duration: 4200,
    },
};

export const ErrorWithAction: StoryObj<typeof SnackPlayground> = {
    render: () => {
        const snackbar = useSnackbar();
        return (
            <button
                className="rounded-[var(--radius-xl2)] px-4 py-2 text-sm font-medium
                   bg-error text-on-error hover:opacity-90 focus-visible:outline-none
                   focus-visible:ring-2 focus-visible:ring-error"
                onClick={() =>
                    snackbar.error("Falha ao excluir transação.", {
                        actionLabel: "Desfazer",
                        onAction: () => snackbar.info("Ação desfeita."),
                        duration: 6000,
                    })
                }
            >
                Trigger error with action
            </button>
        );
    },
};

export const Stacking: StoryObj = {
    render: () => <StackingDemo />,
};
