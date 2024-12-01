const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

// Paths to files
const commentsFile = path.join(__dirname, 'Bible-kjv-master/comments.json');
const booksFile = path.join(__dirname, 'Bible-kjv-master/Books.json');
const booksDir = path.join(__dirname, 'Bible-kjv-master');

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

async function createBibleWithCommentsPDF() {
  const pdfDoc = await PDFDocument.create(); // Create a new PDF document
  const pageWidth = 1000; // Extended page width for wider scripture text
  const pageHeight = 792; // Standard page height
  const scriptureWidth = 600; // Width for scripture text
  const commentWidth = 400; // Width for comment text
  const fontSize = 12; // Font size for both scripture and comments
  const lineHeight = fontSize + 4; // Line height for spacing
  let yOffset = pageHeight - 100; // Current vertical position

  let pageNumber = 0;  //Initialize page number
  const totalPages = [];  //store all pages to add numbers later

  for (const book of books) {
    const bookFile = path.join(booksDir, `${book}.json`);
    const bookData = JSON.parse(fs.readFileSync(bookFile, 'utf-8'));
    let page = pdfDoc.addPage([pageWidth, pageHeight]); // Add a new page
    pageNumber++;
    totalPages.push(page);

    // Draw the book title
    page.drawText(`Book: ${book}`, { x: 80, y: yOffset, size: 18 });
    yOffset -= 30;

    for (const chapter of bookData.chapters) {
      // Estimate the height required for the chapter header and at least 3 verses
        const estimatedHeight = 40 + 20 + (3 * 3 * lineHeight); // Chapter header + 3 verses

      // Check if there's enough space; if not, move to the next page
      if (yOffset - estimatedHeight < 50) {
        pageNumber++;
        page = pdfDoc.addPage([pageWidth, pageHeight]); // Add a new page
        yOffset = pageHeight - 100;
      }

      // Print the chapter header
      yOffset -= 40; // Add space before the chapter header
      page.drawText(`Chapter ${chapter.chapter}`, { x: 80, y: yOffset, size: 16 });
      yOffset -= 30; // Add space after the chapter header

      for (const verse of chapter.verses) {
        // Estimate height for 3 lines of text
        const verseHeight = 3 * lineHeight;

        // Move to the next page if there’s not enough space
        if (yOffset - verseHeight < 50) {
          page = pdfDoc.addPage([pageWidth, pageHeight]); // Add a new page
          yOffset = pageHeight - 100;
          pageNumber++;
        }

        // Wrap and print the scripture text
        //change wrap width here
        const verseLines = wrapText(`${verse.verse}: ${verse.text}`, scriptureWidth - 40, fontSize);
        let verseStartY = yOffset; // Track starting position for comments
        verseLines.forEach((line) => {

          if (yOffset < 50) {  //3 lines after header
            pageNumber++;
            page = pdfDoc.addPage([pageWidth, pageHeight]); // Add a new page
            yOffset = pageHeight - 50;
            //pageNumber++;
          }
          //pageNumber++;
          page.drawText(line, { x: 80, y: yOffset, size: fontSize });
          yOffset -= lineHeight;
          // Add page number
          page.drawText(`Page ${pageNumber}`, {
            x: pageWidth / 2 - 20, // Center the page number horizontally
            y: 30, // Position at the bottom of the page
            size: 12,
            color: rgb(0.5, 0.3, 0.1),
          });
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
          let commentY = Math.max(verseStartY, yOffset + lineHeight); // Align comments properly
          commentLines.forEach((line) => {
            if (commentY < 50) {
              page = pdfDoc.addPage([pageWidth, pageHeight]);
              commentY = pageHeight - 50;
            }
            page.drawText(line, { x: scriptureWidth + 80, y: commentY, size: fontSize, color: rgb(0.5, 0.5, 0.5) });
            commentY -= lineHeight;
          });

          // Ensure the next verse starts below the comment
          yOffset = Math.min(yOffset, commentY);
        }

      }
    }

  }

  // Save the PDF
  const pdfBytes = await pdfDoc.save(); // Save the PDF document
  fs.writeFileSync('./KJV_Bible_with_Comments.pdf', pdfBytes); // Write to file
  console.log('PDF created: KJV_Bible_with_Comments.pdf');
}

createBibleWithCommentsPDF(); // Run the function
