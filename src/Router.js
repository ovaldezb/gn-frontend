import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Login from "./component/Login";
import Principal from "./component/Principal";
import Register from "./component/Register";
import Footer from "./component/Footer";
import Lordenfab from "./component/Lordenfab";
import Lprodterm from "./component/Lprodterm";
import Lproddisp from './component/Lproddisp';
import Lbitacora from "./component/Lbitacora";
import Lusuarios from './component/Lusuarios';
import Lordencompra from "./component/Lordencompra";
import Lcliente from './component/Lcliente';
import Lproveedor from './component/Lproveedor';
import Lproductoentregado from './component/Lprodentregado';
import Llotes from './component/Llote';
import LBases from './component/LBases';

class Router extends Component {
  
  render() {
    let PATH = process.env.REACT_APP_ROOT_PATH
    return (
      <BrowserRouter basename={PATH}>
        <Switch>
          <Route exact path="/" component={Login} />
          <Route exact path="/principal" component={Principal} />
          <Route exact path="/prodterminado" component={Lprodterm} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={Register} />
          <Route exact path="/usuarios" component={Lusuarios} />
          <Route exact path="/bitacora" component={Lbitacora} />
          <Route exact path="/ordenfabricacion" component={Lordenfab} />
          <Route exact path="/proddispon" component={Lproddisp} />
          <Route exact path="/ordencompra" component={Lordencompra} />
          <Route exact path="/clientes" component={Lcliente} />
          <Route exact path="/proveedores" component={Lproveedor} />
          <Route exact path="/productoentregado" component={Lproductoentregado} />
          <Route exact path="/lotes" component={Llotes} />
          <Route exact path="/bases" component={LBases} />
        </Switch>
        
        <div className="clearfix"></div>
        <Footer />
      </BrowserRouter>
    );
  }
}
export default Router;
