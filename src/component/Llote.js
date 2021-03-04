import Axios from "axios";
import Global from "../Global";
import React, { Component } from "react";
import Header from "./Header";
import Lotes from './Lotes'
import Menu from "./Menu";
import swal from "sweetalert";
import AuthService from '../services/auth.service';
import authHeader from "../services/auth-header";

export default class Lordenfab extends Component {

  changeSttus = () =>{
    if(this.state.lstOC[this.state.idSelOc].estatus === Global.OPEN){
      swal({
        title: "Desea aprobar la OC "+this.state.lstOC[this.state.idSelOc].oc+" ?",
        text: "Una vez aprobada, se podrá comenzar con la(s) orden(es) de fabricación ",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if(willDelete){
          let oc = this.state.lstOC[this.state.idSelOc];
          oc.aprobado = true;
          oc.estatus = Global.APRVD;
          Axios.put(Global.url+'ordencompra/'+oc.id,oc,{ headers: authHeader() })
          .then(res =>{
            this.loadOC(false);
            swal("Se cambio el estatus de la Orde de Compra");
          })
          .catch();
        }
        })
      .catch(err=>{
        AuthService.isExpired(err.message);
      });
    }
  }

  render() {
    return (
      <React.Fragment>
        <Header />
        <div className="grid-main">
          <Menu />
          <div className="container-gn">
            <Lotes />
          </div>
        </div>
      </React.Fragment>
    );
  }
}
