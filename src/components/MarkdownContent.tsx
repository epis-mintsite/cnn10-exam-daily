"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold text-gray-900 mb-2 md:text-3xl">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold text-gray-800 mt-10 mb-4 border-b-2 border-red-500 pb-2 md:text-2xl">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-bold text-gray-800 mt-6 mb-3 md:text-xl">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="text-gray-700 leading-relaxed mb-3">{children}</p>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 underline hover:text-red-800"
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-red-400 bg-red-50 pl-4 py-2 my-4 text-sm text-gray-600 rounded-r">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="w-full border-collapse text-sm">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-gray-800 text-white">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2 text-left font-semibold">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 border-b border-gray-200">{children}</td>
        ),
        tr: ({ children }) => (
          <tr className="even:bg-gray-50 hover:bg-red-50 transition-colors">
            {children}
          </tr>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-5 mb-3 space-y-1 text-gray-700">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 mb-3 space-y-1 text-gray-700">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        strong: ({ children }) => (
          <strong className="font-bold text-gray-900">{children}</strong>
        ),
        hr: () => <hr className="my-8 border-gray-200" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
