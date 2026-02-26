
import { NextRequest, NextResponse } from "next/server";
import { getSignedDownloadUrl } from "@/lib/s3";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string } }
) {
  try {
    const path = params.path;
    
    if (!path) {
      return NextResponse.json(
        { error: "Path is required" },
        { status: 400 }
      );
    }

    // Get signed URL from S3
    const signedUrl = await getSignedDownloadUrl(path);
    
    // Redirect to the signed URL
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("Photo fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch photo" },
      { status: 500 }
    );
  }
}
