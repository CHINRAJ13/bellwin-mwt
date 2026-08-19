import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateDailySummaryPDF = (data) => {
  const doc = new jsPDF('p', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Custom font properties
  doc.setFont("helvetica", "normal");

  // 1. HEADER
  // Belwin Logo / Header (Using text to mimic it for now)
  doc.setTextColor(220, 38, 38); // Red color for Belwin Bankers
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("BELWIN BANKERS", pageWidth / 2, 40, { align: 'center', tracking: 1 });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Daily Summary Report", pageWidth / 2, 60, { align: 'center' });

  // Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  const formattedDate = data.date.split('-').reverse().join('-');
  doc.text(`Date : ${formattedDate}`, 40, 90);

  // Balances
  doc.text(`OPENING BALANCE : ${data.openingBalance}`, 40, 110);
  doc.text(`CLOSING BALANCE : ${data.closingBalance}`, pageWidth - 40, 110, { align: 'right' });

  // 2. LEDGER TABLES (Side by Side)
  const leftX = 40;
  const middleX = pageWidth / 2;
  const rightX = pageWidth - 40;
  let startY = 125;

  // Render Income Table (Left)
  const incomeData = data.income.items.map(i => [i.title, i.amount || '']);
  doc.autoTable({
    startY: startY,
    head: [['TITLE', 'Amt.']],
    body: incomeData,
    theme: 'plain',
    headStyles: { lineWidth: 1, lineColor: 0, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { lineWidth: 1, lineColor: 0 },
    columnStyles: {
      0: { cellWidth: (pageWidth / 2) - 40 - 60 }, // Title width
      1: { cellWidth: 60, halign: 'right' }       // Amount width
    },
    margin: { left: leftX, right: middleX }
  });

  const finalYLeft = doc.lastAutoTable.finalY;

  // Render Expense Table (Right)
  const expenseData = data.expense.items.map(e => [e.title, e.amount || '']);
  doc.autoTable({
    startY: startY,
    head: [['EXPENSE TITLE', 'AMOUNT']],
    body: expenseData,
    theme: 'plain',
    headStyles: { lineWidth: 1, lineColor: 0, fontStyle: 'bold' },
    bodyStyles: { lineWidth: 1, lineColor: 0 },
    columnStyles: {
      0: { cellWidth: (pageWidth / 2) - 40 - 60 },
      1: { cellWidth: 60, halign: 'right' }
    },
    margin: { left: middleX, right: 40 }
  });

  const finalYRight = doc.lastAutoTable.finalY;
  
  let currentY = Math.max(finalYLeft, finalYRight) + 20;

  // 3. TOTALS
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL INCOME RS.   ${data.income.total}`, 40, currentY);
  doc.text(`TOTAL EXPENSE AMOUNT RS. ${data.expense.total}`, middleX + 10, currentY);

  currentY += 40;

  // 4. CASH DENOMINATION
  doc.text("CASH DENOMINATION", 40, currentY);
  currentY += 15;

  doc.setFont("helvetica", "normal");
  const notesArr = ['2000', '500', '200', '100', '50', '20', '10', '5', '2', '1'];
  
  notesArr.forEach(note => {
    const count = data.denominations.notes[note]?.count || '';
    const amt = data.denominations.notes[note]?.amount || '';
    doc.text(`${note} x`, 40, currentY);
    doc.text(`${count}`, 90, currentY);
    doc.text(`=`, 120, currentY);
    doc.text(`${amt}`, 160, currentY, { align: 'right' });
    currentY += 15;
  });

  // Coins
  const coinAmt = data.denominations.notes['Coins']?.amount || '';
  doc.text(`Coins`, 40, currentY);
  doc.text(`=`, 120, currentY);
  doc.text(`${coinAmt}`, 160, currentY, { align: 'right' });

  currentY += 15;
  doc.line(40, currentY - 10, 160, currentY - 10);
  
  doc.setFont("helvetica", "bold");
  doc.text(`Total :`, 40, currentY + 5);
  doc.text(`${data.denominations.total}`, 160, currentY + 5, { align: 'right' });
  doc.line(40, currentY + 10, 160, currentY + 10);

  // Render Stamp / Signature Area (Right side of Denomination)
  const stampY = currentY - 80;
  // Draw a circle for stamp
  doc.setDrawColor(0, 0, 150); // Blueish
  doc.circle(middleX + 80, stampY, 40, 'S');
  doc.setTextColor(0, 0, 150);
  doc.setFontSize(8);
  doc.text("BELWIN BANKERS", middleX + 80, stampY - 10, { align: 'center' });
  doc.text("PUDUKKOTTAI-1", middleX + 80, stampY, { align: 'center' });
  doc.line(middleX + 50, stampY + 5, middleX + 110, stampY + 5);
  doc.line(middleX + 50, stampY - 5, middleX + 110, stampY - 5);
  
  // Date written near stamp
  doc.setFont("helvetica", "italic");
  doc.text(`${formattedDate.replace(/-/g, '/')}`, middleX + 120, stampY + 30, { align: 'center', angle: 15 });

  doc.setTextColor(0, 0, 0); // Reset
  currentY += 40;

  // 5. GOLD STOCK (Branch Stock)
  doc.setFont("helvetica", "normal");
  doc.text("Branch Stock :", 40, currentY);
  currentY += 10;

  const stockData = data.goldStock.map(s => [`${s.loanId}-${s.customerName}`.toUpperCase(), s.weight]);
  doc.autoTable({
    startY: currentY,
    body: stockData,
    theme: 'plain',
    bodyStyles: { lineWidth: 1, lineColor: 0 },
    columnStyles: {
      0: { cellWidth: 150 },
      1: { cellWidth: 50, halign: 'right' }
    },
    margin: { left: 40 }
  });

  doc.save(`Daily_Summary_${formattedDate}.pdf`);
};
