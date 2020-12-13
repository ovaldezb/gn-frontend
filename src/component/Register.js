import React, { Component } from "react";
import AuthService from "../services/auth.service";
import SimpleReactValidator from "simple-react-validator";

export default class Register extends Component {
  usernameRef = React.createRef();
  passwordRef = React.createRef();
  emailRef = React.createRef();

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
    email: "",
    password: "",
    status: "failed",
  };

  onChangeUserName = () => {
    this.setState({
      username: this.usernameRef.current.value,
    });
  };

  onChangeEmail = () => {
    this.setState({
      email: this.emailRef.current.value,
    });
  };

  onChangePassword = () => {
    this.setState({
      password: this.passwordRef.current.value,
    });
  };

  onSubmit = (event) => {
    event.preventDefault();
    if (this.validator.allValid()) {
      AuthService.register(
        this.state.username,
        this.state.email,
        this.state.password
      ).then((res) => {
        this.setState({
          status: "success",
        });
      });
    } else {
      this.setState({
        status: "failed",
      });
      this.validator.showMessages();
      this.forceUpdate();
    }
  };

  render() {
    return (
      <div className="col-md-12">
        <div className="card card-container">
          <form onSubmit={this.onSubmit}>
            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <input
                type="text"
                name="username"
                ref={this.usernameRef}
                onChange={this.onChangeUserName}
              />
              {this.validator.message("username",this.state.username,"required")}
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo</label>
              <input
                type="text"
                name="email"
                ref={this.emailRef}
                onChange={this.onChangeEmail}
              />
              {this.validator.message("email",this.state.email,"required")}
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
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
    );
  }
}
