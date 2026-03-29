import Link from "next/link";
import { getDaily, getAllDates } from "@/lib/daily";
import MarkdownContent from "@/components/MarkdownContent";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          &larr; 最新に戻る
        </Link>
        <span className="text-sm text-gray-500">{date}</span>
      </div>

      <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10">
        <MarkdownContent content={entry.content} />
      </article>

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
