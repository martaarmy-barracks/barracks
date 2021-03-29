import React from 'react';
import ReactDOM from 'react-dom';
//import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css';
import App from './App';

var e = document.body.appendChild(document.createElement('div'));
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  e
);
