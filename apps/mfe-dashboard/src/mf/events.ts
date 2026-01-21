export type TxEventType =
  | "tx:created"
  | "tx:updated"
  | "tx:removed"
  | "tx:cancelled"
  | "tx:restored";

export type TxEventDetail = {
  type: TxEventType;
  id?: string;
};

const EVENT_NAME = "mfe:tx";

export function emitTxEvent(detail: TxEventDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail }));
}

export function onTxEvent(handler: (detail: TxEventDetail) => void) {
  if (typeof window === "undefined") return () => {};
  const listener = (event: Event) => {
    handler((event as CustomEvent<TxEventDetail>).detail);
  };
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
