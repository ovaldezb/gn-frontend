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
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import Paginacion from './Paginacion';
import NumberFormat from 'react-number-format';

export default class Lotes extends Component {
  selAllRef = React.createRef();
  displayAdd = false;
  isComplete = false;
  isAdd = true;
  state={
    lstLotes:[],
    pageOfItems: [],
    page:1,
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
      this.setState({
        lstLotes:res.data
      })
    })
    .catch(err=>{
      AuthService.isExpired(err.message);
    });
  }
  addLote = () => {
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

  selectType = ()=>{
    this.loadLotes(this.selAllRef.current.checked);
  }

  onChangePage = (pageOfItems,page) => {
    // update state with new page of items
    this.setState({ pageOfItems: pageOfItems, page:page });
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
                <h2>Lotes</h2>
                <nav>
                <ul>
                  <li>
                    <Link to="#" onClick={this.addLote}>
                      <FontAwesomeIcon icon={faPlusSquare} />
                    </Link>
                  </li>
                  <li>
                    <Link to="#" onClick={this.editLote}>
                      <FontAwesomeIcon icon={faEdit} />
                    </Link>
                  </li>
                  <li>
                    <Link to="#" onClick={this.deleteLote}>
                      <FontAwesomeIcon icon={faTrash} />
                    </Link>
                  </li>
                </ul>
              </nav>
              </div>
            </div>
            <table className="table table-bordered">
              <colgroup>
                <col width="10%"/>
                <col width="10%"/>
                <col width="35%"/>
                <col width="25%"/>
                <col width="10%"/>
                <col width="10%"/>
              </colgroup>
              <thead className="thead-dark">
                <tr>
                  <th style={{textAlign:'center'}}>OC</th>
                  <th style={{textAlign:'center'}}>Lote</th>
                  <th style={{textAlign:'center'}}>Producto</th>
                  <th style={{textAlign:'center'}}>Cliente</th>
                  <th style={{textAlign:'center'}}>Pieza Lote</th>
                  <th style={{textAlign:'center'}}>Estatus</th>
                </tr>
              </thead>
            </table>
            <div className="table-ovfl tbl-lesshead">
            <table className="table table-bordered table-lst" id="ordenFabricacion">
              <colgroup>
                <col width="10%"/>
                <col width="10%"/>
                <col width="35%"/>
                <col width="25%"/>
                <col width="10%"/>
                <col width="10%"/>
              </colgroup>
              <tbody>
                {this.state.pageOfItems.map((lote,i)=>{
                  if(this.state.idSelLt === i){
                    style = "selected pointer";
                  }else{
                    style = "";
                  }
                  return(
                    <tr key={i} onClick={() => {this.selectRow(i)}} onDoubleClick={()=>{this.changeSttus(i)}} className={style}>
                      <td>{lote.oc.oc}</td>
                      <td style={{textAlign:'center'}}>{lote.lote}</td>
                      <td>{lote.oc.producto.nombre}</td>
                      <td>{lote.oc.cliente.nombre}</td>
                      <td style={{textAlign:'center'}}><NumberFormat value={Number(lote.piezasLote)}displayType={'text'} thousandSeparator={true} /></td>
                      <td style={{textAlign:'center'}}>{lote.estatus}</td>
                    </tr> 
                  );
                })}
              </tbody>
            </table>
            </div>
            <div className="center">
              <Paginacion items={this.state.lstLotes} onChangePage={this.onChangePage} page={this.state.page} />
            </div>
          </React.Fragment>
          }
        </React.Fragment>
      )
    }else if(this.displayAdd){
        return  <Addlote cancelar={this.cancelarAdd} ordencompra={this.state.lote} tipo={this.isAdd} />
    }else{
      return(
      <React.Fragment>
        <div className="barnav">
          <div className="container flex-gn">
            <div></div>
            <h2>Lotes</h2>
            <nav>
              <ul>
                <li>
                  <Link to="#" onClick={this.addLote}>
                    <FontAwesomeIcon icon={faPlusSquare} />
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
