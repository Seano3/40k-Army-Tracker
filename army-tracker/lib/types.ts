export type Status =
  | "on_sprue"
  | "in_subassembly"
  | "built"
  | "primed"
  | "painted"
  | "finished"
  | "broken";

export const STATUS_COLUMNS: { id: Status; label: string }[] = [
  { id: "on_sprue", label: "On Sprue" },
  { id: "in_subassembly", label: "In Subassembly" },
  { id: "built", label: "Built" },
  { id: "primed", label: "Primed" },
  { id: "painted", label: "Painted" },
  { id: "finished", label: "Finished" },
  { id: "broken", label: "Broken" },
];

export type Army = {
  id: string;
  name: string;
  created_at: string;
};

export type Unit = {
  id: string;
  army_id: string;
  name: string;
  notes: string | null;
  status: Status;
  position: number;
  created_at: string;
  updated_at: string;
};
