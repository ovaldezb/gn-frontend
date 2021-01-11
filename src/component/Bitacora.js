import Axios from "axios";
import React, { Component } from "react";
import Global from "../Global";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import authHeader from "../services/auth-header";
import Moment from 'react-moment';
import 'moment/locale/es';
import Paginacion from './Paginacion';

export default class Bitacora extends Component {
    filterRef = React.createRef();
  state = {
    lstBitac: [],
    pageOfItems: [],
    page:1
  };

  componentDidMount(){
    this.getAllBitacoras();
  }

  getAllBitacoras() {
      console.log('Bit')
    Axios.get(Global.url + "bitacora",{headers:authHeader()})
      .then((res) => {
        if (res.status === Global.HTTP_OK)
          this.setState({
            lstBitac: res.data,
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  filtrado = () =>{
    var filter = this.filterRef.current.value;
    var nvoArray = this.state.lstBitac.filter(element =>{
      return String(element.user.nombre).includes(filter) || String(element.user.apellido).includes(filter) || String(element.tipoEvento.desc).includes(filter) 
    });
    this.setState({
      pageOfItems:nvoArray
    });
  }

  onChangePage = (pageOfItems,page) => {
    // update state with new page of items
    this.setState({ pageOfItems: pageOfItems ,page:page});
  }

  render() {
    const head1 = { width: '5%' };
    const head2 = { width: '25%',textAlign: "center" };
    const head3 = { width: '35%', textAlign: "center" };
    const head4 = { width: '35%',textAlign: "center" };
    //const head5 = { width: '25%',textAlign: "center" };
    const col1 = { width: '5%' };
    const col2 = { width: '25%',textAlign: "center" };
    const col3 = { width: '35%', textAlign: "center" };
    const col4 = { width: '35%',textAlign: "center" };
    //const col5 = { width: '25%',textAlign: "center" };
    const width ={ width:'100%'};
    if(this.state.lstBitac.length > 0){
        var rows = this.state.pageOfItems.map((bitacora,i)=>{
            return(
                <tr key={i}>
                    <td style={col1}>{((this.state.page-1)*10) + i+1}</td>
                    <td style={col2}>{bitacora.user.nombre} {bitacora.user.apellido}</td>
                    <td style={col3}>{bitacora.tipoEvento.desc}</td>
                    <td style={col4}>
                        <Moment locale="es" format="D MMM YYYY H:mm:ss" withTitle>
                        {bitacora.fechaEvento}
                        </Moment>
                    </td>
                </tr>
            );
        });
    return (
      <React.Fragment>
        <div className="container">
          <div className="barnav">
            <div className="container-gn flex-gn">
              <ul>
                <li>
                  <label className="label">Filtro:</label>
                </li>
                <li>
                  <input name="filtro" className="input" ref={this.filterRef} onKeyUp={this.filtrado}/>
                </li>
              </ul>
              <h2>Bitácora</h2>
              <nav>
                <ul>
                  <li>
                    <Link to="#" onClick={this.addMp}>
                      <FontAwesomeIcon icon={faTrash} />
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          <table className="table table-bordered" style={width}>
            <col width="5%"/>
            <col width="25%"/>
            <col width="35%"/>
            <col width="35%"/>
            <thead className="thead-dark">
                <tr>
                    <th style={head1}>#</th>
                    <th style={head2}>Usuario</th>
                    <th style={head3}>Tipo Evento</th>
                    <th style={head4}>Fecha Evento</th>
                </tr>
            </thead>
          </table>
            <div className="table-ovfl tbl-lesshead">
                <table className="table table-bordered" id="bitacora">
                  <col width="5%"/>
                  <col width="25%"/>
                  <col width="35%"/>
                  <col width="35%"/>
                  <tbody>{rows}</tbody>
                </table>
            </div>
            <Paginacion items={this.state.lstBitac} onChangePage={this.onChangePage}/>
        </div>
      </React.Fragment>
    );
    }else{
        return (
            <React.Fragment>
                <div className="container">
                    <h2 className="center">No hay bitacoras a mostrar</h2>
                </div>
            </React.Fragment>
        );
    }
  }
}
