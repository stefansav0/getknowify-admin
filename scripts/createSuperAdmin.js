import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env.local"),
});

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI missing");
  process.exit(1);
}

const AdminSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  role: {
    type: String,
    default: "superadmin",
  },
});

const Admin =
  mongoose.models.Admin ||
  mongoose.model("Admin", AdminSchema);

async function createSuperAdmin() {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: "getknowify",
    });

    const exists = await Admin.findOne({
      email: "admin@getknowify.com",
    });

    if (exists) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      "Admin@123456",
      12
    );

    await Admin.create({
      name: "Ravi",
      email: "admin@getknowify.com",
      password: hashedPassword,
      role: "superadmin",
    });

    console.log("✅ Super Admin Created");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createSuperAdmin();