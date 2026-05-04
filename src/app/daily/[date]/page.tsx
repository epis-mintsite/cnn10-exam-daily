import Link from "next/link";
import { getDaily, getAllDates } from "@/lib/daily";
import MarkdownContent from "@/components/MarkdownContent";
import TopicPdfDownload from "@/components/TopicPdfDownload";
import { parseVocab } from "@/lib/vocab";
import { parseTopics } from "@/lib/parseTopics";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * トピック番号の h3 見出し行を除いてトピック本文だけを返す。
 * PDF ダウンロードボタンの下に MarkdownContent で描画するため。
 */
function topicBodyMarkdown(raw: string): string {
  return raw
    .split("\n")
    .slice(1) // first line is the ### heading (rendered as card title instead)
    .join("\n")
    .trim();
}

export default async function DailyPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const entry = getDaily(date);
  if (!entry) notFound();

  const dates = getAllDates();
  const idx = dates.indexOf(date);
  const newer = idx > 0 ? dates[idx - 1] : null;
  const older = idx < dates.length - 1 ? dates[idx + 1] : null;

  const wordCount = parseVocab(entry.content).length;
  const topics = parseTopics(entry.content);

  // ── ページ全体のイントロ部分（最初の ### 見出しより前）を抽出
  const introLines: string[] = [];
  for (const line of entry.content.split("\n")) {
    if (/^#{2,4}\s+\d+\.\s+/.test(line)) break;
    introLines.push(line);
  }
  const introContent = introLines.join("\n").trim();

  // ── フッター（今日の学習アドバイス）を抽出
  const footerMatch = entry.content.match(/##\s+今日の学習アドバイス[\s\S]*/);
  const footerContent = footerMatch ? footerMatch[0].trim() : "";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ── ナビゲーション */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          &larr; 最新に戻る
        </Link>
        <span className="text-sm text-gray-500">{date}</span>
      </div>

      {/* ── イントロ（タイトル・サブタイトル） */}
      {introContent && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-5 md:px-10 mb-4">
          <MarkdownContent content={introContent} />
        </div>
      )}

      {/* ── トピックカード × 3（PDF ボタン付き） */}
      {topics.length > 0 ? (
        <div className="space-y-6">
          {topics.map((topic) => (
            <article
              key={topic.index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* カードヘッダー */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 px-6 py-4 md:px-10 bg-[#1a3a5c]">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-amber-400 tracking-widest mb-1">
                    📺 動画 {topic.index} / {topics.length}
                  </p>
                  <h2 className="text-base md:text-lg font-bold text-white leading-snug">
                    {topic.titleEn}
                  </h2>
                  {topic.titleJa && (
                    <p className="text-sm text-blue-200 mt-0.5 leading-snug">
                      {topic.titleJa}
                    </p>
                  )}
                  {topic.category && (
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500 text-white">
                      {topic.category}
                    </span>
                  )}
                </div>

                {/* PDF ダウンロードボタン */}
                <div className="shrink-0 pt-0.5">
                  <TopicPdfDownload topic={topic} date={date} />
                </div>
              </div>

              {/* YouTube 動画プレーヤー */}
              {topic.videoId && (
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${topic.videoId}`}
                    title={topic.titleEn}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              )}

              {/* カード本文（マークダウン） */}
              <div className="px-6 py-5 md:px-10">
                <MarkdownContent content={topicBodyMarkdown(topic.rawMarkdown)} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* トピックが解析できない場合は旧来のレンダリングにフォールバック */
        <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10">
          <MarkdownContent content={entry.content} />
        </article>
      )}

      {/* ── 今日の学習アドバイス */}
      {footerContent && (
        <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5 md:px-10">
          <MarkdownContent content={footerContent} />
        </div>
      )}

      {/* ── 単語テストバナー */}
      {wordCount > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-800">📝 今日の単語テスト</p>
            <p className="text-sm text-gray-500 mt-0.5">
              本日の重要英単語 {wordCount} 語をフラッシュカードで練習しましょう
            </p>
          </div>
          <Link
            href={`/word-tests/${date}`}
            className="shrink-0 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            単語テストを始める →
          </Link>
        </div>
      )}

      {/* ── 前後ナビ */}
      <nav className="mt-8 flex justify-between">
        {older ? (
          <Link
            href={`/daily/${older}`}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            &larr; {older}
          </Link>
        ) : (
          <span />
        )}
        {newer ? (
          <Link
            href={`/daily/${newer}`}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            {newer} &rarr;
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
