'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { google } from 'googleapis';

export async function RevokePermissions() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return { error: 'Unauthorized', status: 401 };
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session.accessToken });

  try {
    await auth.revokeCredentials();
    return { message: 'Permissions revoked successfully', status: 200 };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message, status: 500 };
    } else {
      return { error: "An unknown error occurred", status: 500 };
    }
  }
}
