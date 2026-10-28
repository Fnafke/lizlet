// The backend sends plain dates ("2026-10-28"). Parsing them as local dates avoids off-by-one days.
const toDate = (iso: string) => new Date(`${iso}T00:00:00`);

export const formatDate = (iso: string) => toDate(iso).toLocaleDateString(undefined, { dateStyle: "long" });

export const weekdayShort = (iso: string) => toDate(iso).toLocaleDateString(undefined, { weekday: "short" });