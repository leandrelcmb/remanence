import { TIMETABLE } from "./timetable";
export const ARTISTS = [...new Set(TIMETABLE.map((e) => e.artistName))].sort();
