import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Ensure profile exists for the authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const admin = createAdminClient();
        const { data: existing } = await admin
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existing) {
          const name =
            (user.user_metadata?.name as string) || "User";
          let baseUsername =
            (user.user_metadata?.username as string) ||
            (user.email?.split("@")[0] as string) ||
            "user";
          let username = baseUsername;
          let counter = 0;

          // Handle username collisions
          while (true) {
            const { data: taken } = await admin
              .from("profiles")
              .select("id")
              .eq("username", username)
              .single();
            if (!taken) break;
            counter++;
            username = `${baseUsername}${counter}`;
          }

          await admin.from("profiles").insert({
            id: user.id,
            name,
            username,
          });
        }
      }

      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
