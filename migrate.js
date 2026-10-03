// scripts/migrateApplicationIdToArray.js
const mongoose = require("mongoose");

// paste your real connection string here directly
const MONGO_URI = "mongodb+srv://anurag_db_user:hsGnkfrPlSPYaZvL@musclerox.rybw9ae.mongodb.net/?appName=musclerox"


// const dns = require('dns');
// dns.setServers(['10.5.50.1']);

// async function migrate() {
//     try {
//         console.log("Connecting...");
//         await mongoose.connect(MONGO_URI, {
//             serverSelectionTimeoutMS: 15000,
//         });
//         console.log("Connected to MongoDB");

//         const collection = mongoose.connection.db.collection("applications");

//         const applications = await collection
//             .find({ $expr: { $eq: [{ $type: "$color" }, "objectId"] } })
//             .toArray();

//         console.log(`Found ${applications.length} applications with scalar color`);

//         let updated = 0;

//         for (const a of applications) {
//             await collection.updateOne(
//                 { _id: a._id },
//                 { $set: { color: [a.color] } }
//             );
//             updated++;
//         }

//         console.log(`Migration complete. Updated ${updated} application(s).`);
//     } catch (err) {
//         console.error("Migration failed:", err.message);
//     } finally {
//         await mongoose.disconnect();
//         console.log("Disconnected");
//     }
// }

migrate();