export type HistoricalEvent = {
  id: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  createdAtUtc: string;
};