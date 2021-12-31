import React from 'react';


const InformationCard = (props) => {
    return (
        <div className="card mt-2">
            <div className="card-content is-radiusless pt-3">
                {props.children}
                <span>Powered by <a href="https://www.algolia.com/?utm_source=instantsearch.js&utm_medium=website&utm_content=starfarer.space&utm_campaign=poweredby" target="_blank" rel="noopener noreferrer"><i className="fab fa-algolia"></i> algolia</a></span>
                <div className="credits mt-4">
                    <i>This is an unofficial Star Citizen fansite, not affiliated with the Cloud Imperium group of companies. All content on this site not authored by its host or users are property of their respective owners.</i>
                    <a href="https://robertsspaceindustries.com/citizens/Yonas" target="_blank" rel="noopener noreferrer" className="credits is-pulled-left is-hidden-mobile ">Service provided by yonas</a>
                    <a href="https://www.reddit.com/r/starcitizen/comments/gdg36s/added_some_razzle_dazzle_to_the_image_i_posted_a/" target="_blank" rel="noopener noreferrer" className="credits is-pulled-right is-hidden-mobile ">Background by u/Uranus01</a>
                 </div>
            </div>
            
        </div>
    );
}

export default InformationCard;