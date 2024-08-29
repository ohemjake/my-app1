'use server';

export async function GoogleDocReq(req) {
  const session = await getServerSession(authOptions);

  if ( !session?.accessToken) {
    return { error: 'Unauthorized', status: 401 };
  }

  let accessToken = session?.accessToken;
  const refreshToken = session?.refreshToken;
console.log("accessToken: ",accessToken)
console.log("refreshToken: ",refreshToken)
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const docs = google.docs({ version: 'v1', auth });

  try {
    const response = await docs.documents.create({
      requestBody: {
        title: 'New Document',
      },
    });
    return { result:response.data, status: 200 };
  } catch (error) {
    if ((error.code === 401 || error.code === 403) && refreshToken) {
      try {
        const newCredentials = await refreshAccessToken(refreshToken);
        auth.setCredentials(newCredentials);
        accessToken = newCredentials.access_token;

        const response = await docs.documents.create({
          requestBody: {
            title: 'New Document',
          },
        });
        console.log('200 yey');
        return { result:response.data, status: 200 };
      } catch (refreshError) {
        console.log('500 aww', refreshError);
        return { error: 'Failed to refresh access token', status: 500 };
      }
    }

    console.log('500 dead');
    return { error: error.message, status: 500 };
  }
}
