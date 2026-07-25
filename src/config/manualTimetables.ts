// src/config/manualTimetables.ts

export interface ManualTimetableConfig {
  id: number;
  path: string;
  defaultTitle: string;
}

export const MANUAL_TIMETABLES: ManualTimetableConfig[] = [
  { id: 1, path: "/page1", defaultTitle: "Timetable 1" },
  { id: 2, path: "/page2", defaultTitle: "Timetable 2" },
  { id: 3, path: "/page3", defaultTitle: "Timetable 3" },
  { id: 4, path: "/page4", defaultTitle: "Timetable 4" },
];

export function getTimetableStorageKeys(id: number) {
  // Keeps your existing localStorage data compatible.
  const suffix = id === 1 ? "" : String(id);

  return {
    lessons: `timetableLessons${suffix}`,
    title: `timetableTitle${suffix}`,
    image: `timetableImage${suffix}`,
  };
}