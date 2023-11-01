'use client';
import * as srp from 'secure-remote-password/client';
import CryptoJS from 'crypto-js';
import { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

const Home = () => {
  const { data: session, update } = useSession();
  const [E_Pass, setE_Pass] = useState('');
  const [D_Pass, setD_Pass] = useState('');

  const decryptEncryptedKey = () => {
    if (D_Pass.length > 0) {
      let key = session.user.key;
      const dkey = CryptoJS.AES.decrypt(key, D_Pass).toString(CryptoJS.enc.Utf8);
      update({
        ...session,
        user: {
          ...session.user,
          key: dkey,
        },
      });
    }
  };

  const AddEncryptedKey = () => {
    if (E_Pass.length > 0) {
      const email = session.user.email;
      console.log(session.user);
      const dec_key = CryptoJS.PBKDF2(srp.generateSalt(), srp.generateSalt(), {
        keySize: 1024 / 32,
        iterations: 1000,
      }).toString();
      console.log(dec_key);
      const encryptedKey = CryptoJS.AES.encrypt(dec_key, E_Pass).toString();
      console.log(encryptedKey);
      const decryptedKey = CryptoJS.AES.decrypt(encryptedKey, E_Pass).toString(CryptoJS.enc.Utf8);
      console.log(decryptedKey);

      update({
        ...session,
        user: {
          ...session.user,
          key: dec_key,
        },
      });

      fetch('http://localhost:5173/api/setEncryptedKey', {
        method: 'POST',
        body: JSON.stringify({ email, encryptedKey }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((resp) => resp.json())
        .then((resp) => console.log(resp.message))
        .catch((err) => console.log(err.message));
    }
  };

  const signup = async (email, password) => {
    email = 'cdd';
    password = '1234';
    const salt = srp.generateSalt();

    const privateKey = CryptoJS.PBKDF2(salt + password + email + salt, salt, {
      keySize: 512 / 32,
      iterations: 10000,
    }).toString();

    const verifier = srp.deriveVerifier(privateKey);
    fetch('http://localhost:5173/api/signup', {
      method: 'POST',
      body: JSON.stringify({ email, salt, verifier }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((resp) => resp.json())
      .then((resp) => console.log(resp.message))
      .catch((err) => console.log(err.message));
  };

  return (
    <div>
      {!session?.user && (
        <>
          <button onClick={signup}>signup</button>
          <br />
          <button onClick={() => signIn()}>login</button>
        </>
      )}
      {session?.user.key === undefined && (
        <>
          <input type="text" onChange={(e) => setE_Pass(e.target.value)} value={E_Pass} />
          <br />
          <button onClick={AddEncryptedKey}>click</button>
        </>
      )}
      {session?.user && (
        <>
          <h1>{session?.user?.files[0]?.fileName}</h1>
          <br />
          <h1>{session.user.email}</h1>
          <br />
          <h1>{session.user.key}</h1>
          <br />
          <input type="text" onChange={(e) => setD_Pass(e.target.value)} value={D_Pass} />
          <br />
          <button onClick={decryptEncryptedKey}>decrypt</button>
          <br />
          <button onClick={() => signOut()}>logout</button>
        </>
      )}
    </div>
  );
};

export default Home;
