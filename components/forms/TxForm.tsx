"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ds/Button";
import Input from "@/components/ds/Input";
import Select from "@/components/ds/Select";
import type { AnyTransaction, PixType, PixTransaction, Transaction, TransactionType } from "@/lib/types";
import { getTodayISO, toISODateOnly } from "@/lib/utils/date";
import { FormPayload, buildFormPayload } from "@/lib/utils/tx";
import { useSnackbar } from "../ds/SnackbarProvider";
import { getErrorMessage } from "@/lib/utils/errors";
import { txLabel } from "@/src/core/labels";

type Category = NonNullable<Transaction["category"]>;
type Attachment = NonNullable<Transaction["attachments"]>[number];

const MAX_ATTACHMENTS = 1;
const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "application/pdf"]);

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  ALIMENTACAO: ["mercado", "supermercado", "ifood", "comida", "alimentação", "restaurante", "padaria", "lanche", "cafe"],
  MORADIA: ["aluguel", "condominio", "condomínio", "luz", "energia", "agua", "água", "internet", "gas", "gás"],
  LAZER: ["cinema", "netflix", "spotify", "show", "viagem", "bar", "jogo"],
  TRANSPORTE: ["uber", "99", "taxi", "táxi", "gasolina", "combustivel", "combustível", "metro", "metrô", "onibus", "ônibus"],
  OUTROS: [],
  INCOME: ["salario", "salário", "bonus", "bônus", "reembolso", "rendimento", "cashback", "pix recebido"],
};

function isExpenseType(t: TransactionType) {
  return t === "withdraw" || t === "payment" || t === "pix";
}

function normalizeText(v: string) {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

type Props = {
  /** initial values (editing) */
  initial?: AnyTransaction;
  /** callback ao enviar */
  onSubmit: (data: FormPayload) => Promise<void> | void;
};

export default function TxForm({ initial, onSubmit }: Props) {
  const [type, setType] = useState<TransactionType>(
    () => (initial?.type as TransactionType | undefined) ?? "deposit"
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? "");
  const isEdit = Boolean(initial?.id);
  const [date, setDate] = useState<string>(initial?.date ?? getTodayISO());
  const minDate = getTodayISO();
  const snackbar = useSnackbar();
  const [category, setCategory] = useState<Category>(() => {
    if (initial?.category) return initial.category;
    return isExpenseType((initial?.type ?? "deposit") as TransactionType) ? "OUTROS" : "INCOME";
  });
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>(initial?.attachments ?? []);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [attachmentError, setAttachmentError] = useState<string | undefined>(undefined);

  const [pixType, setPixType] = useState(
    initial?.type === "pix" ? (initial as PixTransaction).pixType : "normal"
  );
  const [scheduledFor, setScheduledFor] = useState(
    initial?.type === "pix" && (initial as PixTransaction).scheduledFor
      ? (initial as PixTransaction).scheduledFor
      : ""
  );

  const [loading, setLoading] = useState(false);

  const suggestion = useMemo(() => {
    if (!description.trim()) return null;
    if (!isExpenseType(type)) return "INCOME";
    const normalized = normalizeText(description);
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (cat === "OUTROS" || cat === "INCOME") continue;
      if (keywords.some((k) => normalized.includes(normalizeText(k)))) {
        return cat as Category;
      }
    }
    return null;
  }, [description, type]);

  useEffect(() => {
    if (!isExpenseType(type)) {
      setCategory("INCOME");
      setCategoryTouched(false);
      return;
    }
    if (category === "INCOME") {
      setCategory("OUTROS");
    }
  }, [type, category]);

  useEffect(() => {
    if (!isExpenseType(type)) return;
    if (!categoryTouched && suggestion && suggestion !== category) {
      setCategory(suggestion);
    }
  }, [category, categoryTouched, suggestion, type]);

  async function handleAttachmentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    const next: Attachment[] = [];
    let errorMessage = "";

    if (attachments.length + files.length > MAX_ATTACHMENTS) {
      errorMessage = "Limite de 1 anexo.";
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        errorMessage = "Somente imagens (PNG/JPG/WEBP) ou PDF.";
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        errorMessage = "Cada arquivo deve ter no maximo 3MB.";
        continue;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        next.push({
          id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl,
        });
      } catch {
        errorMessage = "Nao foi possivel ler o arquivo.";
      }
    }

    setAttachmentError(errorMessage || undefined);
    if (next.length) {
      setAttachments((prev) => [...prev, ...next].slice(0, MAX_ATTACHMENTS));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const nextErrors: Partial<Record<string, string>> = {};
      const trimmedDescription = description.trim();
      const parsedAmount = Number(amount.replace(",", "."));

      if (!trimmedDescription || trimmedDescription.length < 3) {
        nextErrors.description = "Descricao deve ter ao menos 3 caracteres.";
      }
      if (!amount.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        nextErrors.amount = "Informe um valor valido maior que zero.";
      }
      if (!nextErrors.amount && amount && !/^\d+([.,]\d{1,2})?$/.test(amount.trim())) {
        nextErrors.amount = "Use no maximo 2 casas decimais.";
      }
      if (isExpenseType(type) && category === "INCOME") {
        nextErrors.category = "Escolha uma categoria de despesa.";
      }

      if (type !== "pix") {
        if (toISODateOnly(date) < minDate) {
          nextErrors.date = "A data nao pode ser anterior a hoje.";
        }
      } else if (pixType === "scheduled") {
        if (!scheduledFor) {
          nextErrors.scheduledFor = "Informe a data de agendamento.";
        } else if (toISODateOnly(scheduledFor) < minDate) {
          nextErrors.scheduledFor = "A data de agendamento nao pode ser anterior a hoje.";
        }
      }

      if (attachments.length > MAX_ATTACHMENTS) {
        nextErrors.attachments = "Limite de 1 anexo.";
      }

      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        setLoading(false);
        return;
      }

      const common = {
        description: trimmedDescription,
        amount: parsedAmount,
        date: toISODateOnly(date),
        category,
        attachments,
      };

      const payload = buildFormPayload(common, type as TransactionType, { pixType, scheduledFor });
      await onSubmit(payload);
      snackbar.success("Transação criada com sucesso!")
    } catch (err) {
      console.error("Erro ao salvar transação:", err);
      snackbar.error(`Erro ao salvar transação. ${getErrorMessage(e)}`)
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <Select label="Tipo" value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
        <option value="deposit">Depósito</option>
        <option value="transfer">Transferência</option>
        <option value="payment">Pagamento</option>
        <option value="withdraw">Saque</option>
        <option value="pix">Pix</option>
      </Select>

      {type === "pix" && (
        <div className="grid gap-2">
          <label className="text-sm font-medium">Como enviar?</label>
          <div className="flex gap-3 items-center">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="pixType"
                value="normal"
                checked={pixType === "normal"}
                onChange={() => setPixType("normal")}
              />
              <span>Enviar agora</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="pixType"
                value="scheduled"
                checked={pixType === "scheduled"}
                onChange={() => setPixType("scheduled")}
              />
              <span>Agendar</span>
            </label>
          </div>

          {pixType === "scheduled" && (
            <>
              <Input
                label="Agendar para"
                type="date"
                value={scheduledFor}
                min={minDate}
                onChange={(e) => setScheduledFor(e.target.value)}
                required
                aria-invalid={Boolean(errors.scheduledFor)}
              />
              {errors.scheduledFor && (
                <div className="text-xs text-[var(--color-danger)]">{errors.scheduledFor}</div>
              )}
            </>
          )}
        </div>
      )}

      <Input
        label="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        aria-invalid={Boolean(errors.description)}
      />
      {errors.description && (
        <div className="text-xs text-[var(--color-danger)]">{errors.description}</div>
      )}

      <Input
        label="Valor (R$)"
        type="number"
        step="0.01"
        min="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        aria-invalid={Boolean(errors.amount)}
      />
      {errors.amount && (
        <div className="text-xs text-[var(--color-danger)]">{errors.amount}</div>
      )}

      <Select
        label="Categoria"
        value={category}
        disabled={!isExpenseType(type)}
        onChange={(e) => {
          setCategory(e.target.value as Category);
          setCategoryTouched(true);
        }}
        aria-invalid={Boolean(errors.category)}
      >
        <option value="INCOME">Entrada</option>
        <option value="ALIMENTACAO">Alimentação</option>
        <option value="MORADIA">Moradia</option>
        <option value="LAZER">Lazer</option>
        <option value="TRANSPORTE">Transporte</option>
        <option value="OUTROS">Outros</option>
      </Select>
      {errors.category && (
        <div className="text-xs text-[var(--color-danger)]">{errors.category}</div>
      )}
      {suggestion && isExpenseType(type) && suggestion !== category && (
        <div className="text-xs text-fg/70">
          Sugestao:{" "}
          <button
            type="button"
            className="underline text-[color:var(--color-brand)]"
            onClick={() => {
              setCategory(suggestion);
              setCategoryTouched(true);
            }}
          >
            {txLabel.category[suggestion]}
          </button>
        </div>
      )}

      {type !== "pix" && (
        <Input
          label="Data"
          type="date"
          value={date}
          min={minDate}
          onChange={(e) => setDate(e.target.value)}
          required
          aria-invalid={Boolean(errors.date)}
        />
      )}
      {errors.date && (
        <div className="text-xs text-[var(--color-danger)]">{errors.date}</div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Anexos</label>
        <input
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,application/pdf"
          onChange={handleAttachmentChange}
          className="block w-full text-sm file:mr-3 file:rounded-[var(--radius-xl2)] file:border-0 file:bg-[color:var(--color-brand)] file:px-3 file:py-2 file:text-[color:var(--color-on-brand)] file:text-sm file:font-medium hover:file:bg-[color:var(--color-brand-600)]"
        />
        <div className="text-xs text-fg/70">
          Um arquivo (PNG/JPG/WEBP ou PDF), maximo 3MB.
        </div>
        {(attachmentError || errors.attachments) && (
          <div className="text-xs text-[var(--color-danger)]">
            {attachmentError || errors.attachments}
          </div>
        )}
        {attachments.length > 0 && (
          <ul className="space-y-2">
            {attachments.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
              >
                <span className="truncate">
                  {file.name}
                  <span className="ml-2 text-xs text-fg/60">({formatFileSize(file.size)})</span>
                </span>
                <button
                  type="button"
                  className="text-xs text-[var(--color-danger)] hover:underline"
                  onClick={() => setAttachments((prev) => prev.filter((item) => item.id !== file.id))}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-right">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : initial ? "Salvar alterações" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}
