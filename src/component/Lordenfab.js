import React, { Component } from "react";
import Header from "./Header";
import Ordenfabricacion from "./Ordenesfabricacion";
import Menu from "./Menu";

export default class Lordenfab extends Component {
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
