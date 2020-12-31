import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Login from "./component/Login";
import Principal from "./component/Principal";
import Register from "./component/Register";
import Footer from "./component/Footer";
import Materiaprima from './component/Materiaprima';
import Productoterminado from './component/Productoterminado'
import Usuarios from "./component/Usuarios";
import Testpag from './component/Testpag';
import Bitacora from "./component/Bitacora";
import Ordenfabricacion from './component/Ordenfabricacion';
import Proddisponible from './component/Proddisponible';

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
          <Route exact path="/usuarios" component={Usuarios} />
          <Route exact path="/pag" component={Testpag} />
          <Route exact path="/bitacora" component={Bitacora} />
          <Route exact path="/ordenfabricacion" component={Ordenfabricacion} />
          <Route exact path="/proddispon" component={Proddisponible} />
        </Switch>
        <div className="row"></div>
        <div className="clearfix"></div>
        <Footer />
      </BrowserRouter>
    );
  }
}
export default Router;
