'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { google } from 'googleapis';

export async function GoogleDocReq() {
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    return { error: 'Unauthorized', status: 401 };
  }

  let accessToken = session?.accessToken;
  const refreshToken = session?.refreshToken;

  console.log("Session:", session);
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const docs = google.docs({ version: 'v1', auth });
  try {
    const response = await docs.documents.create({
      requestBody: {
        title: 'New Document',
      },
    });
    console.log("Response:", response);
    return { result: response.data, status: 200 };
  } catch (error) {
    console.log("Error:", error);
    if ((error.code === 401 || error.code === 403) && refreshToken) {
      try {
        const newCredentials = await refreshAccessToken(refreshToken);
        auth.setCredentials(newCredentials);
        accessToken = newCredentials.access_token;
        console.log("ReRequest:", accessToken);
        const response = await docs.documents.create({
          requestBody: {
            title: 'New Document',
          },
        });
        return { result: response.data, status: 200 };
      } catch (refreshError) {
        return { error: 'Failed to refresh access token', status: 500 };
      }
    }

    return { error: error.message, status: 500 };
  }
}
