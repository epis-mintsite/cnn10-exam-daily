import Link from "next/link";
import { getLatestDaily, getAllDates, getRelatedVideos } from "@/lib/daily";
import MarkdownContent from "@/components/MarkdownContent";
import TopicPdfDownload from "@/components/TopicPdfDownload";
import { parseTopics } from "@/lib/parseTopics";

export const dynamic = "force-dynamic";

function topicBodyMarkdown(raw: string): string {
  return raw.split("\n").slice(1).join("\n").trim();
}

export default function Home() {
  const latest = getLatestDaily();
  const dates = getAllDates();

  if (!latest) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg">
          まだ配信データがありません。毎朝7時に自動更新されます。
        </p>
      </div>
    );
  }

  const topics = parseTopics(latest.content);

  // イントロ
  const introLines: string[] = [];
  for (const line of latest.content.split("\n")) {
    if (/^#{2,3}\s+\d+\.\s+/.test(line)) break;
    introLines.push(line);
  }
  const introContent = introLines.join("\n").trim();

  // フッター
  const footerMatch = latest.content.match(/##\s+今日の学習アドバイス[\s\S]*/);
  const footerContent = footerMatch ? footerMatch[0].trim() : "";

  // 関連動画
  const relatedMap = new Map(
    topics.map((t) => [
      t.index,
      t.category ? getRelatedVideos(t.category, latest.date, 4) : [],
    ])
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ナビゲーション */}
      <div className="mb-6 flex items-center justify-between">
        <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          LATEST
        </span>
        <span className="text-sm text-gray-500">{latest.date}</span>
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
                  <div className="shrink-0 pt-0.5">
                    <TopicPdfDownload topic={topic} date={latest.date} />
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
          <MarkdownContent content={latest.content} />
        </article>
      )}

      {/* 今日の学習アドバイス */}
      {footerContent && (
        <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5 md:px-10">
          <MarkdownContent content={footerContent} />
        </div>
      )}

      {/* 過去の配信 */}
      {dates.length > 1 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4">過去の配信</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {dates.slice(1, 7).map((date) => (
              <Link
                key={date}
                href={`/daily/${date}`}
                className="block bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-red-400 hover:shadow-md transition-all"
              >
                <span className="text-sm font-medium text-gray-800">{date}</span>
              </Link>
            ))}
          </div>
          {dates.length > 7 && (
            <Link
              href="/archive"
              className="inline-block mt-4 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              すべてのバックナンバーを見る &rarr;
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
