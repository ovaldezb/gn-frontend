import React, { Component } from "react";
import authHeader from "../services/auth-header";
import axios from "axios";
import Global from "../Global";
import Moment from "react-moment";
import "moment/locale/es";
import {Redirect} from 'react-router-dom';

export default class Materiasprimas extends Component {
    url = Global.url;
    idMatprim = '';
    filterRef = React.createRef();
    
    state = {
        lstMatPrim: [],
        filtro:'',
        status:''
    };

    componentDidMount() {
        this.loadMatPrim();
    }

    loadMatPrim() {
        axios.get(this.url + "matprima", { headers: authHeader() })
            .then((res) => {
                if (res.data.length > 0) {
                    this.setState({
                        lstMatPrim: res.data
                    });
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    dblClick = (i) =>{
        this.idMatprim = this.state.lstMatPrim[i].id;
        console.log(this.idMatprim);
        this.setState({
            status:'go'
        });
        
        
    }

    filter=()=>{
        var filter = this.filterRef.current.value;
        var td, found, i, j;
        var tabla = document.getElementById('materiaprima');
        for (i = 0; i <tabla.rows.length; i++){
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
      if(this.state.status ==='go'){
          console.log('nos vamos');
        return <Redirect to={"/materiaprima/"+this.idMatprim} />
      }
    const col1 = { width: 20 };
    const col2 = { width: 100 };
    const col3 = { width: 96, textAlign: "center" };
    const col4 = { width: 96 };
    const col5 = { width: 100 };
    const col6 = { width: 150 };
    const col7 = { width: 150 };
    const col8 = { width: 150 };
    const mb1 = { marginBottom: 15, marginTop: 10 };
    var style = '';
    if (this.state.lstMatPrim.length > 0) {
      var lstMp = this.state.lstMatPrim.map((matprim,i) => {
        if(matprim.cantidad > 0 && matprim.cantidad <= matprim.escaso ){
            style='escaso';
        }else if(matprim.cantidad > matprim.escaso && matprim.cantidad <= matprim.necesario){
            style='necesario';
        }else{
            style='suficiente';
        }
        return (
          <tr key={i} onDoubleClick={()=>this.dblClick(i)} className={style}>
            <td style={col1}>{i+1}</td>
            <td style={col2}>{matprim.descripcion}</td>
            <td style={col3}>{matprim.cantidad}</td>
            <td style={col4}>{matprim.unidadMedida}</td>
            <td style={col5}>{matprim.codigo}</td>
            <td style={col6}>{matprim.proveedor}</td>
            <td style={col7}>
              <Moment locale="es" format="D MMMM YYYY" withTitle>
                {matprim.fechaEntrada}
              </Moment>
            </td>
            <td style={col7}>
              <Moment locale="es" format="MMMM D YYYY" withTitle>
                {matprim.fechaCaducidad}
              </Moment>
            </td>
          </tr>
        );
      });
      return (
        <React.Fragment>
          <div className="input-group" style={mb1}>
            <span>Filtro:</span>
            <input className="input" type="text" name="filtro" ref={this.filterRef} onKeyUp={this.filter}/>
          </div>
          <table className="table table-bordered">
            <thead className="thead-light">
              <tr>
                <th scope="col" style={col1}>#</th>
                <th scope="col" style={col2}>Descripción</th>
                <th scope="col" style={col3}>Cantidad</th>
                <th scope="col" style={col4}>Unidad</th>
                <th scope="col" style={col5}>Código</th>
                <th scope="col" style={col6}>Proveedor</th>
                <th scope="col" style={col7}>Fecha Entrada </th>
                <th scope="col" style={col8}>Fecha Cauducidad</th>
              </tr>
            </thead>
          </table>
          <table className="table table-hover tbl-lesshead table-bordered" id="materiaprima">
            <tbody>{lstMp}</tbody>
          </table>
        </React.Fragment>
      );
    } else {
      return (
        <div>
          <p>No hay Materias Primas por mostrar</p>
        </div>
      );
    }
  }
}
