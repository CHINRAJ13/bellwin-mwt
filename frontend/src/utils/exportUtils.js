import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/Logo 1.png';

export const exportToExcel = async (data, headers, mapper, filename) => {
  if (!data || !data.length) return;
  
  const headerLabels = headers.map(h => h.label || h);
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Export');

  worksheet.addRow(headerLabels);

  data.forEach(row => {
    let rowData = mapper ? mapper(row) : headers.map(h => row[h.key || h]);
    rowData = rowData.map(val => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'object' && !(val instanceof Date)) return JSON.stringify(val);
      return val;
    });
    worksheet.addRow(rowData);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename || 'export'}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportToPDF = (elementId, filename) => {
  window.print();
};

export const exportTableToPDF = async (title, headers, data, mapper, filename) => {
  if (!data || !data.length) return;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  const companyName = "Belwin Group of Company";
  const textWidth = doc.getTextWidth(companyName);
  
  try {
    const img = new Image();
    const loadPromise = new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    img.src = logo;
    await loadPromise;
    const logoSize = 12;
    const logoX = (pageWidth / 2) - (textWidth / 2) - logoSize - 3;
    const logoY = 6;
    doc.addImage(img, 'PNG', logoX, logoY, logoSize, logoSize);
  } catch (e) {
    console.warn('Could not load logo for PDF');
  }
  
  doc.text(companyName, pageWidth / 2, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(title, pageWidth / 2, 22, { align: 'center' });
  doc.setFontSize(9);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  const headerLabels = headers.map(h => h.label || h);

  const tableData = data.map(row => {
    let rowData = mapper ? mapper(row) : headers.map(h => row[h.key || h]);
    return rowData.map(val => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'object' && !(val instanceof Date)) return JSON.stringify(val);
      return val;
    });
  });

  autoTable(doc, {
    head: [headerLabels],
    body: tableData,
    startY: 35,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [22, 163, 74] }
  });

  doc.save(`${filename || 'Export'}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const handlePrint = () => {
  window.print();
};
