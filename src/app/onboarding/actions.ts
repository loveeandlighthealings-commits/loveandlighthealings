"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { interestsSchema } from "@/lib/interests";

export async function saveInterests(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const raw = formData.getAll("interests");
  const parsed = interestsSchema.safeParse(raw);

  if (!parsed.success) {
    redirect("/onboarding?error=" + encodeURIComponent("That selection isn't valid. Please try again."));
  }

  const { error } = await supabase
    .from("profiles")
    .update({ interests: parsed.success ? parsed.data : [] })
    .eq("user_id", user.id);

  if (error) {
    redirect("/onboarding?error=" + encodeURIComponent(error.message));
  }

  redirect("/");
}
