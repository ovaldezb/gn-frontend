import Axios from 'axios';
import React, { Component } from 'react'
import Global from '../Global';
import authHeader from "../services/auth-header";
import AuthService from '../services/auth.service';
import {Link, TextField} from '@material-ui/core';
import Moment from 'moment';
import swal from 'sweetalert';
import momento from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckDouble
} from "@fortawesome/free-solid-svg-icons";
import NumberFormat from 'react-number-format';

export default class Productoentregado extends Component {

  filterRef = React.createRef();
  optionRef = React.createRef();
  isModalActive = false;
  isModalEstatusActive = false;
  state={
      lstProdEnt:[],
      lstProdEntInit:[],
      option:Global.APRVD,
      fechaFinDV:'',
      idSelPe:-1,
      productoentregado:{
        fechainicio:'',
        fechafin:''
      },
      motivoCancel:''
  };

  componentDidMount(){
    this.getProductosEntregados();
  }

  getProductosEntregados = () =>{
    Axios.get(Global.url+'prodent',{ headers: authHeader() })
      .then(res=>{
        let pef = res.data.map((pe,i)=>{
          //delete pe.id;
          pe.estatus_codigo = pe.estatus.codigo;
          delete pe.estatus.id;
          delete pe.cliente.id;
          return pe;
        });
        this.setState({
            lstProdEnt:pef,
            lstProdEntInit:pef,
        });
      })
      .catch(err=>{
        AuthService.isExpired(err.message);
      });
  }

  filtrado = () =>{
    var filter = this.filterRef.current.value;
    if(filter !== ''){
    var nvoArray = this.state.lstProdEntInit.filter(element =>{
        return Object.values(element).filter(
          item=>{ 
            return String(item).includes(filter.toUpperCase())}).length > 0 
    });
    this.setState({
      lstProdEnt:nvoArray
    });
   }else{
    this.setState({
      lstProdEnt:this.state.lstProdEntInit
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
          //delete pe.id;
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

  selectRow = (i) => {
    this.setState({
      idSelPe: i,
    });
  };


  cambiaEstatus = ()=>{
    if(this.state.lstProdEnt[this.state.idSelPe].tipoEntrega === Global.ENTREGA && this.state.lstProdEnt[this.state.idSelPe].estatus.codigo === Global.OPEN){
      this.isModalActive = true;
      this.forceUpdate();
    }
  }

  closeModal = () =>{
    this.isModalActive = false;
    this.forceUpdate();
  }

  changeOption = () =>{
    this.setState({
      option:this.optionRef.current.value
    });
  }

  capturaMotivo =(event) =>{
    this.setState({
      motivoCancel:event.target.value
    });
  }

  procedeCambioEstaus = () =>{
    let prodent = this.state.lstProdEnt[this.state.idSelPe];
    delete prodent.fechaEntrega;
    if(this.state.option === Global.APRVD){
      prodent.codigoEstatus = Global.CMPLT;
      Axios.put(Global.url+'prodent/'+prodent.id,prodent,{ headers: authHeader() })
      .then(res=>{
        if(res.data){
          swal('Se aprobo la entrega de este lote');
          this.getProductosEntregados();
          this.closeModal();
        }
      })
      .catch(err=>{
        AuthService.isExpired(err.message);
      });
    }else if(this.state.option === Global.CANCEL){
      prodent.codigoEstatus = Global.CANCEL;
      prodent.motivoCancel = this.state.motivoCancel;
      Axios.put(Global.url+'prodent/cancel/'+prodent.id,prodent,{ headers: authHeader() })
      .then(res=>{
        swal('Se cancelo la entrega de este lote');
          this.getProductosEntregados();
          this.closeModal();
      })
      .catch(err=>{
        AuthService.isExpired(err.message);
      });
    }
  }

  muestraEstatus = () =>{
    this.isModalEstatusActive = true;
    this.forceUpdate();
  }

  closeModalEstatus = () =>{
    this.isModalEstatusActive = false;
    this.forceUpdate();
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

  render() {
    var style = {};
    var cancelMsg = '';
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
                    <td><button className="btn btn-warning" onClick={this.limpiaBuequeda}>Limpiar</button></td>
                    <td style={{textAlign:'center'}}>
                      {(this.state.idSelPe === -1  || this.state.lstProdEnt[this.state.idSelPe].estatus.codigo !== Global.OPEN) &&
                      <Link to="#" >
                        <FontAwesomeIcon icon={faCheckDouble} size="2x" style={{color:'grey'}} />
                      </Link>
                      }
                      {(this.state.idSelPe !== -1 && this.state.lstProdEnt[this.state.idSelPe].estatus.codigo === Global.OPEN)  &&
                      <Link to="#" onClick={this.cambiaEstatus} >
                        <FontAwesomeIcon icon={faCheckDouble} size="2x" />
                      </Link>
                      }
                    </td>
                </tr>
                </tbody>
              </table>
            <br/>      
          </div>
          <table className="table table-dark header-font table-bordered" style={{marginTop:'-15px',width:'99%'}}>
            <colgroup>
              <col width="7%"/>
              <col width="8%"/>
              <col width="10%"/>
              <col width="32%"/>
              <col width="8%"/>
              <col width="7%"/>
              <col width="8%"/>
              <col width="6%"/>
              <col width="14%"/>
            </colgroup>
            <thead>
              <tr>
                <th className="font12">OF</th>
                <th className="font12">OC</th>
                <th className="font12">Lote</th>
                <th className="font12">Producto</th>
                <th className="font12">Cliente</th>
                <th className="font12">Piezas</th>
                <th className="font12">Remisión</th>
                <th className="font12">Estatus</th>
                <th className="font12">Entrega</th>
              </tr>
            </thead>
          </table>
        {(this.state.lstProdEnt.length > 0) &&
        <React.Fragment>
          <div className="table-ovfl-prodent tbl-lesshead ">
            <table className="table table-lst table-bordered" style={{cursor:'pointer'}}>
              <colgroup>
                <col width="7%"/>
                <col width="8%"/>
                <col width="10%"/>
                <col width="33%"/>
                <col width="8%"/>
                <col width="7%"/>
                <col width="8%"/>
                <col width="5%"/>
                <col width="14%"/>
              </colgroup>
              <tbody>
                {this.state.lstProdEnt.map((pent,i)=>{
                  if (this.state.idSelPe === i) {
                    style = "selected pointer";
                  } else{
                    style = {};
                  }
                  if(pent.estatus.codigo === Global.CANCEL){
                    cancelMsg = '\nMotivo:'+pent.motivoCancel;
                  }else{
                    cancelMsg = '';
                  }
                  return(
                    <tr key={i} onClick={()=>{this.selectRow(i)}}  onDoubleClick={()=>{this.muestraEstatus()}} className={style} title={'Estatus:'+pent.estatus.label+' '+cancelMsg}>
                      <td className="font12">{this.pad(pent.ordenFabricacion,5)}</td>
                      <td className="font12">{pent.oc}</td>
                      <td className="font12">{pent.lote}</td>
                      <td className="font12">{pent.nombreProducto}</td>
                      <td className="font12">{pent.cliente}</td>
                      <td className="font12"><NumberFormat value={pent.piezasEntregadas} thousandSeparator={true} displayType="text"/></td>
                      <td className="font12">{pent.remision}</td>
                      <td className="font12">{pent.estatus_codigo}</td>
                      <td className="font12">{momento(pent.fechaEntrega).format('DD MMM YYYY HH:mm')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {this.isModalActive && 
              <div className="modal fade show"  tabIndex="-1" role="dialog" style={{display:'block'}}>
              <div className="modal-dialog modal-dialog-centered" style={{maxWidth:'600px'}} role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">Producto Entregado</h5>
                    <button type="button" className="close" onClick={this.closeModal} data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body center-100" >
                    <div style={{border:'1px solid blue',width:'100%',marginTop:'15px'}}>
                    <table className="table" style={{width:'100%'}}>
                      <colgroup>
                        <col width="40%" />
                        <col width="60%" />
                      </colgroup>
                        <thead className="thead-dark">                      
                          <tr>
                            <th style={{textAlign:'center'}}>Acción</th>
                            <th style={{textAlign:'center'}}>Comentarios</th>
                            </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <select className="custom-select font12" onChange={this.changeOption} ref={this.optionRef}>
                                <option value={Global.APRVD}>Aprobado</option>
                                <option value={Global.CANCEL}>Cancelar</option>
                              </select>
                            </td>
                            <td>
                              {this.state.option === Global.CANCEL && 
                                <TextField id="label" label="Motivo" 
                                onChange={event =>{this.capturaMotivo(event)}}
                                 />
                              }
                            </td>
                          </tr>
                      </tbody>
                    </table>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={this.closeModal}>Cerrar</button>
                    <button type="button" className="btn btn-primary" onClick={this.procedeCambioEstaus}>Terminar Entrega</button>
                  </div>
                </div>
              </div>
            </div>
            }
            {this.isModalEstatusActive && 
              <div className="modal fade show"  tabIndex="-1" role="dialog" style={{display:'block'}}>
              <div className="modal-dialog modal-dialog-centered"  role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">Estatus del Producto Entregado</h5>
                    <button type="button" className="close" onClick={this.closeModalEstatus} data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body center" >
                    <div style={{border:'1px solid blue',width:'100%',marginTop:'15px'}}>
                    <table className="table" style={{width:'100%'}}>
                      <colgroup>
                        <col width="55%"/>
                        <col width="45%"/>
                      </colgroup>
                      <tbody>
                      <tr>
                          <td>Tipo:</td>
                          <td>{this.state.lstProdEnt[this.state.idSelPe].tipoEntrega}</td>
                        </tr>
                        <tr>
                          <td>Estatus:</td>
                          <td>{this.state.lstProdEnt[this.state.idSelPe].estatus.label}</td>
                        </tr>
                        <tr>
                          <td>Motivo:</td>
                          <td>{this.state.lstProdEnt[this.state.idSelPe].motivoCancel}</td>
                        </tr>
                      </tbody>
                    </table>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={this.closeModalEstatus}>Cerrar</button>
                  </div>
                </div>
              </div>
            </div>
            }
          </React.Fragment>
          }
        </React.Fragment>
        )    
  }
}
