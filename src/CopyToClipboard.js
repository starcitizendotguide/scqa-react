import React from 'react';

const CopyToClipboard = (props) => {
    return (
        <span onClick={() => navigator.clipboard.writeText(props.copyValue)}>
            {props.children}
        </span>
    );
};

export default CopyToClipboard;

