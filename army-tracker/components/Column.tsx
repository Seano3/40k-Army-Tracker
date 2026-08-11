"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { Status, Unit } from "@/lib/types";
import { UnitCard } from "./UnitCard";

type Props = {
  status: Status;
  label: string;
  units: Unit[];
  onAddUnit: (name: string) => void;
  onSaveUnit: (id: string, fields: { name: string; notes: string | null }) => void;
  onDeleteUnit: (id: string) => void;
};

export function Column({
  status,
  label,
  units,
  onAddUnit,
  onSaveUnit,
  onDeleteUnit,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const { setNodeRef, isOver } = useDroppable({ id: `column:${status}` });

  function submitAdd() {
    const trimmed = newName.trim();
    if (!trimmed) {
      setAdding(false);
      return;
    }
    onAddUnit(trimmed);
    setNewName("");
    setAdding(false);
  }

  return (
    <div className="flex w-64 shrink-0 flex-col rounded-xl bg-zinc-100 dark:bg-zinc-950/50">
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {label}
        </h2>
        <span className="text-xs text-zinc-400">{units.length}</span>
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
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={submitAdd}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitAdd();
              if (e.key === "Escape") {
                setNewName("");
                setAdding(false);
              }
            }}
            placeholder="Unit name..."
            className="w-full rounded-md border border-black/[.08] bg-white px-2 py-1.5 text-sm dark:border-white/[.145] dark:bg-zinc-900"
          />
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
