import React, { Component } from "react";
import SimpleReactValidator from "simple-react-validator";
//import { Link } from "react-router-dom";
import { Redirect } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import AuthService from "../services/auth.service";
import swal from "sweetalert";

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
          console.log(err);
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
        <div className="container d-flex justify-content-center">
          <div className="col-md-6">
            <div className="card card-content align-items-center">
              <form onSubmit={this.onSubmit}>
                <div className="form-group">
                  <label htmlFor="username">Usuario</label>
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    ref={this.usernameRef}
                    onChange={this.onChangeUserName}
                  />
                  {this.validator.message(
                    "username",
                    this.state.username,
                    "required"
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    ref={this.passwordRef}
                    onChange={this.onChangePassword}
                  />
                  {this.validator.message(
                    "passqord",
                    this.state.password,
                    "required"
                  )}
                </div>
                <input type="submit" value="Enviar" className="btn-success" />
              </form>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Login;
