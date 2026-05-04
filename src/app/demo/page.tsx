import Link from "next/link";
import { getDaily, getRelatedVideos } from "@/lib/daily";
import MarkdownContent from "@/components/MarkdownContent";
import { parseTopics } from "@/lib/parseTopics";

export const dynamic = "force-dynamic";

function topicBodyMarkdown(raw: string): string {
  return raw.split("\n").slice(1).join("\n").trim();
}

export default function DemoPage() {
  const entry = getDaily("demo");

  // イントロ
  const introLines: string[] = [];
  if (entry) {
    for (const line of entry.content.split("\n")) {
      if (/^#{2,4}\s+\d+\.\s+/.test(line)) break;
      introLines.push(line);
    }
  }
  const introContent = introLines.join("\n").trim();

  // トピック・フッター
  const topics = entry ? parseTopics(entry.content) : [];
  const footerMatch = entry?.content.match(/##\s+今日の学習アドバイス[\s\S]*/);
  const footerContent = footerMatch ? footerMatch[0].trim() : "";

  // 各トピックの関連動画（"demo" は日付ではないので他の日付ファイルから検索）
  const relatedMap = new Map(
    topics.map((t) => [
      t.index,
      t.category ? getRelatedVideos(t.category, "demo", 4) : [],
    ])
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* デモ告知バナー */}
      <div className="mb-6 rounded-xl bg-amber-50 border border-amber-300 px-5 py-4 flex items-start gap-3">
        <span className="text-2xl">🆕</span>
        <div>
          <p className="font-bold text-amber-800">新仕様プレビュー（デモ）</p>
          <p className="text-sm text-amber-700 mt-0.5">
            このページは新しいコンテンツ形式のデモです。日本語全訳・KEY SENTENCE・確認問題が追加されています。
          </p>
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm text-red-600 hover:text-red-800 font-medium">
          &larr; 最新に戻る
        </Link>
        <span className="text-sm text-gray-500">新仕様デモ</span>
      </div>

      {entry ? (
        <>
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
                    {/* カードヘッダー（ラベルなし） */}
                    <div className="px-6 py-4 md:px-10 bg-[#1a3a5c]">
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
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <p className="text-4xl mb-4">⏳</p>
          <p className="text-lg font-semibold text-gray-700">デモコンテンツを生成中です</p>
          <p className="text-sm text-gray-500 mt-2">しばらくしてからページを再読み込みしてください</p>
        </div>
      )}

      {/* 新仕様の説明 */}
      <div className="mt-8 bg-blue-50 rounded-xl border border-blue-200 px-6 py-5">
        <p className="font-bold text-blue-800 mb-3">📋 新仕様の変更点</p>
        <ul className="text-sm text-blue-700 space-y-1.5">
          <li>✅ <strong>動画本数</strong>：3本 → <strong>2本</strong>（1本あたりの分析を深化）</li>
          <li>✅ <strong>語彙テーブル</strong>：2列 → <strong>4列</strong>（品詞・頻出度を追加）</li>
          <li>✅ <strong>語法・関連語メモ</strong>：語彙テーブル後に派生語・コロケーション追加</li>
          <li>✅ <strong>英文サマリー</strong>：¶1/¶2/¶3 の段落構造・語数カウント付き</li>
          <li>✅ <strong>日本語全訳</strong>：新規追加（英文と対応する¶1/¶2/¶3形式）</li>
          <li>✅ <strong>KEY SENTENCE</strong>：新規追加（構文分析・入試ポイント付き）</li>
          <li>✅ <strong>確認問題</strong>：新規追加（T/F・英問英答・穴埋め）</li>
          <li>✅ <strong>関連動画リンク</strong>：新規追加（同テーマの過去動画へのリンク）</li>
        </ul>
      </div>
    </div>
  );
}
