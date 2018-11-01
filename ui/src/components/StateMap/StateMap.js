import React from 'react';
import './StateMap.scss';
import CheckboxUtahMap from './checkbox-utah-map';


let StateMap = (props) => {
  return (
    <CheckboxUtahMap handleGeoFilterUpdate={props.handleGeoFilterUpdate} />
  );
};

export default StateMap;