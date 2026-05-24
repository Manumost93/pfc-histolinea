export type EraKey = "ancient" | "medieval" | "modern" | "contemporary";

export function yearFromDateOnly(dateOnly: string): number | null {
  if (!dateOnly || dateOnly.length < 4) return null;
  const y = Number(dateOnly.slice(0, 4));
  return Number.isFinite(y) ? y : null;
}

export function getEraByYear(year: number): {
  key: EraKey;
  label: string;
  className: string;
  dot: string;
  color: string;
} {
  if (year < 476)
    return {
      key: "ancient",
      label: "Antigua",
      className: "era-ancient",
      dot: "rgba(46,125,50,0.9)",
      color: "#2e7d32",
    };
  if (year < 1492)
    return {
      key: "medieval",
      label: "Medieval",
      className: "era-medieval",
      dot: "rgba(109,76,65,0.95)",
      color: "#6d4c41",
    };
  if (year < 1789)
    return {
      key: "modern",
      label: "Moderna",
      className: "era-modern",
      dot: "rgba(21,101,192,0.9)",
      color: "#1565c0",
    };
  return {
    key: "contemporary",
    label: "Contemporánea",
    className: "era-contemporary",
    dot: "rgba(106,27,154,0.9)",
    color: "#6a1b9a",
  };
}

export function getEraByStartDate(startDate: string) {
  const y = yearFromDateOnly(startDate) ?? 0;
  return getEraByYear(y);
}

export function overlapsRange(params: {
  startDate: string;
  endDate?: string | null;
  from?: string;
  to?: string;
}) {
  const { startDate, endDate, from, to } = params;
  const evStart = startDate;
  const evEnd = endDate ?? startDate;
  if (from && evEnd < from) return false;
  if (to && evStart > to) return false;
  return true;
}

export const ERA_OPTIONS: Array<{ value: "all" | EraKey; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "ancient", label: "Antigua" },
  { value: "medieval", label: "Medieval" },
  { value: "modern", label: "Moderna" },
  { value: "contemporary", label: "Contemporánea" },
];
