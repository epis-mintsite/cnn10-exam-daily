"use client";

/**
 * TopicPdfDocument
 * react-pdf/renderer によるリンガメタリカ風レイアウト
 * ※ このファイルは dynamic(ssr:false) 経由でのみ読み込まれる
 */

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Link,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";
import type { TopicData } from "@/lib/parseTopics";

// ── Font Registration ────────────────────────────────────────────────────────
Font.register({
  family: "NotoSansJP",
  fonts: [
    { src: "/fonts/NotoSansJP-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/NotoSansJP-Bold.otf", fontWeight: "bold" },
  ],
});

// ── Palette ──────────────────────────────────────────────────────────────────
const NAVY = "#1a3a5c";
const NAVY_LIGHT = "#2a5080";
const AMBER = "#e07b39";
const AMBER_PALE = "#fff4ec";
const BLUE_PALE = "#eef4fb";
const GRAY_BG = "#f7f7f7";
const GRAY_LINE = "#e0e0e0";
const GRAY_ALT = "#f0f0f0";
const WHITE = "#ffffff";
const TEXT = "#1a1a1a";
const TEXT_SUB = "#555555";

// ── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    fontSize: 9,
    color: TEXT,
    backgroundColor: WHITE,
    paddingTop: 36,
    paddingBottom: 32,
    paddingHorizontal: 36,
  },

  // ── Page Header ────────────────────────────────────────────────────────────
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: NAVY,
    marginHorizontal: -36,
    marginTop: -36,
    paddingHorizontal: 36,
    paddingVertical: 7,
    marginBottom: 20,
  },
  pageHeaderLeft: {
    color: WHITE,
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  pageHeaderRight: {
    color: "#a8c8e8",
    fontSize: 7.5,
  },

  // ── Topic Band ────────────────────────────────────────────────────────────
  topicBand: {
    backgroundColor: NAVY,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 4,
  },
  topicIndex: {
    color: AMBER,
    fontSize: 7.5,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  topicTitleEn: {
    color: WHITE,
    fontSize: 12,
    fontWeight: "bold",
    lineHeight: 1.4,
    marginBottom: 2,
  },
  topicTitleJa: {
    color: "#a8c8e8",
    fontSize: 9,
    lineHeight: 1.4,
  },

  // ── Meta Row ──────────────────────────────────────────────────────────────
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    paddingTop: 5,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_LINE,
  },
  categoryBadge: {
    backgroundColor: AMBER,
    borderRadius: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  categoryText: {
    color: WHITE,
    fontSize: 7.5,
    fontWeight: "bold",
  },
  youtubeLink: {
    fontSize: 7.5,
    color: NAVY_LIGHT,
    textDecoration: "underline",
    flexShrink: 1,
  },

  // ── Section Header ────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: NAVY,
    borderRadius: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 12,
    marginBottom: 6,
  },
  sectionHeaderText: {
    color: WHITE,
    fontSize: 8.5,
    fontWeight: "bold",
    letterSpacing: 0.4,
  },
  sectionHeaderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AMBER,
    marginRight: 7,
  },

  // ── School Analysis ───────────────────────────────────────────────────────
  schoolBox: {
    backgroundColor: BLUE_PALE,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: NAVY_LIGHT,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 2,
  },
  schoolBullet: {
    flexDirection: "row",
    marginBottom: 3,
  },
  schoolBulletDot: {
    color: NAVY,
    fontWeight: "bold",
    marginRight: 5,
    fontSize: 9,
    lineHeight: 1.5,
  },
  schoolBulletText: {
    flex: 1,
    fontSize: 8,
    color: TEXT,
    lineHeight: 1.5,
  },

  // ── Vocabulary ────────────────────────────────────────────────────────────
  vocabTable: {
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: GRAY_LINE,
  },
  vocabHeader: {
    flexDirection: "row",
    backgroundColor: NAVY,
  },
  vocabHeaderCellEn: {
    width: "40%",
    paddingHorizontal: 8,
    paddingVertical: 5,
    color: WHITE,
    fontSize: 7.5,
    fontWeight: "bold",
  },
  vocabHeaderCellJa: {
    width: "60%",
    paddingHorizontal: 8,
    paddingVertical: 5,
    color: WHITE,
    fontSize: 7.5,
    fontWeight: "bold",
    borderLeftWidth: 1,
    borderLeftColor: NAVY_LIGHT,
  },
  vocabRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: GRAY_LINE,
  },
  vocabRowAlt: {
    backgroundColor: GRAY_ALT,
  },
  vocabCellEn: {
    width: "40%",
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 8,
    fontWeight: "bold",
    color: NAVY,
    lineHeight: 1.4,
  },
  vocabCellJa: {
    width: "60%",
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 8,
    color: TEXT,
    lineHeight: 1.4,
    borderLeftWidth: 1,
    borderLeftColor: GRAY_LINE,
  },

  // ── Summary (READING) ─────────────────────────────────────────────────────
  summaryBox: {
    backgroundColor: GRAY_BG,
    borderRadius: 4,
    padding: 12,
  },
  summaryText: {
    fontSize: 8.5,
    lineHeight: 1.7,
    color: TEXT,
    textAlign: "justify",
  },

  // ── Background ────────────────────────────────────────────────────────────
  bgBox: {
    backgroundColor: AMBER_PALE,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: AMBER,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  bgBullet: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bgBulletDot: {
    color: AMBER,
    fontWeight: "bold",
    marginRight: 5,
    fontSize: 10,
    lineHeight: 1.3,
  },
  bgBulletText: {
    flex: 1,
    fontSize: 8,
    color: TEXT,
    lineHeight: 1.5,
  },

  // ── Separator ─────────────────────────────────────────────────────────────
  separator: {
    borderBottomWidth: 1.5,
    borderBottomColor: GRAY_LINE,
    marginVertical: 18,
  },

  // ── Page Footer ────────────────────────────────────────────────────────────
  pageFooter: {
    position: "absolute",
    bottom: 14,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: GRAY_LINE,
    paddingTop: 5,
  },
  pageFooterText: {
    fontSize: 7,
    color: TEXT_SUB,
  },
  pageFooterBrand: {
    fontSize: 7,
    color: AMBER,
    fontWeight: "bold",
  },
});

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <View style={S.sectionHeader}>
      <View style={S.sectionHeaderDot} />
      <Text style={S.sectionHeaderText}>{label}</Text>
    </View>
  );
}

function PageHeaderFooter({
  date,
  pageNumber,
  totalPages,
}: {
  date: string;
  pageNumber: number;
  totalPages: number;
}) {
  return (
    <>
      {/* Header */}
      <View style={S.pageHeader} fixed>
        <Text style={S.pageHeaderLeft}>CNN10 入試英語長文対策</Text>
        <Text style={S.pageHeaderRight}>{date}</Text>
      </View>
      {/* Footer */}
      <View style={S.pageFooter} fixed>
        <Text style={S.pageFooterBrand}>CNN10 × 入試英語</Text>
        <Text style={S.pageFooterText}>
          {pageNumber} / {totalPages}
        </Text>
      </View>
    </>
  );
}

// ── Topic Section ─────────────────────────────────────────────────────────

function TopicSection({ topic }: { topic: TopicData }) {
  return (
    <View>
      {/* ── Topic band */}
      <View style={S.topicBand}>
        <Text style={S.topicIndex}>TOPIC {topic.index}</Text>
        <Text style={S.topicTitleEn}>{topic.titleEn}</Text>
        {topic.titleJa ? (
          <Text style={S.topicTitleJa}>{topic.titleJa}</Text>
        ) : null}
      </View>

      {/* ── Meta row: category + URL */}
      <View style={S.metaRow}>
        {topic.category ? (
          <View style={S.categoryBadge}>
            <Text style={S.categoryText}>{topic.category}</Text>
          </View>
        ) : null}
        {topic.youtubeUrl ? (
          <Link src={topic.youtubeUrl} style={S.youtubeLink}>
            ▶ {topic.youtubeUrl}
          </Link>
        ) : null}
      </View>

      {/* ── School analysis */}
      {topic.schoolAnalysis.length > 0 && (
        <>
          <SectionHeader label="出題されやすい学校群" />
          <View style={S.schoolBox}>
            {topic.schoolAnalysis.map((line, i) => (
              <View key={i} style={S.schoolBullet}>
                <Text style={S.schoolBulletDot}>▸</Text>
                <Text style={S.schoolBulletText}>{line}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* ── Vocabulary table */}
      {topic.vocabulary.length > 0 && (
        <>
          <SectionHeader label="重要英単語・英語表現" />
          <View style={S.vocabTable}>
            {/* header */}
            <View style={S.vocabHeader}>
              <Text style={S.vocabHeaderCellEn}>英語</Text>
              <Text style={S.vocabHeaderCellJa}>意味</Text>
            </View>
            {/* rows */}
            {topic.vocabulary.map((v, i) => (
              <View
                key={i}
                style={[S.vocabRow, i % 2 === 1 ? S.vocabRowAlt : {}]}
                wrap={false}
              >
                <Text style={S.vocabCellEn}>{v.en}</Text>
                <Text style={S.vocabCellJa}>{v.ja}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* ── English summary (READING) */}
      {topic.summary && (
        <>
          <SectionHeader label="英文サマリー (READING)" />
          <View style={S.summaryBox}>
            <Text style={S.summaryText}>{topic.summary}</Text>
          </View>
        </>
      )}

      {/* ── Background knowledge */}
      {topic.background.length > 0 && (
        <>
          <SectionHeader label="背景知識（教養知識）" />
          <View style={S.bgBox}>
            {topic.background.map((line, i) => (
              <View key={i} style={S.bgBullet} wrap={false}>
                <Text style={S.bgBulletDot}>◆</Text>
                <Text style={S.bgBulletText}>{line}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

// ── Main Document ─────────────────────────────────────────────────────────

interface Props {
  topic: TopicData;
  date: string;
}

export default function TopicPdfDocument({ topic, date }: Props) {
  return (
    <Document
      title={`CNN10 入試英語 ${date} TOPIC${topic.index}`}
      author="CNN10 入試英語長文対策"
      subject={topic.titleEn}
      language="ja"
    >
      <Page size="A4" style={S.page}>
        {/* Fixed header and footer render on every page automatically */}
        <View
          style={S.pageHeader}
          fixed
          render={() => (
            <>
              <Text style={S.pageHeaderLeft}>CNN10 入試英語長文対策</Text>
              <Text style={S.pageHeaderRight}>{date}</Text>
            </>
          )}
        />

        <TopicSection topic={topic} />

        <View
          style={S.pageFooter}
          fixed
          render={({ pageNumber }) => (
            <>
              <Text style={S.pageFooterBrand}>CNN10 × 入試英語</Text>
              <Text style={S.pageFooterText}>p. {pageNumber}</Text>
            </>
          )}
        />
      </Page>
    </Document>
  );
}
