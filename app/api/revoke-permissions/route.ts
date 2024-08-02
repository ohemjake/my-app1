// app/api/google-docs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { google } from "googleapis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  console.log("Received request to create Google Doc");
  const session = await getServerSession(authOptions);

  if (!session) {
    console.log("No session found, unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("Session found:", session);

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session.accessToken });

  console.log("OAuth2 client set up");

  const docs = google.docs({ version: "v1", auth });

  try {
    const response = await docs.documents.create({
      requestBody: {
        title: "New Document",
      },
    });
    console.log("Google Doc created successfully:", response.data);
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error("Error creating Google Doc:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



