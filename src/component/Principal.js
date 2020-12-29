import React, { Component } from "react";
import Materiasprimas from "./Materiasprimas";
import Header from './Header';

export default class Principal extends Component { 
  

  render() {
      return (
        <React.Fragment>
          <Header />
          <div className="container">
            <Materiasprimas />
          </div>
        </React.Fragment>
      );
  }
}
