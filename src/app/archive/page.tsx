import Link from "next/link";
import { getAllDates, getDaily } from "@/lib/daily";

export const dynamic = "force-dynamic";

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : "";
}

export default function ArchivePage() {
  const dates = getAllDates();

  if (dates.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg">
          まだ配信データがありません。
        </p>
      </div>
    );
  }

  const byMonth: Record<string, string[]> = {};
  for (const date of dates) {
    const month = date.slice(0, 7);
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(date);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        バックナンバー
      </h1>

      {Object.entries(byMonth).map(([month, monthDates]) => (
        <section key={month} className="mb-10">
          <h2 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">
            {month}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {monthDates.map((date) => {
              const entry = getDaily(date);
              const title = entry ? extractTitle(entry.content) : date;
              return (
                <Link
                  key={date}
                  href={`/daily/${date}`}
                  className="block bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-red-400 hover:shadow-md transition-all"
                >
                  <span className="block text-sm font-bold text-gray-800">
                    {date}
                  </span>
                  <span className="block text-xs text-gray-500 mt-1 truncate">
                    {title}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
