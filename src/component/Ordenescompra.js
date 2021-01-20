import Axios from "axios";
import React, { Component } from "react";
import Global from "../Global";
import authHeader from "../services/auth-header";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlusSquare,
  faEdit,
  faTrash, faClipboardCheck
} from "@fortawesome/free-solid-svg-icons";
import Paginacion from './Paginacion';
import Moment from 'react-moment';
import momento from 'moment';
import NumberFormat from 'react-number-format';
import swal from "sweetalert";
import axios from 'axios';
import Addordencompra from "./Addordencompra";

export default class Ordenescompra extends Component {
  filterRef = React.createRef();
  center = {textAlign:"center"}
  displayAdd = false;
  isComplete = false;
  isAdd = true;
  state = {
    lstOC: [],
    pageOfItems: [],
    page:1,
    filtro: "",
    status: "",
    idSelOc: -1,
    ordencompra:{}
  };

  componentDidMount() {
      this.getAllOC();
  }

  getAllOC() {
    Axios.get(Global.url + "ordencompra", { headers: authHeader() })
      .then((res) => {
        if (res.data.length > 0) {
          this.setState({
            lstOC: res.data,
          });
        }
      })
      .catch();
  }

  addOC = () => {
      this.displayAdd = true;
      this.forceUpdate();
  }

  updateOc = () =>{
    let i = ((this.state.page-1)*10)+ this.state.idSelOc
      this.setState({
        ordencompra:this.state.pageOfItems[i]
      });
      this.displayAdd = true;
      this.isAdd = false;
      this.setState({
        idSelOc: -1
      });
  }

  cancelarAdd = (ordencom) =>{
    this.displayAdd = false;
    this.getAllOC();
    this.forceUpdate();
  }

  completeOF = () =>{
    swal({
      title: "Desea completar la OF del lote: "+this.state.lstOC[((this.state.page-1)*10)+this.state.idSelOf].lote+"?",
      text: "Una vez completado pasará a PT",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        axios.put(Global.url+'ordenfab/complete/'+this.state.lstOC[((this.state.page-1)*10)+this.state.idSelOf].id,{ headers: authHeader() })
            .then(res=>{
              //var mp = this.state.lstMatPrim[this.state.idSelMp];
              //Bitacora(Global.DEL_MATPRIM,JSON.stringify(mp),'');
              swal("La Orden de Fabricación ha sido completada!", {
                icon: "success",
              });
              this.loadAllOFs();
            }).catch(
              err =>{
                console.log('Error '+err.message);
              }
            );
      } 
    });

  }

  filtrado = () =>{
    var filter = this.filterRef.current.value;
    var nvoArray = this.state.lstOC.filter(element =>{
      return Object.values(element).filter(item=>{ return String(item).includes(filter)}).length > 0 
    });
    this.setState({
      pageOfItems:nvoArray
    });
  }

  selectRow = (i) => {
    this.setState({
      idSelOc: i,
    });
  };

  onChangePage = (pageOfItems,page) => {
    // update state with new page of items
    this.setState({ pageOfItems: pageOfItems, page:page });
  }

  render() {
    var style = {};
    if (this.state.lstOC.length > 0) {
      var lstOrdComPI = this.state.pageOfItems.map((ordcomp, i) => {
        if (this.state.idSelOc === i) {
          style = "selected pointer";
          if(ordcomp.estatus===Global.TEP){
            this.isComplete = true;
          }else{
            this.isComplete = false;
          }
        } else{
          style = {};
        }
        
        return (
          <tr key={i} onClick={() => {this.selectRow(i)}}  className={style}>
            <td>{ordcomp.oc}</td>
            <td>{ordcomp.nombreProducto}</td>
            <td>{ordcomp.clave}</td>
            <td style={this.center}><NumberFormat value={Number(ordcomp.piezas)}displayType={'text'} thousandSeparator={true}/></td>
            <td><Moment format="DD MMMM YYYY">{momento(ordcomp.fechaFabricacion,'MM-DD-YYYY').format('YYYY-MM-DDTHH:mm:ss')}</Moment></td>
            <td><Moment format="DD MMMM YYYY">{momento(ordcomp.fechaEntrega,'MM-DD-YYYY').format('YYYY-MM-DDTHH:mm:ss')}</Moment></td>
            <td>{ordcomp.cliente}</td>
            <td>{ordcomp.estatus}</td>
          </tr>
        );
      });
      return (
        <React.Fragment>
          {this.displayAdd && 
            <Addordencompra cancelar={this.cancelarAdd} ordencompra={this.state.ordencompra} tipo={this.isAdd}/>
          }
          {!this.displayAdd && (
            <React.Fragment>
              <div className="barnav">
                <div className="container flex-gn">
                  <ul>
                    <li>Filtro:</li>
                    <li><input className="input"  type="text"  name="filtro" ref={this.filterRef} onKeyUp={this.filtrado}/></li>
                  </ul>
                  <h2>Orden de Compra</h2>
                  <nav>
                    <ul>
                      <li>
                        <Link to="#" onClick={this.addOC}>
                          <FontAwesomeIcon icon={faPlusSquare} />
                        </Link>
                      </li>
                      <li>
                        <Link to="#" onClick={this.updateOc}>
                          <FontAwesomeIcon icon={faEdit} />
                        </Link>
                      </li>
                      <li>
                        <Link to="#" onClick={this.deleteOc}>
                          <FontAwesomeIcon icon={faTrash} />
                        </Link>
                      </li>
                      <li>                        
                        <Link to="#" onClick={this.completeOF} >
                        {this.isComplete &&
                          <FontAwesomeIcon icon={faClipboardCheck} />
                        }
                        </Link>                        
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
              <table className="table table-bordered header-font">
                  <col width="7%"/>
                  <col width="39%"/>
                  <col width="8%"/>                  
                  <col width="6%"/>
                  <col width="12%"/>
                  <col width="12%"/>
                  <col width="10%"/>
                  <col width="7%"/>
                <thead className="thead-light">                   
                  <tr>
                    <th scope="col">OC</th>
                    <th scope="col">Producto</th>
                    <th scope="col">Clave</th>
                    <th scope="col">Piezas</th>
                    <th scope="col">Fabricación</th>
                    <th scope="col">Entrega</th>
                    <th scope="col">Cliente</th>
                    <th scope="col">Estatus</th>
                  </tr>
                </thead>
              </table>
              <div className="table-ovfl tbl-lesshead">
                <table className="table table-bordered table-lst" id="ordenFabricacion">
                  <col width="7%"/>
                  <col width="38%"/>
                  <col width="8%"/>
                  <col width="6%"/>
                  <col width="12%"/>
                  <col width="12%"/>
                  <col width="10%"/>
                  <col width="7%"/>
                  <tbody>{lstOrdComPI}</tbody>
                </table>              
              </div>
              <div className="center">
                <Paginacion items={this.state.lstOC} onChangePage={this.onChangePage} />
              </div>
            </React.Fragment>
          )}
        </React.Fragment>
      );
    } else if(this.displayAdd){
        return  <Addordencompra cancelar={this.cancelarAdd} ordencompra={this.state.ordencompra} tipo={this.isAdd} />
      }else {
      return (
          <div className="container">
          <div className="barnav">
              <div className="container flex-gn">
                <div>
                </div>
                <h2>Orden de Compra</h2>
                <nav>
                  <ul>
                    <li>
                      <Link to="#" onClick={this.addOC}><FontAwesomeIcon icon={faPlusSquare} />
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
          </div>
          <h1 className="center">No hay órdenes de compra para mostrar</h1>
          </div>
      );
    }
  }
}
