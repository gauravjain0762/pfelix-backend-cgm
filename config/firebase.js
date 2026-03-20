const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

// Initialize Firebase Admin SDK

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin