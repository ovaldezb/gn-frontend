import Axios from "axios";
import React, { Component } from "react";
import Global from "../Global";
import authHeader from "../services/auth-header";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlusSquare,
  faEdit,
  faTrash,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons";
//import Paginacion from './Paginacion';
import Moment from 'react-moment';
import momento from 'moment';
import NumberFormat from 'react-number-format';
import swal from "sweetalert";
import Addordencompra from "./Addordencompra";
import axios from 'axios';
import AuthService from '../services/auth.service';

export default class Ordenescompra extends Component {
  filterRef = React.createRef();
  selAllRef = React.createRef();
  center = {textAlign:"center"}
  displayAdd = false;
  isComplete = false;
  isAdd = true;
  isModalActive = false;
  state = {
    lstOC: [],
    filtro: "",
    status: "",
    idSelOc: -1,
    ordencompra:{}
  };

  componentDidMount() {
      this.loadOC(false);
  }

  loadOC(args) {
    Axios.get(Global.url + "ordencompra"+(args?'/all':''), { headers: authHeader() })
      .then((res) => {
        if (res.data.length > 0) {
          this.setState({
            lstOC: res.data,
            idSelOc:-1
          });
        }else{
          this.setState({
            lstOC:[],
          });
        }
      })
      .catch(err=>{
        AuthService.isExpired(err.message);
      });
  }

  addOC = () => {
      this.displayAdd = true;
      this.forceUpdate();
  }

  updateOc = () =>{
    if(this.state.idSelOc === -1){
      swal('Debe seleccionar una OC');
      return;
    }
    let i =  this.state.idSelOc
      this.setState({
        ordencompra:this.state.lstOC[i]
      });
      this.displayAdd = true;
      this.isAdd = false;
      this.setState({
        idSelOc: -1
      });
  }

  cancelarAdd = () =>{
    this.displayAdd = false;
    this.isAdd = true;
    this.loadOC(false);
    this.forceUpdate();
  }

  selectType = () =>{
    this.loadOC(this.selAllRef.current.checked);
  }

  showData = (index)=>{
    this.isModalActive = true;
    this.forceUpdate();
  }

  deleteOc = () =>{
    swal({
      title: "Estas seguro?",
      text: "Una vez eliminado, no se podrá recuperar la Orden de Compra "+this.state.lstOC[this.state.idSelOc].oc,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        axios.delete(Global.url+'ordencompra/'+this.state.lstOC[this.state.idSelOc].id,{ headers: authHeader() })
            .then(res=>{
              //var oc = this.state.lstOC[this.state.idSelOc];
              //Bitacora(Global.DEL_MATPRIM,JSON.stringify(mp),'');
              swal("La orden de compra ha sido eliminada!", {
                icon: "success",
              });

              this.loadOC(false);
            }).catch(
              err =>{
                AuthService.isExpired(err.message);
              }
            );
      } 
    });
  }

  filtrado=()=>{
    var filter = this.filterRef.current.value;
    var td, found, i, j;
    var tabla = document.getElementById('ordenCompra');
    for (i = 0; i <tabla.rows.length; i++){
        td = tabla.rows[i].cells;
        for (j = 0; j < td.length; j++) {
            if (td[j].innerHTML.toUpperCase().indexOf(filter.toUpperCase()) > -1) {
                found = true;
            }
        }
        if (found) {
            tabla.rows[i].style.display = "";
            found = false;
        } else {
            tabla.rows[i].style.display = "none";
        }
    }
  }

  selectRow = (i) => {
    this.setState({
      idSelOc: i
    });
  };



  cancelOC = () =>{
    swal({
      title: "Desea cancelar la orden de compra ["+this.state.lstOC[this.state.idSelOc].oc+"] ?",
      text: "Una vez cancelada, no se podrán generar mas Lotes de Producto, los que ya fueron generados no se veran afectados",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((approved) => {
      if(approved){
        let ordcom = this.state.lstOC[this.state.idSelOc];
        ordcom.estatus = Global.CANCEL;
        axios.put(Global.url+'ordencompra/'+ordcom.id,ordcom,{ headers: authHeader() })
        .then(res =>{
          swal('La Orden de Compra ha sido cancelada');
          this.loadOC(false);
        })
        .catch(err=>{
          AuthService.isExpired(err.message);
        });
      }
    })
  }

  closeModal = () =>{
    this.isModalActive = false;
    this.forceUpdate();
  }

  render() {
    var style = {};
    if (this.state.lstOC.length > 0) {
      var lstOrdComPI = this.state.lstOC.map((ordcomp, i) => {
        if (this.state.idSelOc === i) {
          style = "selected pointer";
          if(ordcomp.estatus===Global.TEP){
            this.isComplete = true;
          }else{
            this.isComplete = false;
          }
        } else{
          style = {};
        }
        
        return (
          <tr key={i} onClick={() => {this.selectRow(i)}}  onDoubleClick={() => {this.showData(i)}} className={style}>
            <td>{ordcomp.oc}</td>
            <td title={'Observaciones:'+ordcomp.observaciones}>{ordcomp.producto.nombre}</td>
            <td style={this.center}>{ordcomp.clave}</td>
            <td style={this.center}><NumberFormat value={Number(ordcomp.piezas)} displayType={'text'} thousandSeparator={true} title={'Piezas fabricadas: '+ ordcomp.piezasFabricadas +'\nPiezas Completadas:'+ordcomp.piezasCompletadas+' \nPiezas Entregadas: '+ordcomp.piezasEntregadas}/></td>
            <td><Moment format="DD MMM YYYY">{momento(ordcomp.fechaFabricacion,'MM-DD-YYYY').format('YYYY-MM-DDTHH:mm:ss')}</Moment></td>
            <td><Moment format="DD MMM YYYY">{momento(ordcomp.fechaEntrega,'MM-DD-YYYY').format('YYYY-MM-DDTHH:mm:ss')}</Moment></td>
            <td>{ordcomp.cliente.nombre}</td>
            <td>{ordcomp.estatus}</td>
          </tr>
        );
      });
      
      return (
        <React.Fragment>
          {this.displayAdd && 
            <Addordencompra cancelar={this.cancelarAdd} ordencompra={this.state.ordencompra} tipo={this.isAdd}/>
          }
          {!this.displayAdd && (
            <React.Fragment>
              <div className="barnav">
                <div className="container flex-gn">
                  <ul>
                    <li>Filtro:</li>
                    <li><input className="input"  type="text"  name="filtro" ref={this.filterRef} onKeyUp={this.filtrado}/></li>
                    <li>Historial:<input type="checkbox" ref={this.selAllRef} onChange={this.selectType} /></li>
                  </ul>
                  <h2>Orden de Compra</h2>
                  <nav>
                    <ul>
                      <li>
                        <Link to="#" onClick={this.addOC}>
                          <FontAwesomeIcon icon={faPlusSquare} />
                        </Link>
                      </li>
                      <li>
                        {(this.state.idSelOc === -1 || this.state.lstOC[this.state.idSelOc].estatus !== Global.OPEN) &&
                          <Link to="#">
                          <FontAwesomeIcon icon={faEdit} style={{color:'grey'}}/>
                          </Link>
                        }
                        {(this.state.idSelOc !== -1 && this.state.lstOC[this.state.idSelOc].estatus === Global.OPEN) &&
                        <Link to="#" onClick={this.updateOc} >
                          <FontAwesomeIcon icon={faEdit} />
                        </Link>
                        }
                      </li>
                      <li>
                        {(this.state.idSelOc === -1 || this.state.lstOC[this.state.idSelOc].estatus !== Global.OPEN) &&
                          <Link to="#">
                            <FontAwesomeIcon icon={faTrash} style={{color:'grey'}}/>
                          </Link>
                        }
                        {(this.state.idSelOc !== -1 && this.state.lstOC[this.state.idSelOc].estatus === Global.OPEN) &&
                        <Link to="#" onClick={this.deleteOc} >
                          <FontAwesomeIcon icon={faTrash} />
                        </Link>
                        }                        
                      </li>
                      <li>
                      {(this.state.idSelOc === -1 || this.state.lstOC[this.state.idSelOc].estatus !== Global.TEP) &&
                        <Link to="#" title="Cancelar OC" >
                          <FontAwesomeIcon icon={faTimesCircle} style={{color:'grey'}} />
                        </Link>
                      }
                      {(this.state.idSelOc !== -1 && this.state.lstOC[this.state.idSelOc].estatus === Global.TEP) &&
                        <Link to="#" onClick={this.cancelOC} title="Cancelar OC">
                          <FontAwesomeIcon icon={faTimesCircle} />
                        </Link>
                      }
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
              <table className="table table-bordered header-font">
                <colgroup>
                  <col width="7%"/>
                  <col width="36%"/>
                  <col width="8%"/>
                  <col width="8%"/>
                  <col width="12%"/>
                  <col width="12%"/>
                  <col width="10%"/>
                  <col width="7%"/>
                </colgroup>
                <thead className="thead-dark">                   
                  <tr>
                    <th scope="col">OC</th>
                    <th scope="col">Producto</th>
                    <th scope="col">Clave</th>
                    <th scope="col">Piezas</th>
                    <th scope="col">Fabricación</th>
                    <th scope="col">Entrega</th>
                    <th scope="col">Cliente</th>
                    <th scope="col">Estatus</th>
                  </tr>
                </thead>
              </table>
              <div className="table-ovfl-mp tbl-lesshead">
                <table className="table table-bordered table-lst table-hover" style={{cursor:'pointer'}} id="ordenCompra">
                  <colgroup>
                  <col width="7%"/>
                  <col width="36%"/>
                  <col width="8%"/>
                  <col width="8%"/>
                  <col width="12%"/>
                  <col width="12%"/>
                  <col width="10%"/>
                  <col width="7%"/>
                  </colgroup>
                  <tbody>{lstOrdComPI}</tbody>
                </table>              
              </div>
            </React.Fragment>
          )}
          {this.isModalActive && 
              <div className="modal fade show"  tabIndex="-1" role="dialog" style={{display:'block'}}>
              <div className="modal-dialog modal-dialog-centered"  role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">Detalle de la Orden de Compra {this.state.lstOC[this.state.idSelOc].oc}</h5>
                    <button type="button" className="close" onClick={this.closeModal} data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body center" >
                    <div style={{border:'1px solid blue',width:'100%',marginTop:'15px'}}>
                    <table className="table-bordered" style={{width:'100%'}}>
                      <colgroup>
                        <col width="55%"/>
                        <col width="45%"/>
                      </colgroup>
                      <tbody>
                        <tr>
                          <td style={{textAlign:'right'}} className="producto">Piezas Faltantes de Lote:</td>
                          <td className="producto"><NumberFormat value={this.state.lstOC[this.state.idSelOc].piezas - this.state.lstOC[this.state.idSelOc].piezasLote} thousandSeparator={true} displayType={'text'} /></td>
                        </tr>
                        <tr>
                          <td style={{textAlign:'right'}} className="producto">Piezas Faltantes de Fabricar:</td>
                          <td className="producto"><NumberFormat value={this.state.lstOC[this.state.idSelOc].piezas - this.state.lstOC[this.state.idSelOc].piezasFabricadas} thousandSeparator={true} displayType={'text'} /> </td>
                        </tr>
                        <tr>
                          <td style={{textAlign:'right'}} className="producto">Piezas Faltantes de Terminar:</td>
                          <td className="producto"><NumberFormat value={this.state.lstOC[this.state.idSelOc].piezas - this.state.lstOC[this.state.idSelOc].piezasCompletadas}thousandSeparator={true} displayType={'text'} /></td>
                        </tr>
                        <tr>
                          <td style={{textAlign:'right'}} className="producto">Piezas Faltantes de Entregar:</td>
                          <td className="producto"><NumberFormat value={this.state.lstOC[this.state.idSelOc].piezas - this.state.lstOC[this.state.idSelOc].piezasEntregadas} thousandSeparator={true} displayType={'text'} /> </td>
                        </tr>
                        <tr>
                          <td style={{textAlign:'right'}} className="producto">Comentarios:</td>
                          <td className="producto">{this.state.lstOC[this.state.idSelOc].observaciones}</td>
                        </tr>
                      </tbody>
                    </table>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={this.closeModal}>Cerrar</button>
                  </div>
                </div>
              </div>
            </div>
            }
        </React.Fragment>
      );
    } else if(this.displayAdd){
        return  <Addordencompra cancelar={this.cancelarAdd} ordencompra={this.state.ordencompra} tipo={this.isAdd} />
      }else {
      return (
          <React.Fragment>
            <div className="barnav">
              <div className="container flex-gn">
                <ul>
                  <li>Filtro:</li>
                  <li><input className="input"  type="text"  name="filtro" ref={this.filterRef} onKeyUp={this.filtrado}/></li>
                  <li><input type="checkbox" ref={this.selAllRef} onChange={this.selectType} /></li>
                </ul>
                <h2>Orden de Compra</h2>
                <nav>
                  <ul>
                    <li>
                      <Link to="#" onClick={this.addOC}><FontAwesomeIcon icon={faPlusSquare} title="Agregar una orden de compra" />
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
          </div>
          <h1 className="center">No hay órdenes de compra para mostrar</h1>
          </React.Fragment>
      );
    }
  }
}
