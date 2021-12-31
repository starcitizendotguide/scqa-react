import algoliasearch from 'algoliasearch/lite';
import React, { Component } from 'react';
import qs from 'qs';
import {
  InstantSearch,
  Configure,
  connectSearchBox,
  connectStateResults,
} from 'react-instantsearch-dom';
import { useNavigate, useLocation } from 'react-router-dom';

import InformationCard from './InformationCard';
import DebouncedSearchBox from './DebouncedSearchBox';
import Hit from './Hit';
import VideoModal from './VideoModal';

import './../styles/App.scss';
import video_background from './../styles/assets/background.webm';
import video_poster from './../styles/assets/header.webp';

const DSearchBox = connectSearchBox(DebouncedSearchBox);


// create the client
const searchClient = algoliasearch(
  'JXS80KHU8P',
  'ce0e3984181fb0fc71f26a20c56d9725'
);

const createURL = state => (state.query.length > 0 ? `?question=${encodeURIComponent(state.query)}` : '');
const searchStateToUrl = (props, searchState) =>
  searchState ? `${props.location.pathname}${createURL(searchState)}` : '';

const getHashFromUrl = function() {
  let hash = window.location.hash.split('#')[1];
  if(hash === undefined || hash === null) {
    return null;
  } 

  return hash;

}

const urlToSearchState = location => {

  // We have to check whether or not the ?question= even exists, otherwise we get an "undefined" in our search bar...
  let parsed = qs.parse(location.search.slice(1));
  if(parsed['question'] === undefined) {
    return { question: '', query: '', page: "1" };
  }

  // BUG-FIX: For some reason some URLs that had an object id and search paramters failed to resolve when the search paramters
  // where still present, and I think that is because they caused some issue because those URLs were generated with the old
  // version of this website that was written in Vue... Anyway, this should fix it. 
  if(getHashFromUrl() !== null) {
    return { question: '', query: '', page: "1" };
  }

  // encode the question into our state
  let question = decodeURIComponent(parsed.question);
  return { question: encodeURIComponent(question), query: question, page: "1" };
}

// --- custom search results with loading indicator...
const SearchResults = connectStateResults(({ allSearchResults, searching, isSearchStalled, error, videoModal }) => {
  if(searching) {
    return <div>
      <div className="card hoverable">
          <div className="card-content">
            <p className="grey-text text-darken-1">Searching <i className="fas fa-spin fa-spinner"></i></p>
          </div>
        </div>
    </div>;
  } else if(isSearchStalled) {
    return <div>
      <div className="card hoverable">
          <div className="card-content">
            <p className="grey-text text-darken-1">Searching stalled. There might be an issue with your internet connection.</p>
          </div>
        </div>
    </div>; 
  } else {
    return (
      <div>
        {
          allSearchResults.hits.map(element => (
            <Hit key={element.objectID} videoModal={videoModal} {...element} />
          ))
        }
      </div>
    );
  }

});

class App extends Component {

  state = {
    searchState: urlToSearchState(this.props.location),
    lastLocation: this.props.location,
    objectID: null,
  };

  constructor(props) {
    super(props);

    this.videoModal = React.createRef();
  }

  static getDerivedStateFromProps(props, state) {
    if (props.location !== state.lastLocation) {
      return {
        searchState: urlToSearchState(props.location),
        lastLocation: props.location,
      };
    }
    return null;
  }

  onSearchStateChange = searchState => {
    clearTimeout(this.debouncedSetState);

    this.debouncedSetState = setTimeout(() => {
      this.props.navigation(searchStateToUrl(this.props, searchState));
    }, 400);

    this.setState({ searchState: searchState, objectID: null });
  };

  componentDidMount() {
    let hash = getHashFromUrl();

    if(hash === null) {
      return;
    }    

    window.history.replaceState({}, document.title, "/#" + hash);
    this.setState({ objectID: hash });
  }

  render() {
    return (
      <>
        <div className="ais-InstantSearch">
          <InstantSearch 
            indexName="sc_questions" 
            searchClient={searchClient}
            searchState={this.state.searchState}
            onSearchStateChange={this.onSearchStateChange}
            createURL={createURL}
          >
            { this.state.objectID !== null ? <Configure filters={`objectID:${this.state.objectID}`} /> : null }
            <div className="container">
              <InformationCard>
                <DSearchBox delay={250} onSearch={() => this.setState({ objectID: null })} autoFocus={true}/>
              </InformationCard>
              <SearchResults videoModal={this.videoModal} />
            </div>
          </InstantSearch>
        </div>


        <VideoModal ref={this.videoModal} />

        <div className="video-container">
          <video autoPlay={true} muted={true} loop={true} poster={video_poster}>
              <source src={video_background} type="video/webm" />
          </video>
        </div>
      </>
    );
  }
};

const WrappedApp = props => {
  const navigation = useNavigate();
  const location = useLocation();

  return <App navigation={navigation} location={location} {...props} />
}

export default WrappedApp;
