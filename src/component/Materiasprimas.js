import React, { Component } from "react";
import Paginacion from './Paginacion';
import authHeader from "../services/auth-header";
import authServices from '../services/auth.service';
import axios from "axios";
import Global from "../Global";
import "moment/locale/es-mx";
import momento from 'moment';
import { Redirect, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faPlusSquare, faEdit,  faTrash,} from "@fortawesome/free-solid-svg-icons";
import Addmatprima from "./Addmatprima";
import swal from "sweetalert";
import Bitacora from '../services/bitacora-service';
import Moment from 'react-moment';
import NumberFormat from 'react-number-format';

export default class Materiasprimas extends Component {
  url = Global.url;
  isAdd = true;
  idMatprim = "";
  filterRef = React.createRef();
  //idSelMp = 0;
  displayAdd = false;
  newItem=false;
  center = {textAlign:"center"}
  right = {textAlign:"right"}
  left = {textAlign:"left"}
  col1 = { width: 20 };
  col2 = { width: 140 };
  col3 = { width: 70, textAlign: "center" };
  col4 = { width: 96 };
  col5 = { width: 100 };
  col6 = { width: 150 };
  col7 = { width: 150 };
  col8 = { width: 100 };
  state = {
    lstMatPrim: [],
    pageOfItems: [],
    page:1,
    filtro: "",
    status: "",
    idSelMp: -1,
    matprima:{}
  };

  

  componentDidMount() {
    this.loadMatPrim();
  }

  loadMatPrim() {
    axios
      .get(this.url + "matprima", { headers: authHeader() },{ responseType: 'application/json' })
      .then((res) => {
        if (res.data.length > 0) {
          this.setState({
            lstMatPrim: res.data,
          });
        }
      })
      .catch((err) => {
        if(err.message.includes("401")){
          this.setState({
            status:'logout'
          });
          authServices.logout();
          swal("La sesión ha caducado","Por favor vuélvase a conectar","warning");
        }else{
          swal("Ha ocurrido un error, contacte al Administrador",err.message,"error");
        }
      });
  }

  dblClick = (i) => {
    this.idMatprim = this.state.lstMatPrim[i].id;
    this.setState({
      status: "go",
    });
  };

  selectRow = (i) => {
    this.setState({
      idSelMp: i,
    });
  };

  filter = () => {
    var filter = this.filterRef.current.value;
    var td, found, i, j;
    var tabla = document.getElementById("materiaprima");
    for (i = 0; i < tabla.rows.length; i++) {
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

  addMp = () => {
    this.displayAdd = true;
    this.setState((prevState,props)=>{
      return({matprima:{escaso:'',necesario:''}});
    });
    this.forceUpdate();
  };

  updateMp = () =>{
    let i = ((this.state.page-1)*10)+ this.state.idSelMp
      this.setState({
        matprima:this.state.lstMatPrim[i]
      });
      this.displayAdd = true;
      this.isAdd = false;
      this.setState({
        idSelMp: -1
      });
  }

  deleteMp = () =>{
    swal({
      title: "Estas seguro?",
      text: "Una vez eliminado, no se podrá recuperar la Materia Prima",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        axios.delete(this.url+'matprima/'+this.state.lstMatPrim[this.state.idSelMp].id,{ headers: authHeader() })
            .then(res=>{
              var mp = this.state.lstMatPrim[this.state.idSelMp];
              Bitacora(Global.DEL_MATPRIM,JSON.stringify(mp),'');
              swal("La materia prima ha sido eliminada!", {
                icon: "success",
              });
              this.loadMatPrim();
              
              this.forceUpdate();
            }).catch(
              err =>{
                console.log('Error '+err.message);
              }
            );
      } 
    });
  }

  updateLstMp(matprima){
    let matprimant = this.state.lstMatPrim[((this.state.page-1)*10)+ this.state.idSelMp];
    Bitacora(Global.UPDT_MATPRIM,JSON.stringify(matprimant),JSON.stringify(matprima));
    this.isAdd = true;
    this.loadMatPrim();
  }

  cancelarAdd = (matprima) => {
    this.displayAdd = false;
    if(matprima){
      if(this.isAdd){
        let lstTmp = this.state.lstMatPrim;
        lstTmp.push(matprima);
        this.setState({
          lstMatPrim:lstTmp
        });
      }else{
        this.updateLstMp(matprima);
      }
    }
    this.forceUpdate();
  }

  onChangePage = (pageOfItems,page) => {
    // update state with new page of items
    this.setState({ pageOfItems: pageOfItems, page:page });
  }

  render() {
    if (this.state.status === "go") {
      return <Redirect to={"/materiaprima/" + this.idMatprim} />;
    }
    
    var style = {};
    var styleCell = {};
    var styleFecCad = {};
    var today = new Date();
    if (this.state.lstMatPrim.length > 0) {
      var lstMp = this.state.pageOfItems.map((matprim, i) => {
        if (this.state.idSelMp === i) {
          style = "selected pointer";
        } else{
          style = {};
        }
        if (matprim.cantidad > 0 && matprim.cantidad <= matprim.escaso) {
          styleCell = "escaso";
        } else if (matprim.cantidad > matprim.escaso && matprim.cantidad <= matprim.necesario ) {
          styleCell = "necesario";
        } else {
          styleCell = "suficiente";
        }
        var fc = momento(matprim.fechaCaducidad,'MM-DD-YYYY').format('YYYY-MM-DDTHH:mm:ss');
        
        var fecCad = new Date(momento(matprim.fechaCaducidad,'MM-DD-YYYY H:mm:ss'));
        var totalDaysBetwn = (fecCad.getTime() - today.getTime())/(1000*60*60*24);
        
        if(totalDaysBetwn > 30){
          styleFecCad = 'suficiente';
        }else if(totalDaysBetwn > 15 && totalDaysBetwn <= 30){
          styleFecCad = 'necesario';
        }else if(totalDaysBetwn <= 15){
          styleFecCad = 'escaso';
        } 

        return (
          <tr key={i} onDoubleClick={() => this.dblClick(i)} onClick={() => {this.selectRow(i); }} className={style} >
            <td style={this.col1}>{((this.state.page-1)*10) + i+1}</td>
            <td style={this.left}>{matprim.descripcion}</td>
            <td className={styleCell} style={this.col3}><NumberFormat value={Number(matprim.cantidad).toFixed(2)} displayType={'text'} thousandSeparator={true} /></td>
            <td style={this.col4}>{matprim.unidad.unidadMedida}</td>
            <td style={this.col5}>{matprim.codigo}</td>
            <td style={this.col6}>{matprim.proveedor}</td>
            <td style={this.col7}>{momento(matprim.fechaEntrada,'MM-DD-YYYY').format('DD MMMM YYYY')}</td>
            <td className={styleFecCad} style={this.col7}><Moment fromNow>{fc}</Moment></td>
          </tr>
        );
      });
      return (
        <React.Fragment>
          {this.displayAdd && 
            <Addmatprima cancelar={this.cancelarAdd} matprima={this.state.matprima} tipo={this.isAdd}/>
          }
          {!this.displayAdd && (
            <React.Fragment>
              <div className="barnav">
                <div className="container flex-gn">
                  <ul>
                    <li>Filtro:</li>
                    <li>
                      <input className="input" type="text" name="filtro" ref={this.filterRef} onKeyUp={this.filter}/>
                    </li>
                  </ul>
                  <nav>
                    <ul>
                      <li>
                        <Link to="#" onClick={this.addMp}>
                          <FontAwesomeIcon icon={faPlusSquare} />
                        </Link>
                      </li>
                      <li>
                        <Link to="#" onClick={this.updateMp}>
                          <FontAwesomeIcon icon={faEdit} />
                        </Link>
                      </li>
                      <li>
                        <Link to="#" onClick={this.deleteMp} >
                          <FontAwesomeIcon icon={faTrash} />
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>

              <table className="table table-bordered header-font">
                <col width="5%"/>
                <col width="23%"/>
                <col width="8%"/>
                <col width="9%"/>
                <col width="12%"/>
                <col width="17%"/>
                <col width="15%"/>
                <col width="11%"/>
                <thead className="thead-light">
                  <tr>
                    <th>#</th>
                    <th style={this.center}>Descripción</th>
                    <th style={this.center}>Cantidad</th>
                    <th style={this.center}>Unidad</th>
                    <th style={this.center}>Código</th>
                    <th style={this.center}>Proveedor</th>
                    <th style={this.center}>Fecha Entrada</th>
                    <th style={this.center}>Caducidad</th>
                  </tr>
                </thead>
              </table>
              <div className="table-ovfl tbl-lesshead">
                <table className="table table-bordered header-font" id="materiaprima">
                  <col width="5%"/>
                  <col width="24%"/>
                  <col width="8%"/>
                  <col width="10%"/>
                  <col width="8%"/>
                  <col width="18%"/>
                  <col width="16%"/>
                  <col width="11%"/>
                  <tbody>{lstMp}</tbody>
                </table>              
              </div>
              <div className="center">
              <Paginacion items={this.state.lstMatPrim} onChangePage={this.onChangePage} />
              </div>
            </React.Fragment>
          )}
        </React.Fragment>
      );
    } else if(this.displayAdd){
      return <Addmatprima cancelar={this.cancelarAdd} matprima={this.state.matprima} tipo={this.isAdd}/>
    }else {
      return (
        <div className="container">
          <div className="barnav">
                <div className="container flex-gn">
                  <div>
                  </div>
                  <nav>
                    <ul>
                      <li>
                        <Link to="#" onClick={this.addMp}><FontAwesomeIcon icon={faPlusSquare} />
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
          <h1 className="center">No hay materias primas por mostrar</h1>
        </div>
      );
    }
  }
}
