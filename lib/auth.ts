import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// getClaims verifies the JWT signature, so it is safe on the server.
// getSession only reads the cookie, which anyone can forge.
// cache() dedupes calls within one request (layout + page + components).
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;
  return { id: claims.sub, email: claims.email ?? null };
});

// For pages that need a logged-in user.
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

// For pages that also need a finished profile. Signed-up users without a
// profile row haven't picked a role yet, so they go to onboarding.
export const requireProfile = cache(async () => {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!profile) redirect("/onboarding");
  return { user, profile };
});
