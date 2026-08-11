"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { CatalogUnit, Status, Unit } from "@/lib/types";
import { UnitCard } from "./UnitCard";

type Props = {
  status: Status;
  label: string;
  units: Unit[];
  catalog: CatalogUnit[];
  onAddUnit: (catalogUnit: CatalogUnit) => void;
  onSaveUnit: (id: string, fields: { name: string; notes: string | null }) => void;
  onDeleteUnit: (id: string) => void;
};

export function Column({
  status,
  label,
  units,
  catalog,
  onAddUnit,
  onSaveUnit,
  onDeleteUnit,
}: Props) {
  const [adding, setAdding] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: `column:${status}` });
  const columnPoints = units.reduce((sum, u) => sum + (u.points ?? 0), 0);

  function handlePick(catalogUnitId: string) {
    const catalogUnit = catalog.find((c) => c.id === catalogUnitId);
    setAdding(false);
    if (catalogUnit) onAddUnit(catalogUnit);
  }

  return (
    <div className="flex w-64 shrink-0 flex-col rounded-xl bg-zinc-100 dark:bg-zinc-950/50">
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {label}
        </h2>
        <span className="text-xs text-zinc-400">
          {units.length} · {columnPoints} pts
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-[80px] flex-1 flex-col gap-2 px-2 pb-2 ${
          isOver ? "bg-black/[.04] dark:bg-white/[.06]" : ""
        }`}
      >
        {units.map((unit) => (
          <UnitCard
            key={unit.id}
            unit={unit}
            onSave={onSaveUnit}
            onDelete={onDeleteUnit}
          />
        ))}
      </div>
      <div className="p-2 pt-0">
        {adding ? (
          <select
            autoFocus
            defaultValue=""
            onChange={(e) => handlePick(e.target.value)}
            onBlur={() => setAdding(false)}
            className="w-full rounded-md border border-black/[.08] bg-white px-2 py-1.5 text-sm dark:border-white/[.145] dark:bg-zinc-900"
          >
            <option value="" disabled>
              Select a unit...
            </option>
            {catalog.map((c) => (
              <option key={c.id} value={c.id} className="text-black dark:text-black">
                {c.name} — {c.points} pts
              </option>
            ))}
          </select>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full rounded-md px-2 py-1.5 text-left text-sm text-zinc-500 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.08]"
          >
            + Add unit
          </button>
        )}
      </div>
    </div>
  );
}
