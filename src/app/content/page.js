'use client';
import { useSession } from 'next-auth/react';
import { useSelector } from 'react-redux';
import CryptoJS from 'crypto-js';

const Content = () => {
  const { data: session } = useSession();
  const files = useSelector((state) => state.filesReducer.myFiles);

  function convertWordArrayToUint8Array(wordArray) {
    var arrayOfWords = wordArray.hasOwnProperty('words') ? wordArray.words : [];
    var length = wordArray.hasOwnProperty('sigBytes') ? wordArray.sigBytes : arrayOfWords.length * 4;
    var uInt8Array = new Uint8Array(length),
      index = 0,
      word,
      i;
    for (i = 0; i < length; i++) {
      word = arrayOfWords[i];
      uInt8Array[index++] = word >> 24;
      uInt8Array[index++] = (word >> 16) & 0xff;
      uInt8Array[index++] = (word >> 8) & 0xff;
      uInt8Array[index++] = word & 0xff;
    }
    return uInt8Array;
  }

  const handleDownload = async (e) => {
    const fileName = e.target.getAttribute('filename');
    const origname = e.target.getAttribute('origname');
    const email = session.user.email;

    const params = new URLSearchParams();
    params.append('email', email);
    params.append('fileName', fileName);

    let enc_file = await fetch('http://localhost:5173/api/download?' + params.toString());
    enc_file = await enc_file.text();

    const dec_file = CryptoJS.AES.decrypt(enc_file, session.user.key);
    const typedArray = convertWordArrayToUint8Array(dec_file);

    const fileDec = new Blob([typedArray]);

    const a = document.createElement('a');
    const url = window.URL.createObjectURL(fileDec);
    const filename = origname;
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col my-[5%] divide-y overflow-y-auto border border-[#6e6658] rounded-md">
      {files?.map((file) => {
        const dec_file = CryptoJS.AES.decrypt(file.enc_original_name, session.user.key).toString(CryptoJS.enc.Utf8);
        return (
          <div
            className="w-full p-3 hover:bg-gray-200"
            key={file.fileName}
            filename={file.fileName}
            origname={dec_file}
            onClick={handleDownload}>
            {dec_file}
          </div>
        );
      })}
    </div>
  );
};

export default Content;
