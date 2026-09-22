"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const setupSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fullName: z.string().trim().max(80).optional(),
});

export async function saveNumerologyProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const parsed = setupSchema.safeParse({
    birthDate: formData.get("birthDate"),
    fullName: formData.get("fullName") || undefined,
  });
  if (!parsed.success) {
    redirect("/numerology?error=" + encodeURIComponent("Enter a valid date of birth."));
  }

  const update: { birth_date: string; full_name?: string } = { birth_date: parsed.data.birthDate };
  if (parsed.data.fullName) update.full_name = parsed.data.fullName;

  await supabase.from("profiles").update(update).eq("user_id", user.id);
  redirect("/numerology");
}
