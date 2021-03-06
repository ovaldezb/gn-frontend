import Axios from 'axios'
import React, { Component } from 'react'
import authHeader from "../services/auth-header";
import Global from '../Global';
import Addproveedor from './Addproveedor';
import {Link} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlusSquare, faEdit,  faTrash,} from "@fortawesome/free-solid-svg-icons";
import Paginacion from './Paginacion';
import swal from "sweetalert";
import axios from "axios";
import AuthService from '../services/auth.service';

export default class Proveedores extends Component {
    displayAdd = false;
    isUpdt = false;
    filterRef = React.createRef();
    state={
        lstProv:[],
        pageOfItems: [],
        page:1,
        proveedor:{},
        idSelProv:-1,
        filter:''
    }

    componentDidMount(){
        this.getProveedores();
    }

    getProveedores(){
      let lstProvTmp = [];
        Axios.get(Global.url+'proveedor',{ headers: authHeader() })
        .then(res =>{
          res.data.forEach(elem =>{
            let prov = {};
            prov.nombre = elem.nombre; 
            prov.rfc = elem.rfc;
            prov.telefonoPrincipal = elem.telefonoPrincipal;
            prov.contacto = elem.contactos[0] !== undefined ? elem.contactos[0].nombre : '';
            prov.email = elem.contactos[0] !== undefined ? elem.contactos[0].email : '';
            prov.telefono = elem.contactos[0] !== undefined ? elem.contactos[0].telefono : '';
            prov.id = elem.id;
            prov.contactos = elem.contactos;
            lstProvTmp.push(prov);
          });
          this.setState({
              lstProv:lstProvTmp
          });
        })
        .catch(err=>{
            AuthService.isExpired(err.message);
        });
    }

    addProv = () =>{
        this.displayAdd = true;
        this.forceUpdate();
    }

    deleteProv = () =>{
        swal({
            title: "Estas seguro?",
            text: "Una vez eliminado, no se podrá recuperar el proveedor",
            icon: "warning",
            buttons: true,
            dangerMode: true,
          })
          .then((willDelete) => {
            if (willDelete) {
              axios.delete(Global.url+'proveedor/'+this.state.pageOfItems[this.state.idSelProv].id,{ headers: authHeader() })
                  .then(res=>{
                    //var mp = this.state.lstMatPrim[this.state.idSelMp];
                    //Bitacora(Global.DEL_MATPRIM,JSON.stringify(mp),'');
                    swal("El proveedor ha sido eliminado!", {
                      icon: "success",
                    });
                    this.getProveedores();
                    
                  }).catch(
                    err =>{
                        AuthService.isExpired(err.message);
                    }
                  );
            } 
          });
    }

    cancelarProv = ()=>{
        this.displayAdd = false;
        this.isUpdt = false;
        this.getProveedores();
    }

    selectRow = (i) => {
        this.setState({
          idSelProv:  i,
        });
      };

    updateProv = () =>{
        this.displayAdd = true;
        this.isUpdt = true;
        this.setState({
            proveedor:this.state.pageOfItems[this.state.idSelProv]
        });
    }

    filtrado = () =>{
        var filter = this.filterRef.current.value;
        var nvoArray = this.state.lstProv.filter(element =>{
          return Object.values(element).filter(item=>{ return String(item).includes(filter)}).length > 0 
        });
        this.setState({
          pageOfItems:nvoArray
        });
      }

    onChangePage = (pageOfItems,page) => {
     // update state with new page of items
     this.setState({ pageOfItems: pageOfItems, page:page });
  }

    render() {
      if(this.state.lstProv.length >0){
        return (
            <React.Fragment>
            {this.displayAdd &&
                <Addproveedor cancelar={this.cancelarProv} tipo={this.isUpdt} proveedor={this.state.proveedor}/>
            }
            {!this.displayAdd &&
                <React.Fragment>
                    <div className="barnav">
                        <div className="container flex-gn">
                            <ul>
                                <li>Filtro</li>
                                <li>
                                    <input className="input" type="text" ref={this.filterRef} onKeyUp={this.filtrado}/>
                                </li>
                            </ul>
                            <h2>Proveedores</h2>
                            <nav>
                                <ul>
                                    <li>
                                        <Link to="#" onClick={this.addProv}>
                                            <FontAwesomeIcon icon={faPlusSquare} />
                                        </Link>
                                    </li>
                                    <li>
                                      {this.state.idSelProv === -1 && 
                                        <Link to="#" >
                                            <FontAwesomeIcon icon={faEdit} style={{color:'grey'}} />
                                        </Link>
                                      }
                                      {this.state.idSelProv !== -1 && 
                                        <Link to="#" onClick={this.updateProv}>
                                            <FontAwesomeIcon icon={faEdit}  />
                                        </Link>
                                      }
                                    </li>
                                    <li>
                                    {this.state.idSelProv === -1 &&
                                        <Link to="#"  >
                                            <FontAwesomeIcon icon={faTrash} style={{color:'grey'}} />
                                        </Link>
                                      }
                                      {this.state.idSelProv !== -1 &&
                                        <Link to="#" onClick={this.deleteProv} >
                                            <FontAwesomeIcon icon={faTrash}  />
                                        </Link>
                                      }
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                    <table className="table table-dark">
                        <colgroup>
                            <col width="20%"/>
                            <col width="15%"/>
                            <col width="15%"/>
                            <col width="20%"/>
                            <col width="15%"/>
                            <col width="15%"/>
                        </colgroup>
                        <thead>
                            <tr>
                                <th className="font12" style={{textAlign:'center'}}>Nombre</th>
                                <th className="font12" style={{textAlign:'center'}}>RFC</th>
                                <th className="font12" style={{textAlign:'center'}}>Teléfono Principal</th>
                                <th className="font12" style={{textAlign:'center'}}>Correo</th>
                                <th className="font12" style={{textAlign:'center'}}>Contacto</th>
                                <th className="font12" style={{textAlign:'center'}}>Teléfono Contacto</th>
                            </tr>
                        </thead>
                    </table>
                    <div className="table-ovfl tbl-lesshead">
                        <table className="table table-hover table-bordered" style={{cursor:'pointer'}}>
                            <colgroup>
                                <col width="20%"/>
                                <col width="15%"/>
                                <col width="15%"/>
                                <col width="20%"/>
                                <col width="15%"/>
                                <col width="15%"/>
                            </colgroup>
                            <tbody>
                                {this.state.pageOfItems.map((prov,i)=>{
                                    var style = {};
                                    if(this.state.idSelProv === i){
                                        style="selected pointer"
                                    }else{
                                        style={};
                                    }
                                    return(
                                        <tr key={i} onClick={() => {this.selectRow(i); }} className={style} >
                                            <td className="font12">{prov.nombre}</td>
                                            <td className="font12">{prov.rfc}</td>
                                            <td className="font12">{prov.telefonoPrincipal}</td>
                                            <td className="font12">{prov.email}</td>
                                            <td className="font12">{prov.contacto}</td>
                                            <td className="font12">{prov.telefono}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="center">
                        <Paginacion items={this.state.lstProv} onChangePage={this.onChangePage} page={this.state.page}/>
                    </div>
                </React.Fragment>
            }
            </React.Fragment>
        )
      }else if(this.displayAdd){
        return <Addproveedor cancelar={this.cancelarProv} tipo={this.isUpdt}/>
      }else{
          return(
            <div className="container">
                <div className="barnav">
                  <div className="container flex-gn">
                    <div>
                    </div>
                    <nav>
                      <ul>
                        <li>
                          <Link to="#" onClick={this.addProv}><FontAwesomeIcon icon={faPlusSquare} /></Link>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
                <h1 className="center">No hay Proveedores para mostrar</h1>
            </div>
          );
      }
    }
}
