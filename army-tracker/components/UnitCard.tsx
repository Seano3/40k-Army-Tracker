"use client";

import { useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Unit } from "@/lib/types";

type Props = {
  unit: Unit;
  onSave: (id: string, fields: { name: string; notes: string | null }) => void;
  onDelete: (id: string) => void;
};

export function UnitCard({ unit, onSave, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(unit.name);
  const [notes, setNotes] = useState(unit.notes ?? "");

  const draggable = useDraggable({ id: unit.id });
  const droppable = useDroppable({ id: unit.id });

  const setRefs = (node: HTMLElement | null) => {
    draggable.setNodeRef(node);
    droppable.setNodeRef(node);
  };

  const style = {
    transform: CSS.Translate.toString(draggable.transform),
    opacity: draggable.isDragging ? 0.4 : 1,
  };

  function startEditing() {
    setName(unit.name);
    setNotes(unit.notes ?? "");
    setEditing(true);
  }

  function save() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(unit.id, { name: trimmed, notes: notes.trim() ? notes : null });
    setEditing(false);
  }

  if (editing) {
    return (
      <div
        ref={setRefs}
        className="rounded-lg border border-black/[.08] bg-white p-3 shadow-sm dark:border-white/[.145] dark:bg-zinc-900"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-2 w-full rounded border border-black/[.08] bg-transparent px-2 py-1 text-sm dark:border-white/[.145]"
          placeholder="Unit name"
          autoFocus
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mb-2 w-full resize-none rounded border border-black/[.08] bg-transparent px-2 py-1 text-sm dark:border-white/[.145]"
          placeholder="Notes..."
          rows={3}
        />
        <div className="flex justify-end gap-2 text-sm">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setEditing(false)}
            className="rounded px-2 py-1 text-zinc-600 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.08]"
          >
            Cancel
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={save}
            className="rounded bg-foreground px-2 py-1 text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setRefs}
      style={style}
      {...draggable.listeners}
      {...draggable.attributes}
      onClick={startEditing}
      className="group cursor-grab touch-none rounded-lg border border-black/[.08] bg-white p-3 shadow-sm active:cursor-grabbing dark:border-white/[.145] dark:bg-zinc-900"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">{unit.name}</p>
        {unit.points != null && (
          <span className="shrink-0 rounded bg-black/[.06] px-1.5 py-0.5 text-[0.7rem] font-medium text-zinc-600 dark:bg-white/[.08] dark:text-zinc-300">
            {unit.points} pts
          </span>
        )}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete "${unit.name}"?`)) onDelete(unit.id);
          }}
          className="shrink-0 rounded px-1 text-xs text-zinc-400 opacity-0 hover:bg-black/[.06] hover:text-red-600 group-hover:opacity-100 dark:hover:bg-white/[.08]"
          aria-label="Delete unit"
        >
          ✕
        </button>
      </div>
      {unit.notes && (
        <p className="mt-1 line-clamp-3 text-xs text-zinc-500 dark:text-zinc-400">
          {unit.notes}
        </p>
      )}
    </div>
  );
}
