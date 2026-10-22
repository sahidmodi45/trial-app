import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";

type AuthUser = { id: string; email: string };

// Never use getSession() on the server: it reads the cookie without verifying
// the token. getClaims() checks the JWT signature.
export async function getUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;
  return { id: claims.sub, email: claims.email ?? "" };
}

export async function requireUser(next: string): Promise<AuthUser> {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function getProfile(): Promise<Tables<"profiles"> | null> {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Signed-up users without a profile row haven't picked a role yet.
export async function requireProfile(
  next: string,
): Promise<{ user: AuthUser; profile: Tables<"profiles"> }> {
  const user = await requireUser(next);
  const profile = await getProfile();
  if (!profile) redirect("/onboarding");
  return { user, profile };
}

// Stops a crafted link (?next=//evil.com) sending people off-site after login.
export function safeNext(value: string | null | undefined): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/dashboard";
}
