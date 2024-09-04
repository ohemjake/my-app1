'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { google } from 'googleapis';
import { refreshAccessToken } from '../utils/refreshToken';

interface ActionState {
    success: boolean;
    data?: any;
    message?: string;
}

export async function GoogleDocReq(): Promise<ActionState> {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
        return {
            success: false,
            message: 'Unauthorized',
        };
    }

    let accessToken: string = session.accessToken;
    const refreshToken: string | undefined = session.refreshToken;

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
        return {
            success: true,
            data: response.data,
        };
    } catch (error: any) {
        console.log("Error:", error);
        if ((error.code === 401 || error.code === 403) && refreshToken) {
            try {
                const newCredentials = await refreshAccessToken(refreshToken);
                const auth = new google.auth.OAuth2();
                auth.setCredentials(newCredentials);

                const response = await docs.documents.create({
                    requestBody: {
                        title: 'New Document',
                    },
                });

                return {
                    success: true,
                    data: response.data,
                };
            } catch (refreshError: any) {
                console.error('Failed to refresh access token', refreshError);
                return {
                    success: false,
                    message: 'Failed to refresh access token',
                };
            }
        }

        console.error('Document creation failed', error);
        return {
            success: false,
            message: error.message || 'Document creation failed',
        };
    }
}