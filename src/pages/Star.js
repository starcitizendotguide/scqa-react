import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

import algoliaClient from '../algoliaClient';

import Hit from '../components/Hit';

const Star = () => {
    var { id } = useParams();
    const navigate = useNavigate();
    
    const [item, setItem] = useState(null);


    useEffect(() => {
        const fetchItem = async () => {
            try {
                const hits = (await algoliaClient.search({
                    requests: [{ indexName: 'sc_questions', filters: `objectID:${id}`, hitsPerPage: 1 }],
                })).results[0].hits;

                if (hits.length > 0) {
                    setItem(hits[0]);
                } 
                else
                {
                    navigate('/404');
                }
            } catch (err) {
                console.log(err);
            } 
        };

        fetchItem();
    }, [id]);

    return (
        <>
            <Link to="/">
                <div className='mt-4 bg-sc-blue-950'>
                    <button className='p-4 button-link font-bold'>
                        <i className="fa-solid fa-arrow-left mr-1"></i>
                        Back to Search
                    </button>
                </div>
            </Link>
            { item !== null ? <Hit highlightQuery={false} {...item} /> : null }
        </>

    );
};

export default Star;
