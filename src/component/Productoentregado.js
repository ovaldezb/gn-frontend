import Axios from 'axios';
import React, { Component } from 'react'
import Global from '../Global';
import authHeader from "../services/auth-header";
import AuthService from '../services/auth.service';
import {TextField} from '@material-ui/core';
import Moment from 'moment';
import Paginacion from './Paginacion';
import swal from 'sweetalert';
import momento from 'moment';

export default class Productoentregado extends Component {

  filterRef = React.createRef();
  state={
      lstProdEnt:[],
      pageOfItems: [],
      page:1,
      fechaFinDV:'',
      productoentregado:{
        fechainicio:'',
        fechafin:''
      }
  };


  filtrado = () =>{
    var filter = this.filterRef.current.value;
    if(filter !== ''){
    var nvoArray = this.state.lstProdEnt.filter(element =>{
        return Object.values(element).filter(
          item=>{ 
            return String(item).includes(filter)}).length > 0 
    });
    this.setState({
      pageOfItems:nvoArray
    });
   }else{
    this.setState({
      pageOfItems:this.state.lstProdEnt
    });
   }
  }

  consultaPorFechas = () =>{
    if(this.state.productoentregado.fechainicio===''){
      swal('Debe seleccionar la fecha de Inicio para el reporte');
      return;
    } 
    if(this.state.productoentregado.fechafin===''){
      swal('Debe seleccionar la fecha de Fin para el reporte');
      return;
    }
    Axios.get(Global.url+'prodent/'+this.state.productoentregado.fechainicio+'/'+this.state.productoentregado.fechafin,{ headers: authHeader() })
    .then(
      res=>{
        let pef = res.data.map((pe,i)=>{
          delete pe.id;
          delete pe.cliente.id;
          return pe;
        });
        this.setState({
            lstProdEnt:pef
        });
      }
    ).catch(err=>{
      AuthService.isExpired(err.message);
    });
  }

  selectDayEnt = (event) => {
    var productoentregado = this.state.productoentregado;
    productoentregado.fechainicio = Moment(event.target.value).format('MM-DD-yyyy')+' 00:00:00.000';
    this.setState({
      productoentregado:productoentregado
    });
  };

  limpiaBuequeda = () =>{
    this.fechaFinDV = '';
    this.setState({
      lstProdEnt:[]
    });
  }

  selectDayOut = (event) => {
    var productoentregado = this.state.productoentregado;
    productoentregado.fechafin = Moment(event.target.value).format('MM-DD-yyyy')+' 23:59:59.000';;
    this.setState({
      productoentregado:productoentregado
    });
  };

  pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
  }

  onChangePage = (pageOfItems,page) => {
    // update state with new page of items
    this.setState({ pageOfItems: pageOfItems, page:page });
  }

  render() {
    
        return (
        <React.Fragment>
          <div className="container">
            <div className="barnav">
              <h2 className="center">Reporte de Producto Entregado</h2>
            </div>
            <table style={{width:'100%',border:'2px solid #047aed'}}>
              <tbody>
                <tr>
                  <td>Desde</td>
                  <td>
                    <TextField
                        id="fechaEnt"
                        label="Fecha de Inicio"
                        type="date"
                        onChange={event =>{this.selectDayEnt(event)}}
                        InputLabelProps={{shrink: true,}}/>
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
                      <button className="btn btn-success" onClick={this.consultaPorFechas}>Consultar</button>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="5">&nbsp;</td>
                  </tr>
                  <tr>
                    <td>Filtro</td>
                    <td colSpan="2"><input className="input"  type="text"  name="filtro" ref={this.filterRef} onKeyUp={this.filtrado}/></td>
                    <td colSpan="2"><button className="btn btn-warning" onClick={this.limpiaBuequeda}>Limpiar</button></td>
                </tr>
                </tbody>
              </table>
            <br/>      
          </div>
          <table className="table table-dark header-font table-bordered" style={{marginTop:'-15px'}}>
            <colgroup>
              <col width="7%"/>
              <col width="8%"/>
              <col width="10%"/>
              <col width="33%"/>
              <col width="8%"/>
              <col width="7%"/>
              <col width="8%"/>
              <col width="19%"/>
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
                <th>Entrega</th>
              </tr>
            </thead>
          </table>
        {(this.state.lstProdEnt.length > 0) &&
        <React.Fragment>
          <div className="table-ovfl-prodent tbl-lesshead ">
            <table className="table table-lst table-bordered">
              <tbody>
                {this.state.pageOfItems.map((pent,i)=>{
                  return(
                    <tr key={i}>
                      <td>{this.pad(pent.ordenFabricacion,5)}</td>
                      <td>{pent.oc}</td>
                      <td>{pent.lote}</td>
                      <td>{pent.nombreProducto}</td>
                      <td>{pent.cliente}</td>
                      <td>{pent.piezasEntregadas}</td>
                      <td>{pent.remision}</td>
                      <td>{momento(pent.fechaEntrega,'YYYY-MM-DD HH:mm:ss.sss').format('DD MMM YYYY HH:mm:ss')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="center">
            <Paginacion items={this.state.lstProdEnt} onChangePage={this.onChangePage} page={this.state.page}/>
          </div>
          </React.Fragment>
          }
        </React.Fragment>
        )    
  }
}
