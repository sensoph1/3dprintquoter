import React, { useState, useRef, useEffect } from 'react';

const ComboBox = ({ items, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  const selectedItem = items.find(item => item.id === value);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.colorName && item.colorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        className="w-full shadow-sm"
        value={searchTerm || (selectedItem ? `${selectedItem.name} (${selectedItem.colorName})` : '')}
        onFocus={(e) => {
          setIsOpen(true);
          e.target.select();
        }}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        placeholder={placeholder}
      />
      {isOpen && (
        <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
          {filteredItems.map(item => (
            <li
              key={item.id}
              className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
              onClick={() => {
                onChange(item.id);
                setSearchTerm('');
                setIsOpen(false);
              }}
            >
              {item.name} ({item.colorName})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ComboBox;
