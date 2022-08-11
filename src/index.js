// index.js
//    entry point for the main js application

import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './components/App';
import reportWebVitals from './reportWebVitals';

// Note: this Redux Provider is not related to the Web3Provider or ethers provider!
import { Provider } from 'react-redux'
import store from './store/store'       // import our data store from store.js

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Wrap our main App component inside the Redux Provider, set store = to our store
  //    This makes our store available thru Redux to the entire App
  <Provider store={store}>
    <App />
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
