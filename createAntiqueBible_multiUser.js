//const { PDFDocument, rgb } = require('pdf-lib');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fontkit = require('fontkit'); // Import fontkit
const fs = require('fs');
const path = require('path');
const logger = require('./logger'); // Adjust the path based on your file structure
//const currentUserId = "user2"; // Replace with the actual userId from authentication
const { connectDb, closeDb, getComments } = require('./controllers/commentsController');

// Paths to files
//const commentsFile = path.join(__dirname, 'Bible-kjv-master/comments.json');
const booksFile = path.join(__dirname, 'Bible-kjv-master/Books.json');
const booksDir = path.join(__dirname, 'Bible-kjv-master');

// Read the Books and Comments JSON
const books = JSON.parse(fs.readFileSync(booksFile, 'utf-8'));
//const comments = JSON.parse(fs.readFileSync(commentsFile, 'utf-8'));

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

async function createAntiqueBiblePDF_multiUser(currentUserId) {
  if (!currentUserId) {
    throw new Error('currentUserId is required');
  }
  let client; // Declare client outside the try-catch-finally block
  try {
  console.log(`Starting PDF generation for user: ${currentUserId}`);
  const { db, client: dbClient } = await connectDb(); // Connect to the database
  client = dbClient; // Assign client for closing in finally
  
  // Debugging the db instance
  if (!db) {
    throw new Error("Database instance is undefined.");
  }
  console.log("Database instance initialized:", db.databaseName);
  //const currentUserId = "user1"; // Replace with dynamic userId if needed
   
  const userComments = await db.collection('comments').find({ userId: currentUserId }).toArray();
  console.log(`Fetched ${userComments.length} comments for the user.`);


  const pdfDoc = await PDFDocument.create(); // Create a new PDF document
  const pageWidth = 1000; // Extended page width for wider scripture text
  const pageHeight = 792; // Standard page height
  const scriptureWidth = 500; // Width for scripture text
  const commentWidth = 450; // Width for comment text
  const fontSize = 12; // Font size for both scripture and comments
  const lineHeight = fontSize + 4; // Line height for spacing
  let yOffset = pageHeight - 190; // Current vertical position

  //const currentUserId = "user1";
  // Load custom font and graphics
  pdfDoc.registerFontkit(fontkit); // Register fontkit
  const antiqueFontBytes = fs.readFileSync(path.join(__dirname, 'blazed/Blazed.ttf'));
  const antiqueLondonFontBytes = fs.readFileSync(path.join(__dirname, 'old_london/OldLondon.ttf'));
  const antiqueFont = await pdfDoc.embedFont(antiqueFontBytes);
  const LondonFont = await pdfDoc.embedFont(antiqueLondonFontBytes);
  
  const backgroundBytes = fs.readFileSync(path.join(__dirname, 'antiquebkg.png'));
  const backgroundImage = await pdfDoc.embedPng(backgroundBytes);

  const headerDecorationBytes = fs.readFileSync(path.join(__dirname, 'header-decoration.png'));
  const headerDecoration = await pdfDoc.embedPng(headerDecorationBytes);


  let pageNumber = 0;  //Initialize page number
  const totalPages = [];  //store all pages to add numbers later

  for (const book of books) {
    const bookFile = path.join(booksDir, `${book}.json`);
    const bookData = JSON.parse(fs.readFileSync(bookFile, 'utf-8'));
    let page = pdfDoc.addPage([pageWidth, pageHeight]); // Add a new page
    yOffset = pageHeight - 150;  //spacing after book picture
    pageNumber++;
    totalPages.push(page);

    //*************************************************************************** */
    // Draw the background
    //*************************************************************************** */
    page.drawImage(backgroundImage, {
        width: pageWidth,
        height: pageHeight,
    });
    // Add a decorative header
    page.drawImage(headerDecoration, {
        x: 50,
        y: pageHeight - 150,
        width: 500,
        height: 100,
    });

    yOffset -= 100;
    // Draw the book title
    //page.drawText(`Book: ${book}`, { x: 80, y: yOffset, size: 18 });
    // Add book title in antique font
    page.drawText(`Book: ${book}`, {
        x: 80,
        y: yOffset,
        size: 18,
        font: antiqueFont,
        color: rgb(0.5, 0.3, 0.1),
    });
    logger.info(`Added Book: ${book} to the page`);
     // Add the "Commented by" line
    yOffset -= 30;
    page.drawText(`Commented by ${currentUserId}`, {
        x: 80, // Align with the book title
        y: yOffset,
        size: 14,
        font: antiqueFont,
        color: rgb(0.3, 0.3, 0.3),
    });
    yOffset -= 30; // Add spacing below the "Commented by" line
    //logger.info(`Commented by: ${currentUserId} to the page`);
   // yOffset -= 20;

    for (const chapter of bookData.chapters) {
      // Estimate the height required for the chapter header and at least 3 verses
      const estimatedHeight = 20 + (3 * 3 * lineHeight); // Chapter header + 3 verses

      // Check if there's enough space; if not, move to the next page
      if (yOffset - estimatedHeight < 50) {
        pageNumber++;
        page = pdfDoc.addPage([pageWidth, pageHeight]); // Add a new page
        yOffset = pageHeight - 100;  // because added 30 before chapter delete again
        //*************************************************************************** */        
        // Draw the background - NEW CHAPTER PAGE
        //*************************************************************************** */
        page.drawImage(backgroundImage, {
            width: pageWidth,
            height: pageHeight,
        });
      }

      // Print the chapter header
      yOffset -= 20; // Add space before the chapter header
      //page.drawText(`Chapter ${chapter.chapter}`, { x: 80, y: yOffset, size: 16 });
      page.drawText(`Chapter ${chapter.chapter}`, {
        x: 80,
        y: yOffset,
        size: 16,
        font: antiqueFont,
        color: rgb(0.3, 0.2, 0.1),
      });
      
      yOffset -= 30; // Add space after the chapter header

      for (const verse of chapter.verses) {
        // Estimate height for 3 lines of text
        const verseHeight = 3 * lineHeight;

        // Move to the next page if there’s not enough space
        if (yOffset - verseHeight < 50) {
          page = pdfDoc.addPage([pageWidth, pageHeight]); // Add a new page
          yOffset = pageHeight - 100;
          pageNumber++;
        //*************************************************************************** */          
          // Draw the background
        //*************************************************************************** */
          page.drawImage(backgroundImage, {
            width: pageWidth,
            height: pageHeight,
          });
        }

        // Wrap and print the scripture text
        //change wrap width here
        const verseLines = wrapText(`${verse.verse}: ${verse.text}`, scriptureWidth - 40, fontSize);
        let verseStartY = yOffset; // Track starting position for comments       
        
        verseLines.forEach((line) => {

          if (yOffset < 50) {  //3 lines after header
            //pageNumber++;
            page = pdfDoc.addPage([pageWidth, pageHeight]); // Add a new page
            yOffset = pageHeight - 50;

          }
          //pageNumber++;
          //page.drawText(line, { x: 80, y: yOffset, size: fontSize });

          page.drawText(line, {
            x: 80,
            y: yOffset,
            size: fontSize,
            font: LondonFont,
            color: rgb(0.3, 0.2, 0.1),
          });
          yOffset -= lineHeight;
          // Add page number
          page.drawText(`Page ${pageNumber}`, {
            x: pageWidth / 2 - 20, // Center the page number horizontally
            y: 30, // Position at the bottom of the page
            size: 12,
            color: rgb(0.5, 0.3, 0.1),
          });

        });
        
        //*************************************************************************** */
        // Draw vertical line
        //*************************************************************************** */
        page.drawLine({
          start: { x: scriptureWidth + 60, y: pageHeight - 50 },
          end: { x: scriptureWidth + 60, y: 50 },
          thickness: 1,
          color: rgb(0.8, 0.8, 0.8),
        });

        //************************************************************************* */
        // Add comments for this verse
        //*************************************************************************** */
        //const connectDb = require('./connectDb'); // Adjust the path to your connection file
        // Retrieve comments for the current verse and user
        //console.log('before userComment get comments')       
        //const userComments = await getComments(book, chapter.chapter, verse.verse, currentUserId);
        // Fetch all comments for the user in one query
               // Add the scripture text and comments to the PDF
          //console.log(`User comments for ${book} ${chapter.chapter}:${verse.verse}:`, userComments);
 
        const verseComments = userComments.filter(
            (comment) =>
              comment.book === book &&
              comment.chapter === parseInt(chapter.chapter) &&
              comment.verse === parseInt(verse.verse)
          );

          // Skip verses with no comments
          if (verseComments.length === 0) continue;

          console.log(`Adding comments for ${book} ${chapter.chapter}:${verse.verse}:`, verseComments);

        // Print comments for the current verse
        if (verseComments && verseComments.length > 0) {
        verseComments.forEach((comment) => {
            const commentLines = wrapText(
            `${verse.verse}: ${comment.comment}`,
            commentWidth,
            fontSize
            );
            //const commentLines = wrapText(comment, commentWidth, fontSize);
            let commentY = Math.max(verseStartY, yOffset + lineHeight); // Align comments properly
            commentLines.forEach((line) => {
            if (commentY < 50) {
                page = pdfDoc.addPage([pageWidth, pageHeight]);
                commentY = pageHeight - 50;
            }
            page.drawText(line, {
                x: scriptureWidth + 80,
                y: commentY,
                size: fontSize,
                color: rgb(0.3, 0.2, 0.1),
            });
            commentY -= lineHeight;
            });
            // Ensure the next verse starts below the last comment
            yOffset = Math.min(yOffset, commentY);
        });
        }


        //const chapterComments = comments[book]?.[chapter.chapter];
        //const verseComments = chapterComments?.[verse.verse];
        //const userComments = verseComments?.filter((c) => c.userId === currentUserId);

      }
    }
  }

  // Save the PDF
  const pdfBytes = await pdfDoc.save(); // Save the PDF document
  fs.writeFileSync('./Antique_Bible_multiUser.pdf', pdfBytes); // Write to file
  console.log('PDF created: Antique_Bible.pdf');
  logger.info('Successfully created the Antique Bible PDF.');
} catch (error) {
    logger.error(`Error during PDF creation: ${error.message}`);
    console.error(`Error during PDF creation: ${error.message}`);
} finally {
    console.log("Closing MongoDB connection...");
    await closeDb(); // Close the database connection
}
}
//createAntiqueBiblePDF_multiUser(); // Run the function
module.exports = { createAntiqueBiblePDF_multiUser };
