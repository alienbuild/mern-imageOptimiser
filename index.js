const express = require('express');
var cors = require('cors')
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const tinify = require("tinify");

// API Key
tinify.key = "YOUR API KEY";

// Init app
const app = express();
const port = process.env.PORT || 5000;

// Init middleware
app.use(cors())
app.use(express.json());

// Define routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

// SquashIt image optimiser
async function squashIt(file, res){
    console.log('Uploaded file size:', file.size);
    console.log('Squashing it...');
    const source = tinify.fromFile(`./uploads/${file.name}`);
    const fileName =  path.parse(file.name).name;
    try {
        await source.toFile(`./public/public/optimised/${fileName}.jpg`);
        console.log('Await finished');
        const stats = fs.statSync(`./public/public/optimised/${fileName}.jpg`);
        console.log('File size is now:', stats.size);
        res.status(200).json({
            previousSize: file.size,
            optimisedSize: stats.size,
            percentageDiff: 'Optimised By: ' + (file.size - stats.size)/file.size * 100 + '%',
            imageUrl: `/optimised/${file.name}`,
        })
    } catch (e) {
        console.log('Oops, something went wrong...', e);
        res.status(400).json({
            error: 'Something went wrong.'
        })
    }
}

// Listen for form submissions
app.post('/upload', (req, res) => {
    if (req.files === null){
        return res.status(400).json({ msg: 'No files were uploaded.' })
    }
    new formidable.IncomingForm().parse(req)
        .on('fileBegin', (name, file) => {
            file.path = __dirname + '/uploads/' + file.name;
        })
        .on('file', (name, file) => {
            console.log('Preparing to squash it.');
            squashIt(file, res);
        })
});

// Start server
app.listen(port, () => console.log(`Server is running port ${port}`));

