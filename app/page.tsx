"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [docId, setDocId] = useState<string | null>(null);

  const requestAdditionalPermissions = async () => {
    // Redirect user to Google's OAuth 2.0 consent screen to request additional permissions
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.NEXTAUTH_URL}/api/auth/callback/google&response_type=code&scope=https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/documents&access_type=offline&prompt=consent`;
  };

  const createGoogleDoc = async () => {
    const res = await fetch("/api/google-docs", {
      method: "POST",
    });
    const data = await res.json();
    if (data.documentId) {
      setDocId(data.documentId);
    } else {
      alert("Failed to create Google Doc. Please try again.");
    }
  };

  return (
    <div>
      {session ? (
        <>
          <p>Welcome, {session.user?.name}</p>
          <button onClick={() => signOut()}>Sign out</button>
          <button onClick={requestAdditionalPermissions}>
            Create Google Doc (Request Additional Permissions)
          </button>
          {docId && (
            <p>
              Document created! <a href={`https://docs.google.com/document/d/${docId}/edit`}>Open Document</a>
            </p>
          )}
        </>
      ) : (
        <>
          <p>Please sign in</p>
          <button onClick={() => signIn("google")}>Sign in with Google</button>
        </>
      )}
    </div>
  );
}
