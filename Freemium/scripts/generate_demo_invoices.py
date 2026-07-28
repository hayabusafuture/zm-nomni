from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "output" / "pdf"
OUTPUT.mkdir(parents=True, exist_ok=True)


def money(value):
    return f"S${value:,.2f}"


def build_invoice(filename, supplier, address, invoice_number, invoice_date, due_date, items):
    subtotal = sum(quantity * price for _, quantity, _, price in items)
    gst = subtotal * 0.09
    total = subtotal + gst

    doc = SimpleDocTemplate(
        str(OUTPUT / filename),
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title=f"Sample invoice {invoice_number}",
        author="Nomni",
    )
    styles = getSampleStyleSheet()
    styles["Title"].fontName = "Helvetica-Bold"
    styles["Title"].fontSize = 25
    styles["Heading2"].fontSize = 12
    styles["BodyText"].fontSize = 9
    styles["BodyText"].leading = 13

    story = [
        Table(
            [
                [
                    Paragraph(f"<b>{supplier}</b><br/><font size=8>{address}</font>", styles["BodyText"]),
                    Paragraph("<b>INVOICE</b><br/><font color='#1A8040'>FICTIONAL DEMO DOCUMENT</font>", styles["Title"]),
                ]
            ],
            colWidths=[96 * mm, 64 * mm],
        ),
        Spacer(1, 12 * mm),
        Table(
            [
                [
                    Paragraph("<b>Bill to</b><br/>Nomni Kitchen - Tanjong Pagar<br/>18 Tanjong Pagar Road<br/>Singapore 088441", styles["BodyText"]),
                    Table(
                        [
                            ["Invoice no.", invoice_number],
                            ["Invoice date", invoice_date],
                            ["Due date", due_date],
                            ["Currency", "SGD"],
                        ],
                        colWidths=[28 * mm, 36 * mm],
                        style=TableStyle(
                            [
                                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                                ("FONTSIZE", (0, 0), (-1, -1), 9),
                                ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#666666")),
                                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                            ]
                        ),
                    ),
                ]
            ],
            colWidths=[96 * mm, 64 * mm],
        ),
        Spacer(1, 10 * mm),
    ]

    data = [["Description", "Qty", "UOM", "Unit price", "Amount"]]
    for description, quantity, uom, price in items:
        data.append([description, f"{quantity:g}", uom, money(price), money(quantity * price)])
    data.extend(
        [
            ["", "", "", "Subtotal", money(subtotal)],
            ["", "", "", "GST (9%)", money(gst)],
            ["", "", "", "Total", money(total)],
        ]
    )
    table = Table(data, colWidths=[74 * mm, 18 * mm, 20 * mm, 24 * mm, 28 * mm], repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0E3727")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (-2, -3), (-1, -1), "Helvetica-Bold"),
                ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
                ("ALIGN", (2, 1), (2, -4), "CENTER"),
                ("GRID", (0, 0), (-1, -4), 0.5, colors.HexColor("#E7E8EC")),
                ("LINEABOVE", (-2, -1), (-1, -1), 1.2, colors.HexColor("#2AC864")),
                ("BACKGROUND", (0, 1), (-1, -4), colors.white),
                ("ROWBACKGROUNDS", (0, 1), (-1, -4), [colors.white, colors.HexColor("#F9FAFB")]),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.extend(
        [
            table,
            Spacer(1, 14 * mm),
            Paragraph("<b>Payment terms:</b> 7 days from invoice date.", styles["BodyText"]),
            Spacer(1, 3 * mm),
            Paragraph(
                "This invoice is fictional and provided only for the Nomni Procure demo. "
                "Do not use it for accounting, tax, payment, or supplier communication.",
                styles["BodyText"],
            ),
        ]
    )
    doc.build(story)


build_invoice(
    "nomni-demo-invoice-fresh-fields.pdf",
    "Fresh Fields Produce Pte Ltd",
    "31 Pasir Panjang Wholesale Centre, Singapore 110031",
    "FF-8931",
    "25/07/2026",
    "01/08/2026",
    [
        ("Chicken thigh boneless", 12.5, "kg", 8.90),
        ("Baby kailan", 8, "kg", 4.60),
        ("Spring onions", 5, "kg", 6.20),
        ("Fresh coconut", 24, "unit", 2.30),
    ],
)
build_invoice(
    "nomni-demo-invoice-harbour-seafood.pdf",
    "Harbour Seafood Co. Pte Ltd",
    "12 Fishery Port Road, Singapore 619734",
    "HS-10482",
    "26/07/2026",
    "02/08/2026",
    [
        ("Tiger prawns 21/25", 9.2, "kg", 22.40),
        ("Barramundi fillet", 14, "kg", 18.60),
        ("Blue swimmer crab meat", 6, "kg", 31.80),
        ("Squid tubes", 8.5, "kg", 12.40),
    ],
)
