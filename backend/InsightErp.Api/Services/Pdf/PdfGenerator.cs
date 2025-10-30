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
            var doc = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(12));

                    page.Header().Text($"Faktura #{invoice.Id}")
                        .SemiBold().FontSize(20).AlignCenter();

                    page.Content().Column(col =>
                    {
                        col.Item().Text($"Datum: {invoice.Date:dd.MM.yyyy}");
                        col.Item().Text($"Kupac: {invoice.CustomerName}");
                        col.Item().LineHorizontal(1);

                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(5);
                                c.RelativeColumn(1);
                                c.RelativeColumn(2);
                                c.RelativeColumn(2);
                            });

                            // header
                            table.Header(header =>
                            {
                                header.Cell().Text("Proizvod").Bold();
                                header.Cell().Text("Količina").Bold();
                                header.Cell().Text("Cena").Bold();
                                header.Cell().Text("Ukupno").Bold();
                            });

                            // items
                            foreach (var item in invoice.Items)
                            {
                                table.Cell().Text(item.ProductName);
                                table.Cell().Text(item.Quantity.ToString());
                                table.Cell().Text($"{item.UnitPrice:F2} RSD");
                                table.Cell().Text($"{item.LineTotal:F2} RSD");
                            }
                        });

                        col.Item().LineHorizontal(1);
                        col.Item().Text($"Osnovica: {invoice.Amount:F2} RSD");
                        col.Item().Text($"PDV (20%): {invoice.Tax:F2} RSD");
                        col.Item().Text($"Ukupno: {(invoice.Amount + invoice.Tax):F2} RSD")
                            .Bold().FontSize(14);
                    });

                    page.Footer().AlignCenter().Text("InsightERP © 2025");
                });
            });

            return doc.GeneratePdf();
        }
    }
}

