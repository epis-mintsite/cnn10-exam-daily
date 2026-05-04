"use client";

/**
 * PdfButtonInner
 * ブラウザ専用：PDFDownloadLink を使ってダウンロードボタンを描画する。
 * このファイルは dynamic(ssr:false) 経由でのみインポートされる。
 */

import React, { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import TopicPdfDocument from "./TopicPdfDocument";
import type { TopicData } from "@/lib/parseTopics";

interface Props {
  topic: TopicData;
  date: string;
}

export default function PdfButtonInner({ topic, date }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await pdf(
        <TopicPdfDocument topic={topic} date={date} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cnn10-${date}-topic${topic.index}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("PDF の生成に失敗しました。再度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`
        inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold
        transition-all duration-200 select-none
        ${
          loading
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-navy text-white hover:bg-navy-dark shadow-sm hover:shadow-md active:scale-95"
        }
      `}
      style={
        loading
          ? {}
          : { backgroundColor: "#1a3a5c", color: "#fff" }
      }
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <span>PDF 生成中…</span>
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <span>PDF ダウンロード</span>
        </>
      )}
    </button>
  );
}
