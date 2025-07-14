import AuthButton from "@/components/auth/AuthButton";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <header>
        <h1>Smile More Calendar</h1>
        <AuthButton user={user} />
      </header>
      <main>
        <p>Welcome back, {user.email}</p>
        {/* Calendar component will go here */}
      </main>
    </div>
  );
}
