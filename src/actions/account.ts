"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    profile,
  };
}

export async function updateProfile(data: {
  name?: string;
  bio?: string;
  linkedin_url?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const updates: Record<string, string> = {};
  if (data.name !== undefined) updates.name = data.name.trim();
  if (data.bio !== undefined) updates.bio = data.bio.trim();
  if (data.linkedin_url !== undefined) updates.linkedin_url = data.linkedin_url.trim();

  if (Object.keys(updates).length === 0) {
    return { error: "Nothing to update." };
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) return { error: "Failed to update profile." };

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateAvatar(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const file = formData.get("avatar") as File;
  if (!file || file.size === 0) return { error: "No file provided." };
  if (file.size > 2 * 1024 * 1024) return { error: "File must be under 2MB." };

  const fileExt = file.name.split(".").pop();
  const filePath = `${user.id}/avatar.${fileExt}`;

  // Auto-create avatars bucket if it doesn't exist
  const admin = createAdminClient();
  const { data: buckets } = await admin.storage.listBuckets();
  const bucketExists = buckets?.some((b) => b.name === "avatars");
  if (!bucketExists) {
    await admin.storage.createBucket("avatars", {
      public: true,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
      fileSizeLimit: "2MB",
    });
  }

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) return { error: "Failed to upload avatar." };

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) return { error: "Failed to update avatar." };

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
