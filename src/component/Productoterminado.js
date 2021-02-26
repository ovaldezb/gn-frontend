import React, { Component } from 'react'
import Paginacion from './Paginacion';
import authHeader from "../services/auth-header";
import Axios from 'axios';
import Global from '../Global';
import Moment from 'react-moment';
import momento from 'moment';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck } from "@fortawesome/free-solid-svg-icons";
import NumberFormat from 'react-number-format';
import swal from 'sweetalert';
import Logo from '../assets/images/logo.png'
import Clock from 'react-live-clock';
import AuthService from '../services/auth.service';


export default class Productoterminado extends Component {
  
  filterRef = React.createRef();  
  activosRef = React.createRef();
  showTruck = false;
  isPrint= false;
  center = {textAlign:"center"}
  hide={display:'none'};
  cajasInt = 0;
  residual = 0;
  isModalActive = false;
  state = {
      lstPdrTerm:[],
      pageOfItems: [],
      lstPTEntregado:[],
      page:1,
      filtro: "",
      idSelPt: -1
      };
    right_top = {textAlign:'right',verticalAlign: 'top'};
    center_top = {textAlign:'center',verticalAlign: 'top'};
    left_top = {textAlign:'left',verticalAlign: 'top'};
  componentDidMount(props) {
    this.loadProdTerm(true);
  }

  loadProdTerm(getActivos){
    Axios.get(Global.url+'prodterm'+(getActivos?'/activo':''),{ headers: authHeader() })
      .then( res =>{
        this.setState({
          lstPdrTerm:res.data
        });
      })
      .catch(err => {
        AuthService.isExpired(err.message);
      });
  }

  deliverPT = () =>{
    var lstPTEntregado = this.state.lstPdrTerm.map(
      (mp,i) => { 
        if(document.getElementById('check'+i).checked){
          mp.index = i;
          return mp;
        }else{
          return null;
        }
      }
    ).filter(mp => mp!==null);
    this.setState({
      lstPTEntregado:lstPTEntregado
    });
    this.isModalActive = true;
  }

  filtrado = () =>{
    var filter = this.filterRef.current.value;
    var nvoArray = this.state.lstPdrTerm.filter(element =>{
      return Object.values(element).filter(item=>{ return String(item).includes(filter)}).length > 0 
    });
    this.setState({
      pageOfItems:nvoArray
    });
  }

  selectRow = (i, activar) => {
    this.showTruck = activar;
    this.setState({
      idSelPt: ((this.state.page-1)*10) + i,
    });
  };

  onChangePage = (pageOfItems,page) => {
    // update state with new page of items
    this.setState({ pageOfItems: pageOfItems, page:page });
  }

  selectType = () =>{
    if(this.activosRef.current.checked){
      this.loadProdTerm(false);
    }else{      
      this.loadProdTerm(true);
    }
  }

  entregaProductos = () =>{
    let isEmptyPzas = false;
    let of = '';
    let isEmptyRemi = false;
    
    this.state.lstPTEntregado.forEach((ptent,i)=>{
      
      if(document.getElementById('pzasent'+ptent.noConsecutivo).value === ''){
        isEmptyPzas = true;
        of = this.pad(ptent.noConsecutivo,Global.SIZE_DOC);
      }
    });
    if(isEmptyPzas){
      swal('Es necesario ingresar la cantidad de piezas a entregar para la OF: '+of);
      return;
    }
    this.state.lstPTEntregado.forEach((ptent,i)=>{
      if(document.getElementById('noremision'+ptent.noConsecutivo).value === ''){
        isEmptyRemi = true;
        of = this.pad(ptent.noConsecutivo,Global.SIZE_DOC);
      }
    });
    if(isEmptyRemi){
      swal('Es necesario ingresar la remisión la OF: '+of);
      return;
    }

    let lstPtEntDelv = this.state.lstPTEntregado.map((ptent,i) =>{
        ptent.noRemision = document.getElementById('noremision'+ptent.noConsecutivo).value;
        ptent.piezasEntregadas = document.getElementById('pzasent'+ptent.noConsecutivo).value;
        ptent.fechaRemision = momento(new Date()).format('YYYY-MM-DD HH:mm:ss.sss') ;
        return ptent;
    });
    
    Axios.put(Global.url+'prodterm/dlvr',lstPtEntDelv,{ headers: authHeader() })
    .then(res =>{
      this.isModalActive = false;
      this.setState({
        lstPTEntregado:lstPtEntDelv
      });
      this.printPT();
      this.loadProdTerm(true);
      this.state.lstPdrTerm.forEach((ptent,i)=>{
        document.getElementById('check'+i).checked = false;
      });
    })
    .catch(err=>{
      AuthService.isExpired(err.message);
    });
  }
  
  printPT = () =>{
    let printwind = window.open("");
    let estilos = '<style> '+
    '@media print{'+
     ' .table-main{'+
     '   border-collapse: collapse;'+
     '   width: 100%;'+
     '   font-size: 14px;'+
     '   font-family: Arial, Helvetica, sans-serif;'+
     '   padding: 0;'+
     ' }'+
     ' .table-0{'+
     '   border: 2px solid black;'+
     '   border-collapse: collapse;'+
     '   width: 100%;'+
     '   height: 157px;'+
     '   margin-bottom: 0px;'+
     '   margin-right: 0px;'+
     ' }'+
     ' .table-1{'+
     '   border-collapse: collapse;'+
     '   width: 101.5%;'+
     '   height: 157px;'+
     '   margin-bottom: 0px;'+
     '   margin-left: -3px;'+
     '  }'+
    ' .table-1 td{'+
    '   border: 2px solid black;'+
    ' }'+
    ' .table-2{'+
    '   border: 2px solid black;'+
    '   border-collapse: collapse;'+
    '   width: 100%;'+
    '   margin-top: -3px;'+
    '   height: 100px;'+
    '  }'+  
    ' .table-3{'+
    '   border-collapse: collapse;'+
    '   width: 100%;'+
    '   height: 350px;'+
    '   margin-top: -3px;'+
    '  }'+
    ' .table-3 td, th{'+
    '   border: 2px solid black;'+
    ' }'+
    ' .width30{'+
    '   width:30%;'+
    '  }'+
    ' .width70{'+
    '   width:70%;'+
    '  }'+
    ' .center{'+
    '  text-align:center;'+
    ' }'+
    '}'+
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

    this.setState({
      idSelPt:-1
    });
  }

  closeModal = () =>{
    this.isModalActive = false;
    this.forceUpdate();
  }

  pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
 }

  render() {
    var style={};
    if(this.state.lstPdrTerm.length > 0 && !this.isPrint){
        return(
          <React.Fragment>
            <div className="container">
              <div className="barnav">
                <div className="container flex-gn">
                  <ul>
                    <li>Filtro:</li>
                    <li>
                      <input className="input"  type="text"  name="filtro" ref={this.filterRef} onKeyUp={this.filtrado}/>
                    </li>
                    <li>
                      <input type="checkbox" ref={this.activosRef} onChange={this.selectType}/>
                    </li>
                  </ul>
                  <h2>Producto Terminado</h2>
                  <nav>
                    <ul>
                      <li>
                        {this.state.idSelPt !== -1 && this.showTruck &&
                        <Link to="#" onClick={this.deliverPT} data-toggle="modal" data-target="#exampleModal">
                          <FontAwesomeIcon icon={faTruck} size="2x" title="Entregar Producto(s) Terminado(s) seleccionado(s)" />
                        </Link>
                        }
                        {(this.state.idSelPt === -1 || !this.showTruck) &&
                        <Link to="#" >
                          <FontAwesomeIcon icon={faTruck} size="2x" style={{color:'grey'}} />
                        </Link>
                        }
                      </li>                                              
                    </ul>
                  </nav>
                </div>
              </div>
            
              <table className="table table-dark header-font table-bordered">
                <colgroup>
                  <col width="7%"/>
                  <col width="30%"/>
                  <col width="8%"/>
                  <col width="8%"/>
                  <col width="8%"/>
                  <col width="11%"/>
                  <col width="11%"/>
                  <col width="11%"/>
                  <col width="6%"/>
                </colgroup>
                <thead className="thead-dark">
                  <tr>
                    <th>No OF</th>
                    <th>Producto</th>
                    <th>OC</th>
                    <th>Lote</th>
                    <th>Piezas</th>
                    <th>Fabricación</th>
                    <th>Entrega</th>
                    <th>Estatus</th>
                    <th>Envio</th>
                  </tr>
                </thead>
              </table>
              <div className="table-ovfl tbl-lesshead">
                <table className="table table-lst table-bordered">
                  <colgroup>
                  <col width="7%"/>
                  <col width="30%"/>
                  <col width="8%"/>
                  <col width="8%"/>
                  <col width="8%"/>
                  <col width="11%"/>
                  <col width="11%"/>
                  <col width="11%"/>
                  <col width="6%"/>
                  </colgroup>
                  <tbody>
                    {
                      this.state.pageOfItems.map((prodterm,i)=>{
                        style = this.state.idSelPt === i ? "selected pointer":{};
                        return(
                          <tr key={i} onClick={() => {this.selectRow(i,(prodterm.estatus.codigo === Global.WTDEL || prodterm.estatus.codigo === Global.EEP))}}  className={style}>
                            <td>{this.pad(prodterm.noConsecutivo,Global.SIZE_DOC_RED)}</td>
                            <td>{prodterm.producto.nombre}</td>
                            <td>{prodterm.oc}</td>
                            <td>{prodterm.lote}</td>
                            <td style={this.center}><NumberFormat value={Number(prodterm.piezas)}displayType={'text'} thousandSeparator={true} title={'Piezas Entregadas:'+prodterm.piezasEntregadas}/></td>
                            <td style={this.center}><Moment format="DD/MM/YYYY">{momento(prodterm.fechaFabricacion,'YYYY-MM-DD').format('YYYY-MM-DD')}</Moment></td>
                            <td style={this.center}><Moment format="DD/MM/YYYY">{momento(prodterm.fechaEntrega,'YYYY-MM-DD').format('YYYY-MM-DD')}</Moment></td>
                            <td style={this.center} title={prodterm.cliente.nombre}>{prodterm.estatus.label}</td>
                            <td style={this.center}><input type="checkbox" id={'check'+i}/></td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
              <Paginacion items={this.state.lstPdrTerm} onChangePage={this.onChangePage} page={this.state.page}/>
            </div>
            {this.isModalActive && 
              <div className="modal fade show"  tabIndex="-1" role="dialog" style={{display:'block'}}>
              <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">Remisión</h5>
                    <button type="button" className="close" onClick={this.closeModal} data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body center-100" >
                    <div style={{border:'1px solid blue',width:'104%',marginTop:'15px'}}>
                    <table className="table" style={{width:'100%'}}>
                        <thead className="thead-dark">                      
                          <tr>
                            <th style={{textAlign:'center'}}>No OF</th>
                            <th style={{textAlign:'center'}}>Piezas a entregar</th>
                            <th style={{textAlign:'center'}}>Remisión</th>
                          </tr>
                        </thead>

                        <tbody>
                        {this.state.lstPTEntregado.map((pten,i)=>{
                          return(
                            <tr key={i}>
                              <td>{this.pad(pten.noConsecutivo,Global.SIZE_DOC)}</td>
                              <td><input type="number" className="input center" size='3' defaultValue={pten.piezas - pten.piezasEntregadas} id={'pzasent'+pten.noConsecutivo}/></td>
                              <td><input type="text"   className="input center" size='5' id={'noremision'+pten.noConsecutivo}/></td>
                            </tr>
                          );
                          
                        })}
                      </tbody>
                    </table>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={this.closeModal}>Cerrar</button>
                    <button type="button" className="btn btn-primary" onClick={this.entregaProductos}>Entregar Producto(s)</button>
                  </div>
                </div>
              </div>
            </div>
            }
            {this.state.idSelPt !==-1 && 
            <div id="print" style={{display:'none'}}>
            {this.state.lstPTEntregado.map((pt,i)=>{
            return(
              <table className="table-main" key={i}>
                <tbody>
                  <tr>
                    <td className="width70">
                      <table className="table-0" border="1">
                        <tbody>
                          <tr>
                            <td className="width30" rowSpan="3">
                              <img src={Logo} alt="" width="90%" />
                            </td>
                            <td className="width70 center"><b>Grupo Nordan S.A. de C.V.</b></td>
                          </tr>
                          <tr>
                            <td colSpan="2"><h6>FRONTERA No 12, Col A. OBREGON TEL (722)2714460/61</h6></td>
                          </tr>
                          <tr>
                            <td colSpan="2"><h6>SAN MATEO ATENCO, ESTADO DE MEXICO</h6></td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td className="width30">
                      <table className="table-1">
                        <tbody>
                          <tr>
                            <td><b>Remisión #</b></td>
                            <td className="center">{pt.noRemision}</td>
                          </tr>
                          <tr>
                            <td colSpan="2"><b>Fecha</b></td>
                          </tr>
                          <tr>
                            <td colSpan="2"><Clock format={'DD-MMMM-YYYY'} ticking={false}  /></td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <table className="table-2">
                        <colgroup>
                          <col width="20%" />
                          <col width="15%" />
                          <col width="65%" />
                        </colgroup>
                        <tbody>
                        <tr>
                          <td>&nbsp;</td>
                          <td>Cliente:</td>
                          <td>{pt.cliente.nombre}</td>
                        </tr>
                        <tr>
                          <td>&nbsp;</td>
                          <td>Direccion:</td>
                          <td>{pt.cliente.direccion}</td>
                        </tr>
                        <tr>
                          <td>&nbsp;</td>
                          <td>RFC:</td>
                          <td>{pt.cliente.rfc}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td colSpan="2">
                    <div>
                      <table className="table-3">
                        <thead>
                          <tr>
                            <th>Cantidad</th>
                            <th>Clave</th>
                            <th>Descripcion</th>
                            <th>OC</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr key={i}>
                            <td style={this.center_top}>{pt.piezasEntregadas}</td>
                            <td style={this.center_top}>{pt.clave}</td>
                            <td style={this.left_top}>
                              <p>{pt.producto.nombre}</p>
                              <p>Lote:{pt.lote}</p>
                              <p>
                                {Math.floor(pt.piezas / pt.producto.prodxcaja)} CAJAS C/{pt.producto.prodxcaja} PZAS&nbsp;
                                {(pt.piezas - (Math.floor(pt.piezas / pt.producto.prodxcaja))*pt.producto.prodxcaja) > 0 &&
                                  <React.Fragment>
                                    C/UNA MAS CON UN RESTO DE {pt.piezas - (Math.floor(pt.piezas / pt.producto.prodxcaja))*pt.producto.prodxcaja} PZAS
                                  </React.Fragment>
                                }
                              </p>
                            </td>
                            <td style={this.center_top}>{pt.oc}</td>
                          </tr>  
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
                </tbody>
              </table>
              );
            })}
            </div>
            }
          </React.Fragment>
        );
      }else{
        return (
            <React.Fragment>
              <div className="container">
                <div className="barnav">
                  <div className="container flex-gn">
                    <ul>
                      <li>Filtro:</li>
                      <li>
                        <input className="input"  type="text"  name="filtro" ref={this.filterRef} onKeyUp={this.filtrado}/>
                      </li>
                      <li>
                        <input type="checkbox" ref={this.activosRef} onChange={this.selectType}/>
                      </li>
                    </ul>
                    <h2>Producto Terminado</h2>
                    <nav>
                      
                    </nav>
                  </div>
                </div>
                  <h2 className="center">No hay producto terminado para mostrar</h2>
                </div>
            </React.Fragment>
        )
      }
  }
}
