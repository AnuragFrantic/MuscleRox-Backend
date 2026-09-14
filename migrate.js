// scripts/migrateApplicationIdToArray.js
const mongoose = require("mongoose");

// paste your real connection string here directly
const MONGO_URI = "mongodb+srv://anurag_db_user:hsGnkfrPlSPYaZvL@musclerox.rybw9ae.mongodb.net/?appName=musclerox"


// const dns = require('dns');
// dns.setServers(['10.5.50.1']);

async function migrate() {
    try {
        console.log("Connecting...");
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 15000,
        });
        console.log("Connected to MongoDB");

        const collection = mongoose.connection.db.collection("products");

        const products = await collection
            .find({ application_id: { $type: "objectId" } })
            .toArray();

        console.log(`Found ${products.length} products with scalar application_id`);

        let updated = 0;

        for (const p of products) {
            await collection.updateOne(
                { _id: p._id },
                { $set: { application_id: [p.application_id] } }
            );
            updated++;
        }

        console.log(`Migration complete. Updated ${updated} product(s).`);
    } catch (err) {
        console.error("Migration failed:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected");
    }
}

migrate();