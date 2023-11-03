'use client';
import { useSession } from 'next-auth/react';
import { useSelector } from 'react-redux';
import CryptoJS from 'crypto-js';

const Content = () => {
  const { data: session } = useSession();
  const files = useSelector((state) => state.filesReducer.myFiles);

  return (
    <div className="flex-1 flex flex-col my-[5%] divide-y overflow-y-auto border border-[#6e6658] rounded-md">
      {files?.map((file) => {
        const dec_file = CryptoJS.AES.decrypt(file.enc_original_name, session.user.key).toString(CryptoJS.enc.Utf8);
        return (
          <div className="w-full p-3 hover:bg-gray-200" key={file.fileName}>
            {dec_file}
          </div>
        );
      })}
    </div>
  );
};

export default Content;
