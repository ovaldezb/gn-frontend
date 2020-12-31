import Axios from "axios";
import React, { Component } from "react";
import Global from "../Global";
import authHeader from "../services/auth-header";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlusSquare,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Paginacion from './Paginacion';
import Header from './Header';
import Addordenfab from "./Addordenfab";

export default class Ordenfabricacion extends Component {
    col1 = { width: 20 };
    col2 = { width: 100 };
    col3 = { width: 96, textAlign: "center" };
    col4 = { width: 96 };
    col5 = { width: 100 };
    col6 = { width: 150 };
    col7 = { width: 150 };
    col8 = { width: 150 };
  displayAdd = false;
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
      this.getAllOFs();
  }

  getAllOFs() {
    Axios.get(Global.url + "ordenfab", { headers: authHeader() })
      .then((res) => {
        if (res.data.length > 0) {
          this.setState({
            lstOF: res.data,
          });
        }
      })
      .catch();
  }

  addOF = () => {
      this.displayAdd = true;
      this.forceUpdate();
  }

  cancelarAdd = (ordenfab) =>{
      console.log('Cancelar');
    this.displayAdd = false;
    if(ordenfab){

    }
    this.forceUpdate();
  }

  filter = () => {
    var filter = String.value(this.filterRef.current.value);
    var td, found, i, j;
    var tabla = document.getElementById("ordenFabricacion");

    for (i = 0; i < tabla.rows.length; i++) {
      td = tabla.rows[i].cells;
      for (j = 0; j < td.length; j++) {
        if (td[j].innerHTML.toUpperCase().indexOf(filter.toUpperCase()) > -1) {
          found = true;
        }
      }
      if (found) {
        tabla.rows[i].style.display = "";
        found = false;
      } else {
        tabla.rows[i].style.display = "none";
      }
    }
  }

  render() {
    if (this.state.lstOF.length > 0) {
      var lstOrdFabPI = this.state.pageOfItems.map((ordfab, i) => {
        return (
          <tr>
            <td>{ordfab.oc}</td>
            <td>{ordfab.nombre}</td>
            <td>{ordfab.clave}</td>
            <td>{ordfab.lote}</td>
            <td>{ordfab.lote}</td>
            <td>{ordfab.piezas}</td>
            <td>{ordfab.fechaFabricacion}</td>
            <td>{ordfab.fechaEntrega}</td>
          </tr>
        );
      });
      return (
        <React.Fragment>
          {this.displayAdd && 
            <Addordenfab cancelar={this.cancelarAdd} matprima={this.state.ordenfab} />
          }
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
                        onKeyUp={this.filter}
                      />
                    </li>
                  </ul>
                  <nav>
                    <ul>
                      <li>
                        <Link to="#" onClick={this.addMp}>
                          <FontAwesomeIcon icon={faPlusSquare} />
                        </Link>
                      </li>
                      <li>
                        <Link to="#" onClick={this.updateMp}>
                          <FontAwesomeIcon icon={faEdit} />
                        </Link>
                      </li>
                      <li>
                        <Link to="#" onClick={this.deleteMp}>
                          <FontAwesomeIcon icon={faTrash} />
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
              <table className="table table-bordered">
                <thead className="thead-light">
                  <tr>
                    <th scope="col" style={this.col1}>
                      OC
                    </th>
                    <th scope="col" style={this.col2}>
                      Producto
                    </th>
                    <th scope="col" style={this.col3}>
                      Clave
                    </th>
                    <th scope="col" style={this.col4}>
                      Lote
                    </th>
                    <th scope="col" style={this.col5}>
                      Piezas
                    </th>
                    <th scope="col" style={this.col6}>
                      Fecha Fabricación
                    </th>
                    <th scope="col" style={this.col7}>
                      Fecha Entrega
                    </th>
                    <th scope="col" style={this.col8}>
                      Cliente
                    </th>
                  </tr>
                </thead>
              </table>
              <div className="table-ovfl tbl-lesshead">
                <table className="table" id="ordenFabricacion">
                  <tbody>{lstOrdFabPI}</tbody>
                </table>              
              </div>
              <div className="center">
                <Paginacion items={this.state.lstMatPrim} onChangePage={this.onChangePage} />
              </div>
            </React.Fragment>
          )}
        </React.Fragment>
      );
    } else if(this.displayAdd){
        return (
            <React.Fragment>
                <Header/>
                <Addordenfab cancelar={this.cancelarAdd} matprima={this.state.ordenfab} />
              
            </React.Fragment>
            )

            ;
      }else {
      return (
        <React.Fragment>
          <Header />
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
        </React.Fragment>
      );
    }
  }
}
