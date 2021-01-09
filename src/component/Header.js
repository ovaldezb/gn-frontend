import React, { Component } from "react";
import { NavLink, Link, Redirect } from "react-router-dom";
import logo from "../assets/images/logo.png";
import AuthService from "../services/auth.service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoffee } from "@fortawesome/free-solid-svg-icons";

//import { library } from '@fortawesome/fontawesome-svg-core';
//import { faStroopwafel } from '@fortawesome/free-solid-svg-icons';

export default class Header extends Component {
  state = {
    currentUser: AuthService.getCurrentUser(),
  };

  logOut = () => {
    AuthService.logout();
    this.setState({
      currentUser: null,
    });
    this.forceUpdate();
  };

  render() {
    const currentUser = this.state.currentUser;
    if(currentUser){
    return (
      <header>
          <nav className="navbar navbar-expand-lg nav-bg">
            <Link to="/#" className="navbar-brand"><img src={logo} alt="Grupo Nordan" height="80" /></Link>
              <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav mr-auto">
                  <li className="nav-item">
                    <NavLink className="nav-link" activeClassName="active" to={"/principal"}>
                      MP
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to={"/proddispon"}>
                      PD
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to={"/ordenfabricacion"}>
                      OF
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to={"/prodterminado"}>
                      PT
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to={"/bitacora"}>
                      Bitácora
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to={"/usuarios"}>
                      Usuarios
                    </NavLink>
                  </li>
                  <li className="nav-item"></li>
                </ul>

                <form className="form-inline my-2 my-lg-0">
                  <NavLink to={"/profile"} className="btn btn-toolbar">
                    <FontAwesomeIcon icon={faCoffee} />
                    {currentUser.username}
                  </NavLink>

                  <NavLink
                    to="/login"
                    className="btn btn-success"
                    onClick={this.logOut}>
                    Salir
                  </NavLink>
                </form>
              </div>
          </nav>
      </header>
    );
    }else{
      return <Redirect to="/" />
    }
  }
}
