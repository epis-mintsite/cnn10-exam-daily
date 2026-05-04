import Link from "next/link";
import { getDaily, getAllDates, getRelatedVideos } from "@/lib/daily";
import MarkdownContent from "@/components/MarkdownContent";
import TopicPdfDownload from "@/components/TopicPdfDownload";
import { parseVocab } from "@/lib/vocab";
import { parseTopics } from "@/lib/parseTopics";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function topicBodyMarkdown(raw: string): string {
  return raw
    .split("\n")
    .slice(1)
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

  // ── イントロ部分（最初のトピック見出しより前）
  const introLines: string[] = [];
  for (const line of entry.content.split("\n")) {
    if (/^#{2,4}\s+\d+\.\s+/.test(line)) break;
    introLines.push(line);
  }
  const introContent = introLines.join("\n").trim();

  // ── フッター（今日の学習アドバイス）
  const footerMatch = entry.content.match(/##\s+今日の学習アドバイス[\s\S]*/);
  const footerContent = footerMatch ? footerMatch[0].trim() : "";

  // ── 各トピックの関連動画を取得
  const relatedMap = new Map(
    topics.map((t) => [
      t.index,
      t.category ? getRelatedVideos(t.category, date, 4) : [],
    ])
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ナビゲーション */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm text-red-600 hover:text-red-800 font-medium">
          &larr; 最新に戻る
        </Link>
        <span className="text-sm text-gray-500">{date}</span>
      </div>

      {/* イントロ */}
      {introContent && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-5 md:px-10 mb-4">
          <MarkdownContent content={introContent} />
        </div>
      )}

      {/* トピックカード */}
      {topics.length > 0 ? (
        <div className="space-y-6">
          {topics.map((topic) => {
            const related = relatedMap.get(topic.index) ?? [];
            return (
              <article
                key={topic.index}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* カードヘッダー */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 px-6 py-4 md:px-10 bg-[#1a3a5c]">
                  <div className="min-w-0">
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

                {/* カード本文 */}
                <div className="px-6 py-5 md:px-10">
                  <MarkdownContent content={topicBodyMarkdown(topic.rawMarkdown)} />
                </div>

                {/* 関連動画 */}
                {related.length > 0 && (
                  <div className="px-6 pb-6 md:px-10">
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                        📚 同じテーマの過去動画
                      </p>
                      <ul className="space-y-2">
                        {related.map((rv) => (
                          <li key={`${rv.date}-${rv.videoId}`}>
                            <Link
                              href={`/daily/${rv.date}`}
                              className="flex items-start gap-2 group"
                            >
                              <span className="shrink-0 text-xs text-gray-400 pt-0.5 w-24">
                                {rv.date}
                              </span>
                              <span className="text-sm text-red-600 group-hover:text-red-800 group-hover:underline leading-snug">
                                {rv.titleJa || rv.titleEn}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10">
          <MarkdownContent content={entry.content} />
        </article>
      )}

      {/* 今日の学習アドバイス */}
      {footerContent && (
        <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5 md:px-10">
          <MarkdownContent content={footerContent} />
        </div>
      )}

      {/* 単語テストバナー */}
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

      {/* 前後ナビ */}
      <nav className="mt-8 flex justify-between">
        {older ? (
          <Link href={`/daily/${older}`} className="text-sm text-red-600 hover:text-red-800 font-medium">
            &larr; {older}
          </Link>
        ) : (
          <span />
        )}
        {newer ? (
          <Link href={`/daily/${newer}`} className="text-sm text-red-600 hover:text-red-800 font-medium">
            {newer} &rarr;
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
