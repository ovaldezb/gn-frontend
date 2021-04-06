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
      lstSelected:[],
      lstDirecciones:[],
      page:1,
      filtro: "",
      idSelPt: -1,
      lstTipoEntrega:[]
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
        let selected = [];
        res.data.forEach((pt,i)=>{
          selected[i] = false;
        });
        this.setState({
          lstPdrTerm:res.data,
          lstSelected:selected,
          
        });
      })
      .catch(err => {
        AuthService.isExpired(err.message);
      });
  }

  deliverPT = () =>{
    let lstte=[];
    let direcciones=[];
    
    var lstPTEntregado = this.state.lstPdrTerm.map(
      (mp,i) => { 
        if(document.getElementById('check'+i).checked){
          lstte[i]=Global.E;
          mp.index = i;
          direcciones[i]=0;
          return mp;
        }else{
          return null;
        }
      }
    ).filter(mp => mp!==null);

    this.setState({
      lstPTEntregado:lstPTEntregado,
      lstTipoEntrega:lstte,
      lstDirecciones:direcciones
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
    let selected = this.state.lstSelected;
    selected[i] = !this.state.lstSelected[i];
    this.setState({
      idSelPt: i,
      lstSelected:selected
    });
    document.getElementById('check'+i).checked = selected[i];
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

  entregaProductos = async () =>{
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

    /* Validar repetidos en la remision al solicitarlos */
    let arrayRemision = this.state.lstPTEntregado.map((ptent,i)=>{
      return document.getElementById('noremision'+ptent.noConsecutivo).value;
    })
    let duplicados = [];
    let sortedArray = arrayRemision.sort();
    for(let i=0;i<sortedArray.length;i++){
      if(sortedArray[i+1]===sortedArray[i]){
        duplicados.push(sortedArray[i]);
      }
    }
    
    if(duplicados.length === 1){
      swal('La remision '+duplicados[0]+' está duplicada');
      return;
    }else if(duplicados.length > 1){
      swal('Las remisiones '+duplicados.toString()+' estan duplicadas');
      return;
    }

    /* Validar las remisiones en la BD */
    const existen = await this.validaRemision(arrayRemision);
    if(existen.length === 1){
      swal('La remision '+existen[0]+' está duplicada');
      return;
    }else if(existen.length > 1){
      swal('Las remisiones '+existen.toString()+' estan duplicadas');
      return;
    }

    let lstPtEntDelv = this.state.lstPTEntregado.map((ptent,i) =>{
        ptent.noRemision = document.getElementById('noremision'+ptent.noConsecutivo).value;
        ptent.piezasEntregadas = document.getElementById('pzasent'+ptent.noConsecutivo).value;
        ptent.fechaRemision = momento(new Date()).format('YYYY-MM-DD HH:mm:ss.sss') ;
        ptent.tipoEntrega = this.state.lstTipoEntrega[i] === Global.E ? Global.ENTREGA : Global.MERMA;
        ptent.idDireccion = this.state.lstDirecciones[i];
        return ptent;
    });
    
    const arr = this.state.lstTipoEntrega.filter(te=>te===Global.E);
    Axios.put(Global.url+'prodterm/dlvr',lstPtEntDelv,{ headers: authHeader() })
    .then(res =>{
      this.isModalActive = false;
      this.setState({
        lstPTEntregado:lstPtEntDelv
      });
      if(arr.length){
        this.printPT();
      }
      
      this.loadProdTerm(true);
      this.state.lstPdrTerm.forEach((ptent,i)=>{
        document.getElementById('check'+i).checked = false;
      });
    })
    .catch(err=>{
      AuthService.isExpired(err.message);
    });
  }

  validaRemision = async (arrayRemision) =>{
    let arrayRemExiste = [];
    for(let i=0;i<arrayRemision.length;i++){
      const result = await  Axios.get(Global.url+'prodent/rem/'+arrayRemision[i],{ headers: authHeader() });
      if(result.data.id){
        arrayRemExiste.push(arrayRemision[i]);
      }
    }
    return arrayRemExiste;
  }
  
  printPT = () =>{
    let printwind = window.open("");
    let estilos = '<style> '+
    '@media print{'+
    ' .left{'+
    '   border-left: 2px solid black;'+
    ' }'+
    ' .right{'+
    '   border-right: 2px solid black;'+
    ' }'+
    ' .top{'+
    '   border-top: 2px solid black;'+
    ' }'+
    ' .bottom{'+
    '   border-bottom: 2px solid black;'+
    ' }'+
    ' .font14{'+
    '   font-size: 14px;'+
    ' }'+
    ' .font12{'+
    '   font-size: 12px;'+
    ' }'+
    ' .font10{'+
    '   font-size: 10px;'+
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

  cambiaTipoEntrega = (index)=>{
    let lstte = this.state.lstTipoEntrega;
    lstte[index]=document.getElementById('selTE'+index).value
    this.setState({
      tipoEntrega:document.getElementById('selTE'+this.state.idSelPt).value,
      lstTipoEntrega:lstte
    });
  }

  cambiaDireccion =(index)=>{
    let direcciones = this.state.lstDirecciones;
    direcciones[index] = document.getElementById('dire'+index).value;
    this.setState({
      lstDirecciones:direcciones
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
                <table className="table table-lst table-bordered table-hover" style={{cursor:'pointer'}}>
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
                        style = this.state.lstSelected[i] ? "selected pointer":{};
                        return(
                          <tr key={i} onClick={() => {this.selectRow(i,(prodterm.estatus.codigo === Global.WTDEL || prodterm.estatus.codigo === Global.EEP))}}  className={style}>
                            <td className="font12">{this.pad(prodterm.noConsecutivo,Global.SIZE_DOC_RED)}</td>
                            <td className="font12">{prodterm.producto.nombre}</td>
                            <td className="font12">{prodterm.oc}</td>
                            <td className="font12">{prodterm.lote}</td>
                            <td className="font12" style={this.center}><NumberFormat value={Number(prodterm.piezas)}displayType={'text'} thousandSeparator={true} title={'Piezas Entregadas:'+prodterm.piezasEntregadas}/></td>
                            <td className="font12" style={this.center}><Moment format="DD-MMM-YYYY">{momento(prodterm.fechaFabricacion,'YYYY-MM-DD').format('YYYY-MM-DD')}</Moment></td>
                            <td className="font12" style={this.center}><Moment format="DD-MMM-YYYY">{momento(prodterm.fechaEntrega,'YYYY-MM-DD').format('YYYY-MM-DD')}</Moment></td>
                            <td className="font12" style={this.center} title={prodterm.cliente.nombre}>{prodterm.estatus.label}</td>
                            <td className="font12" style={this.center}><input type="checkbox" id={'check'+i}/></td>
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
              <div className="modal-dialog modal-dialog-centered" style={{maxWidth:'800px'}} role="document">
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
                            <th className="font12" style={{textAlign:'center'}}>No OF</th>
                            <th className="font12" style={{textAlign:'center'}}>Piezas a entregar</th>
                            <th className="font12" style={{textAlign:'center'}}>Remisión</th>
                            <th className="font12" style={{textAlign:'center'}}>Tipo</th>
                            <th className="font12" style={{textAlign:'center'}}>Dirección</th>
                          </tr>
                        </thead>
                        <tbody>
                        {this.state.lstPTEntregado.map((pten,i)=>{
                          return(
                            <tr key={i}>
                              <td>{this.pad(pten.noConsecutivo,Global.SIZE_DOC-2)}</td>
                              <td className="font12"><input type="number" className="input center" size='3' defaultValue={pten.piezas - pten.piezasEntregadas} id={'pzasent'+pten.noConsecutivo}/></td>
                              <td className="font12"><input type="text"   className="input center" size='5' id={'noremision'+pten.noConsecutivo}/></td>
                              <td>
                                <select className="custom-select font12" id={'selTE'+i} onChange={()=>this.cambiaTipoEntrega(i)}>
                                  <option value={Global.E}>Entrega</option>
                                  <option value={Global.M}>Merma</option>
                                </select>
                              </td>
                              <td className="font12">
                              {(this.state.lstTipoEntrega[i]===Global.E) &&
                                <select className="custom-select font12" id={'dire'+i} onChange={()=>this.cambiaDireccion(i)}>
                                {pten.cliente.direccion.map((dir,i)=>{
                                  return(
                                    <option key={i} value={i}>{dir}</option>
                                  );
                                })}
                              </select>
                              }
                              </td>
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
            if(this.state.lstTipoEntrega[i]==='M'){
              return ('');
            }else  
            return(
              <React.Fragment>
              <table style={{borderCollapse:'separate', borderSpacing:'0em'}} key={i} >
                <tr>
                  <td style={{width: '4.0cm'}} className="left top bottom" colSpan="2" rowSpan="3">
                    <img src={Logo} alt="" width="90%"/>
                  </td>
                  <td style={{width: '9.6cm', height: '0.5cm'}} className="top right font12" colSpan="7"><b>GRUPO NORDAN S.A. DE C.V.</b></td>
                  <td style={{width: '1.8cm'}} className="top bottom right font12" >Remision #</td>
                  <td style={{width: '2.0cm'}} className="top bottom right font12">{pt.noRemision}</td>
                </tr>
                <tr>
                  <td className="font12 right" style={{width:'0.6cm'}} colSpan="7">FRONTERA No 12, Col A. OBREGON TEL (722)2714460/61</td>
                  <td colspan="2" className="font12 right bottom">FECHA</td>
                </tr>
                <tr>
                  <td className="font12 bottom right" style={{width:'0.5cm'}} colSpan="7">SAN MATEO ATENCO, ESTADO DE MEXICO</td>
                  <td colspan="2" className="font12 bottom right"><Clock format={'DD-MM-YYYY'} ticking={false}  /></td>
                </tr>
                <tr>
                  <td className="left" style={{width: '2.0cm', height: '0.5cm'}}>&nbsp;</td>
                  <td className="font12" style={{width: '2.0cm'}}>CLIENTE</td>
                  <td className="right font12" colSpan="9">{pt.cliente.nombre}</td>
                </tr>
                <tr>
                  <td className="left bottom" style={{width: '2.0cm', height: '0.5cm'}}>&nbsp;</td>
                  <td className="font12 bottom" style={{width: '2.0cm'}}>DIRECCION</td>
                  <td className="bottom right font12" colSpan="9">{pt.cliente.direccion[this.state.lstDirecciones[i]]}</td>
                </tr>
                <tr>
                  <td className="font12 left bottom right" style={{height: '0.5cm'}}>CANTIDAD</td>
                  <td className="font12 bottom right">CLAVE</td>
                  <td className="font12 bottom right" colSpan="8">DESCRIPCION</td>
                  <td className="font12 bottom right" style={{textAlign: 'center'}}>OC</td>
                </tr>
                <tr>
                  <td className="font12 left right" style={{height: '1.0cm',textAlign:'right'}}><NumberFormat value={Number(pt.piezasEntregadas)} displayType={'text'} thousandSeparator={true} /></td>
                  <td className="font12 right" style={{textAlign:'center'}}>{pt.clave}</td>
                  <td className="font10 right" colspan="8">{pt.producto.nombre}</td>
                  <td className="font12 right" style={{textAlign:'center'}}>{pt.oc}</td>
                </tr>
                <tr>
                  <td className="left right" style={{height: '1.0cm'}}>&nbsp;</td>
                  <td className="right">&nbsp;</td>
                  <td className="font10" style={{width: '2.5cm'}}># Cajas/Paquetes</td>
                  <td className="font10"><b>{Math.floor(pt.piezas / pt.producto.prodxcaja)}</b></td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td className="font10" style={{width: '1.0cm'}}>Pzas x Caja/Paquete</td>
                  <td className="font10" style={{textAlign: 'center'}}><b>{pt.producto.prodxcaja}</b></td>
                  <td className="font10" style={{textAlign:'right'}}>Resto</td>
                  <td className="font10 right"><b>{pt.piezas - (Math.floor(pt.piezas / pt.producto.prodxcaja))*pt.producto.prodxcaja}</b></td>
                  <td className="right">&nbsp;</td>
                </tr>
                <tr>
                  <td className="left right bottom" style={{height: '0.8cm'}}>&nbsp;</td>
                  <td className="right bottom">&nbsp;</td>
                  <td className="right bottom font10" colSpan="8" >Lote: {pt.lote}</td>
                  <td className="right bottom">&nbsp;</td>
                </tr>
              </table>
              <p className="font10">Original</p>
              <br></br>
              <table style={{borderCollapse:'separate', borderSpacing:'0em'}} key={i} >
                <tr>
                  <td style={{width: '4.0cm'}} className="left top bottom" colSpan="2" rowSpan="3">
                    <img src={Logo} alt="" width="90%"/>
                  </td>
                  <td style={{width: '9.6cm', height: '0.5cm'}} className="top right font12" colSpan="7"><b>GRUPO NORDAN S.A. DE C.V.</b></td>
                  <td style={{width: '1.8cm'}} className="top bottom right font12" >Remision #</td>
                  <td style={{width: '2.0cm'}} className="top bottom right font12">{pt.noRemision}</td>
                </tr>
                <tr>
                  <td className="font12 right" style={{width:'0.6cm'}} colSpan="7">FRONTERA No 12, Col A. OBREGON TEL (722)2714460/61</td>
                  <td colspan="2" className="font12 right bottom">FECHA</td>
                </tr>
                <tr>
                  <td className="font12 bottom right" style={{width:'0.5cm'}} colSpan="7">SAN MATEO ATENCO, ESTADO DE MEXICO</td>
                  <td colspan="2" className="font12 bottom right"><Clock format={'DD-MM-YYYY'} ticking={false}  /></td>
                </tr>
                <tr>
                  <td className="left" style={{width: '2.0cm', height: '0.5cm'}}>&nbsp;</td>
                  <td className="font12" style={{width: '2.0cm'}}>CLIENTE</td>
                  <td className="right font12" colSpan="9">{pt.cliente.nombre}</td>
                </tr>
                <tr>
                  <td className="left bottom" style={{width: '2.0cm', height: '0.5cm'}}>&nbsp;</td>
                  <td className="font12 bottom" style={{width: '2.0cm'}}>DIRECCION</td>
                  <td className="bottom right font12" colSpan="9">{pt.cliente.direccion[this.state.lstDirecciones[i]]}</td>
                </tr>
                <tr>
                  <td className="font12 left bottom right" style={{height: '0.5cm'}}>CANTIDAD</td>
                  <td className="font12 bottom right">CLAVE</td>
                  <td className="font12 bottom right" colSpan="8">DESCRIPCION</td>
                  <td className="font12 bottom right" style={{textAlign: 'center'}}>OC</td>
                </tr>
                <tr>
                  <td className="font12 left right" style={{height: '1.0cm',textAlign:'right'}}><NumberFormat value={Number(pt.piezasEntregadas)} displayType={'text'} thousandSeparator={true} /></td>
                  <td className="font12 right" style={{textAlign:'center'}}>{pt.clave}</td>
                  <td className="font10 right" colspan="8">{pt.producto.nombre}</td>
                  <td className="font12 right" style={{textAlign:'center'}}>{pt.oc}</td>
                </tr>
                <tr>
                  <td className="left right" style={{height: '1.0cm'}}>&nbsp;</td>
                  <td className="right">&nbsp;</td>
                  <td className="font10" style={{width: '2.5cm'}}># Cajas/Paquetes</td>
                  <td className="font10"><b>{Math.floor(pt.piezas / pt.producto.prodxcaja)}</b></td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td className="font10" style={{width: '1.0cm'}}>Pzas x Caja/Paquete</td>
                  <td className="font10" style={{textAlign: 'center'}}><b>{pt.producto.prodxcaja}</b></td>
                  <td className="font10" style={{textAlign:'right'}}>Resto</td>
                  <td className="font10 right"><b>{pt.piezas - (Math.floor(pt.piezas / pt.producto.prodxcaja))*pt.producto.prodxcaja}</b></td>
                  <td className="right">&nbsp;</td>
                </tr>
                <tr>
                  <td className="left right bottom" style={{height: '0.8cm'}}>&nbsp;</td>
                  <td className="right bottom">&nbsp;</td>
                  <td className="right bottom font10" colSpan="8" >Lote: {pt.lote}</td>
                  <td className="right bottom">&nbsp;</td>
                </tr>
              </table>
              <p className="font10">Laboratorio</p>
              <br></br>
              <table style={{borderCollapse:'separate', borderSpacing:'0em'}} key={i} >
                <tr>
                  <td style={{width: '4.0cm'}} className="left top bottom" colSpan="2" rowSpan="3">
                    <img src={Logo} alt="" width="90%"/>
                  </td>
                  <td style={{width: '9.6cm', height: '0.5cm'}} className="top right font12" colSpan="7"><b>GRUPO NORDAN S.A. DE C.V.</b></td>
                  <td style={{width: '1.8cm'}} className="top bottom right font12" >Remision #</td>
                  <td style={{width: '2.0cm'}} className="top bottom right font12">{pt.noRemision}</td>
                </tr>
                <tr>
                  <td className="font12 right" style={{width:'0.6cm'}} colSpan="7">FRONTERA No 12, Col A. OBREGON TEL (722)2714460/61</td>
                  <td colspan="2" className="font12 right bottom">FECHA</td>
                </tr>
                <tr>
                  <td className="font12 bottom right" style={{width:'0.5cm'}} colSpan="7">SAN MATEO ATENCO, ESTADO DE MEXICO</td>
                  <td colspan="2" className="font12 bottom right"><Clock format={'DD-MM-YYYY'} ticking={false}  /></td>
                </tr>
                <tr>
                  <td className="left" style={{width: '2.0cm', height: '0.5cm'}}>&nbsp;</td>
                  <td className="font12" style={{width: '2.0cm'}}>CLIENTE</td>
                  <td className="right font12" colSpan="9">{pt.cliente.nombre}</td>
                </tr>
                <tr>
                  <td className="left bottom" style={{width: '2.0cm', height: '0.5cm'}}>&nbsp;</td>
                  <td className="font12 bottom" style={{width: '2.0cm'}}>DIRECCION</td>
                  <td className="bottom right font12" colSpan="9">{pt.cliente.direccion[this.state.lstDirecciones[i]]}</td>
                </tr>
                <tr>
                  <td className="font12 left bottom right" style={{height: '0.5cm'}}>CANTIDAD</td>
                  <td className="font12 bottom right">CLAVE</td>
                  <td className="font12 bottom right" colSpan="8">DESCRIPCION</td>
                  <td className="font12 bottom right" style={{textAlign: 'center'}}>OC</td>
                </tr>
                <tr>
                  <td className="font12 left right" style={{height: '1.0cm',textAlign:'right'}}><NumberFormat value={Number(pt.piezasEntregadas)} displayType={'text'} thousandSeparator={true} /></td>
                  <td className="font12 right" style={{textAlign:'center'}}>{pt.clave}</td>
                  <td className="font10 right" colspan="8">{pt.producto.nombre}</td>
                  <td className="font12 right" style={{textAlign:'center'}}>{pt.oc}</td>
                </tr>
                <tr>
                  <td className="left right" style={{height: '1.0cm'}}>&nbsp;</td>
                  <td className="right">&nbsp;</td>
                  <td className="font10" style={{width: '2.5cm'}}># Cajas/Paquetes</td>
                  <td className="font10"><b>{Math.floor(pt.piezas / pt.producto.prodxcaja)}</b></td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td className="font10" style={{width: '1.0cm'}}>Pzas x Caja/Paquete</td>
                  <td className="font10" style={{textAlign: 'center'}}><b>{pt.producto.prodxcaja}</b></td>
                  <td className="font10" style={{textAlign:'right'}}>Resto</td>
                  <td className="font10 right"><b>{pt.piezas - (Math.floor(pt.piezas / pt.producto.prodxcaja))*pt.producto.prodxcaja}</b></td>
                  <td className="right">&nbsp;</td>
                </tr>
                <tr>
                  <td className="left right bottom" style={{height: '0.8cm'}}>&nbsp;</td>
                  <td className="right bottom">&nbsp;</td>
                  <td className="right bottom font10" colSpan="8" >Lote: {pt.lote}</td>
                  <td className="right bottom">&nbsp;</td>
                </tr>
              </table>
              <p className="font10">Vigilancia</p>
              </React.Fragment>
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
