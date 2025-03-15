import React from 'react';
import ReactDOM from 'react-dom';
import './styles/main.css';
import App from './Components/App';
import * as serviceWorker from './serviceWorker';
import isElectron from 'is-electron';

ReactDOM.render(<App/>, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
if (isElectron()) {
  serviceWorker.unregister();
} else {
  serviceWorker.register();
}
