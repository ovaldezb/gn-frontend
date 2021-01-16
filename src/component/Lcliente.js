import React, { Component } from 'react'
import Header from './Header';
import Menu from './Menu';
import Clientes from './Clientes';
export default class Lcliente extends Component {
    render() {
        return (
          <React.Fragment>
            <Header />
            <div className="grid-main">
              <Menu />
              <div className="container-gn">
                <Clientes />
              </div>
            </div>
          </React.Fragment>
        )
    }
}
