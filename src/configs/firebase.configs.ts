export default {
  dataBaseUrl: process.env.FIREBASE_CLIENT_DATABASE_URL,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env?.FIREBASE_PRIVATE_KEY || "",
};
