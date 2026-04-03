import { useEffect, useState } from 'react';

const splashScreen = ({ finishLoading }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      finishLoading();
    }, 3000);
    return () => clearTimeout(timer);
  }, [finishLoading]);
}

return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950">
    {/* logo or icon*/}

    <div className="animate-pulse mb-6">
      <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
        <span className="text-white text-4xl font-bold">R</span>
      </div>
    </div>

    {/* Loading Text/Spinner */}
    <h1 className="text-white text-3xl font-semibold mb-2">My App</h1>
    <div className="w-10 h-10 border-4 border-t-blue-500 border-white rounded-full animate-spin"></div>

    /*
       <div className="min-h-screen bg-white text-black flex items-center justify-center">
      <h1 className="text-4xl font-bold">Smart Results Viewer</h1>
    </div>
    */
    
  </div>
);

export default splashScreen;