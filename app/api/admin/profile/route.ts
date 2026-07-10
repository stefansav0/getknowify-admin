import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import { verifyToken } from "@/lib/jwt";

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    await connectDB();

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    const { email, currentPassword, newPassword } = await req.json();

    // 1. Update Email
    if (email && email !== admin.email) {
      const existing = await Admin.findOne({ email: email.toLowerCase() });
      if (existing) {
        return NextResponse.json({ message: "Email already in use" }, { status: 400 });
      }
      admin.email = email.toLowerCase();
    }

    // 2. Update Password (requires current password verification)
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ message: "Current password is required to set a new password" }, { status: 400 });
      }

      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return NextResponse.json({ message: "Incorrect current password" }, { status: 401 });
      }

      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(newPassword, salt);
    }

    await admin.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });

  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}