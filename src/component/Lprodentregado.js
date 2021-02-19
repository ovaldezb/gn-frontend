import React, { Component } from "react";
import Productotentregado from './Productoentregado';
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
            <Productotentregado />
          </div>
        </div>
      </React.Fragment>
    );
  }
}
