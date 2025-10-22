import type { Meta, StoryObj } from "@storybook/react";
import Select from "./Select";

const meta: Meta<typeof Select> = { title: "DS/Select", component: Select };
export default meta;
type S = StoryObj<typeof Select>;

export const Default: S = {
    render: (args) => (
        <Select {...args} label="Tipo">
            <option>Depósito</option>
            <option>Transferência</option>
            <option>Pagamento</option>
            <option>Saque</option>
        </Select>
    ),
};
