import React, { Component } from "react";
import Axios from "axios";
import Global from "../Global";
import authHeader from "../services/auth-header";
import AuthService from "../services/auth.service";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusSquare, faEdit, faTrash, faCheckDouble, faDollyFlatbed, faFlagCheckered, faPrint } from "@fortawesome/free-solid-svg-icons";
import Addbase from "./Addbase";
import swal from "sweetalert";
import NumberFormat from 'react-number-format';
import Logo from '../assets/images/logo.png'
import Moment from 'react-moment';

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
    rendimiento:'',
    formula:[]
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
    Axios.get(Global.url+'prodisp/'+this.state.lstBases[i].codigo,{ headers: authHeader() })
    .then(res=>{
      this.setState({
        formula:res.data[0].materiaPrimaUsada
      });
    })
    .catch(err=>{
      AuthService.isExpired(err.message);
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

  cierraBase = (i)=>{
    if(this.state.lstBases[this.state.idSelBase].estatus === Global.PCLOSE){
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
    base.estatus = Global.CMPLT;
    base.comentarios = this.state.comentarios;
    base.rendimiento = this.state.rendimiento;
    Axios.put(Global.url+'bases/complete/'+this.state.lstBases[this.state.idSelBase].id,base,{ headers: authHeader() })
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

  productionEnd = () =>{
    swal({
      title: "La producción de esta base ha concluido?",
      text: this.state.lstBases[this.state.idSelBase].lote,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        let base = this.state.lstBases[this.state.idSelBase];
        base.estatus = Global.DISP;
        base.aprobado = true;
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

  printBase = () =>{
    let printwind = window.open("");
    let estilos = '<style> '+
    '@media print{'+
    '  .col1{'+
    '      width: 50px;'+
    '      text-align: center;'+
    '  }'+
    '  .col2{'+
    '      width: 150px;'+
    '      text-align: center;'+
    '  }'+
    '  .col3{'+
    '      width: 220px;'+
    '  }'+
    '  .center{'+
    '      text-align: center;'+
    '  }'+
    '  .left{'+
    '      border-left: 2px solid black;'+
    '  }'+
    '  .right{'+
    '      border-right: 2px solid black;'+
    '  }'+
    '  .top{'+
    '      border-top: 2px solid black;'+
    '  }'+
    '  .bottom{'+
    '      border-bottom: 2px solid black;'+
    '  }'+
    '  .font14{'+
    '      font-size: 14px;'+
    '  }'+
    '  .font12{'+
    '      font-size: 12px;'+
    '  }'+
    '} '  + 
    '</style>';
    var is_chrome = Boolean(window.chrome);
    var is_safari = Boolean(window.safari);
    printwind.document.write(estilos+' '+document.getElementById('print').innerHTML);
    if (is_chrome) {
      printwind.print();      
    }
    else if (is_safari) {
      printwind.print();
      setTimeout(()=>{
        printwind.close();
      },1000);
    }
    else {
      printwind.print();
      printwind.close();
    }
    this.setState({idSelBase:-1});
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
    var cantidadTotal = 0;
    var materia = new Map();
    var BASE = this.state.lstBases[this.state.idSelBase];
    if (this.state.lstBases.length > 0) {
      if(this.state.formula.length >0 && BASE){
        BASE.materiaPrimaOrdFab.forEach(elem=>{
          if(materia.has(elem.codigo)){
            materia.set(elem.codigo,materia.get(elem.codigo)+elem.cantidad)
          }else{
            materia.set(elem.codigo,elem.cantidad);
          }
        });
      var lstRowsBases = BASE.materiaPrimaOrdFab.map((elem,i)=>{
        cantidadTotal += elem.cantidad;
        var mp = this.state.formula.filter(f=>{
          return (f.materiaprimadisponible.codigo === elem.codigo);
        });
        
        return (
          <tr key={i}>
            <td className="left right bottom font12">{elem.nombre}</td>
            <td className="right center bottom font12">{Number(mp[0].porcentaje * elem.cantidad / materia.get(elem.codigo) / 100).toFixed(3)}</td>
            {mp[0] && <td className="right center bottom font12">{mp[0].porcentaje * elem.cantidad / materia.get(elem.codigo)}</td>}
            <td className="right center bottom font12">{elem.cantidad}</td>
            <td className="right bottom center font12">{elem.codigo}</td>
            <td className="right center bottom font12">{elem.lote}</td>
            <td className="right bottom">
              <table style={{border:'2px solid black',width:'100%'}}>
                <tbody>
                  <tr>
                    <td>&nbsp;</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        );
      });
      }else{
        BASE = {};
      }
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
                    {((this.state.idSelBase === -1 ) || this.state.lstBases[this.state.idSelBase].estatus !== Global.OPEN) &&
                      <Link to="#" style={{color:'grey'}} title="Edita una base">
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                    }
                    {(this.state.idSelBase !== -1 && this.state.lstBases[this.state.idSelBase].estatus === Global.OPEN) && 
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
                          <FontAwesomeIcon icon={faCheckDouble} style={{color:'grey'}} title="Aprobar Base"/>
                        </Link>
                        }
                        {(this.state.idSelBase !== -1 && this.state.lstBases[this.state.idSelBase].estatus === Global.OPEN) &&
                        <Link to="#" onClick={this.aproveBase} >
                        <FontAwesomeIcon icon={faCheckDouble} title="Aprobar Base"/>
                        </Link>
                        }
                    </li>
                    <li>
                        {((this.state.idSelBase === -1 ) || this.state.lstBases[this.state.idSelBase].estatus !== Global.TEP) &&
                        <Link to="#" >
                          <FontAwesomeIcon icon={faDollyFlatbed} style={{color:'grey'}} title="Producción Terminada"/>
                        </Link>
                        }
                        {(this.state.idSelBase !== -1 && this.state.lstBases[this.state.idSelBase].estatus === Global.TEP) &&
                        <Link to="#" onClick={this.productionEnd} >
                        <FontAwesomeIcon icon={faDollyFlatbed} title="Producción Terminada"/>
                        </Link>
                        }
                    </li>
                    <li>
                    {((this.state.idSelBase === -1 ) || this.state.lstBases[this.state.idSelBase].estatus !== Global.PCLOSE) &&
                      <Link to="#" >
                        <FontAwesomeIcon icon={faFlagCheckered} style={{color:'grey'}} title="Cerrar Base" />
                      </Link>
                      }
                      {(this.state.idSelBase !== -1 && this.state.lstBases[this.state.idSelBase].estatus === Global.PCLOSE) &&
                      <Link to="#" onClick={() => this.cierraBase(this.state.idSelBase)}>
                        <FontAwesomeIcon icon={faFlagCheckered} title="Cerrar Base" />
                      </Link>
                      }
                    </li>
                    <li>
                        {this.state.idSelBase === -1 && 
                        <Link to="#"  title="Imprime la Base seleccionada">
                          <FontAwesomeIcon icon={faPrint} style={{color:'grey'}}/>
                        </Link>
                        }
                        {this.state.idSelBase !== -1 && 
                        <Link to="#" onClick={this.printBase} title="Imprime la Base seleccionada">
                          <FontAwesomeIcon icon={faPrint} />
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
                      <tr key={i} onClick={() =>{this.selectRow(i)}} className={this.style}>
                        <td style={{textAlign:'center'}}>{i+1}</td>
                        <td>{base.nombre}</td>
                        <td style={{textAlign:'center'}}>{base.lote}</td>
                        <td style={{textAlign:'center'}}>{Number(base.cantidadRestante - base.apartado).toFixed(2)}</td>
                        <td style={{textAlign:'center'}}>{Number(base.cantidadRestante).toFixed(2)}</td>
                        <td style={{textAlign:'center'}}>{base.estatus}</td>
                      </tr>
                    )
                  })}</tbody>
                </table>              
              </div>
              {this.state.idSelOf !== -1 &&
              <div id="print" style={{display:'none'}}>
                <table>
                  <tbody>
                  <tr>
                    <td>
                      <table style={{width: "100%",borderCollapse:'separate', borderSpacing:'0em'}}>
                        <tbody>
                          <tr>
                              <td rowSpan="7" className="col1 right top bottom left">
                              <img src={Logo} alt="" width="90%" />
                              </td>
                          </tr>
                          <tr>
                              <td rowSpan="2" colSpan="3" className="col2 right top bottom">GRUPO NORDAN S.A de C.V.</td>
                              <td className="col3 right top font14">ORDEN DE FABRICACION</td>
                          </tr>
                          <tr>
                              <td className="right bottom center">-</td>
                          </tr>
                          <tr>
                              <td className="right font14">PRODUCTO</td>
                              <td className="right font14">CLAVE</td>
                              <td className="right font14">CLIENTE</td>
                              <td className="right font14">CANTIDAD PZAS</td>
                          </tr>
                          <tr>
                              <td className="right bottom">{BASE.nombre}</td>
                              <td className="right bottom">{BASE.codigo}</td>
                              <td className="right bottom">Grupo Nordan</td>
                              <td className="right bottom center"><NumberFormat value={Number(BASE.cantidadOriginal)} displayType={'text'} thousandSeparator={true}/></td>
                          </tr>
                          <tr>
                              <td className="right font14">FECHA ENTREGA</td>
                              <td className="right font14">NUMERO LOTE</td>
                              <td className="right font14">FECHA</td>
                              <td className="right font14">FIRMA A. DIR:</td>
                          </tr>
                          <tr>
                              <td className="right bottom"></td>
                              <td className="right bottom">{BASE.lote}</td>
                              <td className="right bottom"><Moment format="DD/MM/YYYY">{new Date()}</Moment></td>
                              <td className="right bottom">FECHA:</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      &nbsp;
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <table style={{width: '100%',borderCollapse:'separate', borderSpacing:'0em'}}>
                        <colgroup>
                            <col width="20%"/>
                            <col width="15%"/>
                            <col width="15%"/>
                            <col width="15%"/>
                            <col width="20%"/>
                            <col width="10%"/>
                            <col width="5%"/>
                        </colgroup>
                        <tbody>
                          <tr>
                              <td className="top bottom left right">Integracion de Materia Prima</td>
                              <td className="top bottom right center">&nbsp;</td>
                              <td className="top bottom right center">%</td>
                              <td className="top bottom right center">KGS</td>
                              <td className="top bottom right center">CLAVE</td>
                              <td className="top bottom right center">LOTE</td>
                              <td className="top bottom right center">&nbsp;</td>
                          </tr>
                          
                          {lstRowsBases}
                          <tr>
                              <td className="left right bottom">Total</td>
                              <td className="right  bottom center">1</td>
                              <td className="right  bottom center">100%</td>
                              <td className="right  bottom center">{Number(cantidadTotal).toFixed(2)}</td>
                              <td className="right  bottom">&nbsp;</td>                              
                              <td className="right  bottom font12" colSpan="2">Tamaños del Lote</td>
                          </tr> 
                        </tbody>               
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td>&nbsp;</td>
                  </tr>
                  <tr>
                    <td>
                      <table style={{width: '100%',borderCollapse:'separate', borderSpacing:'0em'}}>
                        <tbody>
                          <tr>
                            <td className="left right top">
                              Observaciones
                            </td>
                          </tr>
                          <tr>
                            <td className="left right bottom">&nbsp;</td>
                          </tr>
                          <tr>
                            <td className="left right ">&nbsp;</td>
                          </tr>
                          <tr>
                            <td className="left right bottom">&nbsp;</td>
                          </tr>
                          <tr>
                            <td className="left right ">&nbsp;</td>
                          </tr>
                          <tr>
                            <td className="left right bottom">&nbsp;</td>
                          </tr>
                          <tr>
                            <td className="left right ">&nbsp;</td>
                          </tr>
                          <tr>
                            <td className="left right bottom">&nbsp;</td>
                          </tr>
                          <tr>
                            <td className="left right ">&nbsp;</td>
                          </tr>
                          <tr>
                            <td className="left right bottom">&nbsp;</td>
                          </tr>
                          <tr>
                            <td className="left right ">&nbsp;</td>
                          </tr>
                          <tr>
                            <td className="left right bottom">&nbsp;</td>
                          </tr>
                          <tr>
                            <td className="left right ">&nbsp;</td>
                          </tr>
                          <tr>
                            <td className="left right bottom">&nbsp;</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
              }
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
