const InformationCard = (props) => {
	return (
		<div className="bg-sc-blue-900 shadow-md mt-4 p-4">
			<div className="text-gray-200">
				{props.inputBox}
				<span>Powered by <a href="https://www.algolia.com/?utm_source=instantsearch.js&utm_medium=website&utm_content=starfarer.space&utm_campaign=poweredby" target="_blank" rel="noopener noreferrer"><i className="fab fa-algolia"></i> algolia</a></span>
				{props.toggles}
				<div className="credits mt-2 text-sm">
					<p className='italic'>This is an unofficial Star Citizen fansite, not affiliated with the Cloud Imperium group of companies. All content on this site not authored by its host or users are property of their respective owners.</p>
					<div className='flex flex-row justify-between'>
						<a href="https://robertsspaceindustries.com/citizens/Yonas" target="_blank" rel="noopener noreferrer" className="text-left md:visible invisible">Service provided by yonas </a>
						<a href="https://www.reddit.com/r/starcitizen/comments/gdg36s/added_some_razzle_dazzle_to_the_image_i_posted_a/" target="_blank" rel="noopener noreferrer" className="text-end is-hidden-mobile ">Background by u/Uranus01</a>
					</div>
				</div>
			</div>
		</div>
	);
}

export default InformationCard;