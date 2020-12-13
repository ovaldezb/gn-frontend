import React, { Component } from "react";
import { Link } from "react-router-dom";
export default class Header extends Component {
  render() {
    const currentUser = this.props.currentUser;
    return (        
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
        {currentUser ? (
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link to={"/profile"} className="nav-link">{currentUser.username}</Link>
            </li>
            <li className="nav-item">
              <a href="/login" className="nav-link" onClick={this.logOut}>LogOut</a>
            </li>
          </ul>
        ) : (
          <ul className="nav-bar ml-auto">
            <li className="nav-item">
              <Link to={"/login"} className="nav-link">Login</Link>
            </li>
            <li className="nav-item">
              <Link to={"/signup"} className="nav-link">SignUp</Link>
            </li>
          </ul>
        )}
        </div>
      </nav>
    );
  }
}
