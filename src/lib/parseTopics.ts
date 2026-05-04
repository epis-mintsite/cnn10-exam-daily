// ── Types ────────────────────────────────────────────────────────────────────

export interface VocabEntry {
  en: string;
  pos: string;   // n. / v. / adj. / adv. / phr.
  ja: string;
  stars: string; // "⭐⭐" | "⭐" | ""
}

export interface KeySentence {
  sentence: string;
  analysis: string; // [ 構文分析 ] block
  point: string;    // [ 入試ポイント ] block
}

/** ¶ numbered paragraph */
export interface Para {
  num: number;   // 1, 2, 3 …
  text: string;
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
  vocabNotes: string[];    // 語法・関連語メモ bullets
  summaryParas: Para[];    // ¶1 ¶2 ¶3 English
  summaryWordCount: number;
  translationParas: Para[]; // ¶1 ¶2 ¶3 Japanese
  keysentence: KeySentence | null;
  checkQuestions: string[]; // Q1, Q2, Q3 raw lines
  background: string[];     // flat bullets (labels stripped for PDF)
  backgroundRaw: string;    // full background text for web display
  frequencyStars: string;   // "★★★☆☆" etc.
  rawMarkdown: string;      // full topic section for web MarkdownContent
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Find the line index that contains a bold field label matching `fieldName`.
 * e.g. **英文サマリー**: or **KEY SENTENCE** 🔍:
 */
function findFieldLine(lines: string[], fieldName: RegExp, from = 0): number {
  return lines.findIndex((l, i) => i >= from && fieldName.test(l));
}

/**
 * Collect content lines after a field label until the next bold field or end.
 */
function collectUntilNextField(lines: string[], startIdx: number): string[] {
  const result: string[] = [];
  for (let i = startIdx; i < lines.length; i++) {
    if (/^\*\*[^*]+\*\*/.test(lines[i].trim())) break;
    result.push(lines[i]);
  }
  return result;
}

/** Parse bullet list lines (strip leading - or *) */
function parseBullets(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("-") || l.startsWith("*"))
    .map((l) => l.replace(/^[-*]\s+/, "").trim())
    .filter(Boolean);
}

/** Parse GFM table rows into VocabEntry objects (supports 2 or 4 columns) */
function parseVocabTable(lines: string[]): VocabEntry[] {
  const rows: VocabEntry[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t.startsWith("|") || /^[|\s:-]+$/.test(t)) continue;
    const cells = t
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 2) continue;
    // Skip header rows
    if (/^(英語|単語|Word)$/i.test(cells[0])) continue;

    if (cells.length >= 4) {
      // New format: 英語 | 品詞 | 日本語訳 | 頻出度
      rows.push({
        en: cells[0],
        pos: cells[1],
        ja: cells[2],
        stars: cells[3].replace(/[^⭐★]/g, ""),
      });
    } else {
      // Legacy format: 英語 | 意味
      rows.push({ en: cells[0], pos: "", ja: cells[1], stars: "" });
    }
  }
  return rows;
}

/** Parse ¶-prefixed paragraphs */
function parseParas(text: string): Para[] {
  const paras: Para[] = [];
  // Match lines starting with ¶N
  const lines = text.split("\n");
  let currentNum = 0;
  let currentLines: string[] = [];

  const flush = () => {
    if (currentNum > 0 && currentLines.length > 0) {
      paras.push({ num: currentNum, text: currentLines.join(" ").trim() });
    }
  };

  for (const raw of lines) {
    const m = raw.match(/^¶(\d+)\s*(.*)/);
    if (m) {
      flush();
      currentNum = parseInt(m[1], 10);
      currentLines = m[2].trim() ? [m[2].trim()] : [];
    } else if (currentNum > 0) {
      const t = raw.trim();
      if (t && !t.startsWith("(") && !/^\d+\s+word/.test(t)) {
        currentLines.push(t);
      }
    }
  }
  flush();

  return paras;
}

/** Extract word count from "(XXX words)" line */
function parseWordCount(text: string): number {
  const m = text.match(/\((\d+)\s*words?\)/i);
  return m ? parseInt(m[1], 10) : 0;
}

/** Parse KEY SENTENCE section into structured object */
function parseKeySentence(lines: string[]): KeySentence | null {
  // Sentence: first blockquote line
  const quoteLine = lines.find((l) => l.trim().startsWith(">"));
  if (!quoteLine) return null;
  const sentence = quoteLine.trim().replace(/^>\s*[""]?/, "").replace(/[""]?\s*$/, "");

  // [ 構文分析 ] block
  const analysisStart = lines.findIndex((l) => /構文分析/.test(l));
  const pointStart = lines.findIndex((l) => /入試ポイント/.test(l));
  const analysisLines =
    analysisStart !== -1
      ? lines
          .slice(analysisStart + 1, pointStart !== -1 ? pointStart : undefined)
          .map((l) => l.trim())
          .filter(Boolean)
      : [];

  // [ 入試ポイント ] block
  const pointLines =
    pointStart !== -1
      ? lines
          .slice(pointStart + 1)
          .map((l) => l.trim())
          .filter(Boolean)
      : [];

  return {
    sentence,
    analysis: analysisLines.join("\n"),
    point: pointLines.join("\n"),
  };
}

/** Parse CHECK questions – returns [Q1 raw, Q2 raw, Q3 raw] */
function parseCheckQuestions(text: string): string[] {
  const qs: string[] = [];
  const lines = text.split("\n");
  let current: string[] = [];

  const flush = () => {
    const s = current.join(" ").trim();
    if (s) qs.push(s);
    current = [];
  };

  for (const line of lines) {
    const t = line.trim();
    if (/^\*\*Q\d+\.\*\*/.test(t) || /^Q\d+\./.test(t)) {
      flush();
      current.push(t.replace(/^\*\*/, "").replace(/\*\*/, ""));
    } else if (current.length > 0 && t) {
      current.push(t);
    }
  }
  flush();
  return qs.slice(0, 3);
}

// ── Main Parser ───────────────────────────────────────────────────────────────

export function parseTopics(content: string): TopicData[] {
  const lines = content.split("\n");

  // Find topic headings: ### 1. / ### 2. etc.
  const topicStarts: number[] = [];
  lines.forEach((line, i) => {
    if (/^#{2,4}\s+\d+\.\s+/.test(line)) topicStarts.push(i);
  });
  if (topicStarts.length === 0) return [];

  const topics: TopicData[] = [];

  topicStarts.forEach((startLine, ti) => {
    const endLine =
      ti + 1 < topicStarts.length ? topicStarts[ti + 1] : lines.length;
    const tl = lines.slice(startLine, endLine);     // topic lines
    const rawMarkdown = tl.join("\n");

    // ── Title ──────────────────────────────────────────────────────────────
    const titleMatch = tl[0].match(/^#{2,4}\s+\d+\.\s+\[(.+?)\]\((.+?)\)/);
    let titleEn = "", titleJa = "", youtubeUrl = "", videoId = "";
    if (titleMatch) {
      const full = titleMatch[1];
      youtubeUrl = titleMatch[2];
      const vM = youtubeUrl.match(/[?&]v=([A-Za-z0-9_-]{11})/);
      videoId = vM ? vM[1] : "";
      const dashIdx = full.search(/\s[—–-]\s/);
      if (dashIdx !== -1) {
        titleEn = full.slice(0, dashIdx).trim();
        titleJa = full.slice(dashIdx).replace(/^[\s—–-]+/, "").trim();
      } else {
        titleEn = full;
      }
    } else {
      titleEn = tl[0].replace(/^#{2,4}\s+\d+\.\s+/, "").trim();
    }

    // ── Category ───────────────────────────────────────────────────────────
    const catIdx = findFieldLine(tl, /\*\*入試テーマカテゴリ/);
    const category =
      catIdx !== -1
        ? tl[catIdx].replace(/.*\*\*入試テーマカテゴリ.*?\*\*\s*:?\s*/, "").trim()
        : "";

    // ── School analysis ────────────────────────────────────────────────────
    const schoolIdx = findFieldLine(tl, /\*\*出題されやすい学校群/);
    const schoolLines =
      schoolIdx !== -1 ? collectUntilNextField(tl, schoolIdx + 1) : [];
    const schoolAnalysis = parseBullets(schoolLines.join("\n"));

    // ── Vocabulary ─────────────────────────────────────────────────────────
    const vocabIdx = findFieldLine(tl, /\*\*重要英単語/);
    const vocabLines =
      vocabIdx !== -1 ? collectUntilNextField(tl, vocabIdx + 1) : [];
    const vocabulary = parseVocabTable(vocabLines);

    // ── Vocab notes (語法・関連語メモ) ────────────────────────────────────
    const vocabNoteIdx = findFieldLine(tl, /\*\*語法・関連語メモ/);
    const vocabNoteLines =
      vocabNoteIdx !== -1 ? collectUntilNextField(tl, vocabNoteIdx + 1) : [];
    const vocabNotes = parseBullets(vocabNoteLines.join("\n"));

    // ── English summary ────────────────────────────────────────────────────
    const summaryIdx = findFieldLine(tl, /\*\*英文サマリー/);
    const summaryLines =
      summaryIdx !== -1 ? collectUntilNextField(tl, summaryIdx + 1) : [];
    const summaryText = summaryLines.join("\n");
    const summaryParas = parseParas(summaryText);
    const summaryWordCount = parseWordCount(summaryText);

    // ── Japanese translation ───────────────────────────────────────────────
    const transIdx = findFieldLine(tl, /\*\*日本語全訳/);
    const transLines =
      transIdx !== -1 ? collectUntilNextField(tl, transIdx + 1) : [];
    const translationParas = parseParas(transLines.join("\n"));

    // ── KEY SENTENCE ───────────────────────────────────────────────────────
    const ksIdx = findFieldLine(tl, /\*\*KEY SENTENCE/);
    const ksLines =
      ksIdx !== -1 ? collectUntilNextField(tl, ksIdx + 1) : [];
    const keysentence = ksLines.length > 0 ? parseKeySentence(ksLines) : null;

    // ── CHECK questions ────────────────────────────────────────────────────
    const checkIdx = findFieldLine(tl, /\*\*確認問題/);
    const checkLines =
      checkIdx !== -1 ? collectUntilNextField(tl, checkIdx + 1) : [];
    const checkQuestions = parseCheckQuestions(checkLines.join("\n"));

    // ── Background ─────────────────────────────────────────────────────────
    const bgIdx = findFieldLine(tl, /\*\*背景知識/);
    const bgLines =
      bgIdx !== -1 ? collectUntilNextField(tl, bgIdx + 1) : [];
    const bgText = bgLines.join("\n");

    // Flat bullets (strip [ラベル] headers for PDF)
    const background = bgText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => (l.startsWith("-") || l.startsWith("*")) && !/^\s*\[/.test(l))
      .map((l) => l.replace(/^[-*]\s+/, "").trim())
      .filter(Boolean);

    // Frequency stars
    const starsMatch = bgText.match(/📌\s*入試頻出度\s*[:：]\s*([★☆]+)/);
    const frequencyStars = starsMatch ? starsMatch[1] : "";

    topics.push({
      index: ti + 1,
      titleEn,
      titleJa,
      youtubeUrl,
      videoId,
      category,
      schoolAnalysis,
      vocabulary,
      vocabNotes,
      summaryParas,
      summaryWordCount,
      translationParas,
      keysentence,
      checkQuestions,
      background,
      backgroundRaw: bgText,
      frequencyStars,
      rawMarkdown,
    });
  });

  return topics;
}
