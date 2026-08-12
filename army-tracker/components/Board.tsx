"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { STATUS_COLUMNS, type CatalogUnit, type Status, type Unit } from "@/lib/types";
import {
  createUnit,
  deleteUnit,
  getCatalogUnits,
  getUnits,
  moveUnit,
  updateUnit,
} from "@/lib/db";
import { Column } from "./Column";
import { UnitCard } from "./UnitCard";

type Props = {
  armyId: string;
  factionId: string;
};

function groupByStatus(units: Unit[]) {
  const groups = new Map<Status, Unit[]>();
  for (const col of STATUS_COLUMNS) groups.set(col.id, []);
  for (const unit of units) groups.get(unit.status)?.push(unit);
  for (const list of groups.values()) list.sort((a, b) => a.position - b.position);
  return groups;
}

export function Board({ armyId, factionId }: Props) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [catalog, setCatalog] = useState<CatalogUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all([getUnits(armyId), getCatalogUnits(factionId)]).then(
      ([unitsData, catalogData]) => {
        if (!cancelled) {
          setUnits(unitsData);
          setCatalog(catalogData);
          setLoading(false);
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, [armyId, factionId]);

  const grouped = useMemo(() => groupByStatus(units), [units]);
  const activeUnit = units.find((u) => u.id === activeId) ?? null;
  const totalPoints = units.reduce((sum, u) => sum + (u.points ?? 0), 0);

  async function handleAddUnit(status: Status, catalogUnit: CatalogUnit) {
    const created = await createUnit(armyId, status, catalogUnit);
    setUnits((prev) => [...prev, created]);
  }

  async function handleSaveUnit(
    id: string,
    fields: { name: string; notes: string | null }
  ) {
    setUnits((prev) => prev.map((u) => (u.id === id ? { ...u, ...fields } : u)));
    await updateUnit(id, fields);
  }

  async function handleDeleteUnit(id: string) {
    setUnits((prev) => prev.filter((u) => u.id !== id));
    await deleteUnit(id);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const draggedUnit = units.find((u) => u.id === active.id);
    if (!draggedUnit) return;

    const overId = String(over.id);
    let targetStatus: Status;
    let targetUnitId: string | null;

    if (overId.startsWith("column:")) {
      targetStatus = overId.slice("column:".length) as Status;
      targetUnitId = null;
    } else {
      if (overId === draggedUnit.id) return;
      const overUnit = units.find((u) => u.id === overId);
      if (!overUnit) return;
      targetStatus = overUnit.status;
      targetUnitId = overUnit.id;
    }

    const columnUnits = (grouped.get(targetStatus) ?? []).filter(
      (u) => u.id !== draggedUnit.id
    );
    const insertIndex = targetUnitId
      ? columnUnits.findIndex((u) => u.id === targetUnitId)
      : columnUnits.length;

    const prevPos = insertIndex > 0 ? columnUnits[insertIndex - 1].position : null;
    const nextPos =
      insertIndex < columnUnits.length ? columnUnits[insertIndex].position : null;

    let newPosition: number;
    if (prevPos !== null && nextPos !== null) newPosition = (prevPos + nextPos) / 2;
    else if (prevPos !== null) newPosition = prevPos + 1000;
    else if (nextPos !== null) newPosition = nextPos - 1000;
    else newPosition = 1000;

    if (
      draggedUnit.status === targetStatus &&
      draggedUnit.position === newPosition
    ) {
      return;
    }

    setUnits((prev) =>
      prev.map((u) =>
        u.id === draggedUnit.id
          ? { ...u, status: targetStatus, position: newPosition }
          : u
      )
    );
    moveUnit(draggedUnit.id, targetStatus, newPosition);
  }

  if (loading) {
    return <p className="p-6 text-sm text-zinc-500">Loading board...</p>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex items-center justify-between px-4 pt-3">
        <p className="text-sm text-zinc-500">
          Total: <span className="font-semibold text-foreground">{totalPoints} pts</span>
        </p>
      </div>
      <div className="flex flex-1 gap-3 overflow-x-auto p-4">
        {STATUS_COLUMNS.map((col) => (
          <Column
            key={col.id}
            status={col.id}
            label={col.label}
            units={grouped.get(col.id) ?? []}
            catalog={catalog}
            onAddUnit={(catalogUnit) => handleAddUnit(col.id, catalogUnit)}
            onSaveUnit={handleSaveUnit}
            onDeleteUnit={handleDeleteUnit}
          />
        ))}
      </div>
      <DragOverlay>
        {activeUnit ? (
          <UnitCard unit={activeUnit} onSave={() => {}} onDelete={() => {}} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
