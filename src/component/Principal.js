import React, { Component } from "react";
import Header from "./Header";
import AuthService from "../services/auth.service";

import Materiasprimas from "./Materiasprimas";

export default class Principal extends Component {
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
        <Header currentUser={currentUser} />
        <div className="container">
          <Materiasprimas />
        </div>
      </React.Fragment>
    );
  }
}
