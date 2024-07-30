import NextAuth, { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";


export const authOptions: NextAuthOptions = {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        authorization: {
          params: {
            scope: "openid email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/documents",
          },
        },
      }),
    ],
    callbacks: {
      async jwt({ token, account }: { token: JWT, account?: any }) {
        if (account) {
          token.accessToken = account.access_token;
        }
        return token;
      },
      async session({ session, token }: { session: any, token: JWT }) {
        session.accessToken = token.accessToken as string;
        return session;
      },
    },
  };
  
  const handler = NextAuth(authOptions);
  
  export { handler as GET, handler as POST };
  