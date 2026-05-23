import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_CATEGORIES = [
  { name: "Technology", slug: "technology" },
  { name: "Music", slug: "music" },
  { name: "Art & Design", slug: "art-design" },
  { name: "Business", slug: "business" },
  { name: "Sports", slug: "sports" },
  { name: "Community", slug: "community" },
  { name: "Education", slug: "education" },
  { name: "Food & Drink", slug: "food-drink" },
];

export async function seedCategories() {
  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("categories")
    .select("slug");

  const existingSlugs = new Set(existing?.map((c) => c.slug) ?? []);
  const toInsert = DEFAULT_CATEGORIES.filter(
    (c) => !existingSlugs.has(c.slug)
  );

  if (toInsert.length > 0) {
    await supabase.from("categories").insert(toInsert);
  }
}
