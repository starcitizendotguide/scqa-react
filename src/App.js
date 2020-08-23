import algoliasearch from 'algoliasearch/lite';
import React, { Component } from 'react';
import qs from 'qs';
import {
  InstantSearch,
  Hits,
  Configure,
  connectSearchBox
} from 'react-instantsearch-dom';


import InformationCard from './InformationCard';
import Hit from './Hit';
import DebouncedSearchBox from './DebouncedSearchBox';

import M from 'materialize-css';
import './styles/App.scss';
import video_background from './styles/assets/background.webm';
import video_poster from './styles/assets/header.webp';

const DSearchBox = connectSearchBox(DebouncedSearchBox);

// create the client
const searchClient = algoliasearch(
  'JXS80KHU8P',
  'ce0e3984181fb0fc71f26a20c56d9725'
);

const createURL = state => `?question=${encodeURIComponent(state.query)}`;
const searchStateToUrl = (props, searchState) =>
  searchState ? `${props.location.pathname}${createURL(searchState)}` : '';

const urlToSearchState = location => {

  // We have to check whether or not the ?question= even exists, otherwise we get an "undefined" in our search bar...
  let parsed = qs.parse(location.search.slice(1));
  if(parsed['question'] === undefined) {
    return { question: '', query: '', page: "1" };
  }

  // encode the question into our state
  let question = decodeURIComponent(parsed.question);
  return { question: encodeURIComponent(question), query: question, page: "1" };
}

class App extends Component {

  state = {
    searchState: urlToSearchState(this.props.location),
    lastLocation: this.props.location,
    objectID: null,
  };

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
      this.props.history.push(
        searchStateToUrl(this.props, searchState),
        searchState
      );
    }, 400);

    this.setState({ searchState });

    this.registerTooltips();
  };

  componentDidMount() {

    M.Modal.init(document.querySelectorAll('.modal'), {
      onCloseStart: function (element) {
          // When video modal is closed stop playing the video
          document.getElementById('video-modal-content').innerHTML = '';
      }
    });
    this.registerTooltips();
    let hash = window.location.hash.split('#')[1];

    if(hash === undefined || hash === null) {
      return;
    } 

    this.setState({ objectID: parseInt(hash) });
  }

  registerTooltips() {
    M.Tooltip.init(document.querySelectorAll('.tooltipped'), {});
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
                <DSearchBox delay={250} onChange={() => this.setState({ objectID: null })} autoFocus={true}/>
              </InformationCard>
              <Hits hitComponent={Hit} />
            </div>
          </InstantSearch>
        </div>

        <div id="video-modal" className="modal">
            <div id="video-modal-content" className="modal-content"> </div>
        </div>

        <div className="video-container">
          <video autoPlay={true} muted={true} loop={true} poster={video_poster}>
              <source src={video_background} type="video/webm" />
          </video>
        </div>
      </>
    );
  }
};

export default App;
