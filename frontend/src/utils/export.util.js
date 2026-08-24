import { jsPDF } from 'jspdf';

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function baseName(fileName) {
  return (fileName || 'summary').replace(/\.[^/.]+$/, '');
}

function toPlainText(points) {
  return points.map((p) => p.text).join('\n\n');
}

export function exportAsTxt(fileName, points) {
  const blob = new Blob([toPlainText(points)], { type: 'text/plain;charset=utf-8' });
  triggerDownload(blob, `${baseName(fileName)}-summary.txt`);
}

export function exportAsMarkdown(fileName, points, keywords = []) {
  const keywordLine = keywords.length ? `\n\n**Keywords:** ${keywords.join(', ')}\n` : '';
  const content = `# Summary — ${fileName}\n\n${toPlainText(points)}${keywordLine}`;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  triggerDownload(blob, `${baseName(fileName)}-summary.md`);
}

export function exportAsPdf(fileName, points) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 56;
  const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
  const pageHeight = doc.internal.pageSize.getHeight();
  const lineHeight = 16;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`Summary — ${fileName}`, margin, margin);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(11);

  let cursorY = margin + 32;

  points.forEach((point) => {
    const lines = doc.splitTextToSize(point.text, maxWidth);
    const blockHeight = lines.length * lineHeight;

    if (cursorY + blockHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
    }

    doc.text(lines, margin, cursorY, { lineHeightFactor: 1.4 });
    cursorY += blockHeight + 10;
  });

  doc.save(`${baseName(fileName)}-summary.pdf`);
}

export async function copyToClipboard(points) {
  const text = Array.isArray(points) ? toPlainText(points) : points;
  await navigator.clipboard.writeText(text);
}
