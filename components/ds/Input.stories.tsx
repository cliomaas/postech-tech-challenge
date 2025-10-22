import type { Meta, StoryObj } from "@storybook/react";
import Input from "./Input";

const meta: Meta<typeof Input> = { title: "DS/Input", component: Input };
export default meta;
type S = StoryObj<typeof Input>;

export const Default: S = { args: { label: "Nome", placeholder: "Digite..." } };
export const WithHint: S = { args: { label: "Email", hint: "Usaremos para contato" } };
