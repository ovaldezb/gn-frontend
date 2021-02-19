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
import Paginacion from './Paginacion';
import Addproddisp from './Addproddisp'

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
    this.forceUpdate();
  };

  updatePd = () =>{
    this.setState({
      proddisp:this.state.pageOfItems[this.state.idSelPd]
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
                  AuthService.isExpired(err.message);
                }
              );
        } 
      });
  }

  filtrado = () =>{
    var filter = this.filterRef.current.value;
    var nvoArray = this.state.lstPrdDisp.filter(element =>{
      return Object.values(element).filter(item=>{ return String(item).includes(filter)}).length > 0 
    });
    this.setState({
      pageOfItems:nvoArray
    });
  }


  selectRow = (i) => {
    this.setState({
      idSelPd:((this.state.page-1)*10) + i,
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
                    <td style={this.col1}>{i+1}</td>
                    <td style={this.col2}>{proddisp.nombre}</td>
                    <td style={this.col3}>{proddisp.clave}</td>
                    <td style={this.col4}>{proddisp.prodxcaja}</td>
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
                          <thead className="thead-dark">
                            <tr>
                                <th scope="col" style={this.col1}>#</th>
                                <th scope="col" style={this.col2}>Nombre</th>
                                <th scope="col" style={this.col3}>Clave</th>
                                <th scope="col" style={this.col4}>Piezas x Caja</th>
                            </tr>
                          </thead>
                        </table>
                        <div className="table-ovfl tbl-lesshead">
                          <table className="table" id="materiaprima">
                            <tbody>{lstMp}</tbody>
                          </table>              
                        </div>
                        <div className="center">
                          <Paginacion items={this.state.lstPrdDisp} onChangePage={this.onChangePage} page={this.state.page}/>
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
                    <div></div>
                    <nav>
                      <ul>
                        <li>
                          <Link to="#" onClick={this.addPd}><FontAwesomeIcon icon={faPlusSquare} /></Link>
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
