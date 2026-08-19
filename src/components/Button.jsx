import React from 'react';

export const Button = ({ onClick, children, variant = 'primary', className = '', disabled = false, icon: Icon }) => {
  const baseStyle = "flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-4";
  
  const variants = {
    primary: "bg-pink-400 text-white border-pink-500 sticker-shadow hover:bg-pink-300 sticker-shadow-hover sticker-shadow-active",
    secondary: "bg-white text-pink-500 border-pink-300 sticker-shadow hover:bg-pink-50 sticker-shadow-hover sticker-shadow-active",
    accent: "bg-cyan-400 text-white border-cyan-500 shadow-[6px_6px_0px_#a5f3fc] hover:shadow-[8px_8px_0px_#22d3ee] active:shadow-none hover:-translate-y-1 active:translate-x-[6px] active:translate-y-[6px]"
  };

  return (
    <button type="button" onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} disabled={disabled}>
      {Icon && <Icon size={24} className="stroke-3" />}
      <span className="text-xl tracking-wide">{children}</span>
    </button>
  );
};

export default Button;