import Axios from "axios";
import React, { Component } from "react";
import Global from "../Global";
import authHeader from "../services/auth-header";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlusSquare,
  faEdit,
  faTrash, faClipboardCheck,faPrint
} from "@fortawesome/free-solid-svg-icons";
import Paginacion from './Paginacion';
import Addordenfab from "./Addordenfab";
import NumberFormat from 'react-number-format';
import swal from "sweetalert";
import axios from 'axios';
import Moment from 'react-moment';
import momento from 'moment';
import Logo from '../assets/images/logo.png'
import AuthService from '../services/auth.service';

export default class Ordenesfabricacion extends Component {
  filterRef = React.createRef();
  selAllRef = React.createRef();
  isActive = true;
  center = {textAlign:"center"}
  displayAdd = false;
  isAdd = true;
  isComplete = false;
  state = {
    lstOF: [],
    pageOfItems: [],
    page:1,
    filtro: "",
    status: "",
    idSelOf: -1,
    ordenfab:{},
    selected:false,
    oc:{}
  };

  componentDidMount() {
      this.loadAactiveOF(false);
  }

  loadAactiveOF(estatus) {
    Axios.get(Global.url + 'ordenfab/active/'+estatus, { headers: authHeader() })
      .then((res) => {
        if (res.data.length > 0) {
          this.setState({
            lstOF: res.data,
            idSelOf:-1
          });
        }else{
          this.setState({
            lstOF: [],
          });
        }
      })
      .catch(err=>{
        AuthService.isExpired(err.message);
      });
  }

  selectType = () =>{
    this.loadAactiveOF(this.selAllRef.current.checked);
    
  }

  addOF = () => {
      this.displayAdd = true;
      this.forceUpdate();
  }

  cancelarAdd = (ordenfab) =>{
    this.displayAdd = false;
    this.isAdd =true;
    if(ordenfab){
      this.loadAactiveOF(false);
    }
    this.forceUpdate();
  }

  completeOF = () =>{
    swal({
      title: "Desea completar la Orden de Fabricacón: "+this.pad(this.state.pageOfItems[this.state.idSelOf].noConsecutivo,Global.SIZE_DOC)+"?",
      text: "Una vez completado, pasará a Producto Terminado",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        axios.get(Global.url+'ordenfab/complete/'+this.state.pageOfItems[this.state.idSelOf].id,{ headers: authHeader() })
            .then(res=>{
              
              //var mp = this.state.lstMatPrim[this.state.idSelMp];
              //Bitacora(Global.DEL_MATPRIM,JSON.stringify(mp),'');
              swal("La Orden de Fabricación ha sido completada!", {
                icon: "success",
              });
              this.loadAactiveOF();
            }).catch(
              err =>{
                AuthService.isExpired(err.message);
              }
            );
      } 
    });
  }

  updateOf = () =>{
    this.displayAdd = true;
    this.isAdd = false;
    this.setState({
      ordenfab:this.state.pageOfItems[this.state.idSelOf]
    });
  }

  deleteOf = () =>{
    swal({
      title: "Esta seguro que desea eliminar la OF "+this.pad(this.state.lstOF[((this.state.page-1)*10)+this.state.idSelOf].noConsecutivo,Global.SIZE_DOC)+"?",
      text: "Una vez eliminada, no se podra recuperar",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        axios.delete(Global.url+'ordenfab/'+this.state.lstOF[((this.state.page-1)*10)+this.state.idSelOf].id,{ headers: authHeader() })
            .then(res=>{
              swal("La Orden de Fabricación ha sido eliminada!", {
                icon: "success",
              });
              this.loadAactiveOF();
            }).catch(
              err =>{
                AuthService.isExpired(err.message);
              }
            );
      } 
    });
  }

  printOf = () =>{
    if(this.state.idSelOf === -1){
      swal("Debe seleccionar una Orden de Fabricación");
      return;
    }
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
  }

  filtrado = () =>{
    var filter = this.filterRef.current.value;
    var nvoArray = this.state.lstOF.filter(element =>{
      return Object.values(element).filter(item=>{ return String(item).includes(filter)}).length > 0 
    });
    this.setState({
      pageOfItems:nvoArray
    });
  }

  selectRow = (i) => {
    if(this.state.lstOF[i].estatus === Global.CMPLT){
      this.isActive = false;
    }else{
      this.isActive = true;
    }
    this.setState({
      idSelOf: i
    });
  };

  onChangePage = (pageOfItems,page) => {
    // update state with new page of items
    this.setState({ pageOfItems: pageOfItems, page:page });
  }

  pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
 }

  render() {
    var cantidadTotal = 0;
    const OF = this.state.pageOfItems[this.state.idSelOf];
    var style = {};
    if (this.state.lstOF.length > 0) {
      var lstOrdFabPI = this.state.pageOfItems.map((ordfab, i) => {
        if (this.state.idSelOf === i) {
          style = "selected pointer";
          if(ordfab.estatus===Global.TEP){
            this.isComplete = true;
          }else{
            this.isComplete = false;
          }
        } else{
          style = {};
        }
        
        return (
          <tr key={i} onClick={() => {this.selectRow(i)}}  className={style}>
            <td style={this.center} title={'Comentarios: '+ordfab.observaciones}>{this.pad(ordfab.noConsecutivo,Global.SIZE_DOC)}</td>
            <td style={this.center}>{ordfab.oc.oc}</td>
            <td style={this.center}>{ordfab.lote}</td>
            <td style={this.center}><NumberFormat value={Number(ordfab.piezas)}displayType={'text'} thousandSeparator={true}/></td>
            <td style={this.center}>{ordfab.estatus}</td>
            <td style={this.center}>
              <Link to="#" onClick={this.completeOF} >
              {this.isComplete && this.state.idSelOf === i &&
                <FontAwesomeIcon icon={faClipboardCheck} size="2x" className="icon" />
              }
              </Link>
            </td>
          </tr>
        );
      });
      return (
        <React.Fragment>
          {this.displayAdd && 
            <Addordenfab cancelar={this.cancelarAdd} ordenfab={this.state.ordenfab} tipo={this.isAdd}/>
          }
          {!this.displayAdd && (
            <React.Fragment>
              <div className="barnav">
                <div className="container flex-gn">
                  <ul>
                    <li>Filtro:</li>
                    <li><input className="input"  type="text"  name="filtro" ref={this.filterRef} onKeyUp={this.filtrado}/></li>
                    <li><input type="checkbox" ref={this.selAllRef} onChange={this.selectType} /></li>
                  </ul>
                  <h2>Orden de Fabricación</h2>
                  <nav>
                    <ul>
                      <li>
                        <Link to="#" onClick={this.addOF} title="Agrega una nueva OF">
                          <FontAwesomeIcon icon={faPlusSquare} />
                        </Link>
                      </li>
                      <li>
                        {(this.state.idSelOf === -1  || this.state.pageOfItems[this.state.idSelOf].estatus!==Global.TEP) &&
                          <Link to="#" title="Actualiza la OF Seleccionada">
                          <FontAwesomeIcon icon={faEdit} style={{color:'grey'}} />
                          </Link>
                        }
                        {(this.state.idSelOf !== -1 && this.state.pageOfItems[this.state.idSelOf].estatus===Global.TEP) &&
                          <Link to="#" onClick={this.updateOf} title="Actualiza la OF Seleccionada">
                          <FontAwesomeIcon icon={faEdit} />
                          </Link>                         
                        }
                      </li>
                      <li>
                        <Link to="#" onClick={this.printOf} title="Imprime la OF Seleccionada">
                          <FontAwesomeIcon icon={faPrint} />
                        </Link>
                      </li>
                      <li>
                        {(this.state.idSelOf === -1  || this.state.pageOfItems[this.state.idSelOf].estatus!==Global.TEP) &&
                          <Link to="#" title="Elimina la OF Seleccionada">
                          <FontAwesomeIcon icon={faTrash} style={{color:'grey'}} />
                          </Link>
                        }
                        
                        {(this.state.idSelOf !== -1 && this.state.pageOfItems[this.state.idSelOf].estatus===Global.TEP) &&
                          <Link to="#" onClick={this.deleteOf} title="Elimina la OF Seleccionada">
                          <FontAwesomeIcon icon={faTrash} />
                          </Link>
                        }
                      </li>
                      <li>                        
                        <Link to="#" onClick={this.completeOF} title="Completa la OF Seleccionada">
                        {!this.isComplete &&
                          <FontAwesomeIcon icon={faClipboardCheck} style={{color:'grey'}}/>
                        }
                        {this.isComplete &&
                          <FontAwesomeIcon icon={faClipboardCheck} />
                        }
                        </Link>                        
                      </li>
                      
                    </ul>
                  </nav>
                </div>
              </div>
              <table className="table table-dark header-font">
                <colgroup>
                  <col width="18%"/>
                  <col width="18%"/>
                  <col width="18%"/>
                  <col width="18%"/>
                  <col width="18%"/>
                  <col width="10%"/>
                </colgroup>
                <thead className="thead-dark">                   
                  <tr>
                    <th scope="col">No de Orden</th>
                    <th scope="col">OC</th>
                    <th scope="col">Lote</th>
                    <th scope="col">Piezas</th>
                    <th scope="col">Estatus</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
              </table>
              <div className="table-ovfl table-hover tbl-lesshead">
                <table className="table table-bordered table-lst" id="ordenFabricacion">
                  <colgroup>
                  <col width="18%"/>
                  <col width="18%"/>
                  <col width="18%"/>
                  <col width="18%"/>
                  <col width="18%"/>
                  <col width="10%"/>
                  </colgroup>
                  <tbody>{lstOrdFabPI}</tbody>
                </table>              
              </div>
              <div className="center">
                <Paginacion items={this.state.lstOF} onChangePage={this.onChangePage} page={this.state.page} />
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
                              <td className="right bottom center">{this.pad(OF.noConsecutivo,Global.SIZE_DOC)}</td>
                          </tr>
                          <tr>
                              <td className="right font14">PRODUCTO</td>
                              <td className="right font14">CLAVE</td>
                              <td className="right font14">CLIENTE</td>
                              <td className="right font14">CANTIDAD PZAS</td>
                          </tr>
                          <tr>
                              <td className="right bottom">{OF.oc.producto.nombre}</td>
                              <td className="right bottom">{OF.oc.clave}</td>
                              <td className="right bottom">{OF.oc.cliente.nombre}</td>
                              <td className="right bottom center"><NumberFormat value={Number(OF.piezas)} displayType={'text'} thousandSeparator={true}/></td>
                          </tr>
                          <tr>
                              <td className="right font14">FECHA ENTREGA</td>
                              <td className="right font14">NUMERO LOTE</td>
                              <td className="right font14">FECHA</td>
                              <td className="right font14">FIRMA A. DIR:</td>
                          </tr>
                          <tr>
                              <td className="right bottom"><Moment format="DD/MM/YYYY">{momento(OF.oc.fechaEntrega,'MM-DD-YYYY').format('YYYY-MM-DDTHH:mm:ss')}</Moment></td>
                              <td className="right bottom">{OF.lote}</td>
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
                              <td className="top bottom right center">&nbsp;</td>
                              <td className="top bottom right center">LOTE</td>
                              <td className="top bottom right center">&nbsp;</td>
                          </tr>
                          {
                            OF.matprima.map((mp,i)=>{
                              var mpObjetoFormula = OF.oc.producto.materiaPrimaUsada.filter(mpu => mpu.materiaprimadisponible.codigo===mp.codigo);
                              cantidadTotal += mp.cantidad;
                              return(
                                <tr key={i}>
                                  <td className="left right">{mp.nombre}</td>
                                  <td className="right center"><NumberFormat value={Number(mpObjetoFormula[0].porcentaje/100)} format="#####" displayType={'text'}/></td>
                                  <td className="right center">{Number(mpObjetoFormula[0].porcentaje).toFixed(2)}</td>
                                  <td className="right center">{Number(mp.cantidad).toFixed(2)}</td>
                                  <td className="right">{mp.nombre}</td>
                                  <td className="right center">{mp.lote}</td>
                                  <td className="right">
                                    <table style={{width: '100%'}}>
                                      <tbody>
                                        <tr>
                                          <td className="left right top bottom">&nbsp;</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              );
                            })
                          }  
                          <tr>
                              <td className="left top right bottom">Total</td>
                              <td className="right top bottom center">1</td>
                              <td className="right top bottom center">100%</td>
                              <td className="right top bottom center">{Number(cantidadTotal).toFixed(2)}</td>
                              <td className="right top bottom">&nbsp;</td>                              
                              <td className="right top bottom" colSpan="2">Tamaños del Lote</td>
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
    } else if(this.displayAdd){
        return  <Addordenfab cancelar={this.cancelarAdd} ordenfab={this.state.ordenfab} tipo={this.isAdd}/>
      }else {
      return (
          <React.Fragment>
          <div className="barnav">
              <div className="container flex-gn">
                <ul>
                  <li>Filtro:</li>
                  <li><input className="input"  type="text"  name="filtro" ref={this.filterRef} onKeyUp={this.filtrado}/></li>
                  <li><input type="checkbox" ref={this.selAllRef} onChange={this.selectType} /></li>
                </ul>
                <h2>Orden de Fabricación</h2>
                <nav>
                  <ul>
                    <li>
                      <Link to="#" onClick={this.addOF}><FontAwesomeIcon icon={faPlusSquare} /></Link>
                    </li>
                  </ul>
                </nav>
              </div>
          </div>
          <h1 className="center">No hay Ordenes de Fabricación para mostrar</h1>
          </React.Fragment>
      );
    }
  }
}
