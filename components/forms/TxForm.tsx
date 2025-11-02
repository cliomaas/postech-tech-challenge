"use client";

import { useState } from "react";
import Button from "@/components/ds/Button";
import Input from "@/components/ds/Input";
import Select from "@/components/ds/Select";
import type { AnyTransaction, PixType, Transaction, TransactionType } from "@/lib/types";
import { toISODateOnly, toISOFromDatetimeLocal } from "@/lib/utils/date";
import { FormPayload, buildFormPayload } from "@/lib/utils/tx";

type Props = {
  /** initial values (editing) */
  initial?: AnyTransaction;
  /** callback ao enviar */
  onSubmit: (data: FormPayload) => Promise<void> | void;
};

export default function TxForm({ initial, onSubmit }: Props) {
  const [type, setType] = useState(initial?.type ?? "deposit");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? "");
  const [date, setDate] = useState(
    initial?.date ? initial.date.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );

  const [pixType, setPixType] = useState(
    initial?.type === "pix" ? initial.pixType : "normal"
  );
  const [scheduledFor, setScheduledFor] = useState(
    initial?.type === "pix" && initial.scheduledFor ? initial.scheduledFor : ""
  );


  const [loading, setLoading] = useState(false);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const common = {
        description,
        amount: Number(amount),
        date: toISODateOnly(date),
      };

      const payload = buildFormPayload(common, type, { pixType, scheduledFor });
      await onSubmit(payload);
    } catch (err) {
      console.error("Erro ao salvar transação:", err);
      // opcional: exibir mensagem pro usuário
      alert("Não foi possível salvar a transação. Tente novamente.");
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
            <Input
              label="Agendar para"
              type="date"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              required
            />
          )}
        </div>
      )}

      <Input
        label="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <Input
        label="Valor (R$)"
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />


      {type !== "pix" && <Input
        label="Data"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />}

      <div className="text-right">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : initial ? "Salvar alterações" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}
