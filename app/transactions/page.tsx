import TxTable from "@/components/TxTable";

export default function TransactionsPage(){
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Transações</h1>
      <TxTable />
    </div>
  );
}
