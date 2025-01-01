import React from 'react';
import './Loader.css'; // Assuming you have styles defined for the spinner blades

const Spinner: React.FC = () => {
  return (
    <div className="spinner center">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="spinner-blade"></div>
      ))}
    </div>
  );
};

export default Spinner;
