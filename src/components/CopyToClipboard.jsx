const CopyToClipboard = (props) => {
	return (
		<span onClick={() => navigator.clipboard.writeText(typeof props.copyValue === 'function' ? props.copyValue() : props.copyValue)}>
			{props.children}
		</span>
	);
};

export default CopyToClipboard;