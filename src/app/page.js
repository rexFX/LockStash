'use client';
import * as srp from 'secure-remote-password/client';
import CryptoJS from 'crypto-js';
import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { initialize } from '@/src/redux/features/files-slice';
import { useDispatch } from 'react-redux';
import Link from 'next/link';

const Home = () => {
  const { data: session, update } = useSession();
  const [E_Pass, setE_Pass] = useState('');
  const [D_Pass, setD_Pass] = useState('');
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const decryptEncryptedKey = () => {
    if (D_Pass.length > 0 && session.user.decrypt === false) {
      let key = session.user.key;
      try {
        const dkey = CryptoJS.AES.decrypt(key, D_Pass).toString(CryptoJS.enc.Utf8);
        update({
          ...session,
          user: {
            ...session.user,
            key: dkey,
            decrypt: true,
          },
        });
        dispatch(initialize(session.user.files));
      } catch (err) {
        console.log('wrong decryption key');
      }
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

      fetch('http://localhost:5173/api/setEncryptedKey', {
        method: 'POST',
        body: JSON.stringify({ email, encryptedKey }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((resp) => resp.json())
        .then((resp) => {
          console.log(resp.message);
          update({
            ...session,
            user: {
              ...session.user,
              key: dec_key,
              decrypt: true,
              mediaPassword: true,
            },
          });
        })
        .catch((err) => console.log(err.message));
    }
  };

  const signupEnable = async () => {
    setShow(true);
  };

  const signup = async (email, password) => {
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
      .then((resp) => {
        console.log(resp.message);
        setShow(false);
      })
      .catch((err) => console.log(err.message));
  };

  return (
    <div className="flex flex-1 flex-col justify-center items-center bg-[#161b22]">
      {!session?.user && (
        <>
          {show ? (
            <div className="flex flex-col justify-start">
              <label htmlFor="email_input" className="text-white">
                Email:{' '}
              </label>
              <input
                className="border-2 px-6 py-1 rounded-md"
                name="email_input"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <br />
              <label htmlFor="password_input" className="text-white">
                Password:{' '}
              </label>
              <input
                className="border-2 px-6 py-1 rounded-md"
                name="password_input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <br />
              <div className="flex justify-evenly">
                <button onClick={() => setShow(false)} className="text-white hover:bg-black p-3 transition-all">
                  Go Back
                </button>
                <button
                  onClick={() => signup(email, password)}
                  className="text-white hover:bg-black p-3 transition-all">
                  Register
                </button>
              </div>
            </div>
          ) : (
            <>
              <button onClick={signupEnable} className="text-white hover:bg-black p-3 transition-all">
                Sign Up
              </button>
              <br />
              <button onClick={() => signIn()} className="text-white hover:bg-black p-3 transition-all">
                Login
              </button>
            </>
          )}
        </>
      )}
      {session?.user.mediaPassword === false && (
        <div className="flex justify-start flex-col">
          <label className="text-white" htmlFor="e_key_input">
            Add a password to secure your media
          </label>
          <input
            className="border-2 px-6 py-1 rounded-md"
            name="e_key_input"
            type="password"
            onChange={(e) => setE_Pass(e.target.value)}
            value={E_Pass}
          />
          <br />
          <button onClick={AddEncryptedKey} className="m-3 text-white hover:bg-black p-3 transition-all">
            Save media password
          </button>
        </div>
      )}
      {session?.user.mediaPassword === true && (
        <>
          <h1>You are logged in as: {session.user.email}</h1>
          <br />
          <h1>Key: {session.user.key}</h1>
          <br />
          <label htmlFor="d_key_input">Enter your media password: </label>
          <input
            className="border-2"
            name="d_key_input"
            type="text"
            onChange={(e) => setD_Pass(e.target.value)}
            value={D_Pass}
          />
          <br />
          <button className="m-3" onClick={decryptEncryptedKey}>
            decrypt
          </button>
          <button onClick={() => signOut()}>logout</button>
          <br />
          <Link href={'/content'}>Go to content</Link>
        </>
      )}
    </div>
  );
};

export default Home;
