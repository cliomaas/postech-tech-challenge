import { boolean, z } from "zod";

export const transactionStatusSchema = z.enum([
    "PROCESSING",
    "PROCESSED",
    "SCHEDULED",
    "FAILED",
    "CANCELLED",
    "CANCELLED_RESTORED",
]);

export const transactionCategorySchema = z.enum([
    "ALIMENTACAO",
    "MORADIA",
    "LAZER",
    "TRANSPORTE",
    "OUTROS",
    "INCOME",
]);

export const attachmentSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    size: z.number(),
    dataUrl: z.string(),
});

export type TransactionStatus = z.infer<typeof transactionStatusSchema>;
export type TransactionCategory = z.infer<typeof transactionCategorySchema>;

export const transactionTypeSchema = z.enum(["INCOME", "EXPENSE", "TRANSFER"]);
export type TransactionType = z.infer<typeof transactionTypeSchema>;

export const transactionSchema = z.object({
    id: z.union([z.string(), z.number()]).transform(String),
    amount: z.number().nonnegative(),
    date: z.string(),
    type: z.string(),
    description: z.string().optional(),
    status: transactionStatusSchema.optional().default("PROCESSING"),
    category: transactionCategorySchema.optional().default("OUTROS"),
    locked: z.boolean().optional(),
    attachments: z.array(attachmentSchema).optional(),
});

export type Transaction = z.infer<typeof transactionSchema>;
