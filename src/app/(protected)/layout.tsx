import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  // TODO: Handle case where profile is not found (e.g., first-time login)
  if (!profile) {
    console.error("User profile not found for user_id:", user.id);
    // A proper flow would redirect to a profile creation page.
    // For now, we'll treat them as a guest, which will limit their access.
  }

  const userRole = (profile?.role || "guest") as 'admin' | 'clinic_staff' | 'guest';

  return (
    <AppShell user={user} userRole={userRole}>
      {children}
    </AppShell>
  );
}
