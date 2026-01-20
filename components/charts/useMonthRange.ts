"use client";

import { useEffect, useMemo, useState } from "react";
import { format, isValid, parseISO, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AnyTransaction } from "@/lib/types";

type MonthOption = { value: string; label: string };

function toMonthKey(dateValue: string) {
  const date = parseISO(dateValue);
  if (!isValid(date)) return "";
  return format(startOfMonth(date), "yyyy-MM");
}

export function useMonthRange(txs: AnyTransaction[]) {
  const options = useMemo<MonthOption[]>(() => {
    const keys = new Map<string, string>();
    txs.forEach((t) => {
      if (!t.date) return;
      const monthKey = toMonthKey(t.date);
      if (!monthKey || keys.has(monthKey)) return;
      const label = format(parseISO(`${monthKey}-01`), "MMM yyyy", { locale: ptBR });
      keys.set(monthKey, label);
    });
    return Array.from(keys.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [txs]);

  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");

  useEffect(() => {
    if (!options.length) {
      setStart("");
      setEnd("");
      return;
    }

    const first = options[0]?.value ?? "";
    const last = options[options.length - 1]?.value ?? "";

    setStart((prev) => (prev && options.some((o) => o.value === prev) ? prev : first));
    setEnd((prev) => (prev && options.some((o) => o.value === prev) ? prev : last));
  }, [options]);

  const setStartSafe = (value: string) => {
    setStart(value);
    setEnd((prev) => (!prev || value > prev ? value : prev));
  };

  const setEndSafe = (value: string) => {
    setEnd(value);
    setStart((prev) => (!prev || value < prev ? value : prev));
  };

  return {
    options,
    start,
    end,
    setStart: setStartSafe,
    setEnd: setEndSafe,
  };
}
