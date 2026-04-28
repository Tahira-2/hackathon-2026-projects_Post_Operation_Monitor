import { supabase } from "../lib/supabase";

type LookupTable = "specialties" | "hospitals";

export function normalizeLookupValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function extractLookupName(
  relation?: { name: string } | Array<{ name: string }> | null,
) {
  if (!relation) return null;
  return Array.isArray(relation) ? (relation[0]?.name ?? null) : relation.name;
}

export async function listLookupNames(table: LookupTable) {
  const { data, error } = await supabase
    .from(table)
    .select("name")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data.map((row) => row.name as string);
}

export async function resolveLookupId(
  table: LookupTable,
  value?: string | null,
) {
  const normalizedValue = normalizeLookupValue(value);
  if (!normalizedValue) return null;

  const { data: existing, error: selectError } = await supabase
    .from(table)
    .select("id")
    .eq("name", normalizedValue)
    .maybeSingle();

  if (selectError) throw new Error(selectError.message);
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from(table)
    .insert({ name: normalizedValue })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function resolveLookupName(
  table: LookupTable,
  id?: string | null,
) {
  if (!id) return null;

  const { data, error } = await supabase
    .from(table)
    .select("name")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.name ?? null;
}
