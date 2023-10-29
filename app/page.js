'use client';
import * as srp from 'secure-remote-password/client';

const Home = () => {
  const signup = async (email, password) => {
    email = 'abcd';
    password = '1234';
    const salt = srp.generateSalt();
    const privateKey = srp.derivePrivateKey(salt, email, password);
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

  const login = async (email, password) => {
    email = 'abcd';
    password = '1234';

    fetch('http://localhost:5173/api/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((resp) => resp.json())
      .then((resp) => {
        const { salt, serverEphemeral } = resp;
        const clientEphemeral = srp.generateEphemeral();

        const privateKey = srp.derivePrivateKey(salt, email, '1234');
        const clientSession = srp.deriveSession(clientEphemeral.secret, serverEphemeral, salt, email, privateKey);

        fetch('http://localhost:5173/api/loginWithProof', {
          method: 'POST',
          body: JSON.stringify({ email, clientEphemeral: clientEphemeral.public, clientProof: clientSession.proof }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((res) => res.json())
          .then((ress) => {
            const { serverProof } = ress;
            srp.verifySession(clientEphemeral.public, clientSession, serverProof);
            console.log('Login success');
          })
          .catch((err) => console.log('Wrong password'));
      })
      .catch((err) => console.log(err));
  };

  return (
    <div>
      <button onClick={signup}>signup</button>
      <br />
      <button onClick={login}>login</button>
    </div>
  );
};

export default Home;
