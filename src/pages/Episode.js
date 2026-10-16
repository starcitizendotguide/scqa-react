import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

import { meiliSearchInstance, INDEX } from '../searchClient';
import Hit from '../components/Hit';
import Card from '../components/Card';
import TimeDelta from '../components/TimeDelta';

const clock = (s) => {
	const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
	return `${h ? `${h}:${String(m).padStart(2, '0')}` : m}:${String(x).padStart(2, '0')}`;
};

const Episode = () => {
	const { videoId } = useParams();
	const navigate = useNavigate();
	const [items, setItems] = useState(null);
	const [start, setStart] = useState(0);
	const [autoplay, setAutoplay] = useState(false);

	useEffect(() => {
		if (!/^[\w-]{6,20}$/.test(videoId)) {
			navigate('/404');
			return;
		}
		meiliSearchInstance.index(INDEX)
			.search('', { filter: `source.video_id = "${videoId}"`, sort: ['source.start:asc'], limit: 500 })
			.then((response) => (response.hits.length ? setItems(response.hits) : navigate('/404')))
			.catch(() => navigate('/404'));
	}, [videoId, navigate]);

	if (items === null) {
		return <div className='mt-4'><Card content={<>Loading <i className="fas fa-spin fa-spinner"></i></>} /></div>;
	}

	const source = items[0].source;
	const youtube = source.platform === 'youtube';
	const jump = (seconds) => {
		setStart(seconds || 0);
		setAutoplay(true);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	return (
		<>
			<Link to="/">
				<div className='mt-4 bg-sc-blue-950'>
					<button className='p-4 button-link font-bold' aria-label='Back to Search'>
						<i className="fa-solid fa-arrow-left mr-1"></i>
						Back to Search
					</button>
				</div>
			</Link>
			<div className='mt-4 bg-sc-blue-950 p-4'>
				<h1 className='text-xl text-sc-blue-300 font-semibold'>{source.title}</h1>
				<div className='text-sm text-gray-400 mb-3'>
					{source.show} · <TimeDelta timestamp={source.published_at} /> · {items.length} Q&As
				</div>
				{youtube ? (
					<iframe
						key={`${start}-${autoplay}`}
						className="w-full aspect-video"
						src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0${start ? `&start=${start}` : ''}${autoplay ? '&autoplay=1' : ''}`}
						title={source.title}
						frameBorder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						referrerPolicy="strict-origin-when-cross-origin"
						allowFullScreen>
					</iframe>
				) : (
					<a href={source.url} target="_blank" rel="noopener noreferrer">Watch on {source.platform}</a>
				)}
			</div>
			{items.map((item) => (
				<div key={item.id}>
					{youtube && item.source.start != null && (
						<button className='mt-4 px-3 py-1 bg-sc-blue-950 text-sc-blue-300 text-sm font-mono hover:opacity-80'
							onClick={() => jump(item.source.start)} aria-label={`Play from ${clock(item.source.start)}`}>
							<i className="fas fa-play mr-1"></i>{clock(item.source.start)}
						</button>
					)}
					<Hit highlightQuery={false} {...item} />
				</div>
			))}
		</>
	);
};

export default Episode;
