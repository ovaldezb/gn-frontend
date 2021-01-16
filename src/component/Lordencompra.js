import React, { Component } from 'react'
import Header from './Header'
import Menu from './Menu'
import Ordenescompra from './Ordenescompra'

export default class Lordencompra extends Component {
    render() {
        return (
            <React.Fragment>
            <Header />
            <div className="grid-main">
              <Menu />
              <div className="container-gn">
                <Ordenescompra />
              </div>
            </div>
          </React.Fragment>
        )
    }
}
