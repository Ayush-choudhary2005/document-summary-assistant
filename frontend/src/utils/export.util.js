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

export function exportAsTxt(fileName, summary) {
  const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
  triggerDownload(blob, `${baseName(fileName)}-summary.txt`);
}

export function exportAsMarkdown(fileName, summary, keywords = []) {
  const keywordLine = keywords.length ? `\n\n**Keywords:** ${keywords.join(', ')}\n` : '';
  const content = `# Summary — ${fileName}\n\n${summary}${keywordLine}`;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  triggerDownload(blob, `${baseName(fileName)}-summary.md`);
}

export function exportAsPdf(fileName, summary) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 56;
  const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`Summary — ${fileName}`, margin, margin);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(summary, maxWidth);
  doc.text(lines, margin, margin + 28, { lineHeightFactor: 1.5 });

  doc.save(`${baseName(fileName)}-summary.pdf`);
}

export async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text);
}
