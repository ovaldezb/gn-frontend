import React, { Component } from "react";
import Paginacion from './Paginacion';
import authHeader from "../services/auth-header";
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

export default class Materiasprimas extends Component {
  url = Global.url;
  isAdd = true;
  idMatprim = "";
  filterRef = React.createRef();
  idSelMp = 0;
  displayAdd = false;
  newItem=false;

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
      .get(this.url + "matprima", { headers: authHeader() })
      .then((res) => {
        if (res.data.length > 0) {
          this.setState({
            lstMatPrim: res.data,
          });
        }
      })
      .catch((err) => {
        console.log(err);
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
    
    /*axios.get(this.url+'matprima/'+this.state.lstMatPrim[this.state.idSelMp].id,{ headers: authHeader() })
      .then(res=>{
          this.setState({
              matprima:res.data
          });
          this.displayAdd = true;
          this.isAdd = false;
          this.forceUpdate();
      });*/
      this.setState({
        matprima:this.state.lstMatPrim[this.state.idSelMp]
      });

      this.displayAdd = true;
      this.isAdd = false;
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
              console.log(this.state.lstMatPrim);
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
    let lstTmp = this.state.lstMatPrim; 
    let matprimant = this.state.lstMatPrim[this.state.idSelMp];
    lstTmp[this.state.idSelMp] = matprima;
    this.setState({
      lstMatPrim:lstTmp
    });
    Bitacora(Global.UPDT_MATPRIM,JSON.stringify(matprimant),JSON.stringify(matprima));
    this.isAdd = true;
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
    const col1 = { width: 20 };
    const col2 = { width: 100 };
    const col3 = { width: 96, textAlign: "center" };
    const col4 = { width: 96 };
    const col5 = { width: 100 };
    const col6 = { width: 150 };
    const col7 = { width: 150 };
    const col8 = { width: 150 };
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
        
        //var fecRef = new Date(today.setMonth(today.getMonth()+4));
        var fecCad = new Date(momento(matprim.fechaCaducidad,'MM-DD-YYYY H:mm:ss'));
        var totalDaysBetwn = (fecCad.getTime() - today.getTime())/(1000*60*60*24);
        //today = new Date();
        if(totalDaysBetwn > 30){
          styleFecCad = 'suficiente';
        }else if(totalDaysBetwn > 15 && totalDaysBetwn <= 30){
          styleFecCad = 'necesario';
        }else if(totalDaysBetwn <= 15){
          styleFecCad = 'escaso';
        } 

        return (
          <tr key={i} onDoubleClick={() => this.dblClick(i)} onClick={() => {this.selectRow(i); }} className={style} >
            <td style={col1}>{((this.state.page-1)*10) + i+1}</td>
            <td style={col2}>{matprim.descripcion}</td>
            <td className={styleCell} style={col3}>{matprim.cantidad}</td>
            <td style={col4}>{matprim.unidad.unidadMedida}</td>
            <td style={col5}>{matprim.codigo}</td>
            <td style={col6}>{matprim.proveedor}</td>
            <td style={col7}>{momento(matprim.fechaEntrada,'MM-DD-YYYY').format('DD MMMM YYYY')}</td>
            <td className={styleFecCad} style={col7}><Moment fromNow>{fc}</Moment></td>
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

              <table className="table table-bordered">
                <thead className="thead-light">
                  <tr>
                    <th scope="col" style={col1}>
                      #
                    </th>
                    <th scope="col" style={col2}>
                      Descripción
                    </th>
                    <th scope="col" style={col3}>
                      Cantidad
                    </th>
                    <th scope="col" style={col4}>
                      Unidad
                    </th>
                    <th scope="col" style={col5}>
                      Código
                    </th>
                    <th scope="col" style={col6}>
                      Proveedor
                    </th>
                    <th scope="col" style={col7}>
                      Fecha Entrada{" "}
                    </th>
                    <th scope="col" style={col8}>
                      Días para Cauducar
                    </th>
                  </tr>
                </thead>
              </table>
              <div className="table-ovfl tbl-lesshead">
                <table className="table" id="materiaprima">
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
