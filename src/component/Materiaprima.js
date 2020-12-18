import axios from "axios";
import React, { Component } from "react";
import authHeader from "../services/auth-header";
import Global from "../Global";
import Header from "./Header";
import AuthService from "../services/auth.service";
import Moment from "react-moment";
import "moment/locale/es";

export default class Materiaprima extends Component {
  state = {
    currentUser: undefined,
    matprima: {},
    estatus:'',
    style:''
  };

  componentDidMount() {
    this.id = this.props.match.params.id;
    this.setState({
      currentUser: AuthService.getCurrentUser(),
    });
    this.getMPById();
  }

  id = "";
  url = Global.url;
  

  getMPById() {
    axios
      .get(this.url + "matprima/" + this.id, authHeader)
      .then((res) => {
        this.setState({
          matprima: res.data,
        });
        var cantidad = this.state.matprima.cantidad;
        var escaso = this.state.matprima.escaso;
        var necesario = this.state.matprima.necesario;
        if(cantidad > 0 && cantidad <= escaso ){
          this.setState({
            estatus:'ESCASO',
            style:'escaso'
          });
        }else if(cantidad > escaso && cantidad <= necesario){
          this.setState({
            estatus:'NECESARIO',
            style: 'necesario'
          });
        }else{
          this.setState({
            estatus:'SUFICIENTE',
            style:'suficiente'
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    const matprima = this.state.matprima;
    const estatus = this.state.estatus;
    const style = this.state.style;
    //const style = {bgColor:'red'};
    return (
      <React.Fragment>
        <Header currentUser={this.state.currentUser} />
        <div className="container">
          <h1 className="text-center">DETALLE DE MATERIA PRIMA</h1>
          <div className="row align-items-end">
            <div className="col bg-1 text-center">
              <legend className="label">Nombre</legend>
            </div>
            <div className="col bg-1 text-center">
              <legend>Cantidad</legend>
            </div>
            <div className="col bg-1 text-center">
              <legend>Codigo</legend>
            </div>
            <div className="col bg-1 text-center">
              <legend>Proveedor</legend>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <input
                type="text"
                className="form-control text-center"
                defaultValue={matprima.descripcion}
              />
            </div>
            <div className="col">
              <input
                type="text"
                className="form-control text-center"
                defaultValue={matprima.cantidad}
              />
            </div>
            <div className="col">
              <input
                type="text"
                className="form-control text-center"
                defaultValue={matprima.codigo}
              />
            </div>
            <div className="col">
              <input
                type="text"
                className="form-control text-center"
                defaultValue={matprima.proveedor}
              />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <legend>&nbsp;</legend>
            </div>
          </div>
          <div className="row">
            <div className="col bg-1 text-center">
              <legend>Lote</legend>
            </div>
            <div className="col bg-1 text-center">
              <legend>Observaciones</legend>
            </div>
            <div className="col bg-1 text-center">
              <legend>Fecha Entrada</legend>
            </div>
            <div className="col bg-1 text-center">
              <legend>Fecha Caducidad</legend>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <input
                className="form-control text-center"
                type="text"
                defaultValue={matprima.lote}
              />
            </div>
            <div className="col">
              <input
                className="form-control text-center"
                type="text"
                defaultValue={matprima.lote}
              />
            </div>
            <div className="col">
              <legend>
                <Moment local="es" format="D MMMM YYYY" withTitle>
                  {matprima.fechaEntrada}
                </Moment>{" "}
              </legend>
            </div>
            <div className="col">
              <legend>
                <Moment local="es" format="D MMMM YYYY" withTitle>
                  {matprima.fechaCaducidad}
                </Moment>{" "}
              </legend>
            </div>
          </div>
          <div className="row">
            <div className="col text-center" >
              <p className={style}>Estatus:{estatus}</p>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
