const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

// Paths
const booksFile = path.join(__dirname, 'Bible-kjv-master', 'Books.json');
const booksDir = path.join(__dirname, 'Bible-kjv-master');

// Read books list
const books = JSON.parse(fs.readFileSync(booksFile, 'utf-8'));

async function createBibleWithMarginsPDF() {
  const pdfDoc = await PDFDocument.create();
  const pageWidth = 612; // 8.5 inches
  const pageHeight = 792; // 11 inches
  const fontSize = 12;

  for (const book of books) {
    const bookFile = path.join(booksDir, `${book}.json`);
    const bookData = JSON.parse(fs.readFileSync(bookFile, 'utf-8'));

    // Add book title
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - 50; // Start at the top
    page.drawText(`Book: ${book}`, { x: 50, y, size: 18 });
    y -= 30;

    // Add chapters and verses
    for (const chapter of bookData.chapters) {
      if (y < 50) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - 50;
      }
      page.drawText(`Chapter ${chapter.chapter}`, { x: 50, y, size: 16 });
      y -= 20;

      for (const verse of chapter.verses) {
        if (y < 50) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - 50;
        }

        // Add Bible text
        page.drawText(`${verse.verse}: ${verse.text}`, { x: 50, y, size: fontSize });

        // Leave right margin empty
        y -= 20;
      }
    }
  }

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('./KJV_Bible_with_Margins.pdf', pdfBytes);
  console.log('PDF created: KJV_Bible_with_Margins.pdf');
}

createBibleWithMarginsPDF();
