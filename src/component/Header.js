import React, { Component } from "react";
import { NavLink, Link } from "react-router-dom";
import logo from "../assets/images/logo.png";
import AuthService from "../services/auth.service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoffee } from '@fortawesome/free-solid-svg-icons'
//import { library } from '@fortawesome/fontawesome-svg-core';
//import { faStroopwafel } from '@fortawesome/free-solid-svg-icons';

export default class Header extends Component {
    
  logOut() {
    AuthService.logout();
  }

  setCurrentUser() {
    console.log("Seteando current user");
  }

  render() {
    const currentUser = this.props.currentUser;
    return (
        <header>
          <div className="container">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <Link to="/#" className="navbar-brand">
          <img src={logo} alt="Grupo Nordan" height="80" />
        </Link>

        {currentUser && (
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav mr-auto">
            <li className="nav-item">
                <NavLink className="nav-link" activeClassName="active" to={"/principal"}>
                  Inicio
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" activeClassName="active" to={"/materiaprima"}>
                  Materia Prima
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to={"/prodterminado"}>
                  Producto Terminado
                </NavLink>
              </li>
              <li className="nav-item"></li>
            </ul>
            <form className="form-inline my-2 my-lg-0">
                <NavLink to={"/profile"} className="btn btn-toolbar"><FontAwesomeIcon icon={faCoffee} />
                  {currentUser.username}
                </NavLink>
              
              <NavLink
                to="/login"
                className="btn btn-success"
                onClick={this.logOut}
              >
                Salir
              </NavLink>
            </form>
          </div>
        )}
      </nav>
      </div>
      </header>
    );
  }
}
