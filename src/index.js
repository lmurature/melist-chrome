/*global chrome*/
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

chrome.cookies.get(
  { url: 'https://melist-app.herokuapp.com/summary', name: 'refresh-token' },
  (cookie) => {
    if (cookie) {
      console.log(cookie.value);
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        ReactDOM.render(
          <React.StrictMode>
            <App refreshToken={cookie.value} tabUrl={tabs[0].url} />
          </React.StrictMode>,
          document.getElementById('root')
        );
      });
    } else {
      ReactDOM.render(
        <React.StrictMode>
          <div className="not-logged">
            Inicia sesión en{' '}
            <a href="https://melist-app.herokuapp.com/" target="_blank">
              Melist
            </a>{' '}
            para comenzar a utilizar la extensión.
          </div>
        </React.StrictMode>,
        document.getElementById('root')
      );
    }
  }
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
