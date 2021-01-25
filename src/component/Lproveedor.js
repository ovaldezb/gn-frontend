import React, { Component } from 'react'
import Header from './Header';
import Menu from './Menu';
import Proveedores from './Proveedores' 
export default class Lcliente extends Component {
    render() {
        return (
          <React.Fragment>
            <Header />
            <div className="grid-main">
              <Menu />
              <div className="container-gn">
                <Proveedores />
              </div>
            </div>
          </React.Fragment>
        )
    }
}
