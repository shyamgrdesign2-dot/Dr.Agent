/** All possible section IDs for the secondary sidebar navigation. */
export type NavItemId =
  | "drAgent"
  | "pastVisits"
  | "vitals"
  | "history"
  | "ophthal"
  | "gynec"
  | "obstetric"
  | "vaccine"
  | "growth"
  | "medicalRecords"
  | "labResults"
  | "personalNotes";

/** Sections that have real data */
export const SECTIONS_WITH_DATA: NavItemId[] = [
  "drAgent", "pastVisits", "vitals", "history",
  "gynec", "obstetric", "vaccine", "growth",
  "medicalRecords", "labResults", "personalNotes",
];

/** Sections that show an empty state */
export const SECTIONS_EMPTY: NavItemId[] = ["ophthal"];
