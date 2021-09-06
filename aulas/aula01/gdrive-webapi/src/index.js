import https from 'https';
import fs from 'fs';

const PORT = process.env.PORT || 3000;

const localHostSSL = {
    key: fs.readFileSync('./certificates/key.pem'),
    ceert: fs.readFileSync('./certificates/cert.pem'),
}