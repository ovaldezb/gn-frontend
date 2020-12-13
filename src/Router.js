import React,{Component} from 'react';
import {BrowserRouter,Route,Switch} from 'react-router-dom';
import Login from './component/Login';
import Principal from './component/Principal'
import Register from './component/Register';
import AuthService from "./services/auth.service";

class Router extends Component{

    

    logOut(){
        AuthService.logout();
    }

    render(){
        //const currentUser = this.state.currentUser;
        return(
            <BrowserRouter>
                {/**Poner el header */}
                <Switch>
                    <Route exact path="/" component={Login} />
                    <Route exact path="/principal" component={Principal} />
                    <Route exact path="/login" component={Login}/>
                    <Route exact path="/signup" component={Register}/>
                </Switch>
            </BrowserRouter>
        );
    }

}
export default Router;