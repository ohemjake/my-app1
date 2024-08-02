"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [docId, setDocId] = useState<string | null>(null);

  console.log("Home component is rendering with session:", session);

  const requestAdditionalPermissions = () => {
    window.location.href = `/api/auth/signin/google?scope=openid email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/documents`;
  };

  const createGoogleDoc = async () => {
    try {
      const res = await fetch("/api/google-docs", {
        method: "POST",
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error response from server:", errorData);
        if (errorData.error === "Unauthorized") {
          console.log("User needs to grant additional permissions.");
          requestAdditionalPermissions();
        } else {
          throw new Error(errorData.error || "Failed to create Google Doc");
        }
      } else {
        const data = await res.json();
        setDocId(data.documentId);
      }
    } catch (error) {
      console.error("Error creating Google Doc:", (error as Error).message);
    }
  };

  return (
    <div>
      {session ? (
        <>
          <p>Welcome, {session.user?.name}</p>
          <button onClick={() => signOut()}>Sign out</button>
          <button onClick={requestAdditionalPermissions}>Grant Google Docs Permission</button>
          <button onClick={createGoogleDoc}>Create Google Doc</button>
          {docId && (
            <p>
              Document created! <a href={`https://docs.google.com/document/d/${docId}`} target="_blank">Open Document</a>
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
