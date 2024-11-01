import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

import algoliaClient from '../algoliaClient';
import { fetchItemByObjectID } from '../algoliaCache';

import { getValidIndex } from '../utils/helpers';

import Hit from '../components/Hit';

const Star = () => {
    var { id, index } = useParams();
    index = getValidIndex(index);

    const navigate = useNavigate();

    const [item, setItem] = useState(null);


    useEffect(() => {
        const fetchItem = async () => {
            try {

                fetchItemByObjectID(id) // --- local cache
                    .then((item) => setItem(item))
                    .catch((error) => {

                        // --- If not in cache, fetch from Algolia
                        algoliaClient.search({
                            requests: [{ indexName: index, filters: `objectID:${id}`, hitsPerPage: 1 }],
                        })
                            .then((response) => {
                                const hits = response.results[0].hits;

                                if (hits.length > 0) {
                                    setItem(hits[0]);
                                } else {
                                    navigate('/404');
                                }
                            })
                            .catch((searchError) => {
                                navigate('/404');
                            });
                    });


            } catch (err) {
                console.log(err);
            }
        };

        fetchItem();
    }, [id, index, navigate]);

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
            {item !== null ? <Hit highlightQuery={false} {...item} /> : null}
        </>

    );
};

export default Star;
