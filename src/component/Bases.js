import React, { Component } from "react";
import Axios from "axios";
import Global from "../Global";
import authHeader from "../services/auth-header";
import AuthService from "../services/auth.service";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusSquare, faEdit, faTrash, faCheckDouble } from "@fortawesome/free-solid-svg-icons";
import Addbase from "./Addbase";
import swal from "sweetalert";

export default class Bases extends Component {
  displayAdd = false;
  isAdd = true;
  comentariosRef = React.createRef();
  rendimientoRef = React.createRef();
  selAllRef = React.createRef();
  state = {
    lstBases: [],
    idSelBase: -1,
    base:{},
    isModalActive: false,
    comentarios:'',
    rendimiento:''
  };

  componentDidMount() {
    this.loadBases(false);
  }

  loadBases = (activo) => {
    Axios.get(Global.url + 'bases/all/'+activo, { headers: authHeader() })
      .then((res) => {
        if (res.data.length > 0) {
          this.setState({
            lstBases: res.data,
            idSelBase: -1,
          });
        } else {
          this.setState({
            lstBases: [],
          });
        }
      })
      .catch((err) => {
        AuthService.isExpired(err.message);
      });
  };

  selectRow = (i) => {
    this.setState({
      idSelBase: i,
    });
  };

  cancelarAdd = ()=>{
    this.displayAdd = false;
    this.forceUpdate();
    this.loadBases(false);
  }

  agregaBase = () => {
    this.displayAdd = true;
    this.isAdd = true;
    this.setState({
      base:{}
    });
  };

  updateBase = () =>{
    this.displayAdd = true;
    this.isAdd = false;
   this.setState({
     base:this.state.lstBases[this.state.idSelBase]
   });
  }

  apruebaBase = (i)=>{
    if(this.state.lstBases[this.state.idSelBase].estatus === Global.TEP || this.state.lstBases[this.state.idSelBase].estatus === Global.CMPLT){
      this.setState({
        isModalActive:true
      });
    }
     
  }

  closeModal = ()=>{
    this.setState({
      isModalActive:false
    });
  }

  aproveBase = () =>{
    swal({
      title: "Desea aprobar el comienzo de la producción de la Base?",
      text: this.state.lstBases[this.state.idSelBase].lote,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        let base = this.state.lstBases[this.state.idSelBase];
        base.estatus = Global.TEP;
        Axios.put(Global.url+'bases/'+this.state.lstBases[this.state.idSelBase].id,base,{ headers: authHeader() })
        .then(res =>{
          swal('Se actualizó exitosamente la Base');
          this.loadBases(false);
        })
        .catch(err=>{
          AuthService.isExpired(err.message);
        });
      }
    })
  }

  completaBase = ()=>{
    let base = this.state.lstBases[this.state.idSelBase];
    base.estatus = Global.DISP;
    base.aprobado = true;
    base.comentarios = this.state.comentarios;
    base.rendimiento = this.state.rendimiento;
    Axios.put(Global.url+'bases/'+this.state.lstBases[this.state.idSelBase].id,base,{ headers: authHeader() })
    .then(res =>{
      swal('Se completó exitosamente la Base');
      this.setState({
        isModalActive:false,
        comentarios:'',
        rendimiento:''
      });
      this.loadBases(false);
    })
    .catch(err=>{
      AuthService.isExpired(err.message);
    });
  }

  deleteBase = () =>{
    swal({
      title: "Estas seguro?",
      text: "Una vez eliminada, no se podrá recuperar la Base",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        Axios.delete(Global.url+'bases/'+this.state.lstBases[this.state.idSelBase].id,{ headers: authHeader() })
        .then(res =>{
          if(res.data){
            swal('Se eliminó la base con éxito');
            this.loadBases(false);
          }
        })
        .catch(
          err =>{
            AuthService.isExpired(err.message);
          });
      }
    })
  }

  selectType = ()=>{
    this.loadBases(this.selAllRef.current.checked);
  }

  formChange = () =>{
    this.setState({
      comentarios:this.comentariosRef.current.value,
      rendimiento:this.rendimientoRef.current.value
    });
  }

  render() {
    if (this.state.lstBases.length > 0) {
      return (
        <React.Fragment>
          {this.displayAdd && <Addbase tipo={this.isAdd} cancelar={this.cancelarAdd} base={this.state.base}/>}
          {!this.displayAdd && (
            <React.Fragment>
              <div className="barnav">
                <div className="container flex-gn">
                  <ul>
                    <li>Filtro:</li>
                    <li>
                      <input
                        className="input"
                        type="text"
                        name="filtro"
                        ref={this.filterRef}
                        onKeyUp={this.filtrado}
                      />
                    </li>
                    <li>
                      Historial:
                      <input
                        type="checkbox"
                        ref={this.selAllRef}
                        onChange={this.selectType}
                      />
                    </li>
                  </ul>
                <h2>Bases</h2>
                <nav>
                  <ul>
                    <li>
                      <Link to="#" onClick={this.agregaBase}>
                        <FontAwesomeIcon icon={faPlusSquare} />
                      </Link>
                    </li>
                    <li>
                    {this.state.idSelBase === -1 &&
                      <Link to="#" style={{color:'grey'}} title="Edita una base">
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                    }
                    {this.state.idSelBase !== -1 &&
                      <Link to="#" onClick={this.updateBase} title="Edita una base">
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                    }
                    </li>
                    <li>
                    {((this.state.idSelBase === -1 ) || this.state.lstBases[this.state.idSelBase].estatus !== Global.OPEN) &&
                      <Link to="#" >
                        <FontAwesomeIcon icon={faTrash} style={{color:'grey'}} title="Elimina una base"/>
                      </Link>
                    }
                    {(this.state.idSelBase !== -1 && this.state.lstBases[this.state.idSelBase].estatus === Global.OPEN) && 
                      <Link to="#" onClick={this.deleteBase} title="Elimina una base">
                        <FontAwesomeIcon icon={faTrash} />
                      </Link>
                    }
                    </li>
                    <li>
                        {((this.state.idSelBase === -1 ) || this.state.lstBases[this.state.idSelBase].estatus !== Global.OPEN) &&
                        <Link to="#" >
                        <FontAwesomeIcon icon={faCheckDouble} style={{color:'grey'}}/>
                        </Link>
                        }
                        {(this.state.idSelBase !== -1 && this.state.lstBases[this.state.idSelBase].estatus === Global.OPEN) &&
                        <Link to="#" onClick={this.aproveBase} >
                        <FontAwesomeIcon icon={faCheckDouble} title="Aprobar Base "/>
                        </Link>
                        }
                    </li>
                  </ul>
                </nav>
                </div>
              </div>
              {this.state.isModalActive &&
              <div className="modal fade show"  tabIndex="-1" role="dialog" style={{display:'block'}}>
              <div className="modal-dialog modal-dialog-centered" style={{maxWidth:'600px'}} role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">Completar Base {this.state.lstBases[this.state.idSelBase].lote}</h5>
                    <button type="button" className="close" onClick={this.closeModal} data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body center-100" >
                    <div style={{border:'1px solid blue',width:'104%',marginTop:'15px'}}>
                      <form onChange={this.formChange}>
                      <table style={{width:'80%'}}>
                        <tbody>
                          <tr>
                            <td>Comentarios</td>
                            <td style={{textAlign:'center'}}>Rendimiento</td>
                          </tr>
                          <tr>
                            <td><input type="textarea" row="2" col="5" ref={this.comentariosRef} defaultValue={this.state.lstBases[this.state.idSelBase].comentarios}/></td>
                            <td>
                              <input type="number" size="4" ref={this.rendimientoRef} defaultValue={this.state.lstBases[this.state.idSelBase].rendimiento}/>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      </form>
                    </div>
                  </div>
                  <div className="modal-footer">
                    {this.state.lstBases[this.state.idSelBase].estatus === Global.TEP && 
                    <button className="btn btn-success" onClick={this.completaBase}>{Global.COMPLETAR}</button>
                    }
                    <button className="btn btn-secondary" onClick={this.closeModal}>{Global.CANCELAR}</button>
                  </div>
                </div>
              </div>
            </div>
              }
              <table className="table table-bordered">
                <colgroup>
                  <col width="10%"/>
                  <col width="30%"/>
                  <col width="15%"/>
                  <col width="15%"/>
                  <col width="15%"/>
                  <col width="15%"/>
                </colgroup>
                <thead className="thead-dark">
                  <tr>
                    <th scope="col" style={{textAlign:'center'}}>#</th>
                    <th scope="col" style={{textAlign:'center'}}>Base</th>
                    <th scope="col" style={{textAlign:'center'}}>Lote</th>
                    <th scope="col" style={{textAlign:'center'}}>C. Disponible</th>
                    <th scope="col" style={{textAlign:'center'}}>C. Restante</th>
                    <th scope="col" style={{textAlign:'center'}}>Estatus</th>
                  </tr>
                </thead>
              </table>
              <div className="table-ovfl-mp tbl-lesshead">
                <table className="table table-hover" style={{cursor:'pointer'}} id="proddisponible">
                  <colgroup>
                    <col width="10%"/>
                    <col width="30%"/>
                    <col width="15%"/>
                    <col width="15%"/>
                    <col width="15%"/>
                    <col width="15%"/>
                  </colgroup>
                  <tbody>{this.state.lstBases.map((base,i)=>{
                    if(this.state.idSelBase === i){
                      this.style = "selected pointer";
                  }else{
                      this.style ={};
                  }
                    return(
                      <tr key={i} onClick={() =>{this.selectRow(i)}} onDoubleClick={()=>{this.apruebaBase(i)}} className={this.style}>
                        <td style={{textAlign:'center'}}>{i+1}</td>
                        <td>{base.nombre}</td>
                        <td style={{textAlign:'center'}}>{base.lote}</td>
                        <td style={{textAlign:'center'}}>{base.cantidadRestante - base.apartado}</td>
                        <td style={{textAlign:'center'}}>{base.cantidadRestante}</td>
                        <td style={{textAlign:'center'}}>{base.estatus}</td>
                      </tr>
                    )
                  })}</tbody>
                </table>              
              </div>
            </React.Fragment>
          )}
        </React.Fragment>
      );
    } else if (this.displayAdd) {
      return <Addbase tipo={this.isAdd}  cancelar={this.cancelarAdd} />;
    } else {
      return (
        <React.Fragment>
          <div className="barnav">
            <div className="container flex-gn">
              <ul>
                <li>Filtro:</li>
                <li>
                  <input
                    className="input"
                    type="text"
                    name="filtro"
                    ref={this.filterRef}
                    onKeyUp={this.filtrado}
                  />
                </li>
                <li>
                  <input
                    type="checkbox"
                    ref={this.selAllRef}
                    onChange={this.selectType}
                  />
                </li>
              </ul>
              <h2>Bases</h2>
              <nav>
                <ul>
                  <li>
                    <Link to="#" onClick={this.agregaBase}>
                      <FontAwesomeIcon icon={faPlusSquare}  title="Agregar Base"
                      />
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          <h1 className="center">No hay Bases para mostrar</h1>
        </React.Fragment>
      );
    }
  }
}
