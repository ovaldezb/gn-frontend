import React, { Component } from "react";
import AuthService from "../services/auth.service";
import Header from './Header';

export default class Principal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentUser: AuthService.getCurrentUser(),
    };
    
  }
  render() {
    const  currentUser  = this.state.currentUser;
    console.log(currentUser );
    return (
      <React.Fragment>
          <Header currentUser={currentUser}/>
        <h1>Bienvenido</h1>
        <h2>{currentUser.username}</h2>
      </React.Fragment>
    );
  }
}
