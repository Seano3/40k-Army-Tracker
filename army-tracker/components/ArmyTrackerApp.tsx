"use client";

import { useEffect, useState } from "react";
import type { Army, Faction } from "@/lib/types";
import { createArmy, deleteArmy, getArmies, getFactions, renameArmy } from "@/lib/db";
import { ArmyTabs } from "./ArmyTabs";
import { Board } from "./Board";

export function ArmyTrackerApp() {
  const [armies, setArmies] = useState<Army[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getArmies(), getFactions()]).then(([armiesData, factionsData]) => {
      setArmies(armiesData);
      setFactions(factionsData);
      setSelectedId((current) => current ?? armiesData[0]?.id ?? null);
      setLoading(false);
    });
  }, []);

  async function handleCreate(name: string, factionId: string) {
    const army = await createArmy(name, factionId);
    setArmies((prev) => [...prev, army]);
    setSelectedId(army.id);
  }

  async function handleRename(id: string, name: string) {
    setArmies((prev) => prev.map((a) => (a.id === id ? { ...a, name } : a)));
    await renameArmy(id, name);
  }

  async function handleDelete(id: string) {
    setArmies((prev) => prev.filter((a) => a.id !== id));
    setSelectedId((current) => {
      if (current !== id) return current;
      const remaining = armies.filter((a) => a.id !== id);
      return remaining[0]?.id ?? null;
    });
    await deleteArmy(id);
  }

  if (loading) {
    return <p className="p-6 text-sm text-zinc-500">Loading...</p>;
  }

  const selectedArmy = armies.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="flex flex-1 flex-col">
      <header className="px-4 pt-4">
        <h1 className="text-xl font-semibold">40k Army Tracker</h1>
      </header>
      <ArmyTabs
        armies={armies}
        factions={factions}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={handleCreate}
        onRename={handleRename}
        onDelete={handleDelete}
      />
      {selectedArmy ? (
        <Board key={selectedArmy.id} armyId={selectedArmy.id} factionId={selectedArmy.faction_id} />
      ) : (
        <p className="p-6 text-sm text-zinc-500">
          Create an army to start tracking units.
        </p>
      )}
    </div>
  );
}
