import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Login from "./component/Login";
import Principal from "./component/Principal";
import Register from "./component/Register";
import Footer from "./component/Footer";
import Materiaprima from './component/Materiaprima';
import Testpag from './component/Testpag';
import Lordenfab from "./component/Lordenfab";
import Lprodterm from "./component/Lprodterm";
import Lproddisp from './component/Lproddisp';
import Lbitacora from "./component/Lbitacora";
import Lusuarios from './component/Lusuarios';

class Router extends Component {

  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Login} />
          <Route exact path="/principal" component={Principal} />
          <Route exact path="/materiaprima/:id" component={Materiaprima} />
          <Route exact path="/prodterminado" component={Lprodterm} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={Register} />
          <Route exact path="/usuarios" component={Lusuarios} />
          <Route exact path="/pag" component={Testpag} />
          <Route exact path="/bitacora" component={Lbitacora} />
          <Route exact path="/ordenfabricacion" component={Lordenfab} />
          <Route exact path="/proddispon" component={Lproddisp} />
        </Switch>
        
        <div className="clearfix"></div>
        <Footer />
      </BrowserRouter>
    );
  }
}
export default Router;
