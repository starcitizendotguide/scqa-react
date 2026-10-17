import React from 'react';

const Footer = () => (
	<footer className="mt-8 mb-6 bg-sc-blue-950/90 p-4 text-sm text-gray-300">
		<p className='italic'>This is an unofficial Star Citizen fansite, not affiliated with the Cloud Imperium group of companies. All content on this site not authored by its host or users are property of their respective owners.</p>
		<div className='flex flex-row justify-between mt-1'>
			<a href="https://robertsspaceindustries.com/citizens/Yonas" target="_blank" rel="noopener noreferrer">Service provided by yonas</a>
			<a href="https://www.reddit.com/r/starcitizen/comments/gdg36s/added_some_razzle_dazzle_to_the_image_i_posted_a/" target="_blank" rel="noopener noreferrer" className="hidden md:inline">Background by u/Uranus01</a>
		</div>
	</footer>
);

export default Footer;
