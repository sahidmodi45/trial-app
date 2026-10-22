import { redirect } from "next/navigation";
import { getProfile, requireUser } from "@/lib/auth";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  await requireUser("/onboarding");
  if (await getProfile()) redirect("/dashboard");

  return <OnboardingForm />;
}
