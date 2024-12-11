import React, { useState, useRef, useEffect } from 'react';

function DropdownMenu({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Render the trigger button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
      >
        Actions
      </button>

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function DropdownMenuItem({ children, onClick, className = '' }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${className}`}
    >
      {children}
    </button>
  );
}

export { DropdownMenu, DropdownMenuItem };