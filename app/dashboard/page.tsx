import { requireProfile } from "@/lib/auth";

export default async function DashboardPage() {
  const { profile } = await requireProfile("/dashboard");

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
      <p>
        Hi {profile.full_name}, you&apos;re signed in as a {profile.role}
      </p>
    </div>
  );
}
