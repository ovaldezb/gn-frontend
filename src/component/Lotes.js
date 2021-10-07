import Axios from 'axios'
import React, { Component } from 'react'
import Global from "../Global";
import authHeader from "../services/auth-header";
import AuthService from '../services/auth.service';
import Addlote from './Addlote';
import { Link } from "react-router-dom";
import swal from "sweetalert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlusSquare,
  faEdit,
  faTrash,faCheckDouble
} from "@fortawesome/free-solid-svg-icons";

import NumberFormat from 'react-number-format';

export default class Lotes extends Component {
  selAllRef = React.createRef();
  filterRef = React.createRef();
  displayAdd = false;
  isComplete = false;
  isAdd = true;
  state={
    lstLotes:[],
    lote:{},
    idSelLt:-1
  }

  componentDidMount(){
    this.loadLotes(false);
  }

  loadLotes(buscaTodos){
    Axios
    .get(Global.url+'lote/'+buscaTodos,{ headers: authHeader() })
    .then(res=>{
      
      if(res.data.length > 0){
        let lstLtTmp = res.data.map(lt=>{
          lt.producto = lt.oc.producto.nombre;
          lt.cliente = lt.oc.cliente.nombre;
          lt.ordencompra = lt.oc.oc;
          return lt;
        });
        this.setState({
          lstLotes:lstLtTmp,
          idSelLt:-1
        });
      }else{
        this.setState({
          lstLotes:[]
        });
      }
    })
    .catch(err=>{
      AuthService.isExpired(err.message);
    });
  }
  addLote = () => {
    this.displayAdd = true;
    this.forceUpdate();
  }

  editLote = () => {
    console.log(this.state.lstLotes[this.state.idSelLt]);
    this.isAdd = false;
    this.setState({lote:this.state.lstLotes[this.state.idSelLt]});
    this.displayAdd = true;
    this.forceUpdate();
  }

  cancelarAdd = ()=>{
    this.displayAdd = false;
    this.loadLotes(false);
  }

  selectRow = (i) => {
    this.setState({
      idSelLt: i,
    });
  };

  changeSttus = () =>{
    if(this.state.lstLotes[this.state.idSelLt].estatus === Global.OPEN){
      swal({
        title: "Desea aprobar el Lote "+this.state.lstLotes[this.state.idSelLt].lote+" ?",
        text: "Una vez aprobado, se podrá(n) comenzar con la(s) orden(es) de fabricación ",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if(willDelete){
          let lote = this.state.lstLotes[this.state.idSelLt];
          lote.aprobado = true;
          lote.estatus = Global.APRVD;
          Axios.put(Global.url+'lote/'+lote.id,lote,{ headers: authHeader() })
          .then(res =>{
            this.loadLotes(false);
            swal("Se aprobo el Lote, ahora se puede comenzar a fabricar",'Felicidades','success');
          })
          .catch(err =>{
            AuthService.isExpired(err.message);
          });
        }
      })
    }
  }

  deleteLote = () =>{
    swal({
      title: "Desea eliminar el Lote "+this.state.lstLotes[this.state.idSelLt].lote+" ?",
      text: "Una vez eliminado, no se podrá recuperar",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if(willDelete){
        Axios.delete(Global.url+'lote/'+this.state.lstLotes[this.state.idSelLt].id,{ headers: authHeader() })
        .then(res =>{
          swal('El lote ha sido eliminado');
          this.loadLotes(false);
        })
        .catch(err=>{
          AuthService.isExpired(err.message);
        });
      }
    })
  }

  filtrado=()=>{
    var filter = this.filterRef.current.value;
    var td, found, i, j;
    var tabla = document.getElementById('lotes');
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

  selectType = ()=>{
    this.loadLotes(this.selAllRef.current.checked);
  }

  render() {
    var style = {};
    if (this.state.lstLotes.length > 0) {
      return (
        <React.Fragment>
          {this.displayAdd && 
            <Addlote cancelar={this.cancelarAdd} lote={this.state.lote} tipo={this.isAdd}/>
          }
          {!this.displayAdd && 
          <React.Fragment>
            <div className="barnav">
              <div className="container flex-gn">
                <ul>
                  <li>Filtro:</li>
                  <li><input className="input"  type="text"  name="filtro" ref={this.filterRef} onKeyUp={this.filtrado}/></li>
                  <li><input type="checkbox" ref={this.selAllRef} onChange={this.selectType} /></li>
                </ul>
                <h2>Lotes de Producto</h2>
                <nav>
                <ul>
                  <li>
                    <Link to="#" onClick={this.addLote}>
                      <FontAwesomeIcon icon={faPlusSquare} title="Agregar un Lote"/>
                    </Link>
                  </li>
                  <li>
                    {(this.state.idSelLt === -1 || this.state.lstLotes[this.state.idSelLt].estatus !== Global.OPEN) &&
                    <Link to="#" >
                      <FontAwesomeIcon icon={faEdit} style={{color:'grey'}} title="Editar el Lote seleccionado"/>
                    </Link>
                    }
                    {(this.state.idSelLt !== -1 && this.state.lstLotes[this.state.idSelLt].estatus === Global.OPEN) &&
                    <Link to="#" onClick={this.editLote}>
                      <FontAwesomeIcon icon={faEdit} title="Editar el Lote seleccionado" />
                    </Link>
                    }
                  </li>
                  <li>
                    {(this.state.idSelLt === -1 || this.state.lstLotes[this.state.idSelLt].estatus !== Global.OPEN) &&
                    <Link to="#" >
                    <FontAwesomeIcon icon={faTrash} style={{color:'grey'}} title="Eliminar el Lote"/>
                    </Link>
                    }
                    {(this.state.idSelLt !== -1 && this.state.lstLotes[this.state.idSelLt].estatus === Global.OPEN) &&
                    <Link to="#" onClick={this.deleteLote}>
                    <FontAwesomeIcon icon={faTrash} title="Eliminar el Lote"/>
                    </Link>
                    }
                  </li>
                  <li>
                    {(this.state.idSelLt === -1 || this.state.lstLotes[this.state.idSelLt].estatus !== Global.OPEN) && 
                    <Link to="#" >
                      <FontAwesomeIcon icon={faCheckDouble} style={{color:'grey'}} title="Aprobar el Lote" />
                    </Link>
                    }
                    {(this.state.idSelLt !== -1 && this.state.lstLotes[this.state.idSelLt].estatus === Global.OPEN) && 
                    <Link to="#" onClick={this.changeSttus} >
                      <FontAwesomeIcon icon={faCheckDouble} title="Aprobar el Lote"/>
                    </Link>
                    }
                  </li>
                </ul>
              </nav>
              </div>
            </div>
            <table className="table table-bordered">
              <colgroup>
                <col width="10%"/>
                <col width="15%"/>
                <col width="40%"/>
                <col width="15%"/>
                <col width="10%"/>
                <col width="10%"/>
              </colgroup>
              <thead className="thead-dark">
                <tr>
                  <th style={{textAlign:'center'}}>OC</th>
                  <th style={{textAlign:'center'}}>Lote</th>
                  <th style={{textAlign:'center'}}>Producto</th>
                  <th style={{textAlign:'center'}}>Clave</th>
                  <th style={{textAlign:'center'}}>Pieza Lote</th>
                  <th style={{textAlign:'center'}}>Estatus</th>
                </tr>
              </thead>
            </table>
            <div className="table-ovfl-mp tbl-lesshead">
            <table className="table table-bordered table-lst table-hover" style={{cursor:'pointer'}} id="lotes">
              <colgroup>
                <col width="10%"/>
                <col width="15%"/>
                <col width="40%"/>
                <col width="15%"/>
                <col width="10%"/>
                <col width="10%"/>
              </colgroup>
              <tbody>
                {this.state.lstLotes.map((lote,i)=>{
                  if(this.state.idSelLt === i){
                    style = "selected pointer";
                  }else{
                    style = "";
                  }
                  return(
                    <tr key={i} onClick={() => {this.selectRow(i)}} className={style}>
                      <td>{lote.ordencompra}</td>
                      <td style={{textAlign:'center'}}>{lote.lote}</td>
                      <td>{lote.producto}</td>
                      <td style={{textAlign:'center'}}>{lote.oc.clave}</td>
                      <td style={{textAlign:'center'}}><NumberFormat value={Number(lote.piezasLote)}displayType={'text'} thousandSeparator={true} /></td>
                      <td style={{textAlign:'center'}}>{lote.estatus}</td>
                    </tr> 
                  );
                })}
              </tbody>
            </table>
            </div>
          </React.Fragment>
          }
        </React.Fragment>
      )
    }else if(this.displayAdd){
        return  <Addlote cancelar={this.cancelarAdd} lote={this.state.lote} tipo={this.isAdd} />
    }else{
      return(
      <React.Fragment>
        <div className="barnav">
          <div className="container flex-gn">
            <ul>
              <li>Filtro:</li>
              <li><input className="input"  type="text"  name="filtro" ref={this.filterRef} onKeyUp={this.filtrado}/></li>
              <li><input type="checkbox" ref={this.selAllRef} onChange={this.selectType} /></li>
            </ul>
            <h2>Lotes de Producto</h2>
            <nav>
              <ul>
                <li>
                  <Link to="#" onClick={this.addLote}>
                    <FontAwesomeIcon icon={faPlusSquare} title="Agregar un nuevo lote de producto"/>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        <h1 className="center">No hay Lotes para mostrar</h1>
      </React.Fragment>
      )
    }
  
  }
}
