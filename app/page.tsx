"use client";

import { useSession, signIn, signOut, getSession } from 'next-auth/react';
import { useState } from 'react';

import { GoogleDocReq } from './api/google-docs';
import { RevokePermissions } from './api/revoke-permissions';

export default function Home() {
  const { data: session } = useSession();
  const [docId, setDocId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const requestAdditionalPermissions = () => {
    window.location.href = `/api/auth/signin/google?scope=openid email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/documents`;
  };

  const createGoogleDoc = async () => {
    const currentSession = await getSession();
    console.log('SESS:', currentSession);
    if (!currentSession) {
      requestAdditionalPermissions();
      return;
    }

    try {
      // const res = await fetch('/api/google-docs', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${currentSession.accessToken}`,
      //   },
      // });
      const res = await GoogleDocReq(currentSession.accessToken)
      console.log('> GoogleDocuRequest >>>',res);

      if (!(res.status = 200)) {
        const errorData = res; //await res.json();
        if (errorData.error === 'Unauthorized' || errorData.error === 'invalid_token' || errorData.error === 'insufficient_scope') {
          requestAdditionalPermissions();
        } else {
          throw new Error(errorData.error || "Failed to create Google Doc");
        }
      } else {
        const data = res.result; //await res.json();
        setDocId(data.documentId);
        setMessage("Google Doc created successfully.");
      }
    } catch (error) {
      setMessage("Error creating Google Doc: " + (error as Error).message);
    }
  };

  const revokePermissions = async () => {
    try {
      // const res = await fetch('/api/revoke-permissions', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${session?.accessToken}`,
      //   },
      // });

      const res = await RevokePermissions(session?.accessToken)
      console.log('> RevokePermissions >>>',res);

      if (!(res.status = 200)) {
        const errorData = res; //await res.json();
        throw new Error(errorData.error || "Failed to revoke permissions");
      } else {
        const data = res; //await res.json();
        setMessage("Permissions revoked successfully.");
        setDocId(null);
      }
    } catch (error) {
      setMessage("Error revoking permissions: " + (error as Error).message);
    }
  };

  return (
    <div>
      {session ? (
        <>
          <p>Welcome1, {session.user?.name}</p>
          <button onClick={() => signOut()}>Sign out</button>
          <button onClick={requestAdditionalPermissions}>Grant Google Docs Permission</button>
          <button onClick={createGoogleDoc}>Create Google Doc</button>
          <button onClick={revokePermissions}>Revoke Permissions</button>
          {docId && (
            <p>
              Document created! <a href={`https://docs.google.com/document/d/${docId}`} target="_blank" rel="noopener noreferrer">Open Document</a>
            </p>
          )}
          {message && <p>{message}</p>}
        </>
      ) : (
        <>
          <p>Please sign in</p>
          <button onClick={() => signIn('google')}>Sign in with Google</button>
        </>
      )}
    </div>
  );
}
