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
         Axios.put(Global.url+'prodterm/'+this.state.lstPdrTerm[this.state.idSelPt].id,prodterm,{ headers: authHeader() })
         .then(res =>{
           swal('PT '+prodterm.nombre+' entregado','Lote:'+prodterm.lote,'success');
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

  printPT = () =>{
    if(this.state.idSelPt < 0){
      swal('Debe elegir un Producto Terminado');
      return;
    };
   this.forceUpdate();
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
    '}'+
    '</style>';
    var is_chrome = Boolean(window.chrome);
    var is_safari = Boolean(window.safari);
    
    printwind.document.write(estilos+' '+document.getElementById('print').innerHTML);
    if (is_chrome) {
      console.log('Entrando')
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
                      <Link to="#" onClick={this.printPT}>
                        
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
                            <td>{prodterm.nombre}</td>
                            <td>{prodterm.oc}</td>
                            <td>{prodterm.lote}</td>
                            <td style={this.center}><NumberFormat value={Number(prodterm.piezas)}displayType={'text'} thousandSeparator={true}/></td>
                            <td style={this.center}><Moment format="DD MMMM YYYY">{momento(prodterm.fechaFabricacion,'YYYY-MM-DD').format('YYYY-MM-DD')}</Moment></td>
                            <td style={this.center}><Moment format="DD MMMM YYYY">{momento(prodterm.fechaEntrega,'YYYY-MM-DD').format('YYYY-MM-DD')}</Moment></td>
                            <td style={this.center}>{prodterm.estatus.label}</td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
              <Paginacion items={this.state.lstPdrTerm} onChangePage={this.onChangePage} />
            </div>
            {this.state.idSelPt !==-1 && 
            <div id="print" style={{display:'none'}}>
              <table className="table-main">
                  <tbody>
                <tr>
                  <td style={this.w70}>
                    <table className="table-0">
                        <tbody>
                      <tr>
                        <td style={this.w25} rowSpan="3">
                          <img src={Logo} alt="" width="100%" />
                        </td>
                        <td style={this.w75}>Grupo Nordan SA de CV</td>
                      </tr>
                      <tr>
                        <td colSpan="2">FRONTERA No 12, Col A. OBREGON TEL (722)2714460/61</td>
                      </tr>
                      <tr>
                        <td colSpan="2">SAN MATEO ATENCO, ESTADO DE MEXICO</td>
                      </tr>
                      </tbody>
                    </table>
                  </td>
                  <td style={this.w30}>
                    <table className="table-1">
                    <tbody>
                      <tr>
                        <td>Remision #</td>
                        <td>32902</td>
                      </tr>
                      <tr>
                        <td colSpan="2">Fecha</td>
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
                        <td>{this.state.lstPdrTerm[this.state.idSelPt].cliente}</td>
                      </tr>
                      <tr>
                        <td>&nbsp;</td>
                        <td>Direccion:</td>
                        <td>Toluca Edo de Mex</td>
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
                            {this.state.lstPdrTerm[this.state.idSelPt].nombre}
                          </p>
                          <p>Lote:{this.state.lstPdrTerm[this.state.idSelPt].lote}</p>
                          <p>{this.state.lstPdrTerm[this.state.idSelPt].comentario}</p>
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
