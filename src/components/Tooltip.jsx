export default function Tooltip({ message, children, position = "top", className = "" }) {

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };
  const long = typeof message !== 'string';

  return (
    <div className={`group relative inline-block ${className}`}>
      <span
        className={`tip absolute ${positionClasses[position]} z-50 scale-0 transition-all group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100 opacity-0 ${long ? 'w-72 whitespace-normal normal-case tracking-normal' : 'whitespace-nowrap'}`}
      >
        {message}
      </span>
      {children}
    </div>
  );
}
