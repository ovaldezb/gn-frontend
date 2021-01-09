import React, { Component } from "react";
import Header from './Header';
import Menu from './Menu';
import Ordenfabricacion from './Ordenfabricacion';

export default class Lproddisp extends Component {
  render() {
    return (
      <React.Fragment>
        <Header />
        <div className="grid-main">
          <Menu />
          <div className="container-gn">
            <Ordenfabricacion />
          </div>
        </div>
      </React.Fragment>
    );
  }
}
