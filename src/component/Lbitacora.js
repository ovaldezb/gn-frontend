import React, { Component } from "react";
import Header from './Header';
import Menu from './Menu';
import Bitacora from './Bitacora';

export default class Lbitacora extends Component {
  render() {
    return (
      <React.Fragment>
        <Header />
        <div className="grid-main">
          <Menu/>
          <div className="container-gn">
            <Bitacora/>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
