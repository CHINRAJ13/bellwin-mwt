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

export const exportTableToPDF = async (arg1, arg2, arg3, arg4, arg5) => {
  let title = 'Export';
  let headers = [];
  let data = [];
  let mapper = null;
  let filename = 'export';

  // Parse arguments based on type to handle parameter mismatch and optional mapper
  if (Array.isArray(arg1)) {
    data = arg1;
    headers = Array.isArray(arg2) ? arg2 : [];
    if (typeof arg3 === 'function') {
      mapper = arg3;
    }
    title = typeof arg4 === 'string' ? arg4 : 'Export';
    filename = typeof arg5 === 'string' ? arg5 : 'export';
  } else {
    title = typeof arg1 === 'string' ? arg1 : 'Export';
    headers = Array.isArray(arg2) ? arg2 : [];
    data = Array.isArray(arg3) ? arg3 : [];
    
    if (typeof arg4 === 'function') {
      mapper = arg4;
      filename = typeof arg5 === 'string' ? arg5 : 'export';
    } else if (typeof arg4 === 'string') {
      mapper = null;
      filename = arg4;
    } else {
      filename = typeof arg5 === 'string' ? arg5 : 'export';
    }
  }

  if (!data || !data.length) return;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  const companyName = "BELLWIN GROUP OF COMPANIES";
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
