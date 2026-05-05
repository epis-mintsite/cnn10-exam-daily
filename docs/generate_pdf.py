#!/usr/bin/env python3
"""
Markdown -> PDF converter for nft-auth-plan.md
Uses fpdf2 with Arial Unicode MS (.ttf) for Japanese support
"""

import re
from fpdf import FPDF

FONT_PATH = "/Library/Fonts/Arial Unicode.ttf"
INPUT_MD = "/Users/yamayahajime/my-next-app/docs/nft-auth-plan.md"
OUTPUT_PDF = "/Users/yamayahajime/my-next-app/docs/nft-auth-plan.pdf"


class PDFDoc(FPDF):
    def __init__(self):
        super().__init__()
        self.add_font("jp", "", FONT_PATH)
        # Arial Unicode has no separate bold file; we simulate with same font
        self.add_font("jpb", "", FONT_PATH)
        self.set_auto_page_break(auto=True, margin=20)

    def header(self):
        if self.page_no() > 1:
            self.set_font("jp", "", 7)
            self.set_text_color(150, 150, 150)
            self.cell(0, 6, "CNN10 入試対策アプリ — NFT 認証ログイン 完全構築案", new_x="LMARGIN", new_y="NEXT")
            self.set_draw_color(220, 220, 220)
            self.line(10, self.get_y(), self.w - 10, self.get_y())
            self.ln(2)

    def footer(self):
        self.set_y(-15)
        self.set_font("jp", "", 7)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"- {self.page_no()} -", align="C")


def clean_inline(text):
    """Remove markdown inline formatting"""
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"\*(.+?)\*", r"\1", text)
    text = re.sub(r"`(.+?)`", r"\1", text)
    text = re.sub(r"\[(.+?)\]\(.+?\)", r"\1", text)
    text = text.replace("&larr;", "<-").replace("&rarr;", "->")
    text = text.replace("&mdash;", " -- ")
    text = text.replace("←", "<-").replace("→", "->")
    text = text.replace("★", "*")
    return text


def parse_and_render(pdf, md_text):
    lines = md_text.split("\n")
    i = 0
    in_code = False
    code_buf = []
    in_table = False
    table_rows = []
    table_col_count = 0

    def flush_table():
        nonlocal in_table, table_rows, table_col_count
        if not table_rows:
            in_table = False
            return

        usable = pdf.w - 20
        col_widths = [usable / table_col_count] * table_col_count

        for row_idx, row in enumerate(table_rows):
            cells_raw = [c.strip() for c in row.strip().strip("|").split("|")]
            while len(cells_raw) < table_col_count:
                cells_raw.append("")
            cells_raw = cells_raw[:table_col_count]

            # Skip separator row (e.g. |---|---|)
            if row_idx == 1 and all(re.match(r"^[-: ]+$", c) for c in cells_raw):
                pdf.set_draw_color(180, 180, 180)
                pdf.line(10, pdf.get_y(), pdf.w - 10, pdf.get_y())
                pdf.ln(1)
                continue

            is_header = (row_idx == 0)
            size = 8 if is_header else 8
            pdf.set_font("jp", "", size)
            pdf.set_text_color(30, 30, 30)

            if is_header:
                pdf.set_fill_color(235, 235, 245)
            else:
                pdf.set_fill_color(255, 255, 255)

            cell_texts = [clean_inline(c) for c in cells_raw]

            # Calculate row height
            rh = 5.5
            max_lines = 1
            for ci, txt in enumerate(cell_texts):
                n_lines = pdf.multi_cell(col_widths[ci] - 2, rh, txt, dry_run=True, output="LINES")
                if len(n_lines) > max_lines:
                    max_lines = len(n_lines)
            h = rh * max_lines + 1

            if pdf.get_y() + h > pdf.h - 22:
                pdf.add_page()

            y0 = pdf.get_y()
            for ci, txt in enumerate(cell_texts):
                pdf.set_xy(10 + sum(col_widths[:ci]), y0)
                pdf.multi_cell(col_widths[ci], rh, " " + txt, fill=is_header)
            pdf.set_y(y0 + h)

        pdf.ln(3)
        in_table = False
        table_rows = []
        table_col_count = 0

    while i < len(lines):
        line = lines[i]

        # --- Code block ---
        if line.strip().startswith("```"):
            if in_code:
                # Render code block
                if pdf.get_y() + len(code_buf) * 3.8 > pdf.h - 22:
                    pdf.add_page()
                pdf.set_font("jp", "", 6.5)
                pdf.set_text_color(50, 50, 50)
                pdf.set_fill_color(242, 242, 242)
                for cl in code_buf:
                    if pdf.get_y() > pdf.h - 20:
                        pdf.add_page()
                    pdf.set_x(12)
                    cl_clean = cl.replace("\t", "    ")
                    pdf.cell(pdf.w - 24, 3.8, "  " + cl_clean, fill=True,
                             new_x="LMARGIN", new_y="NEXT")
                pdf.ln(3)
                code_buf = []
                in_code = False
            else:
                if in_table:
                    flush_table()
                in_code = True
            i += 1
            continue

        if in_code:
            code_buf.append(line)
            i += 1
            continue

        # --- Table ---
        if "|" in line and line.strip().startswith("|"):
            if not in_table:
                in_table = True
                table_rows = []
                cols = [c.strip() for c in line.strip().strip("|").split("|")]
                table_col_count = len(cols)
            table_rows.append(line)
            i += 1
            continue
        else:
            if in_table:
                flush_table()

        stripped = line.strip()

        # Empty line
        if not stripped:
            pdf.ln(2)
            i += 1
            continue

        # Horizontal rule
        if stripped in ("---", "***", "___"):
            pdf.set_draw_color(200, 200, 200)
            pdf.line(10, pdf.get_y() + 2, pdf.w - 10, pdf.get_y() + 2)
            pdf.ln(6)
            i += 1
            continue

        # H1
        if stripped.startswith("# ") and not stripped.startswith("##"):
            pdf.ln(4)
            text = clean_inline(stripped[2:])
            pdf.set_font("jp", "", 17)
            pdf.set_text_color(180, 30, 30)
            pdf.multi_cell(pdf.w - 20, 9, text)
            pdf.ln(3)
            i += 1
            continue

        # H2
        if stripped.startswith("## "):
            if in_table:
                flush_table()
            pdf.ln(5)
            if pdf.get_y() > pdf.h - 40:
                pdf.add_page()
            text = clean_inline(stripped[3:])
            pdf.set_font("jp", "", 13)
            pdf.set_text_color(30, 70, 150)
            pdf.multi_cell(pdf.w - 20, 8, text)
            pdf.set_draw_color(30, 70, 150)
            pdf.line(10, pdf.get_y() + 1, pdf.w - 10, pdf.get_y() + 1)
            pdf.ln(4)
            i += 1
            continue

        # H3
        if stripped.startswith("### "):
            pdf.ln(3)
            if pdf.get_y() > pdf.h - 30:
                pdf.add_page()
            text = clean_inline(stripped[4:])
            pdf.set_font("jp", "", 11)
            pdf.set_text_color(50, 50, 50)
            pdf.multi_cell(pdf.w - 20, 6.5, text)
            pdf.ln(2)
            i += 1
            continue

        # Blockquote
        if stripped.startswith("> "):
            text = clean_inline(stripped[2:])
            pdf.set_fill_color(238, 242, 255)
            y = pdf.get_y()
            pdf.set_font("jp", "", 9)
            pdf.set_text_color(60, 60, 80)
            pdf.set_x(16)
            pdf.multi_cell(pdf.w - 32, 5.5, text, fill=True)
            pdf.set_draw_color(30, 70, 150)
            pdf.line(13, y, 13, pdf.get_y())
            pdf.ln(2)
            i += 1
            continue

        # List item
        m = re.match(r"^(\s*)([-*]|\d+\.)\s+(.+)", line)
        if m:
            indent_str, bullet, text = m.groups()
            indent_level = len(indent_str) // 2
            indent = 4 + indent_level * 6
            text = clean_inline(text)
            if pdf.get_y() > pdf.h - 20:
                pdf.add_page()
            pdf.set_font("jp", "", 9)
            pdf.set_text_color(30, 30, 30)
            pdf.set_x(10 + indent)
            if bullet in ("-", "*"):
                prefix = "- "
            else:
                prefix = f"{bullet} "
            pdf.multi_cell(pdf.w - 20 - indent, 5.5, prefix + text)
            i += 1
            continue

        # Regular paragraph
        text = clean_inline(stripped)
        if pdf.get_y() > pdf.h - 20:
            pdf.add_page()
        pdf.set_font("jp", "", 9)
        pdf.set_text_color(30, 30, 30)
        pdf.multi_cell(pdf.w - 20, 5.5, text)
        i += 1

    if in_table:
        flush_table()


def main():
    with open(INPUT_MD, "r", encoding="utf-8") as f:
        md_text = f.read()

    pdf = PDFDoc()
    pdf.add_page()

    # ===== Title Page =====
    pdf.ln(35)
    pdf.set_font("jp", "", 22)
    pdf.set_text_color(180, 30, 30)
    pdf.cell(0, 12, "CNN10 入試対策アプリ", align="C",
             new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    pdf.set_font("jp", "", 18)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(0, 12, "NFT 認証ログイン 完全構築案", align="C",
             new_x="LMARGIN", new_y="NEXT")
    pdf.ln(12)
    pdf.set_font("jp", "", 11)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 7, "エピスミントサイト NFT 所有者限定アクセス制御", align="C",
             new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    pdf.cell(0, 7, "最終更新: 2026-04-05", align="C",
             new_x="LMARGIN", new_y="NEXT")
    pdf.ln(18)

    # Decorative line
    pdf.set_draw_color(180, 30, 30)
    pdf.set_line_width(0.5)
    pdf.line(60, pdf.get_y(), pdf.w - 60, pdf.get_y())
    pdf.set_line_width(0.2)
    pdf.ln(18)

    # Summary box
    pdf.set_fill_color(245, 245, 252)
    pdf.set_x(25)
    pdf.set_font("jp", "", 10)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(pdf.w - 50, 8, "  概  要", fill=True, align="C",
             new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("jp", "", 9)
    pdf.set_x(25)
    pdf.multi_cell(pdf.w - 50, 6,
        "エピスミントサイト (Polygon NFT) で発行された特定の NFT を所有する\n"
        "生徒のみが、本アプリのコンテンツを閲覧できるようにする認証システムの構築案。\n"
        "\n"
        "方式: Firebase Authentication + Epis API 連携\n"
        "生徒のウォレット操作不要 / 既存アカウントでログイン可能",
        fill=True, align="C")

    # ===== Content Pages =====
    pdf.add_page()

    # Remove first H1 (already on title page)
    content = re.sub(r"^#\s+.+\n", "", md_text, count=1)

    parse_and_render(pdf, content)

    pdf.output(OUTPUT_PDF)
    print(f"PDF saved: {OUTPUT_PDF}")
    print(f"Pages: {pdf.page_no()}")


if __name__ == "__main__":
    main()
