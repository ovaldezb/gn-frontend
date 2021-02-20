import Axios from "axios";
import React, { Component } from "react";
import Global from "../Global";
import authHeader from "../services/auth-header";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlusSquare,
  faEdit,
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import Paginacion from './Paginacion';
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
  state = {
    lstOC: [],
    pageOfItems: [],
    page:1,
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
        ordencompra:this.state.pageOfItems[i]
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

  filtrado = () =>{
    var filter = this.filterRef.current.value;
    var nvoArray = this.state.lstOC.filter(element =>{
      return Object.values(element).filter(item=>{ return String(item).includes(filter)}).length > 0 
    });
    this.setState({
      pageOfItems:nvoArray
    });
  }

  selectRow = (i) => {
    this.setState({
      idSelOc: ((this.state.page - 1) * 10) + i,
    });
  };

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
          axios.put(Global.url+'ordencompra/'+oc.id,oc,{ headers: authHeader() })
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

  onChangePage = (pageOfItems,page) => {
    // update state with new page of items
    this.setState({ pageOfItems: pageOfItems, page:page });
  }

  render() {
    var style = {};
    if (this.state.lstOC.length > 0) {
      var lstOrdComPI = this.state.pageOfItems.map((ordcomp, i) => {
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
          <tr key={i} onClick={() => {this.selectRow(i)}}   onDoubleClick={()=>{this.changeSttus(i)}} className={style}>
            <td>{ordcomp.oc}</td>
            <td>{ordcomp.producto.nombre}</td>
            <td style={this.center}>{ordcomp.clave}</td>
            <td style={this.center}>{ordcomp.lote}</td>
            <td style={this.center}><NumberFormat value={Number(ordcomp.piezas)}displayType={'text'} thousandSeparator={true} title={'Piezas fabricadas: '+ ordcomp.piezasFabricadas +'\nPiezas Completadas:'+ordcomp.piezasCompletadas+' \nPiezas Entregadas: '+ordcomp.piezasEntregadas}/></td>
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
                    <li><input type="checkbox" ref={this.selAllRef} onChange={this.selectType} /></li>
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
                        <Link to="#" onClick={this.updateOc}>
                          <FontAwesomeIcon icon={faEdit} />
                        </Link>
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
                    </ul>
                  </nav>
                </div>
              </div>
              <table className="table table-bordered header-font">
                <colgroup>
                  <col width="7%"/>
                  <col width="30%"/>
                  <col width="8%"/>
                  <col width="6%"/>
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
                    <th scope="col">Lote</th>
                    <th scope="col">Piezas</th>
                    <th scope="col">Fabricación</th>
                    <th scope="col">Entrega</th>
                    <th scope="col">Cliente</th>
                    <th scope="col">Estatus</th>
                  </tr>
                </thead>
              </table>
              <div className="table-ovfl tbl-lesshead">
                <table className="table table-bordered table-lst" id="ordenFabricacion">
                  <colgroup>
                  <col width="7%"/>
                  <col width="30%"/>
                  <col width="8%"/>
                  <col width="6%"/>
                  <col width="8%"/>
                  <col width="12%"/>
                  <col width="12%"/>
                  <col width="10%"/>
                  <col width="7%"/>
                  </colgroup>
                  <tbody>{lstOrdComPI}</tbody>
                </table>              
              </div>
              <div className="center">
                <Paginacion items={this.state.lstOC} onChangePage={this.onChangePage} page={this.state.page} />
              </div>
            </React.Fragment>
          )}
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
                      <Link to="#" onClick={this.addOC}><FontAwesomeIcon icon={faPlusSquare} />
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
