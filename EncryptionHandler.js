const crypto = require('crypto');

// The secret must be exactly 32 characters for AES-256
const secret = 'pppppppppppppppppppppppppppppppp'; 

// Encryption function
const encrypt = (password) => {
    // Generate a random Initialization Vector (IV) of 16 bytes
    const iv = crypto.randomBytes(16);

    // Create the cipher object with the secret and the IV
    const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(secret), iv);

    // Encrypt the password
    const encryptedPassword = Buffer.concat([
        cipher.update(password),
        cipher.final(),
    ]);

    // Return the IV and encrypted password in hexadecimal format
    return {
        iv: iv.toString("hex"),
        password: encryptedPassword.toString("hex"),
    };
};

// Decryption function
const decrypt = (encryption) => {
    // Create the decipher object with the secret and the IV
    const decipher = crypto.createDecipheriv(
        'aes-256-ctr',
        Buffer.from(secret),
        Buffer.from(encryption.iv, "hex") // Convert IV back to Buffer
    );

    // Decrypt the password
    const decryptedPassword = Buffer.concat([
        decipher.update(Buffer.from(encryption.password, "hex")), // Convert encrypted password to Buffer
        decipher.final(),
    ]);

    return decryptedPassword.toString(); // Return decrypted password as a string
};

module.exports = { encrypt, decrypt };
