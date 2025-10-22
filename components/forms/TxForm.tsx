"use client";

import { useState } from "react";
import Input from "@/components/ds/Input";
import Select from "@/components/ds/Select";
import Button from "@/components/ds/Button";
import { useTxStore } from "@/lib/store";
import type { Transaction } from "@/lib/types";

export default function TxForm({ initial, onSubmit }:{ initial?: Partial<Transaction>; onSubmit:(data:Omit<Transaction,"id">)=>void }){
  const [type, setType] = useState(initial?.type ?? "deposit");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? "");
  const [date, setDate] = useState(initial?.date ? initial!.date.slice(0,10) : new Date().toISOString().slice(0,10));

  function submit(e: React.FormEvent){
    e.preventDefault();
    const amt = Number(amount);
    if(!description || !amt || amt <= 0) return alert("Preencha os campos corretamente.");
    onSubmit({
      type: type as any,
      description,
      amount: amt,
      date: new Date(date).toISOString()
    });
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <Select label="Tipo" value={type} onChange={(e)=>setType(e.target.value)}>
        <option value="deposit">Depósito</option>
        <option value="transfer">Transferência</option>
        <option value="payment">Pagamento</option>
        <option value="withdraw">Saque</option>
      </Select>
      <Input label="Descrição" value={description} onChange={(e)=>setDescription(e.target.value)} />
      <Input label="Valor (R$)" type="number" step="0.01" value={amount} onChange={(e)=>setAmount(e.target.value)} />
      <Input label="Data" type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
      <div className="pt-2 flex justify-end gap-2">
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}
