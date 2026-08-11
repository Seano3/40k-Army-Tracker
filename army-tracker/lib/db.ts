import { supabase } from "./supabase";
import type { Army, CatalogUnit, Faction, Status, Unit } from "./types";

export async function getFactions(): Promise<Faction[]> {
  const { data, error } = await supabase
    .from("factions")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getCatalogUnits(factionId: string): Promise<CatalogUnit[]> {
  const { data, error } = await supabase
    .from("unit_catalog")
    .select("*")
    .eq("faction_id", factionId)
    .order("name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getArmies(): Promise<Army[]> {
  const { data, error } = await supabase
    .from("armies")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createArmy(name: string, factionId: string): Promise<Army> {
  const { data, error } = await supabase
    .from("armies")
    .insert({ name, faction_id: factionId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function renameArmy(id: string, name: string): Promise<void> {
  const { error } = await supabase.from("armies").update({ name }).eq("id", id);
  if (error) throw error;
}

export async function deleteArmy(id: string): Promise<void> {
  const { error } = await supabase.from("armies").delete().eq("id", id);
  if (error) throw error;
}

export async function getUnits(armyId: string): Promise<Unit[]> {
  const { data, error } = await supabase
    .from("units")
    .select("*")
    .eq("army_id", armyId)
    .order("position", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createUnit(
  armyId: string,
  status: Status,
  catalogUnit: CatalogUnit
): Promise<Unit> {
  const { data, error } = await supabase
    .from("units")
    .insert({
      army_id: armyId,
      name: `${catalogUnit.name} (${catalogUnit.variant})`,
      status,
      position: Date.now(),
      points: catalogUnit.points,
      catalog_unit_id: catalogUnit.id,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateUnit(
  id: string,
  fields: { name?: string; notes?: string | null }
): Promise<void> {
  const { error } = await supabase
    .from("units")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function moveUnit(
  id: string,
  status: Status,
  position: number
): Promise<void> {
  const { error } = await supabase
    .from("units")
    .update({ status, position, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteUnit(id: string): Promise<void> {
  const { error } = await supabase.from("units").delete().eq("id", id);
  if (error) throw error;
}
