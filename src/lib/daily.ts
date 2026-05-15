import fs from "fs";
import path from "path";
import { parseTopics } from "./parseTopics";

const DAILY_DIR = path.join(process.cwd(), "content");

export interface DailyEntry {
  date: string;
  content: string;
}

export interface RelatedVideo {
  date: string;
  titleEn: string;
  titleJa: string;
  videoId: string;
  category: string;
}

/** カテゴリ文字列からキーワードを抽出（括弧内・記号除去） */
function categoryKeywords(cat: string): string[] {
  return cat
    .replace(/（[^）]*）/g, "")
    .replace(/\([^)]*\)/g, "")
    .split(/[\s・／/、,]+/)
    .map((k) => k.trim())
    .filter((k) => k.length > 1);
}

/** 2つのカテゴリが同じテーマを含むか判定 */
function categoriesOverlap(a: string, b: string): boolean {
  const ak = categoryKeywords(a);
  const bk = categoryKeywords(b);
  return ak.some((x) => bk.some((y) => x.includes(y) || y.includes(x)));
}

/**
 * 指定カテゴリに関連する他の日付の動画を返す。
 * demo.md など日付形式でないファイルは除外する。
 */
export function getRelatedVideos(
  category: string,
  currentDate: string,
  limit = 5
): RelatedVideo[] {
  const results: RelatedVideo[] = [];
  const dates = getAllDates().filter(
    (d) => d !== currentDate && /^\d{4}-\d{2}-\d{2}$/.test(d)
  );

  for (const date of dates) {
    if (results.length >= limit) break;
    const entry = getDaily(date);
    if (!entry) continue;
    const topics = parseTopics(entry.content);
    for (const t of topics) {
      if (results.length >= limit) break;
      if (t.category && categoriesOverlap(category, t.category)) {
        results.push({
          date,
          titleEn: t.titleEn,
          titleJa: t.titleJa,
          videoId: t.videoId,
          category: t.category,
        });
      }
    }
  }
  return results;
}

export function getAllDates(): string[] {
  if (!fs.existsSync(DAILY_DIR)) return [];
  return fs
    .readdirSync(DAILY_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
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
