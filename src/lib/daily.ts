import fs from "fs";
import path from "path";

const DAILY_DIR = path.join(process.cwd(), "content");

export interface DailyEntry {
  date: string;
  content: string;
}

export function getAllDates(): string[] {
  if (!fs.existsSync(DAILY_DIR)) return [];
  return fs
    .readdirSync(DAILY_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(".md", ""))
    .sort((a, b) => b.localeCompare(a));
}

export function getDaily(date: string): DailyEntry | null {
  const filePath = path.join(DAILY_DIR, `${date}.md`);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");
  return { date, content };
}

export function getLatestDaily(): DailyEntry | null {
  const dates = getAllDates();
  if (dates.length === 0) return null;
  return getDaily(dates[0]);
}
