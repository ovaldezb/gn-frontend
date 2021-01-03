import React, { Component } from 'react'
import Header from './Header'
import Ordenfabricacion from './Ordenfabricacion'

export default class Lordenfab extends Component {
    render() {
        return (
           <React.Fragment>
               <Header/>
               <div className="container">
                   <Ordenfabricacion/>
               </div>
           </React.Fragment>
        )
    }
}
