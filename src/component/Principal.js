import React, { Component } from "react";
import Materiasprimas from "./Materiasprimas";
import Header from './Header';
import Menu from './Menu'

export default class Principal extends Component { 
  

  render() {
      return (
        <React.Fragment>
          <Header />
          <div className="grid-main">
            <Menu/>
            <div className="container-gn">
              <Materiasprimas />
            </div>
          </div>
        </React.Fragment>
      );
  }
}
