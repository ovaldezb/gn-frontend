import React, { Component } from "react";
import SimpleReactValidator from "simple-react-validator";
//import { Link } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { Redirect } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import AuthService from "../services/auth.service";
import swal from "sweetalert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faUser,faKey} from "@fortawesome/free-solid-svg-icons";

class Login extends Component {
  usernameRef = React.createRef();
  passwordRef = React.createRef();
  constructor() {
    super();
    this.validator = new SimpleReactValidator({
      messages: {
        required: "Este campo es requerido",
      },
    });
  }

  state = {
    username: "",
    password: "",
    message: "",
    status: "fail",
  };

  onChangeUserName = () => {
    this.setState({
      username: this.usernameRef.current.value,
    });
  };

  onChangePassword = (event) => {
    this.setState({
      password: this.passwordRef.current.value,
    });
  };

  onSubmit = (event) => {
    event.preventDefault();
    if (this.validator.allValid()) {
      AuthService.login(this.state.username, this.state.password)
        .then((res) => {
            if(res!== 'error'){
              this.setState({
                status: "success"
              });
            }else{
              swal("Ocurrio un error","Verifique su usario y contraseña",'error');
            }
        }).catch((err) => {
          
          this.setState({
            status: "error"
          });

        });
    } else {
      this.setState({
        status: "error"
      });
      this.validator.showMessages();
      this.forceUpdate();
    }
  };

  render() {
    if (this.state.status === "success") {
      return <Redirect to="/principal" />;
    }
    return (
      <React.Fragment>
        <header>
          <nav className="navbar-expand-lg nav-bg bg-light">
            <img src={logo} alt="Grupo Nordan" height="70" />
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
            
            </div>
          </nav>
        </header>
        <div className="contenedor">
          <h1 className="titulo">Sistema de Seguimiento de Materia Prima</h1>
              <form onSubmit={this.onSubmit} className="formulario">
                <h2 className="titulo">Ingrese</h2>
                <div className="input-contenedor">
                  <FontAwesomeIcon icon={faUser} className="icon"/>
                  <input type="text" placeholder="Usuario" name="username"  ref={this.usernameRef}    onChange={this.onChangeUserName}/>
                  {this.validator.message("username",this.state.username,"required")}
                </div>
                <div className="input-contenedor">
                  <FontAwesomeIcon icon={faKey} className="icon"/>
                  <input type="password" name="password" placeholder="Password" ref={this.passwordRef} onChange={this.onChangePassword} />
                  {this.validator.message("password",this.state.password,"required")}
                </div>
                <input type="submit" value="Enviar" className="button" />
              </form>
            </div>
        
      </React.Fragment>
    );
  }
}

export default Login;
