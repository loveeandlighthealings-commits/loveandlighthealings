"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dietSchema } from "@/lib/diet";

export async function setDiet(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = dietSchema.safeParse(formData.get("diet"));
  if (!parsed.success) {
    redirect("/diet?error=" + encodeURIComponent("Pick one of the options below."));
  }

  const { error } = await supabase.from("profiles").update({ diet: parsed.data }).eq("user_id", user.id);
  if (error) {
    redirect("/diet?error=" + encodeURIComponent(error.message));
  }

  const redirectTo = String(formData.get("redirectTo") ?? "/food");
  redirect(redirectTo);
}
