'use client';
import { useState } from 'react';
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { useSession } from 'next-auth/react';
import { add } from '@/src/redux/features/files-slice';
import { useDispatch } from 'react-redux';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

const ContentLayout = ({ children }) => {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const { data: session } = useSession();

  const filePicker = (e) => {
    setFile(e.target.files[0]);
  };

  const fileUploader = () => {
    if (file !== null) {
      var reader = new FileReader();
      // const enc_key = sessionStorage.getItem('enc_key');
      const enc_key = session.user.key;
      reader.onload = function () {
        const wordArray = CryptoJS.lib.WordArray.create(reader.result);
        const encryptedFile = CryptoJS.AES.encrypt(wordArray, enc_key).toString();
        const enc_file = new Blob([encryptedFile]);
        const fileName = uuidv4();
        const enc_original_name = CryptoJS.AES.encrypt(file.name, enc_key).toString();

        const form = new FormData();
        form.append('email', session.user.email);
        form.append('fileName', fileName);
        form.append('enc_original_name', enc_original_name);
        form.append('userFile', enc_file);

        fetch('http://localhost:5173/api/upload', {
          method: 'POST',
          body: form,
        })
          .then((res) => res.json())
          .then((data) => {
            dispatch(
              add({
                fileName,
                enc_original_name,
              }),
            );
            console.log(data.message, {
              fileName,
              enc_original_name,
            });
          });
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="flex-1 flex flex-row bg-[#161b22]">
      <div className="flex-[1] p-4 border-r-[0.5px] font-inter flex flex-col justify-center items-center">
        <input type="file" className="text-white" onChange={filePicker} />
        <div className="w-[80%] p-4 gap-3 flex flex-col justify-center items-center">
          <button
            className="w-[50%] text-center p-3 rounded-md cursor-pointer bg-gray-300 hover:bg-gray-400 transition-colors"
            onClick={fileUploader}>
            Upload
          </button>
          <button
            className="w-[50%] text-center p-3 rounded-md cursor-pointer bg-gray-300 hover:bg-gray-400 transition-colors"
            onClick={() => signOut({ callbackUrl: 'http://localhost:3000/' })}>
            Log Out
          </button>
        </div>
      </div>
      <div className="flex-[3] p-4 font-inter flex">{children}</div>
    </div>
  );
};

export default ContentLayout;
