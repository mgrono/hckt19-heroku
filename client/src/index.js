import React from 'react';
import ReactDOM from 'react-dom';
import './styles/style.css';
import Index from './components/index';

import { BrowserRouter as Router, Route} from "react-router-dom";

import * as serviceWorker from './serviceWorker';

class App extends React.Component {
    render(){
        return (
            <Router>
                <div>
                    <Route path="/" exact component={Index}/>
                </div>
            </Router>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
serviceWorker.unregister();
