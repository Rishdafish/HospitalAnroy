import React from 'react';

const Toggle = ({ isOn, onToggle, labelOn = 'Yes', labelOff = 'No' }) => {
  return (
    <div className="flex items-center space-x-4">
      <span className={`text-sm ${!isOn ? 'text-[#92C7CF] font-medium' : 'text-gray-500'}`}>
        {labelOff}
      </span>
      <button
        type="button"
        className={`relative inline-flex flex-shrink-0 h-6 w-10 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#92C7CF] ${
          isOn ? 'bg-[#92C7CF]' : 'bg-[#AAD7D9]'
        }`}
        onClick={onToggle}
        aria-pressed={isOn}
        style={{
          backgroundColor: isOn ? '#92C7CF' : '#E2E8F0'
        }}
      >
        <span className="sr-only">Toggle {isOn ? 'on' : 'off'}</span>
        <span
          className={`pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
            isOn ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
      <span className={`text-sm ${isOn ? 'text-[#92C7CF] font-medium' : 'text-gray-500'}`}>
        {labelOn}
      </span>
    </div>
  );
};

export default Toggle;