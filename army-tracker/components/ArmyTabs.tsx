"use client";

import { useState } from "react";
import type { Army, Faction } from "@/lib/types";

type Props = {
  armies: Army[];
  factions: Faction[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: (name: string, factionId: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
};

export function ArmyTabs({
  armies,
  factions,
  selectedId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newFactionId, setNewFactionId] = useState(() => factions[0]?.id ?? "");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (trimmed && newFactionId) onCreate(trimmed, newFactionId);
    setNewName("");
    setAdding(false);
  }

  function submitRename() {
    const trimmed = renameValue.trim();
    if (renamingId && trimmed) onRename(renamingId, trimmed);
    setRenamingId(null);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-black/[.08] px-4 py-3">
      {armies.map((army) =>
        renamingId === army.id ? (
          <input
            key={army.id}
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={submitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitRename();
              if (e.key === "Escape") setRenamingId(null);
            }}
            className="rounded-full border border-black/[.08] px-3 py-1 text-sm"
          />
        ) : (
          <button
            key={army.id}
            onClick={() => onSelect(army.id)}
            onDoubleClick={() => {
              setRenamingId(army.id);
              setRenameValue(army.name);
            }}
            className={`group flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${
              selectedId === army.id
                ? "bg-foreground text-background"
                : "bg-black/[.04] text-zinc-700 hover:bg-black/[.08]"
            }`}
          >
            {army.name}
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete army "${army.name}" and all its units?`))
                  onDelete(army.id);
              }}
              className="hidden text-xs opacity-60 hover:opacity-100 group-hover:inline"
            >
              ✕
            </span>
          </button>
        )
      )}

      {adding ? (
        <form onSubmit={submitAdd} className="flex items-center gap-1.5">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setNewName("");
                setAdding(false);
              }
            }}
            placeholder="Army name..."
            className="rounded-full border border-black/[.08] px-3 py-1 text-sm"
          />
          <select
            value={newFactionId}
            onChange={(e) => setNewFactionId(e.target.value)}
            className="rounded-full border border-black/[.08] bg-transparent px-3 py-1 text-sm"
          >
            {factions.map((f) => (
              <option key={f.id} value={f.id} className="text-black">
                {f.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full bg-foreground px-3 py-1 text-sm text-background hover:bg-[#383838]"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setNewName("");
              setAdding(false);
            }}
            className="rounded-full px-2 py-1 text-sm text-zinc-500 hover:bg-black/[.04]"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="rounded-full border border-dashed border-black/[.15] px-3 py-1 text-sm text-zinc-500 hover:bg-black/[.04]"
        >
          + New Army
        </button>
      )}
    </div>
  );
}
