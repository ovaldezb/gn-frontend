import React, { Component} from "react";
import { NavLink, Link, Redirect } from "react-router-dom";
import logo from "../assets/images/logo.png";
import AuthService from "../services/auth.service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faDoorOpen,faSitemap } from "@fortawesome/free-solid-svg-icons";
import Clock from 'react-live-clock';
//import { library } from '@fortawesome/fontawesome-svg-core';
//import { faStroopwafel } from '@fortawesome/free-solid-svg-icons';

export default class Header extends Component {

   version = "1.0.1";

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
      <header style={{height:'70px'}}>
          <nav className="navbar navbar-expand-lg nav-bg" style={{height:'70px'}}>
            <Link to="/#" className="navbar-brand"><img src={logo} alt="Grupo Nordan" height="80" /></Link>
              <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <div className="navbar-nav mr-auto">
                <div className="info-user">
                    <Clock format={'dddd DD MMMM YYYY hh:mm A'} ticking={true}  />
                  </div>
                </div>
                <div className="info-user" style={{fontSize:'12px',marginRight:'30px'}}>
                  <strong>Ver.</strong>{this.version}
                </div>

                <form className="grid-3">
                  
                  <div className="info-user">
                  <FontAwesomeIcon icon={faSitemap} size="2x" className="icon"/>
                    {currentUser.area}
                  </div>
                  <div className="info-user">
                    <FontAwesomeIcon icon={faUser} size="2x" className="icon"/>
                    {currentUser.username}
                    </div> 
                  <NavLink to="/login"
                    className="btn btn-success"
                    onClick={this.logOut}>
                      <span>
                      <FontAwesomeIcon icon={faDoorOpen}className="icon-menu" />
                    </span>
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
