export default function Tooltip(props) {
  return (
    <div className={`group relative inline-block ${props.className}`}>
      <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100 group-hover:opacity-100 opacity-0 whitespace-nowrap">
        {props.message}
      </span>
      {props.children}
    </div>
  );
}
