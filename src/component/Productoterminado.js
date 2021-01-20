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

export default class Productoterminado extends Component {
  filterRef = React.createRef();  
  showTruck = false;
  center = {textAlign:"center"}
  state = {
      lstPdrTerm:[],
      pageOfItems: [],
      page:1,
      filtro: "",
      idSelPt: -1,
      };

  constructor(props) {
    super();
    this.loadProdTerm();
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
      title:"Se va a entregar el PT del Lote"+prodterm.lote,
      text: prodterm.nombre,
      content: "input",
      dangerMode:false,
      icon:'warning',
      buttons: true
    }).then(
      comment =>{
        prodterm.comentario = comment;
        Axios.put(Global.url+'prodterm/'+this.state.lstPdrTerm[this.state.idSelPt].id,prodterm,{ headers: authHeader() })
        .then(res =>{
          swal('PT '+prodterm.nombre+' entregado',prodterm.lote,'success');
        })
        .catch(err=>{

        });
        swal.close();
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

  render() {
    var style={};
      if(this.state.lstPdrTerm.length > 0 ){
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
                            <td>{prodterm.noConsecutivo}</td>
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
          </React.Fragment>
        );

      }else{
        return (
            <React.Fragment>
                <div className="container-gn">
                  <h2 className="center">No hay producto terminado para mostrar</h2>
                </div>
            </React.Fragment>
        )
      }
  }
}
