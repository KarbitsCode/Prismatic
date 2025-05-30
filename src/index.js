import React from 'react';
import ReactDOM from 'react-dom';
import './styles/main.css';
import App from './Components/App';
import * as serviceWorker from './serviceWorker';
import noop from "noop3";

ReactDOM.render(<App/>, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
if (noop()) {
  serviceWorker.register();
} else {
  serviceWorker.unregister();
}
