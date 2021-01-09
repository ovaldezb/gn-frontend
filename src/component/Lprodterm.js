import React, { Component } from "react";
import Productoterminado from './Productoterminado';
import Menu from './Menu';
import Header from './Header';

export default class Lprodterm extends Component {
  render() {
    return (
      <React.Fragment>
        <Header />
        <div className="grid-main">
          <Menu />
          <div className="container-gn">
            <Productoterminado />
          </div>
        </div>
      </React.Fragment>
    );
  }
}
