// app.js
const express = require('express');
const pdf = require('pdf-creator-node');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 3000;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Template for PDF
const htmlTemplate = fs.readFileSync(path.join(__dirname, './template.html'), 'utf8');

app.post('/generate-pdf', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Data to replace in template
    const options = {
      format: 'A3',
      orientation: 'portrait',
      border: '10mm',
      header: {
        height: '20mm',
        contents: '<div style="text-align: center;">Generated PDF</div>'
      },
      footer: {
        height: '20mm',
        contents: '<div style="float:right">{{page}}/{{pages}}</div>'
      }
    };

    const document = {
      html: htmlTemplate,
      data: { name, email, phone },
      path: path.join(__dirname, `./${name}.pdf`)
    };

    const result = await pdf.create(document, options);

    // Return PDF file
    res.download(result.filename, (err) => {
      if (err) {
        throw err;
      }
      fs.unlinkSync(result.filename);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error generating PDF' });
  }
});

app.use((req, res) => {
  res.status(404).send({ message: 'Route not found' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```
```javascript
// pdf-creator-node and express need to be installed
// Here's a sample HTML template
// template.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PDF Document</title>
  <style>
    * {
      font-size: 18px;
    }
  </style>
</head>
<body>
  <div>
    <p><strong>Name:</strong> {{name}}</p>
    <p><strong>Email:</strong> {{email}}</p>
    <p><strong>Phone:</strong> {{phone}}</p>
  </div>
</body>
</html>