import React, { Component } from "react";
import Bases from "./Bases";
import Header from "./Header";
import Menu from "./Menu";

export default class LBases extends Component {
  render() {
    return (
      <React.Fragment>
        <Header />
        <div className="grid-main">
          <Menu />
          <div className="container-gn">
            <Bases />
          </div>
        </div>
      </React.Fragment>
    );
  }
}
