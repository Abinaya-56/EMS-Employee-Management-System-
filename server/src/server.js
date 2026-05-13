import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { seedDefaultUsers, setMockDbMode as setSeedMockMode } from "./utils/seedUsers.js";
import { setMockDbMode } from "./utils/modelFactory.js";
import { initMockDb } from "./utils/mockDb.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB(process.env.MONGO_URI);
    await seedDefaultUsers();
    console.log("✓ MongoDB connected and users seeded");
  } catch (error) {
    console.warn("⚠ MongoDB not available. Using in-memory mock database for development");
    setMockDbMode(true);
    setSeedMockMode(true);
    await initMockDb();
    await seedDefaultUsers();
  }

  app.listen(PORT, () => {
    console.log(`EMS server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
