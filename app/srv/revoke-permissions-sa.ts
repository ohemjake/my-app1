'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { google } from 'googleapis';

interface ActionState {
    success: boolean;
    data?: any;
    message?: string;
}

export async function RevokePermissions(): Promise<ActionState> {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
        return {
            success: false,
            message: 'Unauthorized',
        };
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: session.accessToken });

    try {
        await auth.revokeCredentials();
        return {
            success: true,
            message: 'Permissions revoked successfully'
        };
    } catch (error) {
        return {
            success: false,
            data: error,
            message: 'An unknown error occurred'
        };
    }
}