import { Header } from "@/components/layout/header";
import { AppShell } from "@/components/layout/app-shell";
import { getSubjects } from "@/lib/actions/subjects";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const subjectsRes = await getSubjects();
  const subjects = (subjectsRes.data ?? []) as any[];

  return (
    <AppShell header={<Header />} subjects={subjects}>
      {children}
    </AppShell>
  );
}
