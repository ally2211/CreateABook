## Sprint Project T4
### Generate a PDF Bible with Wide Margins for Comments

This project generates a PDF of the King James Version (KJV) Bible using data from a `Books.json` file and individual JSON files for each book. The output includes wide margins on each page for handwritten or digital comments.

---

### **Project Features**
- Generates a fully formatted PDF of the KJV Bible.
- Includes extra-wide margins on the right-hand side for notes or comments.
- Processes data from JSON files for each book, organized by chapters and verses.

---

### **Requirements**
1. **Node.js** (v14 or higher)
2. **npm** (comes with Node.js)
3. Dependencies:
   - `pdf-lib`: For creating and formatting PDFs.
4. File structure containing `Books.json` and individual book files (e.g., `Genesis.json`, `Exodus.json`).

---

### **File Structure**
project directory should be organized as follows:
```
Bible-kjv-master/
├── Books.json            # Array of book names (e.g., ["Genesis", "Exodus", ...])
├── Genesis.json          # JSON file with chapters and verses for Genesis
├── Exodus.json           # JSON file with chapters and verses for Exodus
├── Leviticus.json        # JSON file for other books...
```

Example `Books.json`:
```json
["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", ...]
```

Example `Genesis.json`:
```json
{
  "book": "Genesis",
  "chapters": [
    {
      "chapter": "1",
      "verses": [
        { "verse": "1", "text": "In the beginning God created the heaven and the earth." },
        { "verse": "2", "text": "And the earth was without form, and void; and darkness was upon the face of the deep..." }
      ]
    },
    {
      "chapter": "2",
      "verses": [
        { "verse": "1", "text": "Thus the heavens and the earth were finished, and all the host of them." }
      ]
    }
  ]
}
```

---

### **Setup Instructions**

#### 1. **Clone or Prepare the Directory**
Place the `Bible-kjv-master` folder containing `Books.json` and individual book files in your project directory.

#### 2. **Install Dependencies**
Install the required npm package:
```bash
npm install pdf-lib
```

#### 3. **Run the Script**
Execute the script to generate the PDF:
```bash
node createBibleWithMargins.js
```

---

### **Script: `createBibleWithMargins.js`**

The script:
1. Reads the `Books.json` file to get the list of all books.
2. Iterates through each book and loads its corresponding JSON file (e.g., `Genesis.json`).
3. Formats the Bible text and outputs a PDF with wide margins for comments.

Key parts of the script include:
- **Adding the Bible Text**: Places text on the left-hand side of the page.
- **Wide Margins**: Leaves an adjustable margin space on the right.

---

### **Output**
The script generates a PDF file named `KJV_Bible_with_Margins.pdf` in the project directory. The PDF:
- Contains all 66 books of the Bible.
- Has chapters and verses formatted clearly with ample space for annotations.

---

### **Customization Options**
1. **Adjust Margins**:
   - Modify `marginWidth` in the script to change the size of the right-hand margin.

2. **Change Font Size**:
   - Update the `fontSize` variable to fit more or less text per page.

3. **Add Comments**:
   - If your JSON files include comments, modify the script to display them in the margins:
     ```javascript
     if (verse.comment) {
       page.drawText(`Comment: ${verse.comment}`, { x: 420, y, size: 10 });
     }
     ```

4. **Split Long Verses**:
   - Use text wrapping to handle long verses that don't fit on a single line.

---

### **Future Enhancements**
- Add interactive form fields for digital notes in the margins.
- Include headers and footers for navigation and styling.
- Support for multilingual Bibles or alternative translations.



### **Tools and Libraries**
1. **Node.js** with **Express**: For building the API.
2. **`fs`**: To handle file operations (reading and writing the comments JSON file).
3. **Middleware**: `body-parser` (to parse JSON request bodies) and `multer` (to handle file uploads).

---

### **API Endpoints**

1. **GET `/comments`**:
   - Retrieve comments for a specific book, chapter, or verse.
   - Query parameters:
     - `book`: The name of the book (e.g., Genesis).
     - `chapter`: (Optional) The chapter number.
     - `verse`: (Optional) The verse number.

2. **POST `/comments`**:
   - Add a comment to a specific verse.
   - Request body: `{ book, chapter, verse, comment }`.

3. **PUT `/comments`**:
   - Edit a comment for a specific verse.
   - Request body: `{ book, chapter, verse, comment }`.

4. **DELETE `/comments`**:
   - Remove a comment for a specific verse.
   - Query parameters: `book`, `chapter`, and `verse`.

5. **POST `/upload-comments`**:
   - Upload a JSON file containing comments for the entire Bible.
   - Overwrites the existing `comments.json` file.

---

### **Code Implementation**

#### 1. **Setup the Server**

```javascript
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Middleware for JSON parsing
app.use(express.json());

// Comments file path
const commentsFile = path.join(__dirname, 'comments.json');

// Ensure comments.json exists
if (!fs.existsSync(commentsFile)) {
  fs.writeFileSync(commentsFile, JSON.stringify({}), 'utf-8');
}

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });
```

---

#### 2. **Endpoints**

##### **GET `/comments`**

```javascript
app.get('/comments', (req, res) => {
  const { book, chapter, verse } = req.query;

  // Read comments file
  const comments = JSON.parse(fs.readFileSync(commentsFile, 'utf-8'));

  if (!book) {
    return res.status(400).json({ error: 'Book is required' });
  }

  let result = comments[book];
  if (chapter) {
    result = result?.[chapter];
    if (verse) {
      result = result?.[verse];
    }
  }

  if (!result) {
    return res.status(404).json({ error: 'No comments found' });
  }

  res.json(result);
});
```

---

##### **POST `/comments`**

```javascript
app.post('/comments', (req, res) => {
  const { book, chapter, verse, comment } = req.body;

  if (!book || !chapter || !verse || !comment) {
    return res.status(400).json({ error: 'Book, chapter, verse, and comment are required' });
  }

  // Read comments file
  const comments = JSON.parse(fs.readFileSync(commentsFile, 'utf-8'));

  // Add or update the comment
  comments[book] = comments[book] || {};
  comments[book][chapter] = comments[book][chapter] || {};
  comments[book][chapter][verse] = comment;

  // Save the updated comments
  fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2));
  res.status(201).json({ message: 'Comment added successfully' });
});
```

---

##### **PUT `/comments`**

```javascript
app.put('/comments', (req, res) => {
  const { book, chapter, verse, comment } = req.body;

  if (!book || !chapter || !verse || !comment) {
    return res.status(400).json({ error: 'Book, chapter, verse, and comment are required' });
  }

  // Read comments file
  const comments = JSON.parse(fs.readFileSync(commentsFile, 'utf-8'));

  if (!comments[book]?.[chapter]?.[verse]) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  // Update the comment
  comments[book][chapter][verse] = comment;

  // Save the updated comments
  fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2));
  res.json({ message: 'Comment updated successfully' });
});
```

---

##### **DELETE `/comments`**

```javascript
app.delete('/comments', (req, res) => {
  const { book, chapter, verse } = req.query;

  if (!book || !chapter || !verse) {
    return res.status(400).json({ error: 'Book, chapter, and verse are required' });
  }

  // Read comments file
  const comments = JSON.parse(fs.readFileSync(commentsFile, 'utf-8'));

  if (!comments[book]?.[chapter]?.[verse]) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  // Remove the comment
  delete comments[book][chapter][verse];

  // Clean up empty objects
  if (Object.keys(comments[book][chapter]).length === 0) {
    delete comments[book][chapter];
  }
  if (Object.keys(comments[book]).length === 0) {
    delete comments[book];
  }

  // Save the updated comments
  fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2));
  res.json({ message: 'Comment deleted successfully' });
});
```

---

##### **POST `/upload-comments`**

```javascript
app.post('/upload-comments', upload.single('file'), (req, res) => {
  const { file } = req;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Read the uploaded file
  const uploadedComments = JSON.parse(fs.readFileSync(file.path, 'utf-8'));

  // Save the uploaded comments
  fs.writeFileSync(commentsFile, JSON.stringify(uploadedComments, null, 2));

  // Remove the uploaded file
  fs.unlinkSync(file.path);

  res.json({ message: 'Comments file uploaded successfully' });
});
```

---

#### 3. **Start the Server**

```javascript
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

---

### **Testing the Endpoints**

1. **GET `/comments`**:
   ```bash
   curl "http://localhost:3000/comments?book=Genesis&chapter=1&verse=1"
   ```

2. **POST `/comments`**:
   ```bash
   curl -X POST -H "Content-Type: application/json" -d '{"book":"Genesis","chapter":"1","verse":"1","comment":"This is a test comment"}' http://localhost:3000/comments
   ```

3. **PUT `/comments`**:
   ```bash
   curl -X PUT -H "Content-Type: application/json" -d '{"book":"Genesis","chapter":"1","verse":"1","comment":"Updated comment"}' http://localhost:3000/comments
   ```

4. **DELETE `/comments`**:
   ```bash
   curl -X DELETE "http://localhost:3000/comments?book=Genesis&chapter=1&verse=1"
   ```

5. **POST `/upload-comments`**:
   ```bash
   curl -X POST -F "file=@comments.json" http://localhost:3000/upload-comments
   ```

---