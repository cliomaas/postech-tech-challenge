import TransactionsView from "@/components/pages/TransactionsView";
import { SnackbarProvider } from "@/components/ds/SnackbarProvider";
import { ThemeProvider } from "@/theme/ThemeProvider";

export default function Root() {
  return (
    <ThemeProvider>
      <SnackbarProvider>
        <TransactionsView />
      </SnackbarProvider>
    </ThemeProvider>
  );
}
