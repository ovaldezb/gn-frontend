import React, { Component } from "react";
import Header from './Header';
import Menu from './Menu';
import ProductoDisponible from './Proddisponible'

export default class Lproddisp extends Component {
  render() {
    return (
      <React.Fragment>
        <Header />
        <div className="grid-main">
          <Menu />
          <div className="container-gn">
            <ProductoDisponible />
          </div>
        </div>
      </React.Fragment>
    );
  }
}
