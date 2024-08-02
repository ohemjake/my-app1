// app/api/google-docs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { refreshAccessToken } from '../../utils/refreshToken'; // Adjust the path if necessary

export async function POST(req: NextRequest) {
  console.log('Received request to create Google Doc');
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken || !session.refreshToken) {
    console.log('No session found, unauthorized');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('Session found:', session);

  let accessToken = session.accessToken as string;
  const refreshToken = session.refreshToken as string;

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  console.log('OAuth2 client set up');

  const docs = google.docs({ version: 'v1', auth });

  try {
    const response = await docs.documents.create({
      requestBody: {
        title: 'New Document',
      },
    });
    console.log('Google Doc created successfully:', response.data);
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error('Error creating Google Doc:', error);

    if ((error.code === 401 || error.code === 403) && refreshToken) {
      console.log('Access token expired or insufficient permissions, attempting to refresh token');
      try {
        const newCredentials = await refreshAccessToken(refreshToken);
        auth.setCredentials(newCredentials);
        accessToken = newCredentials.access_token as string;

        // Retry creating the document with the new access token
        const response = await docs.documents.create({
          requestBody: {
            title: 'New Document',
          },
        });
        console.log('Google Doc created successfully with refreshed token:', response.data);
        return NextResponse.json(response.data, { status: 200 });
      } catch (refreshError) {
        console.error('Error refreshing access token:', refreshError);
        return NextResponse.json({ error: 'Failed to refresh access token' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
