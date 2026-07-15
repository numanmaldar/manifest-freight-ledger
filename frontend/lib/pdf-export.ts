import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FreightRate } from "./api";

export function exportToPdf(rates: FreightRate[]) {
  const doc = new jsPDF();

  // Document Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Manifest: Freight Rate Report", 14, 22);

  // Timestamp
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor("#646464"); // Use hex string for color to avoid issues
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

  // Define table data
  const tableColumn = ["Route", "Carrier", "Container", "Valid Date", "Rate"];
  const tableRows: (string | number)[][] = [];

  rates.forEach(rate => {
    const rateData = [
      `${rate.origin_port} → ${rate.destination_port}`,
      rate.carrier,
      rate.container_type,
      rate.valid_date,
      `${rate.currency} ${rate.rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    ];
    tableRows.push(rateData);
  });

  // Create table
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    theme: "grid",
    headStyles: { fillColor: [15, 31, 53] }, // --hull-raised
    styles: {
      font: "helvetica",
      cellPadding: 3,
    },
  });

  doc.save("manifest-rates-report.pdf");
}