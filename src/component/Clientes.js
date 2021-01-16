import Axios from 'axios'
import React, { Component } from 'react'
import authHeader from "../services/auth-header";
import Global from '../Global';
import Addcliente from './Addcliente';
import {Link} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlusSquare, faEdit,  faTrash,} from "@fortawesome/free-solid-svg-icons";
import Paginacion from './Paginacion';

export default class Clientes extends Component {
    displayAdd = false;
    isUpdt = false;
    filterRef = React.createRef();
    state={
        lstClientes:[],
        pageOfItems: [],
        page:1,
        cliente:{},
        idSelCli:-1,
        filter:''
    }

    componentDidMount(){
        this.getClientes();
    }

    getClientes(){
        Axios.get(Global.url+'cliente',authHeader())
        .then(res =>{
            this.setState({
                lstClientes:res.data
            });
        } )
        .catch(err=>{

        });
    }

    addCl = () =>{
        this.displayAdd = true;
        this.forceUpdate();
    }

    cancelarCli = ()=>{
        this.displayAdd = false;
        this.isUpdt = false;
        this.getClientes();
    }

    selectRow = (i) => {
        this.setState({
          idSelCli: i,
        });
      };

    updateCl = () =>{
        this.displayAdd = true;
        this.isUpdt = true;
        this.setState({
            cliente:this.state.lstClientes[((this.state.page-1)*10)+this.state.idSelCli]
        });
    }

    filtrado = () =>{
        var filter = this.filterRef.current.value;
        var nvoArray = this.state.lstClientes.filter(element =>{
          return Object.values(element).filter(item=>{ return String(item).includes(filter)}).length > 0 
        });
        this.setState({
          pageOfItems:nvoArray
        });
      }

    onChangePage = (pageOfItems,page) => {
     // update state with new page of items
     this.setState({ pageOfItems: pageOfItems, page:page });
  }

    render() {
      if(this.state.lstClientes.length >0){
        return (
            <React.Fragment>
            {this.displayAdd &&
                <Addcliente cancelar={this.cancelarCli} tipo={this.isUpdt} cliente={this.state.cliente}/>
            }
            {!this.displayAdd &&
                <React.Fragment>
                    <div className="barnav">
                        <div className="container flex-gn">
                            <ul>
                                <li>Filtro</li>
                                <li>
                                    <input className="input" type="text" ref={this.filterRef} onKeyUp={this.filtrado}/>
                                </li>
                            </ul>
                            <h2>Clientes</h2>
                            <nav>
                                <ul>
                                    <li>
                                        <Link to="#" onClick={this.addCl}>
                                            <FontAwesomeIcon icon={faPlusSquare} />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="#" onClick={this.updateCl}>
                                            <FontAwesomeIcon icon={faEdit} />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="#" onClick={this.deleteCl} >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Link>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                    <table className="table table-dark">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>RFC</th>
                                <th>Contacto</th>
                            </tr>
                        </thead>
                    </table>
                    <div className="table-ovfl tbl-lesshead">
                        <table className="table table-hover">
                            <tbody>
                                {this.state.pageOfItems.map((cli,i)=>{
                                    var style = {};
                                    if(this.state.idSelCli === i){
                                        style="selected pointer"
                                    }else{
                                        style={};
                                    }
                                    return(
                                        <tr key={i} onClick={() => {this.selectRow(i); }} className={style} >
                                            <td>{cli.nombre}</td>
                                            <td>{cli.rfc}</td>
                                            <td>{cli.contacto}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="center">
                        <Paginacion items={this.state.lstClientes} onChangePage={this.onChangePage} />
                    </div>
                </React.Fragment>
            }
            </React.Fragment>
        )
      }else if(this.displayAdd){
        return <Addcliente cancelar={this.cancelarCli} tipo={this.isUpdt}/>
      }else{
          return(
            <div className="container">
                <div className="barnav">
                  <div className="container flex-gn">
                    <div>
                    </div>
                    <nav>
                      <ul>
                        <li>
                          <Link to="#" onClick={this.addCl}><FontAwesomeIcon icon={faPlusSquare} /></Link>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
                <h1 className="center">No hay clientes para mostrar</h1>
            </div>
          );
      }
    }
}
