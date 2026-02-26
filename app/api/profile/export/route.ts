
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

    // Fetch all user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        posts: {
          include: {
            comments: true,
            reactions: true,
          },
        },
        comments: true,
        reactions: true,
        sentFriendRequests: true,
        receivedFriendRequests: true,
        groupMemberships: {
          include: {
            group: true,
          },
        },
        notifications: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Remove sensitive fields
    const { password, deviceFingerprints, ...userData } = user;

    // Create exportable data
    const exportData = {
      exportDate: new Date().toISOString(),
      user: userData,
      summary: {
        totalPosts: user.posts.length,
        totalComments: user.comments.length,
        totalReactions: user.reactions.length,
        friendRequests: user.sentFriendRequests.length + user.receivedFriendRequests.length,
        groupMemberships: user.groupMemberships.length,
      },
    };

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="bridgingtheaisle-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Data export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
