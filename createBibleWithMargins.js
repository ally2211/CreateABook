const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

// File paths
const booksFile = path.join(__dirname, 'Bible-kjv-master', 'Books.json');
const booksDir = path.join(__dirname, 'Bible-kjv-master');
const commentsFile = path.join(__dirname, 'Bible-kjv-master', 'Comments.json');

// Read the Books and Comments JSON
const books = JSON.parse(fs.readFileSync(booksFile, 'utf-8'));
const comments = JSON.parse(fs.readFileSync(commentsFile, 'utf-8'));

/**
 * Helper function to wrap text into lines that fit within a given width.
 * @param {string} text - The text to wrap.
 * @param {number} maxWidth - The maximum width in points.
 * @param {number} fontSize - Font size for approximation.
 * @returns {string[]} - Array of wrapped lines.
 */
function wrapText(text, maxWidth, fontSize) {
  const words = text.split(' ');
  let lines = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine + word + ' ';
    const testWidth = testLine.length * (fontSize * 0.5); // Approximation
    if (testWidth > maxWidth) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines;
}

async function createBibleWithMarginsPDF() {
  const pdfDoc = await PDFDocument.create(); // Create a new PDF document
  const pageWidth = 1000; // Extended width for wider scripture text
  const pageHeight = 792; // Standard page height
  const scriptureWidth = 600; // Width for scripture text
  const commentWidth = 400; // Width for comment text
  const fontSize = 12; // Font size for both scripture and comments
  const lineHeight = fontSize + 4; // Line height for spacing
  let yOffset = pageHeight - 50; // Current vertical position

  for (const book of books) {
    const bookFile = path.join(booksDir, `${book}.json`);
    const bookData = JSON.parse(fs.readFileSync(bookFile, 'utf-8'));
    let page = pdfDoc.addPage([pageWidth, pageHeight]); // Add a new page

    // Draw the book title
    page.drawText(`Book: ${book}`, { x: 50, y: yOffset, size: 18 });
    yOffset -= 30;

    for (const chapter of bookData.chapters) {
       // Estimate the height required for the chapter header and at least 3 verses
        const estimatedHeight = 40 + 20 + (3 * 3 * lineHeight); // Chapter header + 3 verses

      // Check if enough space is available before adding the chapter header
      if (yOffset - estimatedHeight  < 50) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        yOffset = pageHeight - 50;
      }

      // Add space before the chapter header
      yOffset -= 40;
      page.drawText(`Chapter ${chapter.chapter}`, { x: 50, y: yOffset, size: 16 });
      yOffset -= 30;

      for (const verse of chapter.verses) {
        // Estimate the height required for at least 3 verses
        const verseHeight =  3 * lineHeight;
        if (yOffset - verseHeight < 50) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          yOffset = pageHeight - 50;
        }
        // Wrap and draw scripture text
        const verseLines = wrapText(`${verse.verse}: ${verse.text}`, scriptureWidth, fontSize);
        let verseStartY = yOffset; // Starting Y position for this verse's text
        verseLines.forEach((line) => {

          if (yOffset < 50) {  //3 lines after header
            page = pdfDoc.addPage([pageWidth, pageHeight]); // Add a new page
            yOffset = pageHeight - 50;
          }
          page.drawText(line, { x: 50, y: yOffset, size: fontSize });
          yOffset -= lineHeight;
        });

        // Draw vertical line
        page.drawLine({
          start: { x: scriptureWidth + 60, y: pageHeight - 50 },
          end: { x: scriptureWidth + 60, y: 50 },
          thickness: 1,
          color: rgb(0.8, 0.8, 0.8),
        });

        // Add comments for this verse
        const chapterComments = comments[book]?.[chapter.chapter];
        const verseComment = chapterComments?.[verse.verse];
        if (verseComment) {
          const commentLines = wrapText(`${verse.verse}: ${verseComment}`, commentWidth, fontSize);

          // Calculate the comment's starting position
          let commentY = Math.max(verseStartY, yOffset + lineHeight); // Align with verse's top or move down if needed
          commentLines.forEach((line) => {
            if (commentY < 50) {
              page = pdfDoc.addPage([pageWidth, pageHeight]);
              commentY = pageHeight - 50;
            }
            page.drawText(line, { x: scriptureWidth + 80, y: commentY, size: fontSize, color: rgb(0.5, 0.5, 0.5) });
            commentY -= lineHeight;
          });

          // Update yOffset to avoid overlap with comments
          yOffset = Math.min(yOffset, commentY);
        }
      }
    }
  }

  // Save the PDF
  const pdfBytes = await pdfDoc.save(); // Correctly save the PDF from the instance
  fs.writeFileSync('./KJV_Bible_with_Margins.pdf', pdfBytes); // Write to file
  console.log('PDF created: KJV_Bible_with_Margins.pdf');
}

createBibleWithMarginsPDF(); // Execute the function
