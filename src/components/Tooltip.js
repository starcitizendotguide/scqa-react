export default function Tooltip({ message, children, position = "top", className = "" }) {

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  return (
    <div className={`group relative inline-block ${className}`}>
      <span
        className={`absolute ${positionClasses[position]} scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100 group-hover:opacity-100 opacity-0 whitespace-nowrap`}
      >
        {message}
      </span>
      {children}
    </div>
  );
}
