import DashboardView from "@/components/pages/DashboardView";
import { SnackbarProvider } from "@/components/ds/SnackbarProvider";
import { ThemeProvider } from "./providers/ThemeProvider";

export default function Root() {
  return (
    <ThemeProvider>
      <SnackbarProvider>
        <DashboardView />
      </SnackbarProvider>
    </ThemeProvider>
  );
}
