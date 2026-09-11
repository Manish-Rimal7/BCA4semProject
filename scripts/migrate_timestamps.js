import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoUri = process.env.MONGO || "mongodb://localhost:27017/thrift";

async function migrate() {
  console.log("Connecting to:", mongoUri);
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;

  const collections = ["users", "products", "activities", "categories", "carts", "ratings", "feedbacks"];

  for (const colName of collections) {
    const col = db.collection(colName);
    const docs = await col.find({}).toArray();
    let updatedCount = 0;

    for (const doc of docs) {
      const updates = {};
      const fallbackDate = doc._id.getTimestamp ? doc._id.getTimestamp() : new Date();

      if (!doc.createdAt) {
        updates.createdAt = fallbackDate;
      }
      if (!doc.updatedAt) {
        updates.updatedAt = doc.createdAt || fallbackDate;
      }

      // If user collection, also normalize mail and trims
      if (colName === "users") {
        if (doc.mail && typeof doc.mail === "string") {
          const cleanMail = doc.mail.trim().toLowerCase();
          if (cleanMail !== doc.mail) {
            updates.mail = cleanMail;
          }
        }
        if (doc.username && typeof doc.username === "string") {
          const cleanUsername = doc.username.trim();
          if (cleanUsername !== doc.username) {
            updates.username = cleanUsername;
          }
        }
      }

      if (Object.keys(updates).length > 0) {
        await col.updateOne({ _id: doc._id }, { $set: updates });
        updatedCount++;
      }
    }

    console.log(`Collection [${colName}]: updated ${updatedCount} / ${docs.length} documents.`);
  }

  console.log("Migration complete!");
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
