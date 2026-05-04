"use client";

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
import type { TopicData, Para } from "@/lib/parseTopics";

// ── Fonts ─────────────────────────────────────────────────────────────────────
Font.register({
  family: "NotoSansJP",
  fonts: [
    { src: "/fonts/NotoSansJP-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/NotoSansJP-Bold.otf", fontWeight: "bold" },
  ],
});

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  navy:      "#1a3a5c",
  navyLight: "#2a5080",
  navyPale:  "#eef4fb",
  amber:     "#e07b39",
  amberPale: "#fff4ec",
  green:     "#2e7d52",
  greenPale: "#edf7f1",
  grayBg:    "#f7f7f7",
  grayLine:  "#e0e0e0",
  grayAlt:   "#f0f0f0",
  white:     "#ffffff",
  text:      "#1a1a1a",
  textSub:   "#555555",
};

// ── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    fontSize: 8.5,
    color: C.text,
    backgroundColor: C.white,
    paddingTop: 42,
    paddingBottom: 30,
    paddingHorizontal: 34,
  },

  // Page header (fixed)
  pageHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.navy,
    paddingHorizontal: 34,
    paddingVertical: 7,
  },
  pageHeaderL: { color: C.white, fontSize: 7.5, fontWeight: "bold", letterSpacing: 0.4 },
  pageHeaderR: { color: "#a8c8e8", fontSize: 7 },

  // Page footer (fixed)
  pageFooter: {
    position: "absolute",
    bottom: 10,
    left: 34,
    right: 34,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: C.grayLine,
    paddingTop: 4,
  },
  pageFooterBrand: { fontSize: 6.5, color: C.amber, fontWeight: "bold" },
  pageFooterPage:  { fontSize: 6.5, color: C.textSub },

  // ── Section header band ────────────────────────────────────────────────────
  secHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.navy,
    borderRadius: 3,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginTop: 10,
    marginBottom: 5,
  },
  secHeaderDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.amber, marginRight: 6 },
  secHeaderText: { color: C.white, fontSize: 8, fontWeight: "bold", letterSpacing: 0.3 },

  // ── Topic band ─────────────────────────────────────────────────────────────
  topicBand: {
    backgroundColor: C.navy,
    borderRadius: 4,
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginBottom: 4,
  },
  topicIdx:     { color: C.amber, fontSize: 7, fontWeight: "bold", letterSpacing: 1, marginBottom: 2 },
  topicTitleEn: { color: C.white, fontSize: 11.5, fontWeight: "bold", lineHeight: 1.4, marginBottom: 2 },
  topicTitleJa: { color: "#a8c8e8", fontSize: 8.5, lineHeight: 1.35 },

  // Meta row
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: C.grayLine,
  },
  catBadge: { backgroundColor: C.amber, borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2 },
  catText:  { color: C.white, fontSize: 7, fontWeight: "bold" },
  ytLink:   { fontSize: 7, color: C.navyLight, textDecoration: "underline" },

  // ── School analysis ────────────────────────────────────────────────────────
  schoolBox: {
    backgroundColor: C.navyPale,
    borderRadius: 3,
    borderLeftWidth: 3,
    borderLeftColor: C.navyLight,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  schoolRow:    { flexDirection: "row", marginBottom: 3 },
  schoolDot:    { color: C.navy, fontWeight: "bold", marginRight: 4, fontSize: 8.5, lineHeight: 1.45 },
  schoolText:   { flex: 1, fontSize: 7.5, lineHeight: 1.5 },

  // ── Vocabulary ─────────────────────────────────────────────────────────────
  vocabTable:   { borderRadius: 3, overflow: "hidden", borderWidth: 0.5, borderColor: C.grayLine },
  vocabHead:    { flexDirection: "row", backgroundColor: C.navy },
  vocabHCell:   { paddingHorizontal: 6, paddingVertical: 4, color: C.white, fontSize: 7, fontWeight: "bold" },
  vocabRow:     { flexDirection: "row", borderTopWidth: 0.5, borderTopColor: C.grayLine },
  vocabRowAlt:  { backgroundColor: C.grayAlt },
  vocabCellEn:  { paddingHorizontal: 6, paddingVertical: 4, fontSize: 7.5, fontWeight: "bold", color: C.navy, lineHeight: 1.35 },
  vocabCellPos: { paddingHorizontal: 6, paddingVertical: 4, fontSize: 7, color: C.textSub, lineHeight: 1.35, fontStyle: "italic" },
  vocabCellJa:  { paddingHorizontal: 6, paddingVertical: 4, fontSize: 7.5, lineHeight: 1.35, borderLeftWidth: 0.5, borderLeftColor: C.grayLine },
  vocabCellSt:  { paddingHorizontal: 6, paddingVertical: 4, fontSize: 7.5, lineHeight: 1.35 },

  // Vocab notes
  notesBox: {
    backgroundColor: C.amberPale,
    borderRadius: 3,
    borderLeftWidth: 2,
    borderLeftColor: C.amber,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 5,
  },
  notesRow:   { flexDirection: "row", marginBottom: 2 },
  notesDot:   { color: C.amber, marginRight: 4, fontSize: 8 },
  notesText:  { flex: 1, fontSize: 7.5, lineHeight: 1.45 },

  // ── Two-column READING + TRANSLATION ──────────────────────────────────────
  twoColRow: { flexDirection: "row", marginBottom: 5 },
  twoColLeft:  { flex: 1, paddingRight: 7 },
  twoColSep:   { width: 0.5, backgroundColor: C.grayLine },
  twoColRight: { flex: 1, paddingLeft: 7 },

  paraNum:    { color: C.amber, fontWeight: "bold", fontSize: 7.5, marginRight: 3 },
  paraEn:     { fontSize: 8, lineHeight: 1.65, color: C.text, textAlign: "justify", flex: 1 },
  paraJa:     { fontSize: 8, lineHeight: 1.65, color: C.text, flex: 1 },
  paraRow:    { flexDirection: "row", marginBottom: 6 },

  wordCount:  { fontSize: 7, color: C.textSub, marginTop: 4, textAlign: "right" },

  colLabel:   { fontSize: 7, fontWeight: "bold", color: C.textSub, letterSpacing: 0.4, marginBottom: 4, textTransform: "uppercase" },

  // ── KEY SENTENCE ──────────────────────────────────────────────────────────
  ksBox: {
    backgroundColor: C.grayBg,
    borderRadius: 3,
    borderLeftWidth: 3,
    borderLeftColor: C.navy,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  ksSentence: { fontSize: 8.5, fontWeight: "bold", color: C.navy, lineHeight: 1.5, marginBottom: 6, fontStyle: "italic" },
  ksLabel:    { fontSize: 7, fontWeight: "bold", color: C.textSub, letterSpacing: 0.4, marginBottom: 3 },
  ksBody:     { fontSize: 7.5, lineHeight: 1.5, color: C.text, marginBottom: 6 },
  ksPoint:    { fontSize: 7.5, lineHeight: 1.5, color: C.navy, backgroundColor: C.navyPale, borderRadius: 2, padding: 5 },

  // ── CHECK ─────────────────────────────────────────────────────────────────
  checkBox: {
    backgroundColor: "#e8f0f8",
    borderRadius: 3,
    padding: 9,
    gap: 5,
  },
  checkQ:   { fontSize: 7.5, lineHeight: 1.55, color: C.text },
  checkNum: { color: C.navy, fontWeight: "bold" },

  // ── Background ────────────────────────────────────────────────────────────
  bgBox: {
    backgroundColor: C.greenPale,
    borderRadius: 3,
    borderLeftWidth: 3,
    borderLeftColor: C.green,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  bgRow:   { flexDirection: "row", marginBottom: 3 },
  bgDot:   { color: C.green, fontWeight: "bold", marginRight: 4, fontSize: 9, lineHeight: 1.35 },
  bgText:  { flex: 1, fontSize: 7.5, lineHeight: 1.5 },
  bgStars: { fontSize: 7.5, color: C.amber, marginTop: 5, fontWeight: "bold" },

  // ── Separator ─────────────────────────────────────────────────────────────
  separator: { borderBottomWidth: 1, borderBottomColor: C.grayLine, marginVertical: 14 },
});

// ── Sub-components ────────────────────────────────────────────────────────────

function SecHeader({ label }: { label: string }) {
  return (
    <View style={S.secHeader}>
      <View style={S.secHeaderDot} />
      <Text style={S.secHeaderText}>{label}</Text>
    </View>
  );
}

// Column widths for vocab table (proportional)
const W = { en: "32%", pos: "10%", ja: "46%", stars: "12%" };

function VocabSection({ topic }: { topic: TopicData }) {
  if (!topic.vocabulary.length) return null;
  return (
    <>
      <SecHeader label="重要英単語・英語表現" />
      <View style={S.vocabTable}>
        {/* Header */}
        <View style={S.vocabHead}>
          <Text style={[S.vocabHCell, { width: W.en }]}>英語</Text>
          <Text style={[S.vocabHCell, { width: W.pos }]}>品詞</Text>
          <Text style={[S.vocabHCell, { width: W.ja }]}>日本語訳</Text>
          <Text style={[S.vocabHCell, { width: W.stars }]}>頻出</Text>
        </View>
        {/* Rows */}
        {topic.vocabulary.map((v, i) => (
          <View key={i} style={[S.vocabRow, i % 2 === 1 ? S.vocabRowAlt : {}]} wrap={false}>
            <Text style={[S.vocabCellEn,  { width: W.en }]}>{v.en}</Text>
            <Text style={[S.vocabCellPos, { width: W.pos }]}>{v.pos}</Text>
            <Text style={[S.vocabCellJa,  { width: W.ja }]}>{v.ja}</Text>
            <Text style={[S.vocabCellSt,  { width: W.stars }]}>{v.stars}</Text>
          </View>
        ))}
      </View>
      {/* Vocab notes */}
      {topic.vocabNotes.length > 0 && (
        <View style={S.notesBox}>
          {topic.vocabNotes.map((n, i) => (
            <View key={i} style={S.notesRow}>
              <Text style={S.notesDot}>→</Text>
              <Text style={S.notesText}>{n}</Text>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

function ReadingTranslation({ topic }: { topic: TopicData }) {
  const hasTrans = topic.translationParas.length > 0;
  const paras = topic.summaryParas;
  if (!paras.length) return null;

  return (
    <>
      <SecHeader label={hasTrans ? "英文サマリー (READING) ／ 日本語全訳" : "英文サマリー (READING)"} />
      {hasTrans ? (
        // ── Two-column layout ─────────────────────────────────────────────
        <>
          {/* Column labels */}
          <View style={S.twoColRow}>
            <View style={S.twoColLeft}>
              <Text style={S.colLabel}>English</Text>
            </View>
            <View style={S.twoColSep} />
            <View style={S.twoColRight}>
              <Text style={S.colLabel}>日本語訳</Text>
            </View>
          </View>
          {/* Paragraph rows */}
          {paras.map((p) => {
            const jp = topic.translationParas.find((t) => t.num === p.num);
            return (
              <View key={p.num} style={S.twoColRow} wrap={false}>
                <View style={S.twoColLeft}>
                  <View style={S.paraRow}>
                    <Text style={S.paraNum}>¶{p.num}</Text>
                    <Text style={S.paraEn}>{p.text}</Text>
                  </View>
                </View>
                <View style={S.twoColSep} />
                <View style={S.twoColRight}>
                  <View style={S.paraRow}>
                    <Text style={S.paraNum}>¶{p.num}</Text>
                    <Text style={S.paraJa}>{jp?.text ?? ""}</Text>
                  </View>
                </View>
              </View>
            );
          })}
          {topic.summaryWordCount > 0 && (
            <Text style={S.wordCount}>({topic.summaryWordCount} words)</Text>
          )}
        </>
      ) : (
        // ── Single column fallback ────────────────────────────────────────
        <View style={{ backgroundColor: C.grayBg, borderRadius: 3, padding: 10 }}>
          {paras.map((p) => (
            <View key={p.num} style={S.paraRow}>
              <Text style={S.paraNum}>¶{p.num}</Text>
              <Text style={S.paraEn}>{p.text}</Text>
            </View>
          ))}
          {topic.summaryWordCount > 0 && (
            <Text style={S.wordCount}>({topic.summaryWordCount} words)</Text>
          )}
        </View>
      )}
    </>
  );
}

function KeySentenceSection({ topic }: { topic: TopicData }) {
  const ks = topic.keysentence;
  if (!ks) return null;
  return (
    <>
      <SecHeader label="KEY SENTENCE 🔍" />
      <View style={S.ksBox}>
        <Text style={S.ksSentence}>"{ks.sentence}"</Text>
        {ks.analysis && (
          <>
            <Text style={S.ksLabel}>[ 構文分析 ]</Text>
            <Text style={S.ksBody}>{ks.analysis}</Text>
          </>
        )}
        {ks.point && (
          <>
            <Text style={S.ksLabel}>[ 入試ポイント ]</Text>
            <Text style={S.ksPoint}>{ks.point}</Text>
          </>
        )}
      </View>
    </>
  );
}

function CheckSection({ topic }: { topic: TopicData }) {
  if (!topic.checkQuestions.length) return null;
  return (
    <>
      <SecHeader label="確認問題 (CHECK)" />
      <View style={S.checkBox}>
        {topic.checkQuestions.map((q, i) => (
          <Text key={i} style={S.checkQ}>
            <Text style={S.checkNum}>Q{i + 1}.  </Text>
            {q.replace(/^Q\d+\.\s*/, "")}
          </Text>
        ))}
      </View>
    </>
  );
}

function BackgroundSection({ topic }: { topic: TopicData }) {
  if (!topic.background.length && !topic.frequencyStars) return null;
  return (
    <>
      <SecHeader label="背景知識（教養知識）" />
      <View style={S.bgBox}>
        {topic.background.map((line, i) => (
          <View key={i} style={S.bgRow} wrap={false}>
            <Text style={S.bgDot}>◆</Text>
            <Text style={S.bgText}>{line}</Text>
          </View>
        ))}
        {topic.frequencyStars && (
          <Text style={S.bgStars}>📌 入試頻出度: {topic.frequencyStars}</Text>
        )}
      </View>
    </>
  );
}

// ── Topic page ────────────────────────────────────────────────────────────────

function TopicSection({ topic }: { topic: TopicData }) {
  return (
    <View>
      {/* Band */}
      <View style={S.topicBand}>
        <Text style={S.topicIdx}>TOPIC {topic.index}</Text>
        <Text style={S.topicTitleEn}>{topic.titleEn}</Text>
        {topic.titleJa ? <Text style={S.topicTitleJa}>{topic.titleJa}</Text> : null}
      </View>

      {/* Meta */}
      <View style={S.metaRow}>
        {topic.category ? (
          <View style={S.catBadge}><Text style={S.catText}>{topic.category}</Text></View>
        ) : null}
        {topic.youtubeUrl ? (
          <Link src={topic.youtubeUrl} style={S.ytLink}>▶ {topic.youtubeUrl}</Link>
        ) : null}
      </View>

      {/* School analysis */}
      {topic.schoolAnalysis.length > 0 && (
        <>
          <SecHeader label="出題されやすい学校群" />
          <View style={S.schoolBox}>
            {topic.schoolAnalysis.map((l, i) => (
              <View key={i} style={S.schoolRow}>
                <Text style={S.schoolDot}>▸</Text>
                <Text style={S.schoolText}>{l}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Vocabulary */}
      <VocabSection topic={topic} />

      {/* Reading + Translation (two-column) */}
      <ReadingTranslation topic={topic} />

      {/* Key Sentence */}
      <KeySentenceSection topic={topic} />

      {/* Check */}
      <CheckSection topic={topic} />

      {/* Background */}
      <BackgroundSection topic={topic} />
    </View>
  );
}

// ── Document ──────────────────────────────────────────────────────────────────

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
        {/* Fixed header */}
        <View style={S.pageHeader} fixed>
          <Text style={S.pageHeaderL}>CNN10 入試英語長文対策</Text>
          <Text style={S.pageHeaderR}>{date}</Text>
        </View>

        <TopicSection topic={topic} />

        {/* Fixed footer */}
        <View
          style={S.pageFooter}
          fixed
          render={({ pageNumber }) => (
            <>
              <Text style={S.pageFooterBrand}>CNN10 × 入試英語</Text>
              <Text style={S.pageFooterPage}>p. {pageNumber}</Text>
            </>
          )}
        />
      </Page>
    </Document>
  );
}
