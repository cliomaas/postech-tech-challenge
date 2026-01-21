import type { Meta, StoryObj } from "@storybook/react";
import Badge from "./Badge";

const meta: Meta<typeof Badge> = { title: "DS/Badge", component: Badge };
export default meta;
type S = StoryObj<typeof Badge>;

export const Slate: S = { render: () => <Badge>Neutro</Badge> };
export const Green: S = { render: () => <Badge color="green">OK</Badge> };
export const Red: S = { render: () => <Badge color="red">Erro</Badge> };
export const Yellow: S = { render: () => <Badge color="yellow">Aviso</Badge> };
