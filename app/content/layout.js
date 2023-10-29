const ContentLayout = ({ children }) => {
  return (
    <div className="flex-1 bg-[#121212] flex flex-row">
      <div className="flex-[1] p-4 border-r-[0.5px] border-[#424242] font-inter flex justify-center items-center">
        <div className="w-[80%] text-center p-3 rounded-md bg-[#616161] cursor-pointer hover:bg-[#757575] transition-colors">
          Upload
        </div>
      </div>
      <div className="flex-[3] p-4 font-inter flex">{children}</div>
    </div>
  );
};

export default ContentLayout;
