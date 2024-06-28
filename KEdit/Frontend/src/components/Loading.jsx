import { LoadingOutlined, UserAddOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

const Loading = ({ progress }) => {
  return (
    <div className="fixed top-0 left-0 z-10 flex justify-center items-center w-screen h-screen bg-black opacity-55">
      <div className="relative flex justify-center items-center">
        <LoadingOutlined className="flex relative text-[100px] text-blue-500" />
        <p className="font-extrabold text-3xl absolute  text-white">
          {Math.floor(progress)}%
        </p>
      </div>
    </div>
  );
};

export default Loading;
