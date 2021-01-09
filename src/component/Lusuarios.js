import React, { Component } from "react";
import Header from "./Header";
import Menu from "./Menu";
import Usuarios from "./Usuarios";
export default class Lusuarios extends Component {
  render() {
    return (
      <React.Fragment>
        <Header />
        <div className="grid-main">
          <Menu />
          <div className="container-gn">
            <Usuarios />
          </div>
        </div>
      </React.Fragment>
    );
  }
}
