
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uploadFile, deleteFile } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `profile-photos/${session.user.id}/${timestamp}-${file.name}`;
    
    // Upload to S3
    const cloudStoragePath = await uploadFile(buffer, filename, file.type);

    // Get old profile image
    const oldUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { profileImage: true },
    });

    // Update user profile with new image path and disable avatar
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        profileImage: cloudStoragePath,
        useAvatar: false, // Use uploaded photo instead of avatar
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        bio: true,
        profileImage: true,
        useAvatar: true,
        avatarStyle: true,
        avatarSeed: true,
        politicalLeaning: true,
        civilityScore: true,
        joinedAt: true,
        password: true,
      },
    });

    // Delete old profile image if it exists
    if (oldUser?.profileImage) {
      try {
        await deleteFile(oldUser.profileImage);
      } catch (error) {
        console.error("Error deleting old profile image:", error);
      }
    }

    // Return user data but only indicate if password exists (not the hash itself)
    const { password, ...userWithoutPasswordHash } = updatedUser;
    return NextResponse.json({ 
      user: {
        ...userWithoutPasswordHash,
        password: password ? 'exists' : null,
      },
      message: "Profile photo updated successfully" 
    });
  } catch (error) {
    console.error("Photo upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
