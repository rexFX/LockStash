'use client';
import { useState } from 'react';
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

const ContentLayout = ({ children }) => {
  const [file, setFile] = useState(null);

  const filePicker = (e) => {
    setFile(e.target.files[0]);
  };

  const fileUploader = () => {
    if (file !== null) {
      var reader = new FileReader();
      // const enc_key = sessionStorage.getItem('enc_key');
      const enc_key = 'e5bf1a2256bb1f5234950e8e6ea60d02c2ecace8a8073f9d0014e3033e8b0a19';
      reader.onload = function () {
        const wordArray = CryptoJS.lib.WordArray.create(reader.result);
        const encryptedFile = CryptoJS.AES.encrypt(wordArray, enc_key).toString();
        const enc_file = new Blob([encryptedFile]);
        const fileName = uuidv4();

        const form = new FormData();
        form.append('email', 'abcd');
        form.append('fileName', fileName);
        form.append('enc_original_name', CryptoJS.AES.encrypt(file.name, enc_key).toString());
        form.append('userFile', enc_file);

        fetch('http://localhost:5173/api/upload', {
          method: 'POST',
          body: form,
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data.message);
          });
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="flex-1 bg-[#121212] flex flex-row">
      <div className="flex-[1] p-4 border-r-[0.5px] border-[#424242] font-inter flex justify-center items-center">
        <input type="file" onChange={filePicker} />
        <div
          className="w-[80%] text-center p-3 rounded-md bg-[#616161] cursor-pointer hover:bg-[#757575] transition-colors"
          onClick={fileUploader}>
          Upload
        </div>
      </div>
      <div className="flex-[3] p-4 font-inter flex">{children}</div>
    </div>
  );
};

export default ContentLayout;
