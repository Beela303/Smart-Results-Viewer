import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 py-12 bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-gray-400">
            Made with <span className="text-red-500 animate-pulse inline-block">❤️</span> by Nabila Abubakar
          </p>
          <div className="flex gap-x-6">
            <span className="text-xs text-gray-500 uppercase tracking-widest">
              © 2026 Smart Results Viewer
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}