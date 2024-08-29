import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { refreshAccessToken } from '../../utils/refreshToken';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  // if ( !session?.accessToken || !session?.refreshToken) {
    if ( !session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let accessToken = session?.accessToken as string;
  const refreshToken = session?.refreshToken as string;
console.log("accessToken: ",accessToken)
console.log("refreshToken: ",refreshToken)
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const docs = google.docs({ version: 'v1', auth });

  try {
    const response = await docs.documents.create({
      requestBody: {
        title: 'New Document',
      },
    });
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    if ((error.code === 401 || error.code === 403) && refreshToken) {
      try {
        const newCredentials = await refreshAccessToken(refreshToken);
        auth.setCredentials(newCredentials);
        accessToken = newCredentials.access_token as string;

        const response = await docs.documents.create({
          requestBody: {
            title: 'New Document',
          },
        });
        return NextResponse.json(response.data, { status: 200 });
      } catch (refreshError) {
        return NextResponse.json({ error: 'Failed to refresh access token' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
