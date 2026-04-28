"use client";

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="w-full px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-3-3v6M12 3C7.029 3 3 7.029 3 12s4.029 9 9 9 9-4.029 9-9-4.029-9-9-9z"
              />
            </svg>
          </div>
          <span className="font-semibold text-gray-800">PerfectPuls</span>
        </div>
      </div>
    </header>
  );
}
