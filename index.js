require('dotenv').config();
const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const PORT = process.env.PORT || 3003;
const { encrypt, decrypt } = require("./EncryptionHandler.js");
app.use(cors({
    origin: 'https://cryptonest1.netlify.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'] 
}));
app.use(express.json());

// MySQL connection config using environment variables
const db = mysql.createConnection({
        user: 'avnadmin',
        host: 'mysql-19e6ba64-mandavillitanushree-7351.e.aivencloud.com',
        password: 'AVNS_nJ5gBEb9Ya4jApdeAdd',
        database: 'defaultdb',
        port:15844,
        connectTimeout: 10000,
   /* ssl: {
        ca: sslCertificate,
        rejectUnauthorized: false,
    }, */
});

db.connect((err) => {
    if (err) {
        console.log('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

app.post('/addpassword', (req, res) => {
    const { password, title } = req.body;
    const hashedPassword = encrypt(password);

    if (!password || !title) {
        return res.status(400).send("Password and title are required.");
    }

    db.query(
        "INSERT INTO passwords (passwords, title, iv) VALUES (?, ?, ?)",
        [hashedPassword.password, title, hashedPassword.iv],
        (err, result) => {
            if (err) {
                console.log('Database Error:', err);
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
            res.send(result);
        }
    });
});

app.post('/decryptpass', (req, res) => {
    try {
        const { password, iv } = req.body;

        if (!password || !iv) {
            return res.status(400).send('Invalid request: Missing password or IV.');
        }

        const decryptedPassword = decrypt({ password, iv });

        res.status(200).send({ decryptedPassword });
    } catch (error) {
        console.error('Decryption error:', error);
        res.status(500).send('An error occurred while decrypting the password.');
    }
});

app.listen(process.env.PORT || 3003, () => {
    console.log(`Server running on port ${process.env.PORT || 3003}`);
});
