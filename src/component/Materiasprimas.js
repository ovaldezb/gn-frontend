import React, { Component } from "react";
import authHeader from "../services/auth-header";
import axios from "axios";
import Global from "../Global";
import "moment/locale/es-mx";
import momento from 'moment';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faPlusSquare, faEdit,  faTrash,faCheckDouble} from "@fortawesome/free-solid-svg-icons";
import Addmatprima from "./Addmatprima";
import swal from "sweetalert";
import Bitacora from '../services/bitacora-service';
import Moment from 'react-moment';
import NumberFormat from 'react-number-format';
import AuthService from '../services/auth.service';
import Axios from "axios";

export default class Materiasprimas extends Component {
  url = Global.url;
  isAdd = true;
  idMatprim = "";
  filterRef = React.createRef();
  iniRef = React.createRef();
  isFiltro = false;
  displayAdd = false;
  newItem=false;
  center = {textAlign:"center",fontSize:'14px'}
  right = {textAlign:"right"}
  left = {textAlign:"left",fontSize:'12px'}
  sortDir = true;
  isModalActive = false;
  state = {
    lstMatPrim: [],
    filtro: "",
    status: "",
    idSelMp: -1,
    matprima:{}
  };

  componentDidMount() {
    this.loadMatPrim();
  }

  loadMatPrim=()=> {
    axios
      .get(this.url + "matprima", { headers: authHeader() },{ responseType: 'application/json' })
      .then((res) => {
        this.setState({
          lstMatPrim: res.data.map((mp,i)=>{
            mp.nombreproveedor = mp.proveedor.nombre;
            return mp;
          }),
        });
        
        document.getElementById('checkini').checked = false;
        document.getElementById('checkmid').checked = false;
        document.getElementById('checkfin').checked = false;
        this.isFiltro = false;
      })
      .catch((err) => {
        AuthService.isExpired(err.message);
      });
  }

  selectRow = (i) => {
    this.setState({
      idSelMp: i,
    });
  };

 

  addMp = () => {
    this.displayAdd = true;
    this.setState((prevState,props)=>{
      return(
        {matprima:{escaso:'',necesario:''}}
        );
    });
    this.forceUpdate();
  };

  updateMp = () =>{
    this.displayAdd = true;
    this.isAdd = false;
    let i = this.state.idSelMp
    this.setState({
      matprima:this.state.lstMatPrim[i],
      idSelMp: -1
    });  
  }

  deleteMp = () =>{
    swal({
      title: "Estas seguro que desea eliminar la MP["+this.state.lstMatPrim[this.state.idSelMp].descripcion+"]?",
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
        }).catch(
          err =>{
            AuthService.isExpired(err.message);
          }
        );
      } 
    });
  }

  cancelarAdd = () => {
    this.displayAdd = false;
    this.isAdd = true;
    this.loadMatPrim();
  }

  sortCaducidad = ()=>{
    let poi = this.state.lstMatPrim;
    this.sortDir = !this.sortDir;
     poi.sort((o1,o2)=>{
      let dateO1 =  new Date(momento(o1.fechaCaducidad,'MM-DD-YYYY H:mm:ss')) 
      let dateO2 =  new Date(momento(o2.fechaCaducidad,'MM-DD-YYYY H:mm:ss'))
      if(this.sortDir)
        return dateO1.getTime() > dateO2.getTime() ? 1 : -1;
      else
        return dateO1.getTime() < dateO2.getTime() ? 1 : -1;
    })    
  }

  buscaIni =()=>{
    this.isFiltro = true;
    let f1 = new Date();
    f1.setDate(f1.getDate() + Global.MIN_DAYS);
    Axios
    .get(Global.url+'matprima/ini/'+momento(f1).format('MM-DD-YYYY H:mm:ss'),{ headers: authHeader() })
    .then(res=>{
      this.setState({
        lstMatPrim: res.data.map((mp,i)=>{
          mp.nombreproveedor = mp.proveedor.nombre;
          return mp;
        })
      });
    })
    .catch(err=>{
      AuthService.isExpired(err.message);
    });
  }

  buscaBtwn =()=>{
    this.isFiltro = true;
    let f1 = new Date();
    let f2 = new Date();
    f1.setDate(f1.getDate() + Global.MIN_DAYS);
    f2.setDate(f2.getDate() + Global.MAX_DAYS);
    Axios
    .get(Global.url+'matprima/btw/'+momento(f1).format('MM-DD-YYYY H:mm:ss')+'/'+momento(f2).format('MM-DD-YYYY H:mm:ss'),{ headers: authHeader() })
    .then(res=>{
      this.setState({
        lstMatPrim: res.data.map((mp,i)=>{
          mp.nombreproveedor = mp.proveedor.nombre;
          return mp;
        })
      });
    })
    .catch(err=>{
      AuthService.isExpired(err.message);
    });
  }

  aproveMP = () =>{
    if(!this.state.lstMatPrim[this.state.idSelMp].aprobado){
      swal({
        title: "Desea aprobar la materia prima ["+this.state.lstMatPrim[this.state.idSelMp].descripcion+"] del lote["+this.state.lstMatPrim[this.state.idSelMp].lote+"] para su uso?",
        text: "Una vez aprobada, se podrá utilizar para generar los Lotes de Producto",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((approved) => {
        if(approved){
          let matprima = this.state.lstMatPrim[this.state.idSelMp];
          matprima.aprobado = true;
          matprima.fechaAprobacion = momento(new Date()).format('YYYY-MM-DD HH:mm:ss.sss') ;
          Axios.put(Global.url+'matprima/'+this.state.lstMatPrim[this.state.idSelMp].id,matprima,{ headers: authHeader() })
          .then(res=>{
            swal('La materia prima ['+matprima.descripcion+'] ha sido aprobada');
            this.loadMatPrim();
          })
          .catch(err=>{
            AuthService.isExpired(err.message);
          });
        }
      })
    }
  }

  closeModal = () =>{
    this.isModalActive = false;
    this.forceUpdate();
  }

  detalleMP = () =>{
    this.isModalActive = true;
    this.forceUpdate();
  }

  buscaFin = ()=>{
    this.isFiltro = true;
    let f1 = new Date();
    f1.setDate(f1.getDate() + Global.MAX_DAYS);
    Axios
    .get(Global.url+'matprima/fin/'+momento(f1).format('MM-DD-YYYY H:mm:ss'),{ headers: authHeader() })
    .then(res=>{
      this.setState({
        lstMatPrim: res.data.map((mp,i)=>{
          mp.nombreproveedor = mp.proveedor.nombre;
          return mp;
        })
      });
    })
    .catch(err=>{
      AuthService.isExpired(err.message);
    });
  }

  filtrado=()=>{
    var filter = this.filterRef.current.value;
    var td, found, i, j;
    var tabla = document.getElementById('materiaprima');
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

  render() {
    var style = {};
    var styleDisp={};
    var styleCell = {};
    var styleFecCad = {};
    var today = new Date();
    if ((this.state.lstMatPrim.length > 0 || this.isFiltro)) {
      var lstMp = this.state.lstMatPrim.map((matprim, i) => {
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

        if ((matprim.cantidad - matprim.apartado) > 0 && (matprim.cantidad - matprim.apartado) <= matprim.escaso) {
          styleDisp = "escaso";
        } else if ((matprim.cantidad - matprim.apartado) > matprim.escaso && (matprim.cantidad - matprim.apartado) <= matprim.necesario ) {
          styleDisp = "necesario";
        } else {
          styleDisp = "suficiente";
        }

        var fc = momento(matprim.fechaCaducidad,'MM-DD-YYYY').format('YYYY-MM-DDTHH:mm:ss');
        var fecCad = new Date(momento(matprim.fechaCaducidad,'MM-DD-YYYY H:mm:ss'));
        var totalDaysBetwn = (fecCad.getTime() - today.getTime())/(1000*60*60*24);
        
        if(totalDaysBetwn <= Global.MIN_DAYS){
          styleFecCad = 'escaso';
        }else if(totalDaysBetwn <= Global.MAX_DAYS){
          styleFecCad = 'necesario';
        }else{
          styleFecCad = 'suficiente';
        }
        
        return (
          <tr key={i} onClick={() => {this.selectRow(i); }}  onDoubleClick={()=>{this.detalleMP()}} className={style} >
            {matprim.aprobado &&
            <td style={this.left} title={matprim.aprobado?'Aprobado':'Pendiente de aprobación'}><b>{matprim.descripcion}</b></td>
            }
            {!matprim.aprobado &&
            <td style={this.left} title={matprim.aprobado?'Aprobado':'Pendiente de aprobación'}><i>{matprim.descripcion}</i></td>
            }
            <td className={styleCell} style={{fontSize:'12px'}}><NumberFormat value={Number(matprim.cantidad).toFixed(2)} displayType={'text'} thousandSeparator={true} /> Kg</td>
            <td className={styleDisp} style={{fontSize:'12px'}}><NumberFormat value={Number(matprim.cantidad - matprim.apartado ).toFixed(2)} displayType={'text'} thousandSeparator={true} /> Kg</td>
            <td className="font12">{matprim.codigo}</td>
            <td style={{fontSize:'12px'}}>{matprim.lote}</td>
            <td style={{fontSize:'12px'}}>{matprim.nombreproveedor}</td>
            <td style={{fontSize:'12px'}}>{momento(matprim.fechaEntrada,'MM-DD-YYYY').format('DD MMM YYYY')}</td>
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
                  <table>
                    <tbody>
                    <tr>
                      <td>Filtro:</td>
                      <td colSpan="3">
                        <input className="input" type="text" name="filtro" ref={this.filterRef} onKeyUp={this.filtrado}/>
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>
                        Caducidad:
                      </td>
                      <td style={{textAlign:'center',background:'#f50707'}}>
                        <input type="radio" name="filtro" id="checkini" className="checkbox" onClick={this.buscaIni} />
                      </td>
                      <td style={{textAlign:'center',background:'rgb(243, 247, 26)'}}>
                        <input className="input" name="filtro" id="checkmid" type="radio" onClick={this.buscaBtwn}/>
                      </td>
                      <td style={{textAlign:'center',background:'rgb(27, 247, 7)'}}>
                      <input className="input" type="radio" id="checkfin" name="filtro" onClick={this.buscaFin} />
                      </td>
                      <td style={{textAlign:'center'}}>
                        <button className="btn-secondary btn-sm" onClick={this.loadMatPrim}>Limpiar</button>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                  <h2>Materia Prima</h2>
                  <nav>
                    <ul>
                      <li>
                        <Link to="#" onClick={this.addMp}>
                          <FontAwesomeIcon icon={faPlusSquare} title="Agregar Materia Prima"/>
                        </Link>
                      </li>
                      <li>
                        {this.state.idSelMp === -1 &&
                        <Link to="#" >
                          <FontAwesomeIcon icon={faEdit} title="Actualizar Materia Prima" style={{color:'grey'}} />
                        </Link>
                        }
                        {this.state.idSelMp !== -1 &&
                        <Link to="#" onClick={this.updateMp}>
                          <FontAwesomeIcon icon={faEdit} title="Actualizar Materia Prima" />
                        </Link>
                        }
                      </li>
                      <li>
                        {(this.state.idSelMp === -1 || this.state.lstMatPrim[this.state.idSelMp].aprobado) && 
                        <Link to="#" >
                          <FontAwesomeIcon icon={faTrash} title="Eliminar Materia Prima" style={{color:'grey'}}/>
                        </Link>
                        }
                        {(this.state.idSelMp !== -1 && !this.state.lstMatPrim[this.state.idSelMp].aprobado) && 
                        <Link to="#" onClick={this.deleteMp} >
                          <FontAwesomeIcon icon={faTrash} title="Eliminar Materia Prima"/>
                        </Link>
                        }
                      </li>
                      <li>
                        {(this.state.idSelMp === -1 || this.state.lstMatPrim[this.state.idSelMp].aprobado) &&
                        <Link to="#" >
                        <FontAwesomeIcon icon={faCheckDouble} style={{color:'grey'}}/>
                        </Link>
                        }
                        {(this.state.idSelMp !== -1 && !this.state.lstMatPrim[this.state.idSelMp].aprobado) &&
                        <Link to="#" onClick={this.aproveMP} >
                        <FontAwesomeIcon icon={faCheckDouble} title="Aprobar Materia Prima"/>
                        </Link>
                        }
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
              {this.isModalActive && 
              <div className="modal fade show"  tabIndex="-1" role="dialog" style={{display:'block'}}>
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth:'600px'}} role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="exampleModalLabel">Detalle de la Materia Prima {this.state.lstMatPrim[this.state.idSelMp].descripcion}</h5>
                      <button type="button" className="close" onClick={this.closeModal} data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div className="modal-body center-100" >
                      <div style={{border:'1px solid blue',width:'104%',marginTop:'15px'}}>
                      <table className="table" style={{width:'100%'}}>
                        <tbody>
                        <tr>
                            <td>Fecha Creación:</td>
                            <td>{momento(this.state.lstMatPrim[this.state.idSelMp].fechaCreacion,'YYYY-MM-DD hh:mm:ss').format('DD-MMM-YYYY hh:mm a')}</td>
                          </tr>
                          <tr>
                            <td>Estatus:</td>
                            <td>{this.state.lstMatPrim[this.state.idSelMp].aprobado ? 'Aprobado':'Pendiente de Aprobación'}</td>
                          </tr>
                          <tr>
                            <td>Lote:</td>
                            <td>{this.state.lstMatPrim[this.state.idSelMp].lote}</td>
                          </tr>
                          <tr>
                            <td>Observaciones:</td>
                            <td>{this.state.lstMatPrim[this.state.idSelMp].observaciones}</td>
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
              <table className="table table-bordered header-font" >
                <colgroup>
                  <col width="21%"/>
                  <col width="9%"/>
                  <col width="9%"/>
                  <col width="9%"/>
                  <col width="12%"/>
                  <col width="16%"/>
                  <col width="12%"/>
                  <col width="11%"/>
                </colgroup>
                <thead className="thead-dark">
                  <tr>
                    <th style={this.center}>Descripción</th>
                    <th style={this.center}>Físico</th>
                    <th style={this.center}>Disp</th>
                    <th style={this.center}>Código</th>
                    <th style={this.center}>Lote</th>
                    <th style={this.center}>Proveedor</th>
                    <th style={this.center}>F. Entrada</th>
                    <th style={this.center}><Link to="#" onClick={this.sortCaducidad}>Caducidad</Link></th>
                  </tr>
                </thead>
              </table>
              <div className="table-ovfl-mp tbl-lesshead">
                <table className="table table-bordered table-hover header-font" style={{cursor:'pointer'}} id="materiaprima">
                  <colgroup>
                  <col width="21%"/>
                  <col width="9%"/>
                  <col width="9%"/>
                  <col width="9%"/>
                  <col width="12%"/>
                  <col width="16%"/>
                  <col width="12%"/>
                  <col width="11%"/>
                  </colgroup>
                  <tbody>{lstMp}</tbody>
                </table>              
              </div>
              <div className="center" style={{marginTop:'-10px'}}>
             
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
