import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Login from "./component/Login";
import Principal from "./component/Principal";
import Register from "./component/Register";
import Footer from "./component/Footer";
import Materiaprima from './component/Materiaprima';
import Productoterminado from './component/Productoterminado'

class Router extends Component {
  

  render() {
    
    return (
      <BrowserRouter>
        {/**Poner el header */}
        
        <Switch>
          <Route exact path="/" component={Login} />
          <Route exact path="/principal" component={Principal} />
          <Route exact path="/materiaprima/:id" component={Materiaprima} />
          <Route exact path="/prodterminado" component={Productoterminado} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={Register} />
        </Switch>
        <div className="row"></div>
        <div className="clearfix"></div>
        <Footer />
      </BrowserRouter>
    );
  }
}
export default Router;
