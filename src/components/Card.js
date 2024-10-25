const Card = (props) => {
	return (
		<div className="bg-sc-blue-900 shadow-md mt-4">
			<div className="p-4 pb-2">
				{props.title}
			</div>
			<div className="p-4 pt-2 text-gray-200">
				{props.content}
			</div>
		</div>
	);
};

export default Card;