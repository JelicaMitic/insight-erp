using InsightErp.Api.Models.Orders;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace InsightErp.Api.Services.Pdf
{
    public static class PdfGenerator
    {
        public static byte[] GenerateInvoicePdf(InvoiceDto invoice)
        {
            var primaryColor = Colors.Blue.Darken2;
            var lightGray = "#F2F2F2";

            var doc = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(11));

                    // ===== HEADER =====
                    page.Header().Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("Insight d.o.o.")
                                .FontSize(24).SemiBold().FontColor(primaryColor);

                            col.Item().Text("Računovodstvo & ERP rešenja")
                                .FontSize(10).Light().FontColor(Colors.Grey.Medium);
                        });

                        row.ConstantItem(150).AlignRight().Text($"FAKTURA")
                            .FontSize(26).Bold().FontColor(primaryColor);
                    });

                    // ===== CONTENT =====
                    page.Content().Column(col =>
                    {
                        col.Spacing(12);

                        // --- Basic Invoice Info ---
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Column(left =>
                            {
                                left.Item().Text("Prodavac")
                                    .SemiBold().FontColor(primaryColor);
                                left.Item().Text("Insight d.o.o.");
                                left.Item().Text("Bulevar 123, Beograd");
                                left.Item().Text("PIB: 123456789");
                            });

                            row.RelativeItem().Column(right =>
                            {
                                right.Item().Text("Kupac")
                                    .SemiBold().FontColor(primaryColor);
                                right.Item().Text(invoice.CustomerName);
                                right.Item().Text($"Datum: {invoice.Date:dd.MM.yyyy}");
                                right.Item().Text($"Faktura br: {invoice.Id}");
                            });
                        });

                        col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

                        // ===== TABLE =====
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(5);
                                c.RelativeColumn(1);
                                c.RelativeColumn(2);
                                c.RelativeColumn(2);
                            });

                            // HEADER
                            table.Header(header =>
                            {
                                header.Cell().Element(StyleHeader).Text("Proizvod");
                                header.Cell().Element(StyleHeader).Text("Količina");
                                header.Cell().Element(StyleHeader).Text("Cena");
                                header.Cell().Element(StyleHeader).Text("Ukupno");
                            });

                            static IContainer StyleHeader(IContainer container)
                            {
                                return container
                                    .Padding(5)
                                    .Background(Colors.Grey.Lighten3)
                                    .BorderBottom(1)
                                    .BorderColor(Colors.Grey.Medium)
                                    .AlignCenter();
                                    //.Bold();
                            }

                            // ROWS
                            var i = 0;

                            var lightGray = "#F2F2F2";
                            var white = "#FFFFFF";

                            foreach (var item in invoice.Items)
                            {
                                var bg = (i++ % 2 == 0) ? lightGray : white;

                                table.Cell().Background(bg).Padding(4).Text(item.ProductName);
                                table.Cell().Background(bg).Padding(4).Text(item.Quantity.ToString()).AlignCenter();
                                table.Cell().Background(bg).Padding(4).Text($"{item.UnitPrice:F2} RSD").AlignRight();
                                table.Cell().Background(bg).Padding(4).Text($"{item.LineTotal:F2} RSD").AlignRight();
                            }
                        });

                        col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

                        // === TOTALS SECTION ===
                        col.Item().AlignRight().Column(right =>
                        {
                            right.Spacing(4);

                            right.Item().Row(r =>
                            {
                                r.RelativeItem().Text("");
                                r.ConstantItem(130).Row(rr =>
                                {
                                    rr.RelativeItem().Text("Osnovica:");
                                    rr.RelativeItem().AlignRight().Text($"{invoice.Amount:F2} RSD");
                                });
                            });

                            right.Item().Row(r =>
                            {
                                r.RelativeItem().Text("");
                                r.ConstantItem(130).Row(rr =>
                                {
                                    rr.RelativeItem().Text("PDV (20%):");
                                    rr.RelativeItem().AlignRight().Text($"{invoice.Tax:F2} RSD");
                                });
                            });

                            right.Item().PaddingTop(5).BorderTop(1).BorderColor(Colors.Grey.Medium);

                            right.Item().Row(r =>
                            {
                                r.RelativeItem().Text("");
                                r.ConstantItem(130).Row(rr =>
                                {
                                    rr.RelativeItem().Text("Ukupno za naplatu:")
                                        .FontSize(12).Bold();
                                    rr.RelativeItem().AlignRight()
                                        .Text($"{(invoice.Amount + invoice.Tax):F2} RSD")
                                        .FontSize(12).Bold();
                                });
                            });
                        });
                    });

                    // ===== FOOTER =====
                    page.Footer().AlignCenter().Text(txt =>
                    {
                        txt.Span("InsightERP © ").FontSize(10).Light();
                        txt.Span(DateTime.Now.Year.ToString()).FontSize(10).Light();
                    });
                });
            });

            return doc.GeneratePdf();
        }
    }
}
