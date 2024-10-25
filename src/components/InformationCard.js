import Card from "./Card";

const InformationCard = (props) => {
	return (
		<div className='relative z-10 overflow-hidden border border-slate-800 md:p-1 border-none mt-4'>
			<div
				className="md:animate-rotate transform-gpu absolute h-full w-full bg-[conic-gradient(#58b4f6_20deg,transparent_120deg)]"
			></div>
			<div className='relative z-20 flex bg-sc-blue-900'>
				<Card
					title={props.inputBox}
					content={
						<>
							<span>Powered by <a href="https://www.algolia.com/?utm_source=instantsearch.js&utm_medium=website&utm_content=starfarer.space&utm_campaign=poweredby" target="_blank" rel="noopener noreferrer"><i className="fab fa-algolia"></i> algolia</a></span>
							{props.toggles}
							<div className="credits text-sm">
								<p className='italic'>This is an unofficial Star Citizen fansite, not affiliated with the Cloud Imperium group of companies. All content on this site not authored by its host or users are property of their respective owners.</p>
								<div className='flex flex-row justify-between'>
									<a href="https://robertsspaceindustries.com/citizens/Yonas" target="_blank" rel="noopener noreferrer" className="text-left md:visible invisible">Service provided by yonas </a>
									<a href="https://www.reddit.com/r/starcitizen/comments/gdg36s/added_some_razzle_dazzle_to_the_image_i_posted_a/" target="_blank" rel="noopener noreferrer" className="text-end is-hidden-mobile ">Background by u/Uranus01</a>
								</div>
							</div>
						</>
					}
				/>
			</div>

		</div>
	);
}

export default InformationCard;