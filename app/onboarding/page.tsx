import type { Metadata } from "next";
import { OnboardingClient } from "./onboarding-client";

export const metadata: Metadata = {
  title: "Conectar perfil",
  description: "Conecte seu perfil público de CS2 para comparar com o lobby.",
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}
