
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        displayNamePreference: true,
        showEmail: true,
        showPoliticalLeaning: true,
        showLastActive: true,
        profileVisibility: true,
        allowSearch: true,
        dataCollectionConsent: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ privacy: user });
  } catch (error) {
    console.error("Privacy settings fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      displayNamePreference,
      showEmail,
      showPoliticalLeaning,
      showLastActive,
      profileVisibility,
      allowSearch,
      dataCollectionConsent,
    } = body;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        displayNamePreference: displayNamePreference || undefined,
        showEmail: showEmail !== undefined ? showEmail : undefined,
        showPoliticalLeaning: showPoliticalLeaning !== undefined ? showPoliticalLeaning : undefined,
        showLastActive: showLastActive !== undefined ? showLastActive : undefined,
        profileVisibility: profileVisibility || undefined,
        allowSearch: allowSearch !== undefined ? allowSearch : undefined,
        dataCollectionConsent: dataCollectionConsent !== undefined ? dataCollectionConsent : undefined,
      },
      select: {
        displayNamePreference: true,
        showEmail: true,
        showPoliticalLeaning: true,
        showLastActive: true,
        profileVisibility: true,
        allowSearch: true,
        dataCollectionConsent: true,
      },
    });

    return NextResponse.json({ privacy: updatedUser });
  } catch (error) {
    console.error("Privacy settings update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
