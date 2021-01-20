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
import Addordenfab from "./Addordenfab";
import NumberFormat from 'react-number-format';
import swal from "sweetalert";
import axios from 'axios';

export default class Ordenesfabricacion extends Component {
  filterRef = React.createRef();
  selAllRef = React.createRef();
  center = {textAlign:"center"}
  displayAdd = false;
  isComplete = false;
  state = {
    lstOF: [],
    pageOfItems: [],
    page:1,
    filtro: "",
    status: "",
    idSelOf: -1,
    ordenfab:{}
  };

  componentDidMount() {
      this.loadAactiveOF();
  }

  loadAactiveOF() {
    Axios.get(Global.url + "ordenfab/active/false", { headers: authHeader() })
      .then((res) => {
        if (res.data.length > 0) {
          this.setState({
            lstOF: res.data,
          });
        }
      })
      .catch();
  }

  selectAllOF = () =>{
    Axios.get(Global.url + "ordenfab/active/true", { headers: authHeader() })
    .then((res) => {
      if (res.data.length > 0) {
        this.setState({
          lstOF: res.data,
        });
      }
    })
    .catch();
  }

  selectType = () =>{
    if(this.selAllRef.current.checked){
      this.selectAllOF();
    }else{
      this.loadAactiveOF();
    }
  }

  addOF = () => {
      this.displayAdd = true;
      this.forceUpdate();
  }

  cancelarAdd = (ordenfab) =>{
    this.displayAdd = false;
    if(ordenfab){
      this.loadAactiveOF();
    }
    this.forceUpdate();
  }

  completeOF = () =>{
    swal({
      title: "Desea completar la Orden de Fabricacón: "+this.pad(this.state.lstOF[((this.state.page-1)*10)+this.state.idSelOf].noConsecutivo,Global.SIZE_DOC)+"?",
      text: "Una vez completado, pasará a Producto Terminado",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        axios.put(Global.url+'ordenfab/complete/'+this.state.lstOF[((this.state.page-1)*10)+this.state.idSelOf].id,{ headers: authHeader() })
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
    var nvoArray = this.state.lstOF.filter(element =>{
      return Object.values(element).filter(item=>{ return String(item).includes(filter)}).length > 0 
    });
    this.setState({
      pageOfItems:nvoArray
    });
  }

  selectRow = (i) => {
    this.setState({
      idSelOf: i,
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
            <td style={this.center}>{this.pad(ordfab.noConsecutivo,Global.SIZE_DOC)}</td>
            <td style={this.center}>{ordfab.oc}</td>
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
            <Addordenfab cancelar={this.cancelarAdd} ordenfab={this.state.ordenfab} />
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
                        <Link to="#" onClick={this.addOF}>
                          <FontAwesomeIcon icon={faPlusSquare} />
                        </Link>
                      </li>
                      <li>
                        <Link to="#" onClick={this.updateOf}>
                          <FontAwesomeIcon icon={faEdit} />
                        </Link>
                      </li>
                      <li>
                        <Link to="#" onClick={this.deleteOf}>
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
                  <col width="18%"/>
                  <col width="18%"/>
                  <col width="18%"/>
                  <col width="18%"/>
                  <col width="18%"/>
                  <col width="10%"/>
                  
                <thead className="thead-light">                   
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
                  <col width="18%"/>
                  <col width="18%"/>
                  <col width="18%"/>
                  <col width="18%"/>
                  <col width="18%"/>
                  <col width="10%"/>
                  <tbody>{lstOrdFabPI}</tbody>
                </table>              
              </div>
              <div className="center">
                <Paginacion items={this.state.lstOF} onChangePage={this.onChangePage} />
              </div>
            </React.Fragment>
          )}
        </React.Fragment>
      );
    } else if(this.displayAdd){
        return  <Addordenfab cancelar={this.cancelarAdd} matprima={this.state.ordenfab} />
      }else {
      return (
          <div className="container">
          <div className="barnav">
              <div className="container flex-gn">
                <div>
                </div>
                <nav>
                  <ul>
                    <li>
                      <Link to="#" onClick={this.addOF}><FontAwesomeIcon icon={faPlusSquare} />
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
          </div>
          <h1 className="center">No hay Ordenes de Fabricación para mostrar</h1>
          </div>
      );
    }
  }
}
