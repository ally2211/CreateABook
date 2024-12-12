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
- **Comment Margins**: Leaves an adjustable margin space on the right for comments.

---

### **Output**
The script generates a PDF file named `Antique_Bible_multiUser.pdf` in the project directory. The PDF:
- Contains all 66 books of the Bible.
- Has chapters and verses formatted clearly with ample space for annotations.

---

### **Customization Options**
1. **Adjust Margins**:
   - Modify `marginWidth` in the script to change the size of the right-hand margin.

2. **Change Font Size**:
   - Update the `fontSize` variable to fit more or less text per page.

3. **Add Comments**:
   - Query MongoDB database to get user comments
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
- Support for multilingual Bibles or alternative translations.



### **Tools and Libraries**
1. **Node.js** with **Express**: For building the API.
2. **`fs`**: To handle file operations (reading and writing the scripture JSON file).
3. **Middleware**: `body-parser` (to parse JSON request bodies) and `multer` (to handle file uploads).
3. **MongoDB Database**: storage of user comments

---
### **Generate Token**
node generateToken.js
### **Start the Server:**

node server.js
# Bible Comments Management System

A secure API for managing user-specific comments on Bible verses, including functionality to add, edit, delete comments, and generate personalized PDFs.

---

## Usage

To use the Bible Comments Management System:

1. **Start the Server**:
   - Ensure MongoDB and Redis are running.
   - Run the server:
     ```bash
     node server.js
     ```

2. **Authenticate**:
   - Use a valid JWT token for all API requests.
   - Include the token in the `Authorization` header:
     ```
     Authorization: Bearer <your-jwt-token>
     ```

3. **Test the Endpoints**:
   - Use `curl`, Postman, or Swagger (if enabled) to interact with the API.
   - Base URL: `http://localhost:3000`

---

## Endpoints

### 1. Add a Comment

- **Method**: `POST`
- **Endpoint**: `/comments`
- **Description**: Add a new comment to a specific verse.

#### Request:
- **Headers**:
  - `Authorization: Bearer <your-jwt-token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
      "book": "Genesis",
      "chapter": 1,
      "verse": 4,
      "comment": "This is a test comment."
  }
  ```

#### Using Curl:
```bash
curl -X POST -H "Authorization: Bearer <your-jwt-token>" \
-H "Content-Type: application/json" \
-d '{"book":"Genesis", "chapter":1, "verse":4, "comment":"This is a test comment"}' \
http://localhost:3000/comments
```

#### Response:
```json
{
    "message": "Comment added successfully",
    "commentId": "unique-comment-id"
}
```

---

### 2. Edit a Comment

- **Method**: `PUT`
- **Endpoint**: `/comments`
- **Description**: Update an existing comment for a specific Bible verse.

#### Request:
- **Headers**:
  - `Authorization: Bearer <your-jwt-token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
      "book": "Genesis",
      "chapter": 1,
      "verse": 4,
      "comment": "Updated comment text."
  }
  ```

#### Using Curl:
```bash
curl -X PUT -H "Authorization: Bearer <your-jwt-token>" \
-H "Content-Type: application/json" \
-d '{"book":"Genesis", "chapter":1, "verse":4, "comment":"Updated comment text"}' \
http://localhost:3000/comments
```

#### Response:
```json
{
    "message": "Comment updated successfully"
}
```

---

### 3. Delete a Comment

- **Method**: `DELETE`
- **Endpoint**: `/comments`
- **Description**: Remove a comment for a specific Bible verse.

#### Request:
- **Headers**:
  - `Authorization: Bearer <your-jwt-token>`
- **Query Parameters**:
  - `book=Genesis`
  - `chapter=1`
  - `verse=4`

#### Using Curl:
```bash
curl -X DELETE -H "Authorization: Bearer <your-jwt-token>" \
"http://localhost:3000/comments?book=Genesis&chapter=1&verse=4"
```

#### Response:
```json
{
    "message": "Comment deleted successfully"
}
```

---

### 4. Generate a PDF

- **Method**: `GET`
- **Endpoint**: `/comments/generate-pdf`
- **Description**: Generate a personalized PDF with user comments.

#### Request:
- **Headers**:
  - `Authorization: Bearer <your-jwt-token>`

#### Using Curl:
```bash
curl -X GET -H "Authorization: Bearer <your-jwt-token>" \
http://localhost:3000/comments/generate-pdf
```

#### Response:
```
PDF generated successfully.
```

The PDF will be saved in the server directory.

---

### 5. Fetch All Comments (Optional)

- **Method**: `GET`
- **Endpoint**: `/comments`
- **Description**: Fetch all comments for the authenticated user.

#### Request:
- **Headers**:
  - `Authorization: Bearer <your-jwt-token>`

#### Response:
```json
[
    {
        "userId": "user1",
        "book": "Genesis",
        "chapter": 1,
        "verse": 4,
        "comment": "This is a test comment."
    },
    {
        "userId": "user1",
        "book": "Exodus",
        "chapter": 2,
        "verse": 5,
        "comment": "Another comment."
    }
]
```

---

## Notes

- **JWT Token**: Use a valid JWT token to authenticate all requests. Without it, you'll receive a `401 Unauthorized` error.
- **Swagger Documentation**: If Swagger is enabled, access interactive API documentation at `http://localhost:3000/api-docs`.



## Usage

To use the Bible Comments Management System:

1. **Start the Server**:
   - Ensure MongoDB and Redis are running.
   - Run the server:
     ```bash
     node server.js
     ```

2. **Authenticate**:
   - Use a valid JWT token for all API requests.
   - Include the token in the `Authorization` header:
     ```
     Authorization: Bearer <your-jwt-token>
     ```

3. **Test the Endpoints**:
   - Use `curl`, Postman, or Swagger (if enabled) to interact with the API.
   - Base URL: `http://localhost:3000`

---

## Endpoints

### 1. Add a Comment

- **Method**: `POST`
- **Endpoint**: `/comments`
- **Description**: Add a new comment to a specific verse.

#### Request:
- **Headers**:
  - `Authorization: Bearer <your-jwt-token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
      "book": "Genesis",
      "chapter": 1,
      "verse": 4,
      "comment": "This is a test comment."
  }
  ```

#### Using Curl:
```bash
curl -X POST -H "Authorization: Bearer <your-jwt-token>" \
-H "Content-Type: application/json" \
-d '{"book":"Genesis", "chapter":1, "verse":4, "comment":"This is a test comment"}' \
http://localhost:3000/comments
```

#### Response:
```json
{
    "message": "Comment added successfully",
    "commentId": "unique-comment-id"
}
```

---

### 2. Edit a Comment

- **Method**: `PUT`
- **Endpoint**: `/comments`
- **Description**: Update an existing comment for a specific Bible verse.

#### Request:
- **Headers**:
  - `Authorization: Bearer <your-jwt-token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
      "book": "Genesis",
      "chapter": 1,
      "verse": 4,
      "comment": "Updated comment text."
  }
  ```

#### Using Curl:
```bash
curl -X PUT -H "Authorization: Bearer <your-jwt-token>" \
-H "Content-Type: application/json" \
-d '{"book":"Genesis", "chapter":1, "verse":4, "comment":"Updated comment text"}' \
http://localhost:3000/comments
```

#### Response:
```json
{
    "message": "Comment updated successfully"
}
```

---

### 3. Delete a Comment

- **Method**: `DELETE`
- **Endpoint**: `/comments`
- **Description**: Remove a comment for a specific Bible verse.

#### Request:
- **Headers**:
  - `Authorization: Bearer <your-jwt-token>`
- **Query Parameters**:
  - `book=Genesis`
  - `chapter=1`
  - `verse=4`

#### Using Curl:
```bash
curl -X DELETE -H "Authorization: Bearer <your-jwt-token>" \
"http://localhost:3000/comments?book=Genesis&chapter=1&verse=4"
```

#### Response:
```json
{
    "message": "Comment deleted successfully"
}
```

---

### 4. Generate a PDF

- **Method**: `GET`
- **Endpoint**: `/comments/generate-pdf`
- **Description**: Generate a personalized PDF with user comments.

#### Request:
- **Headers**:
  - `Authorization: Bearer <your-jwt-token>`

#### Using Curl:
```bash
curl -X GET -H "Authorization: Bearer <your-jwt-token>" \
http://localhost:3000/comments/generate-pdf
```

#### Response:
```
PDF generated successfully.
```

The PDF will be saved in the server directory.

---

### 5. Fetch All Comments (Optional)

- **Method**: `GET`
- **Endpoint**: `/comments`
- **Description**: Fetch all comments for the authenticated user.

#### Request:
- **Headers**:
  - `Authorization: Bearer <your-jwt-token>`

#### Response:
```json
[
    {
        "userId": "user1",
        "book": "Genesis",
        "chapter": 1,
        "verse": 4,
        "comment": "This is a test comment."
    },
    {
        "userId": "user1",
        "book": "Exodus",
        "chapter": 2,
        "verse": 5,
        "comment": "Another comment."
    }
]
```

---

## Notes

- **JWT Token**: Use a valid JWT token to authenticate all requests. Without it, you'll receive a `401 Unauthorized` error.
- **Swagger Documentation**: If Swagger is enabled, access interactive API documentation at `http://localhost:3000/api-docs`.


