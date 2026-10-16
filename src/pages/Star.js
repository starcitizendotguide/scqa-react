import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

import { meiliSearchInstance, INDEX } from '../searchClient';

import Hit from '../components/Hit';

const Star = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);

    useEffect(() => {
        if (!/^[A-Za-z0-9_-]+$/.test(id)) {
            navigate('/404');
            return;
        }
        meiliSearchInstance.index(INDEX).search('', { filter: `id = "${id}"`, limit: 1 })
            .then((response) => {
                if (response.hits.length > 0) {
                    setItem(response.hits[0]);
                } else {
                    navigate('/404');
                }
            })
            .catch(() => navigate('/404'));
    }, [id, navigate]);

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
