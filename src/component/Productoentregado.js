import Axios from 'axios';
import React, { Component } from 'react'
import Global from '../Global';
import authHeader from "../services/auth-header";
import AuthService from '../services/auth.service';
import {TextField} from '@material-ui/core';
import Moment from 'moment';

export default class Productoentregado extends Component {


    state={
        lstProdEnt:[],
        productoentregado:{
          fechainicio:'',
          fechafin:''
        }
    };

    componentDidMount(){
        this.loadProdEntregado();
    }

    loadProdEntregado = () =>{
        Axios.get(Global.url+'prodent',{ headers: authHeader() })
        .then(res=>{
            if(res.data.length > 0){
                this.setState({
                    lstProdEnt:res.data
                });
            }
            
        })
        .catch(err=>{
            AuthService.isExpired(err.message);
        });
    }

  selectDayEnt = (event) => {
    var productoentregado = this.state.productoentregado;
    productoentregado.fechainicio = Moment(event.target.value).format('MM-DD-yyyy h:mm:ss');
    this.setState({
      productoentregado:productoentregado
    });
  };


  selectDayOut = (event) => {
    var productoentregado = this.state.productoentregado;
    productoentregado.fechafin = Moment(event.target.value).format('MM-DD-yyyy h:mm:ss');
    this.setState({
      productoentregado:productoentregado
    });
  };

  pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
  }

    render() {
        if(this.state.lstProdEnt.length > 0){
            return (
            <React.Fragment>
              <div className="container">
                <div className="barnav">
                <h2 className="center">Reporte de Producto Entregado</h2>
                </div>
                    
                    <table style={{width:'100%',border:'1px solid black'}}>
                      <tbody>
                        <tr>
                          <td>
                            Filtro
                          </td>
                          <td colSpan="4"><input className="input"  type="text"  name="filtro" ref={this.filterRef} onKeyUp={this.filtrado}/></td>
                        </tr>
                        <tr>
                          <td colSpan="5">&nbsp;</td>
                        </tr>
                        <tr>
                          <td>Desde</td>
                          <td>
                          <TextField
                            id="fechaEnt"
                            label="Fecha de Inicio"
                            type="date"
                            
                            onChange={event =>{this.selectDayEnt(event)}}
                            InputLabelProps={{
                              shrink: true,
                            }}/>
                          </td>
                          <td>Hasta</td>
                          <td>
                          <TextField
                            id="fechaEnt"
                            label="Fecha de Fin"
                            type="date"
                            onChange={event =>{this.selectDayOut(event)}}
                            InputLabelProps={{
                              shrink: true,
                            }}/>
                          </td>
                          <td>
                            <button className="btn">Consultar</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>

              <br></br>      
                    
                    
                
                
              </div>
              <table className="table table-dark header-font table-bordered">
                <colgroup>
                </colgroup>
                <thead>
                  <tr>
                    <th>OF</th>
                    <th>OC</th>
                    <th>Lote</th>
                    <th>Producto</th>
                    <th>Cliente</th>
                    <th>Piezas</th>
                    <th>Remisión</th>
                    <th>F. Entrega</th>
                  </tr>
                </thead>
              </table>
              <div className="table-ovfl tbl-lesshead">
                <table className="table table-lst table-bordered">
                  <tbody>
                    {this.state.lstProdEnt.map((pent,i)=>{
                      return(
                        <tr key={i}>
                          <td>{this.pad(pent.ordenFabricacion,5)}</td>
                          <td>{pent.oc}</td>
                          <td>{pent.lote}</td>
                          <td>{pent.nombreProducto}</td>
                          <td>{pent.cliente.nombre}</td>
                          <td>{pent.piezasEntregadas}</td>
                          <td>{pent.remision}</td>
                          <td>{pent.fechaEntrega}</td>
                        </tr>
                      );
                    })}

                  </tbody>
                </table>
              </div>
            </React.Fragment>
            )    
        }else{
          return (
            <React.Fragment>
              <div className="container">
                <div className="barnav">
                  <div className="container flex-gn">
                    <h2>Producto Entregado</h2>
                    <nav>
                    </nav>
                  </div>
                </div>
                  <h2 className="center">No hay producto entregados para mostrar</h2>
                </div>
            </React.Fragment>
        )
        }
        
    }
}
