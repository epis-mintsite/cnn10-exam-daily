import Link from "next/link";
import { getLatestDaily, getAllDates } from "@/lib/daily";
import MarkdownContent from "@/components/MarkdownContent";

export const dynamic = "force-dynamic";

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          LATEST
        </span>
        <span className="text-sm text-gray-500">{latest.date}</span>
      </div>

      <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10">
        <MarkdownContent content={latest.content} />
      </article>

      {dates.length > 1 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            過去の配信
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {dates.slice(1, 7).map((date) => (
              <Link
                key={date}
                href={`/daily/${date}`}
                className="block bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-red-400 hover:shadow-md transition-all"
              >
                <span className="text-sm font-medium text-gray-800">
                  {date}
                </span>
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
