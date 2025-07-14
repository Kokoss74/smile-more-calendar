import AuthButton from "@/components/auth/AuthButton";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
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
  // For now, we'll just log it and proceed.
  if (!profile) {
    console.error("User profile not found for user_id:", user.id);
    // redirect("/create-profile"); // This will be the next step
  }

  const userRole = profile?.role || "guest";

  return (
    <div>
      <header>
        <h1>Smile More Calendar</h1>
        <AuthButton user={user} />
      </header>
      <main>
        <p>
          Welcome back, {user.email} (Role: {userRole})
        </p>
        {/* Calendar component will go here */}
      </main>
    </div>
  );
}
