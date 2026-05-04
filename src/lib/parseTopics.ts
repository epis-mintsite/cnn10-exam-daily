export interface VocabEntry {
  en: string;
  ja: string;
}

export interface TopicData {
  index: number;
  titleEn: string;
  titleJa: string;
  youtubeUrl: string;
  videoId: string;
  category: string;
  schoolAnalysis: string[];
  vocabulary: VocabEntry[];
  summary: string;
  background: string[];
  rawMarkdown: string; // full topic section for web rendering
}

/**
 * Extract a field value that follows a bold label like "**フィールド名**:"
 * Returns everything until the next "**" bold label or end of section.
 */
function extractField(
  lines: string[],
  startIdx: number,
  fieldName: string
): { value: string; endIdx: number } | null {
  const trigger = new RegExp(`\\*\\*${fieldName}.*?\\*\\*\\s*:?\\s*`);
  const idx = lines.findIndex((l, i) => i >= startIdx && trigger.test(l));
  if (idx === -1) return null;

  // Collect lines until the next bold field or end
  const result: string[] = [];
  // Content on the same line after the label
  const sameLine = lines[idx].replace(trigger, "").trim();
  if (sameLine) result.push(sameLine);

  let i = idx + 1;
  while (i < lines.length) {
    const line = lines[i];
    if (/^\*\*[^*]+\*\*/.test(line)) break; // next field
    result.push(line);
    i++;
  }

  return { value: result.join("\n").trim(), endIdx: i };
}

/** Parse a GFM table into rows of { en, ja } */
function parseVocabTable(text: string): VocabEntry[] {
  const rows: VocabEntry[] = [];
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t.startsWith("|") || /^[|\s-]+$/.test(t)) continue;
    const cells = t
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 2) continue;
    const [en, ja] = cells;
    // Skip header row
    if (en === "英語" || en === "単語" || en === "Word") continue;
    rows.push({ en, ja });
  }
  return rows;
}

/** Extract bullet list lines (strip leading "- " or "* ") */
function parseBullets(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("-") || l.startsWith("*"))
    .map((l) => l.replace(/^[-*]\s+/, "").trim())
    .filter(Boolean);
}

/**
 * Parse the full daily markdown content into individual TopicData objects.
 * Topics are delimited by "### N." headings.
 */
export function parseTopics(content: string): TopicData[] {
  const lines = content.split("\n");

  // Find topic start lines: "### 1." "### 2." etc.
  const topicStarts: number[] = [];
  lines.forEach((line, i) => {
    if (/^#{2,4}\s+\d+\.\s+/.test(line)) topicStarts.push(i);
  });

  if (topicStarts.length === 0) return [];

  const topics: TopicData[] = [];

  topicStarts.forEach((startLine, ti) => {
    const endLine =
      ti + 1 < topicStarts.length ? topicStarts[ti + 1] : lines.length;
    const topicLines = lines.slice(startLine, endLine);
    const rawMarkdown = topicLines.join("\n");

    // ── Title line ─────────────────────────────────────────────────────────
    const titleLine = topicLines[0];
    // Matches: ### 1. [English Title — 日本語タイトル](URL)
    const titleMatch = titleLine.match(
      /^#{2,4}\s+\d+\.\s+\[(.+?)\]\((.+?)\)/
    );
    let titleEn = "";
    let titleJa = "";
    let youtubeUrl = "";
    let videoId = "";

    if (titleMatch) {
      const fullTitle = titleMatch[1];
      youtubeUrl = titleMatch[2];
      const vMatch = youtubeUrl.match(/[?&]v=([A-Za-z0-9_-]{11})/);
      videoId = vMatch ? vMatch[1] : "";

      // Split "English — Japanese" on various dash styles
      const dashIdx = fullTitle.search(/\s[—–-]\s/);
      if (dashIdx !== -1) {
        titleEn = fullTitle.slice(0, dashIdx).trim();
        titleJa = fullTitle.slice(dashIdx).replace(/^[\s—–-]+/, "").trim();
      } else {
        titleEn = fullTitle;
      }
    } else {
      // Fallback: strip markdown heading syntax
      titleEn = titleLine.replace(/^#{2,4}\s+\d+\.\s+/, "").trim();
    }

    // ── Category ───────────────────────────────────────────────────────────
    const categoryResult = extractField(topicLines, 1, "入試テーマカテゴリ");
    const category = categoryResult?.value ?? "";

    // ── School analysis ────────────────────────────────────────────────────
    const schoolResult = extractField(topicLines, 1, "出題されやすい学校群");
    const schoolAnalysis = schoolResult
      ? parseBullets(schoolResult.value)
      : [];

    // ── Vocabulary ─────────────────────────────────────────────────────────
    const vocabResult = extractField(
      topicLines,
      1,
      "重要英単語・英語表現"
    );
    const vocabulary = vocabResult ? parseVocabTable(vocabResult.value) : [];

    // ── Summary ────────────────────────────────────────────────────────────
    const summaryResult = extractField(topicLines, 1, "英文サマリー");
    const summary = summaryResult?.value ?? "";

    // ── Background ─────────────────────────────────────────────────────────
    const bgResult = extractField(topicLines, 1, "背景知識");
    const background = bgResult ? parseBullets(bgResult.value) : [];

    topics.push({
      index: ti + 1,
      titleEn,
      titleJa,
      youtubeUrl,
      videoId,
      category,
      schoolAnalysis,
      vocabulary,
      summary,
      background,
      rawMarkdown,
    });
  });

  return topics;
}
