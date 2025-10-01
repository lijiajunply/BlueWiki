import React from 'react';
import Image from "next/image";

const FullScreenLoading = () => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        <div className="mb-4">
            <Image src="/logo.png" alt="BlueWiki Logo" width={100} height={100} className={'mb-4'}/>
        </div>
        <h2 className="text-2xl font-bold text-base-content mb-2">Blue Wiki</h2>
        <p className="text-base-content/70">正在加载中，请稍候...</p>
      </div>
    </div>
  );
};

export default FullScreenLoading;