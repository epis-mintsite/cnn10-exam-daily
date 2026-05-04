"use client";

/**
 * TopicPdfDownload
 * PDF ダウンロードボタン。
 * react-pdf は SSR 非対応のため dynamic(ssr:false) 経由でのみ読み込む。
 */

import dynamic from "next/dynamic";
import type { TopicData } from "@/lib/parseTopics";

// PDFDownloadLink をラップした内部コンポーネントをブラウザ専用で読み込む
const PdfButtonInner = dynamic(() => import("./PdfButtonInner"), {
  ssr: false,
  loading: () => (
    <button
      disabled
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg
                 bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed"
    >
      <span>📄</span>
      <span>PDF 準備中…</span>
    </button>
  ),
});

interface Props {
  topic: TopicData;
  date: string;
}

export default function TopicPdfDownload({ topic, date }: Props) {
  return <PdfButtonInner topic={topic} date={date} />;
}
