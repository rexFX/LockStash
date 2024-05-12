import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import srp from 'secure-remote-password/client';
import CryptoJS from 'crypto-js';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials, req) {
        // if (credentials.password.length < 8) {
        //   console.log('Password must be at least 8 characters long');
        //   return null;
        // }

        try {
          let user = null;

          let resp = await fetch('http://localhost:5173/api/login', {
            method: 'POST',
            body: JSON.stringify({ email: credentials.email }),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          resp = await resp.json();

          const { salt, serverEphemeral } = resp;
          const clientEphemeral = srp.generateEphemeral();

          const privateKey = CryptoJS.PBKDF2(salt + credentials.password + credentials.email + salt, salt, {
            keySize: 256 / 32,
            iterations: 50,
          }).toString();

          const clientSession = srp.deriveSession(
            clientEphemeral.secret,
            serverEphemeral,
            salt,
            credentials.email,
            privateKey,
          );

          console.log(credentials.email);
          let res = await fetch('http://localhost:5173/api/loginWithProof', {
            method: 'POST',
            body: JSON.stringify({
              email: credentials.email,
              clientEphemeral: clientEphemeral.public,
              clientProof: clientSession.proof,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          });

          res = await res.json();
          const { serverProof, key, files, mediaPassword } = res;

          srp.verifySession(clientEphemeral.public, clientSession, serverProof);
          user = { email: credentials.email, key, files, mediaPassword };

          console.log(user);
          return user;
        } catch (err) {
          console.log(err.message);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt: async ({ token, trigger, session, user }) => {
      if (trigger === 'signIn') {
        user && (token.user = user);
        token.user.decrypt = false;
      }

      if (trigger === 'update') {
        token.user = session.user;
      }

      return Promise.resolve(token);
    },
    session: async ({ session, token }) => {
      session.user = token.user;
      return Promise.resolve(session);
    },
  },
});

export { handler as GET, handler as POST };
