"use client";

import { useState } from "react";
import type { Army } from "@/lib/types";

type Props = {
  armies: Army[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
};

export function ArmyTabs({
  armies,
  selectedId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  function submitAdd() {
    const trimmed = newName.trim();
    if (trimmed) onCreate(trimmed);
    setNewName("");
    setAdding(false);
  }

  function submitRename() {
    const trimmed = renameValue.trim();
    if (renamingId && trimmed) onRename(renamingId, trimmed);
    setRenamingId(null);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-black/[.08] px-4 py-3 dark:border-white/[.145]">
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
            className="rounded-full border border-black/[.08] px-3 py-1 text-sm dark:border-white/[.145]"
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
                : "bg-black/[.04] text-zinc-700 hover:bg-black/[.08] dark:bg-white/[.08] dark:text-zinc-300 dark:hover:bg-white/[.12]"
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
          placeholder="Army name..."
          className="rounded-full border border-black/[.08] px-3 py-1 text-sm dark:border-white/[.145]"
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="rounded-full border border-dashed border-black/[.15] px-3 py-1 text-sm text-zinc-500 hover:bg-black/[.04] dark:border-white/[.2] dark:text-zinc-400 dark:hover:bg-white/[.08]"
        >
          + New Army
        </button>
      )}
    </div>
  );
}
