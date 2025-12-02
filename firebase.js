// import admin from "firebase-admin";
// import dotenv from "dotenv";
// dotenv.config();

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert({
//       projectId: process.env.FIREBASE_PROJECT_ID,
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
//     }),
//   });
// }

// export const db = admin.firestore();
// export const auth = admin.auth();
import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

let serviceAccount;

if (fs.existsSync("./serviceAccountKey.json")) {
  // Local dev
  serviceAccount = JSON.parse(fs.readFileSync("./serviceAccountKey.json", "utf8"));
} else {
  // Render / Production
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
