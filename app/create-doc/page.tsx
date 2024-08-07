"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

export default function CreateDoc() {
  const { data: session } = useSession();
  const [docId, setDocId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (session) {
      const createGoogleDoc = async () => {
        const res = await fetch("/api/google-docs", {
          method: "POST",
        });
        const data = await res.json();
        if (data.id) {
          setDocId(data.id);
        } else {
          router.push("/"); // Redirect if document creation fails
        }
      };
      createGoogleDoc();
    } else {
      router.push("/"); // Redirect if session is missing
    }
  }, [session, router]);

  return (
    <div>
      {docId ? (
        <p>
          Document created! <a href={`https://docs.google.com/document/d/${docId}`}>Open Document</a>
        </p>
      ) : (
        <p>Creating Google Doc...</p>
      )}
    </div>
  );
}
