import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';


const GenericNotFound = () => {

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
      <Card
        title={
          <h1 className="text-lg text-sc-blue-300 font-semibold">
            404 - Oops! It seems we've drifted off course - this page is lost in the cosmic void. Try checking your spaceship's coordinates!
          </h1>
        }
      />
    </>

  );
};

export default GenericNotFound;
