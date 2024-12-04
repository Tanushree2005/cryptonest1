const express = require('express'); // to call our express module
const app = express();
const PORT =3003;
const mysql = require('mysql2');
const cors = require('cors');
const {encrypt,decrypt}=require("./EncryptionHandler.js");
const fs = require('fs');
app.use(cors(
));
app.use(express.json());
// Create MySQL connection
const db = mysql.createConnection({
    user: 'avnadmin',
    host: 'mysql-19e6ba64-mandavillitanushree-7351.e.aivencloud.com',
    password: 'AVNS_nJ5gBEb9Ya4jApdeAdd',
    database: 'defaultdb',
    port:15844,
    connectTimeout: 10000,
    ssl: {
        ca: fs.readFileSync('../ca.pem')
    }
});

// Check MySQL connection
db.connect((err) => {
    if (err) {
        console.log('Error connecting to MySQL: ', err);
    } else {
        console.log('Connected to MySQL');
    }
});

app.post('/addpassword', (req, res) => {
    console.log("Request Body:", req.body); // Log the received body
    const { password, title } = req.body;
    const hashedPassword=encrypt(password);
    console.log('Received password:', password);  // Log the received data
    console.log('Received title:', title);

    if (!password || !title) {
        return res.status(400).send("Password and title are required.");
    }

    db.query(
        "INSERT INTO passwords (passwords, title,iv) VALUES (?, ?,?)",
        [hashedPassword.password, title,hashedPassword.iv],
        (err, result) => {
            if (err) {
                console.log('Database Error:', err);  // Log the database error
                return res.status(500).send("Error inserting password.");
            } else {
                res.status(200).send("Password added successfully.");
            }
        }
    );
});
app.get('/showpassword', (req, res) => {
    db.query("SELECT * FROM passwords;", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            // Log the result to see if password and iv are being returned correctly
            console.log('Fetched passwords:', result);
            res.send(result);
        }
    });
});

app.post('/decryptpass', (req, res) => {
    try {
        const { password, iv } = req.body;
        console.log('Received decryption request:', req.body); // Log request for debugging
        
        // Validate inputs
        if (!password || !iv) {
            return res.status(400).send('Invalid request: Missing password or IV.');
        }

        // Decrypt the password
        const decryptedPassword = decrypt({ password, iv });

        res.status(200).send({ decryptedPassword });
    } catch (error) {
        console.error('Decryption error:', error); // Log detailed error
        res.status(500).send('An error occurred while decrypting the password.');
    }
});

// Start server
app.listen(process.env.PORT || PORT, () => {
    console.log(`The server is running on port ${PORT}`); // to check if the server is running
});
