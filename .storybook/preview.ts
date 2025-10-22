import type { Preview } from "@storybook/react";
// importa só se o passo do Tailwind já estiver OK
import "../app/globals.css";

const preview: Preview = {
  parameters: { controls: { expanded: true } },
};
export default preview;