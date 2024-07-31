import { NextRequest, NextResponse } from 'next/server';
import { google } from "googleapis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session.accessToken });

  const docs = google.docs({ version: "v1", auth });

  try {
    const response = await docs.documents.create({
      requestBody: {
        title: "New Document",
      },
    });
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error("Error creating Google Doc:", (error as Error).message);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


