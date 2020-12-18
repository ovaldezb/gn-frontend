import React, { Component } from 'react'
import Header from './Header'
import AuthService from "../services/auth.service";

export default class Productoterminado extends Component {
    state = {
        currentUser: undefined,
      };
      constructor(props) {
        super(props);
        this.state = {
          currentUser: AuthService.getCurrentUser(),
        };
      }
    render() {
        const currentUser = this.state.currentUser;
        return (
            <React.Fragment>
                <div className="container">
                <Header currentUser={currentUser} />
                <div>Producto Terminado</div>
                </div>
            </React.Fragment>
        )
    }
}
