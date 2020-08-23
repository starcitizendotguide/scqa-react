import React from 'react';

class DebouncedSearchBox extends React.Component {
    timerId = null;
  
    state = {
      value: this.props.currentRefinement
    };
  
    onChangeDebounced = event => {
      const { refine, delay } = this.props;
      const value = event.currentTarget.value;
  
      clearTimeout(this.timerId);
      this.timerId = setTimeout(() => refine(value), delay);
  
      this.setState(() => ({
        value
      }));
    };
  
    render() {
      const { value } = this.state;
  
      return (
        <input
            className="ais-SearchBox"
            value={value}
            onChange={this.onChangeDebounced}
            placeholder="What are you looking for?"
        />
      );
    }
}

export default DebouncedSearchBox;