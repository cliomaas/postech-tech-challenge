import type { Meta, StoryObj } from "@storybook/react";
import Modal from "./Modal";
import Button from "./Button";
import { useState } from "react";

const meta: Meta<typeof Modal> = { title: "DS/Modal", component: Modal };
export default meta;
type S = StoryObj<typeof Modal>;

export const Playground: S = {
    render: () => {
        const [open, setOpen] = useState(true);
        return (
            <>
                <Button onClick={() => setOpen(true)}>Abrir</Button>
                <Modal open={open} onClose={() => setOpen(false)}>
                    <h3 className="text-lg font-medium mb-2">Título</h3>
                    <p>Conteúdo do modal.</p>
                    <div className="mt-3 text-right"><Button onClick={() => setOpen(false)}>Fechar</Button></div>
                </Modal>
            </>
        );
    },
};
