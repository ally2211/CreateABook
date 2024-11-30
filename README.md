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

---