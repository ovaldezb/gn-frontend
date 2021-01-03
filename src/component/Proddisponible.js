import Axios from 'axios'
import React, { Component } from 'react'
import Global from '../Global';
import authHeader from "../services/auth-header";
import authServices from '../services/auth.service';
import swal from "sweetalert";
import Bitacora from '../services/bitacora-service';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faPlusSquare, faEdit,  faTrash,} from "@fortawesome/free-solid-svg-icons";
import Paginacion from './Paginacion';
import Addproddisp from './Addproddisp'
import Header from './Header';

export default class Proddisponible extends Component {
  displayAdd = false;
  isAdd = true;
  col1 = { width: 20 };
  col2 = { width: 100 };
  col3 = { width: 96, textAlign: "center" };
  filterRef = React.createRef();
  state ={
    lstPrdDisp:[],
    pageOfItems: [],
    page:1,
    filtro: "",
    status: "",
    idSelPd: -1,
    proddisp:{}
  };
  componentDidMount(){
    this.loadProdDisp();
  }

  loadProdDisp(){
    Axios.get(Global.url+'prodisp',{ headers: authHeader() })
      .then(res =>{
        this.setState({
            lstPrdDisp:res.data
        }); 
      })
      .catch(err=>{
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

  addPd = () => {
    this.displayAdd = true;
    this.forceUpdate();
  };

  updatePd = () =>{
    this.setState({
      proddisp:this.state.lstPrdDisp[this.state.idSelPd]
    });
    this.displayAdd = true;
    this.isAdd = false;
  }

  updateLstPd(prddisp){
    let lstTmp = this.state.lstPrdDisp; 
    let prddispAnt = this.state.lstPrdDisp[this.state.idSelPd];
    lstTmp[this.state.idSelPd] = prddisp;
    this.setState({
      lstPrdDisp:lstTmp
    });
    Bitacora(Global.UPDT_PRDDISP,JSON.stringify(prddispAnt),JSON.stringify(prddisp));
    this.isAdd = true;
  }

  cancelarAdd = (prddisp) => {
    this.displayAdd = false;
    if(prddisp){
        if(this.isAdd){
            this.state.lstPrdDisp.push(prddisp);
            this.setState({
                lstPrdDisp:this.state.lstPrdDisp
            });
        }else{
            this.updateLstPd(prddisp);
        }
    }
    this.forceUpdate();
  }

  deletePd = () => {
    swal({
        title: "Estas seguro?",
        text: "Una vez eliminado, no se podrá recuperar el Producto",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {
          Axios.delete(Global.url+'prodisp/'+this.state.lstPrdDisp[this.state.idSelPd].id,{ headers: authHeader() })
              .then(res=>{
                var pd = this.state.lstPrdDisp[this.state.idSelPd];
                Bitacora(Global.DEL_PRDDISP,JSON.stringify(pd),'');
                swal("El Producto ha sido eliminado!", {
                  icon: "success",
                });
                this.loadProdDisp();
                this.forceUpdate();
              }).catch(
                err =>{
                  console.log('Error '+err.message);
                }
              );
        } 
      });
  }

  filter = () => {
    var filter = this.filterRef.current.value;
    var td, found, i, j;
    var tabla = document.getElementById("productodisponible");
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

  selectRow = (i) => {
    this.setState({
      idSelPd: i
    });
  };

  onChangePage = (pageOfItems,page) => {
    // update state with new page of items
    this.setState({ pageOfItems: pageOfItems, page:page });
  }

  render() {
    if (this.state.lstPrdDisp.length > 0) {
        var lstMp = this.state.pageOfItems.map((proddisp, i) => {
            if(this.state.idSelPd === i){
                this.style = "selected pointer";
            }else{
                this.style ={};
            }
            return(
                <tr key={i} onClick={() => {this.selectRow(i); }} className={this.style}>
                    <td>{i+1}</td>
                    <td>{proddisp.nombre}</td>
                    <td>{proddisp.clave}</td>
                </tr>
            );
        });
        return(
            <React.Fragment>
                {this.displayAdd && 
                    <React.Fragment>
                        <Header/>
                    <div className="container">
                    <Addproddisp cancelar={this.cancelarAdd} proddisp={this.state.proddisp} tipo={this.isAdd}/>
                    </div>
                    </React.Fragment>
                }
                {!this.displayAdd && 
                    <React.Fragment>
                      <Header/>
                      <div className="container">
                        <div className="barnav">
                          <div className="container flex-gn">
                            <ul>
                              <li>Filtro:</li>
                              <li><input className="input" type="text" name="filtro" ref={this.filterRef} onKeyUp={this.filter}/></li>
                            </ul>
                          <nav>
                            <ul>
                              <li>
                                <Link to="#" onClick={this.addPd}>
                                  <FontAwesomeIcon icon={faPlusSquare} />
                                </Link>
                              </li>
                              <li>
                                <Link to="#" onClick={this.updatePd}>
                                  <FontAwesomeIcon icon={faEdit} />
                                </Link>
                              </li>
                              <li>
                                <Link to="#" onClick={this.deletePd} >
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
                                <th scope="col" style={this.col1}>#</th>
                                <th scope="col" style={this.col2}>Nombre</th>
                                <th scope="col" style={this.col3}>Clave</th>
                            </tr>
                        </thead>
                      </table>
                      <div className="table-ovfl tbl-lesshead">
                        <table className="table" id="materiaprima">
                          <tbody>{lstMp}</tbody>
                        </table>              
                      </div>
                      <div className="center">
                        <Paginacion items={this.state.lstPrdDisp} onChangePage={this.onChangePage} />
                      </div>
                    </div>
                    </React.Fragment>
                }
            </React.Fragment>
        );
    }else if(this.displayAdd){
        return (
            <React.Fragment>
                <Header/>
                <div className="container">
                <Addproddisp cancelar={this.cancelarAdd} proddisp={this.state.proddisp} tipo={this.isAdd}/>
                </div>
            </React.Fragment>    
        )
        
    }else{
        return (
            <React.Fragment>
              <Header/>
              <div className="container">
              <div className="barnav">
                    <div className="container flex-gn">
                      <div>
                      </div>
                      <nav>
                        <ul>
                          <li>
                            <Link to="#" onClick={this.addPd}><FontAwesomeIcon icon={faPlusSquare} />
                            </Link>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </div>
                </div>
              <h1 className="center">No hay productos disponibles a mostrar</h1>
            </React.Fragment>
        ); 
    }
  }
}
