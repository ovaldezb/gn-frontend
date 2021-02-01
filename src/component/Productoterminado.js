import React, { Component } from 'react'
import Paginacion from './Paginacion';
import authHeader from "../services/auth-header";
import Axios from 'axios';
import Global from '../Global';
import Moment from 'react-moment';
import momento from 'moment';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck, faPrint } from "@fortawesome/free-solid-svg-icons";
import NumberFormat from 'react-number-format';
import swal from 'sweetalert';
import Logo from '../assets/images/logo.png'
import Clock from 'react-live-clock';

export default class Productoterminado extends Component {
  
  filterRef = React.createRef();  
  activosRef = React.createRef();
  showTruck = false;
  isPrint= false;
  center = {textAlign:"center"}
  hide={display:'none'};
  cajasInt = 0;
  residual = 0;
  state = {
      lstPdrTerm:[],
      pageOfItems: [],
      page:1,
      filtro: "",
      idSelPt: -1
      };
    right_top = {textAlign:'right',verticalAlign: 'top'};
    center_top = {textAlign:'center',verticalAlign: 'top'};
    left_top = {textAlign:'left',verticalAlign: 'top'};
  componentDidMount(props) {
    //super();
    this.loadProdTermActive();
  }

  loadProdTermActive(){
    Axios.get(Global.url+'prodterm/activo',{ headers: authHeader() })
      .then( res =>{
        this.setState({
          lstPdrTerm:res.data
        });
      })
      .catch(err => {

      });
  }

  loadProdTerm(){
    Axios.get(Global.url+'prodterm',{ headers: authHeader() })
      .then( res =>{
        this.setState({
          lstPdrTerm:res.data
        });
      })
      .catch(err => {

      });
  }

  deliverPT = () =>{
    var prodterm = this.state.lstPdrTerm[this.state.idSelPt];
    swal({
      title:"Se va a entregar el PT del Lote:"+prodterm.lote,
      text: prodterm.nombre,
      content: "input",
      dangerMode:false,
      icon:'warning',
      buttons: true
    }).then(
      comment =>{
        if(comment){
        prodterm.comentario = comment;
         Axios.put(Global.url+'prodterm/dlvr/'+this.state.lstPdrTerm[this.state.idSelPt].id,prodterm,{ headers: authHeader() })
         .then(res =>{
           swal('PT '+prodterm.producto.nombre+' entregado','Lote:'+prodterm.lote,'success');
           this.loadProdTermActive();
         })
         .catch(err=>{

         });
        swal.close();
        }
      }
    );
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
      idSelPt: i,
    });
  };

  onChangePage = (pageOfItems,page) => {
    // update state with new page of items
    this.setState({ pageOfItems: pageOfItems, page:page });
  }

  selectType = () =>{
    if(this.activosRef.current.checked){
      this.loadProdTerm();
    }else{      
      this.loadProdTermActive();
    }
  }

  pideNoRemision = () =>{
    if(this.state.idSelPt < 0){
      swal('Debe elegir un Producto Terminado');
      return;
    };
    let prodterm = this.state.lstPdrTerm[this.state.idSelPt];
    this.cajasInt = Math.floor(prodterm.piezas / prodterm.producto.prodxcaja);
    this.residual = prodterm.piezas -(this.cajasInt*prodterm.producto.prodxcaja);
    
    if(!prodterm.noRemision){
      swal({
        title:"Se requiere el No de Remision para este Lote:"+prodterm.lote,
        text: prodterm.nombre,
        content: "input",
        dangerMode:false,
        icon:'warning',
        buttons: true
      }).then(
        noRemision =>{
          if(noRemision){
          prodterm.noRemision = noRemision;
          prodterm.fechaRemision = new Date() ;
           Axios.put(Global.url+'prodterm/updnrem/'+this.state.lstPdrTerm[this.state.idSelPt].id,prodterm,{ headers: authHeader() })
           .then(res =>{
             let lstPT = this.state.lstPdrTerm;
             lstPT[this.state.idSelPt] = prodterm
             this.setState({
              lstPdrTerm:lstPT
             });
            this.printPT();
           })
           .catch(err=>{
  
           });
          swal.close();
          }
        }
      );
    }else{
      this.printPT();
    }
    
    
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
                      <Link to="#" onClick={this.pideNoRemision}>
                        
                          <FontAwesomeIcon icon={faPrint} size="2x" />
                        
                        </Link>
                      </li>
                      <li>
                        <Link to="#" onClick={this.deliverPT}>
                          {this.state.idSelPt !== -1 && this.showTruck &&
                          <FontAwesomeIcon icon={faTruck} size="2x" />
                          }
                        </Link>
                      </li>                                              
                    </ul>
                  </nav>
                </div>
              </div>
            
              <table className="table table-dark header-font table-bordered">
                <col width="7%"/>
                <col width="31%"/>
                <col width="8%"/>
                <col width="8%"/>
                <col width="9%"/>
                <col width="13%"/>
                <col width="13%"/>
                <col width="11%"/>
                <thead>
                  <tr>
                    <th>No OF</th>
                    <th>Producto</th>
                    <th>OC</th>
                    <th>Lote</th>
                    <th>Piezas</th>
                    <th>Fabricación</th>
                    <th>Entrega</th>
                    <th>Estatus</th>
                  </tr>
                </thead>
              </table>
              <div className="table-ovfl tbl-lesshead">
                <table className="table table-lst table-bordered">
                  <col width="7%"/>
                  <col width="31%"/>
                  <col width="8%"/>
                  <col width="8%"/>
                  <col width="9%"/>
                  <col width="13%"/>
                  <col width="13%"/>
                  <col width="11%"/>
                  <tbody>
                    {
                      this.state.pageOfItems.map((prodterm,i)=>{
                        style = this.state.idSelPt === i ? "selected pointer":{};
                        return(
                          <tr key={i} onClick={() => {this.selectRow(i,(prodterm.estatus.codigo === Global.WTDEL))}}  className={style}>
                            <td>{this.pad(prodterm.noConsecutivo,Global.SIZE_DOC)}</td>
                            <td>{prodterm.producto.nombre}</td>
                            <td>{prodterm.oc}</td>
                            <td>{prodterm.lote}</td>
                            <td style={this.center}><NumberFormat value={Number(prodterm.piezas)}displayType={'text'} thousandSeparator={true}/></td>
                            <td style={this.center}><Moment format="DD MMMM YYYY">{momento(prodterm.fechaFabricacion,'YYYY-MM-DD').format('YYYY-MM-DD')}</Moment></td>
                            <td style={this.center}><Moment format="DD MMMM YYYY">{momento(prodterm.fechaEntrega,'YYYY-MM-DD').format('YYYY-MM-DD')}</Moment></td>
                            <td style={this.center} title={prodterm.cliente.nombre}>{prodterm.estatus.label}</td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
              <Paginacion items={this.state.lstPdrTerm} onChangePage={this.onChangePage} page={this.state.page}/>
            </div>
            {this.state.idSelPt !==-1 && 
            <div id="print" style={{display:'none'}}>
              <table className="table-main">
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
                        <td className="center">{this.state.lstPdrTerm[this.state.idSelPt].noRemision}</td>
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
                      <col width="20%" />
                      <col width="15%" />
                      <col width="65%" />
                      <tbody>
                      <tr>
                        <td>&nbsp;</td>
                        <td>Cliente:</td>
                        <td>{this.state.lstPdrTerm[this.state.idSelPt].cliente.nombre}</td>
                      </tr>
                      <tr>
                        <td>&nbsp;</td>
                        <td>Direccion:</td>
                        <td>{this.state.lstPdrTerm[this.state.idSelPt].cliente.direccion}</td>
                      </tr>
                      <tr>
                        <td>&nbsp;</td>
                        <td>RFC:</td>
                        <td>{this.state.lstPdrTerm[this.state.idSelPt].cliente.rfc}</td>
                      </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td colSpan="2">
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
                      <tr>
                        <td style={this.center_top}>{this.state.lstPdrTerm[this.state.idSelPt].piezas}</td>
                        <td style={this.center_top}>{this.state.lstPdrTerm[this.state.idSelPt].clave}</td>
                        <td style={this.left_top}>
                          <p>
                            {this.state.lstPdrTerm[this.state.idSelPt].producto.nombre}
                          </p>
                          <p>Lote:{this.state.lstPdrTerm[this.state.idSelPt].lote}</p>
                          <p>
                            {Math.floor(this.state.lstPdrTerm[this.state.idSelPt].piezas / this.state.lstPdrTerm[this.state.idSelPt].producto.prodxcaja)} CAJAS C/{this.state.lstPdrTerm[this.state.idSelPt].producto.prodxcaja} PZAS&nbsp;
                            {(this.state.lstPdrTerm[this.state.idSelPt].piezas - (Math.floor(this.state.lstPdrTerm[this.state.idSelPt].piezas / this.state.lstPdrTerm[this.state.idSelPt].producto.prodxcaja))*this.state.lstPdrTerm[this.state.idSelPt].producto.prodxcaja) > 0 &&
                              <React.Fragment>
                                C/UNA MAS CON UN RESTO DE {this.state.lstPdrTerm[this.state.idSelPt].piezas - (Math.floor(this.state.lstPdrTerm[this.state.idSelPt].piezas / this.state.lstPdrTerm[this.state.idSelPt].producto.prodxcaja))*this.state.lstPdrTerm[this.state.idSelPt].producto.prodxcaja} PZAS
                              </React.Fragment>
                            }
                          </p>
                        </td>
                        <td style={this.center_top}>{this.state.lstPdrTerm[this.state.idSelPt].oc}</td>
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
