import React, { Component } from "react";
import Paginacion from './Paginacion';
import authHeader from "../services/auth-header";
import axios from "axios";
import Global from "../Global";
import "moment/locale/es-mx";
import momento from 'moment';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faPlusSquare, faEdit,  faTrash,} from "@fortawesome/free-solid-svg-icons";
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

  loadMatPrim=()=> {
    axios
      .get(this.url + "matprima", { headers: authHeader() },{ responseType: 'application/json' })
      .then((res) => {
        this.setState({
          lstMatPrim: res.data,
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

  /*loadMatPrim=()=> {
    
    
  }*/

  selectRow = (i) => {
    this.setState({
      idSelMp: i,
    });
  };

  filtrado = () =>{
    var filter = this.filterRef.current.value;
    if(filter !== ''){
    var nvoArray = this.state.lstMatPrim.filter(element =>{
      return Object.values(element).filter(item=>{ return String(item).includes(filter)}).length > 0 
    });
    this.setState({
      pageOfItems:nvoArray
    });
   }else{
    this.setState({
      pageOfItems:this.state.lstMatPrim
    });
   }
  }

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
      matprima:this.state.pageOfItems[i],
      idSelMp: -1
    });  
  }

  deleteMp = () =>{
    swal({
      title: "Estas seguro que desea eliminar la MP["+this.state.pageOfItems[this.state.idSelMp].descripcion+"]?",
      text: "Una vez eliminado, no se podrá recuperar la Materia Prima",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        axios.delete(this.url+'matprima/'+this.state.pageOfItems[this.state.idSelMp].id,{ headers: authHeader() })
        .then(res=>{
          var mp = this.state.pageOfItems[this.state.idSelMp];
          Bitacora(Global.DEL_MATPRIM,JSON.stringify(mp),'');
          swal("La materia prima ha sido eliminada!", {
            icon: "success",
          });
          this.loadMatPrim();
          
          this.forceUpdate();
        }).catch(
          err =>{
            AuthService.isExpired(err.message);
          }
        );
      } 
    });
  }

  cancelarAdd = (matprima) => {
    this.displayAdd = false;
    if(matprima){
      this.isAdd = false;
    }else{
      this.isAdd = true;
    }
    this.forceUpdate();
  }

  sortCaducidad = ()=>{
    let poi = this.state.pageOfItems;
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
        lstMatPrim:res.data,
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
        lstMatPrim:res.data,
      });
    })
    .catch(err=>{
      AuthService.isExpired(err.message);
    });
  }

  buscaFin = ()=>{
    this.isFiltro = true;
    let f1 = new Date();
    f1.setDate(f1.getDate() + Global.MAX_DAYS);
    Axios
    .get(Global.url+'matprima/fin/'+momento(f1).format('MM-DD-YYYY H:mm:ss'),{ headers: authHeader() })
    .then(res=>{
      this.setState({
        lstMatPrim:res.data,
      });
    })
    .catch(err=>{
      AuthService.isExpired(err.message);
    });
  }

  onChangePage = (pageOfItems,page) => {
    this.setState({ 
      pageOfItems: pageOfItems, 
      page:page,
      idSelMp:-1 });
  }

  render() {
    var style = {};
    var styleDisp={};
    var styleCell = {};
    var styleFecCad = {};
    var today = new Date();
    if ((this.state.lstMatPrim.length > 0 || this.isFiltro)) {
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
          <tr key={i} onClick={() => {this.selectRow(i); }} className={style} >
            <td style={this.left}>{matprim.descripcion}</td>
            <td className={styleCell} style={{fontSize:'12px'}}><NumberFormat value={Number(matprim.cantidad).toFixed(2)} displayType={'text'} thousandSeparator={true} /> Kg</td>
            <td className={styleDisp} style={{fontSize:'12px'}}><NumberFormat value={Number(matprim.cantidad - matprim.apartado ).toFixed(2)} displayType={'text'} thousandSeparator={true} /> Kg</td>
            <td style={{fontSize:'12px'}}>{matprim.codigo}</td>
            <td style={{fontSize:'12px'}}>{matprim.lote}</td>
            <td style={{fontSize:'12px'}}>{matprim.proveedor.nombre}</td>
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
                <colgroup>
                  <col width="19%"/>
                  <col width="8%"/>
                  <col width="8%"/>
                  <col width="9%"/>
                  <col width="12%"/>
                  <col width="18%"/>
                  <col width="12%"/>
                  <col width="13%"/>
                </colgroup>
                <thead className="thead-dark">
                  <tr>
                    <th style={this.center}>Descripción</th>
                    <th style={this.center}>Físico</th>
                    <th style={this.center}>Disp</th>
                    <th style={this.center}>Código</th>
                    <th style={this.center}>Lote</th>
                    <th style={this.center}>Proveedor</th>
                    <th style={this.center}>F. Ent</th>
                    <th style={this.center}><Link to="#" onClick={this.sortCaducidad}>Caducidad</Link></th>
                  </tr>
                </thead>
              </table>
              <div className="table-ovfl-mp tbl-lesshead">
                <table className="table table-bordered table-hover header-font" id="materiaprima">
                  <colgroup>
                  <col width="19%"/>
                  <col width="8%"/>
                  <col width="8%"/>
                  <col width="9%"/>
                  <col width="12%"/>
                  <col width="18%"/>
                  <col width="12%"/>
                  <col width="13%"/>
                  </colgroup>
                  <tbody>{lstMp}</tbody>
                </table>              
              </div>
              <div className="center">
              <Paginacion items={this.state.lstMatPrim} onChangePage={this.onChangePage} page={this.state.page}/>
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
          <Paginacion items={this.state.lstMatPrim} onChangePage={this.onChangePage} page={this.state.page}/>
        </div>
      );
    }
  }
}
