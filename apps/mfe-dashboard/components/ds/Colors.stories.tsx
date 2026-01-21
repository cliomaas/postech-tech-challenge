export default { title: "Design Tokens/Colors" };

// lista de cores e variáveis
const colors = [
    { name: "brand-600", var: "--color-brand-600" },
    { name: "surface-50", var: "--color-surface-50" },
    { name: "success", var: "--color-success" },
    { name: "danger", var: "--color-danger" },
    { name: "warning", var: "--color-warning" },
];

function Swatch({ name, cssVar }: { name: string; cssVar: string }) {
    const color = getComputedStyle(document.documentElement)
        .getPropertyValue(cssVar)
        .trim();

    return (
        <div className="flex flex-col items-center gap-2 text-sm">
            <div
                className="w-16 h-16 rounded"
                style={{ backgroundColor: `var(${cssVar})` }}
            />
            <span>{name}</span>
            <code className="opacity-70">{color}</code>
        </div>
    );
}

export const Palette = () => (
    <div className="grid grid-cols-5 gap-6 text-center">
        {colors.map((c) => (
            <Swatch key={c.name} name={c.name} cssVar={c.var} />
        ))}
    </div>
);
