"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [docId, setDocId] = useState<string | null>(null);

  console.log("Home component is rendering with session:", session);

  const createGoogleDoc = async () => {
    const res = await fetch("/api/google-docs", {
      method: "POST",
    });
    const data = await res.json();
    if (data.id) {
      setDocId(data.id);
    }
  };

  return (
    <div>
      {session ? (
        <>
          <p>Welcome, {session.user?.name}</p>
          <button onClick={() => signOut()}>Sign out</button>
          <button onClick={createGoogleDoc}>Create Google Doc</button>
          {docId && (
            <p>
              Document created! <a href={`https://docs.google.com/document/d/${docId}`}>Open Document</a>
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


