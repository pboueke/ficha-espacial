import React, { Component } from 'react';
import Ranking from "./Ranking"
import './App.css';
import 'semantic-ui-css/semantic.min.css';

const m2ToCandidate = ({candidate_name, years, uf, city, value, job}) => ({
  name: candidate_name,
  years: Object.keys(years),
  uf,
  city,
  value,
  job
})

class App extends Component {
  state = {
    ranking_m2: require('./data/ranking-m2.json')
  }
  render() {
    return (
      <div className="App">
        <Ranking candidates={this.state.ranking_m2.map(m2ToCandidate)}/>
      </div>
    );
  }
}

export default App;
