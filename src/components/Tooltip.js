export default function Tooltip(props) {
    return (
    <div class={`group relative flex ` + props.className}>
        <span class="absolute top-10 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100 width-1/5">{props.message}</span>
        {props.children}
    </div>
    )
}
