import { getSession } from "next-auth/react";
import { redirect } from 'next/navigation';
import { GoogleDocReq } from '../srv/google-docs';

export default async function CreateDoc() {
  const session = await getSession();

  if (!session) {
    redirect('/'); // Redirect if session is missing
    return null;
  }

  const data = await GoogleDocReq(session.accessToken);
  if (!data.result.id) {
    redirect('/'); // Redirect if document creation fails
    return null;
  }

  return (
    <div>
      <p>
        Document created! <a href={`https://docs.google.com/document/d/${data.result.id}`}>Open Document</a>
      </p>
    </div>
  );
}