"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { themeSchema } from "@/lib/themes";

export async function setTheme(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = themeSchema.safeParse(formData.get("theme"));
  if (!parsed.success) {
    redirect("/appearance?error=" + encodeURIComponent("Pick one of the themes below."));
  }

  const { error } = await supabase
    .from("profiles")
    .update({ theme: parsed.data })
    .eq("user_id", user.id);

  if (error) {
    redirect("/appearance?error=" + encodeURIComponent(error.message));
  }

  redirect("/");
}
