import Axios from 'axios'
import React, { Component } from 'react'
import Global from '../Global';
import authHeader from "../services/auth-header";
import AuthService from '../services/auth.service';
import swal from "sweetalert";
import Bitacora from '../services/bitacora-service';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faPlusSquare, faEdit,  faTrash,} from "@fortawesome/free-solid-svg-icons";
import Addproddisp from './Addproddisp'
import SimpleReactValidator from 'simple-react-validator'

export default class Proddisponible extends Component {
  displayAdd = false;
  isAdd = true;
  col1 = { width: '10%', textAlign:'center' };
  col2 = { width: "50%", textAlign:'center' };
  col3 = { width: "20%", textAlign: "center" };
  col4 = { width: '20%', textAlign: "center" };
  filterRef = React.createRef();
  state ={
    lstPrdDisp:[],
    filtro: "",
    status: "",
    idSelPd: -1,
    proddisp:{}
  };
  constructor(){
    super();
    this.validator = new SimpleReactValidator({
      messages:{
          required:'requeridos'
      }
  });
  }
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
        AuthService.isExpired(err.message);
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
    this.isAdd = true;
    this.setState({
      proddisp:{}
    });
    //this.forceUpdate();
  };

  updatePd = () =>{
    this.setState({
      proddisp:this.state.lstPrdDisp[this.state.idSelPd]
    });
    this.displayAdd = true;
    this.isAdd = false;
  }

  updateLstPd(prddisp){
    //let lstTmp = this.state.lstPrdDisp; 
    let prddispAnt = this.state.lstPrdDisp[this.state.idSelPd];
    //lstTmp[this.state.idSelPd] = prddisp;
    /*this.setState({
      lstPrdDisp:lstTmp
    });*/
    this.loadProdDisp();
    Bitacora(Global.UPDT_PRDDISP,JSON.stringify(prddispAnt),JSON.stringify(prddisp));
    this.isAdd = true;
  }

  cancelarAdd = (prddisp) => {
    this.displayAdd = false;
    if(prddisp){
        if(this.isAdd){
            this.loadProdDisp();
        }else{
            this.updateLstPd(prddisp);
        }
    }else{
      this.loadProdDisp();
    }
    //this.forceUpdate();
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
                  AuthService.isExpired(err.message);
                }
              );
        } 
      });
  }

  
  filtrado=()=>{
    var filter = this.filterRef.current.value;
    var td, found, i, j;
    var tabla = document.getElementById('proddisponible');
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
      idSelPd: i,
    });
  };

  render() {
    if (this.state.lstPrdDisp.length > 0) {
        var lstMp = this.state.lstPrdDisp.map((proddisp, i) => {
            if(this.state.idSelPd === i){
                this.style = "selected pointer";
            }else{
                this.style ={};
            }
            return(
                <tr key={i} onClick={() => {this.selectRow(i); }} className={this.style}>
                    <td style={{textAlign:'center'}}>{i+1}</td>
                    <td style={{textAlign:'left'}}>{proddisp.nombre}</td>
                    <td style={{textAlign:'center'}}>{proddisp.clave}</td>
                    <td style={{textAlign:'center'}}>{proddisp.prodxcaja}</td>
                    <td style={{textAlign:'center'}}>{proddisp.tipoProducto === 'P'? 'Producto' :'Base'}</td>
                </tr>
            );
        });
        return(
            <React.Fragment>
                {this.displayAdd &&   
                  <Addproddisp cancelar={this.cancelarAdd} proddisp={this.state.proddisp} tipo={this.isAdd}/>  
                }
                {!this.displayAdd && 
                  <React.Fragment>
                        <div className="barnav">
                          <div className="container flex-gn">
                            <ul>
                              <li>Filtro:</li>
                              <li><input className="input" type="text" name="filtro" ref={this.filterRef} onKeyUp={this.filtrado}/></li>
                            </ul>
                            <h2>Producto Disponible</h2>
                            <nav>
                              <ul>
                                <li>
                                  <Link to="#" onClick={this.addPd}>
                                    <FontAwesomeIcon icon={faPlusSquare} />
                                  </Link>
                                </li>
                                <li>
                                  {this.state.idSelPd === -1 &&
                                  <Link to="#">
                                    <FontAwesomeIcon icon={faEdit} style={{color:'grey'}}/>
                                  </Link>
                                  }
                                  {this.state.idSelPd !== -1 &&
                                  <Link to="#" onClick={this.updatePd}>
                                    <FontAwesomeIcon icon={faEdit} />
                                  </Link>
                                  }
                                </li>
                                <li>
                                  {this.state.idSelPd === -1 &&
                                  <Link to="#" >
                                    <FontAwesomeIcon icon={faTrash}  style={{color:'grey'}} />
                                  </Link>
                                  }
                                  {this.state.idSelPd !== -1 &&
                                  <Link to="#" onClick={this.deletePd} >
                                    <FontAwesomeIcon icon={faTrash} />
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
                              <col width="40%"/>
                              <col width="20%"/>
                              <col width="15%"/>
                              <col width="15%"/>
                            </colgroup>
                          <thead className="thead-dark">
                            <tr>
                                <th scope="col" style={{textAlign:'center'}}>#</th>
                                <th scope="col" style={{textAlign:'center'}}>Nombre</th>
                                <th scope="col" style={{textAlign:'center'}}>Clave</th>
                                <th scope="col" style={{textAlign:'center'}}>Piezas x Caja</th>
                                <th scope="col" style={{textAlign:'center'}}>Tipo</th>
                            </tr>
                          </thead>
                        </table>
                        <div className="table-ovfl-mp tbl-lesshead">
                          <table className="table table-hover" style={{cursor:'pointer'}} id="proddisponible">
                            <colgroup>
                              <col width="10%"/>
                              <col width="40%"/>
                              <col width="20%"/>
                              <col width="15%"/>
                              <col width="15%"/>
                            </colgroup>
                            <tbody>{lstMp}</tbody>
                          </table>              
                        </div>
                </React.Fragment>
                }
            </React.Fragment>
        );
    }else if(this.displayAdd){
        return (
            <React.Fragment>
              <div className="container">
                <Addproddisp cancelar={this.cancelarAdd} proddisp={this.state.proddisp} tipo={this.isAdd}/>
              </div>
            </React.Fragment>    
        )
    }else{
        return (
          <React.Fragment>
              <div className="container">
                <div className="barnav">
                  <div className="container flex-gn">
                  <h2 className="center">Producto Disponible</h2>
                    <nav>
                      <ul>
                        <li>
                          <Link to="#" onClick={this.addPd} title="Agregar un nuevo producto disponible"><FontAwesomeIcon icon={faPlusSquare} /></Link>
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
