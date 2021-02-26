import Global from '../Global';
import Axios from 'axios';
import React, { Component } from 'react';
import SimpleReactValidator from 'simple-react-validator';
import swal from 'sweetalert';
import authHeader from "../services/auth-header";
import AuthService from '../services/auth.service';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faPlusSquare, faEdit,  faTrash,} from "@fortawesome/free-solid-svg-icons";

export default class Addcliente extends Component {
    btnMsg = 'Enviar';
    nombreRef = React.createRef();
    direccionRef = React.createRef();
    telRef = React.createRef();
    emailRef = React.createRef();
    rfcRef = React.createRef();
    contactoRef = React.createRef();
    idCliente = '';
    state={
        cliente:{},
        contacto:{},
        lstContactos:[],
        lstDireccion:[],
        idSelCntc:-1,
        idSelDir:-1
    }
    validator = new SimpleReactValidator({
      className: 'text-danger',
      messages:{
        required:'requerido',

    }});

    componentDidMount(){
        if(this.props.tipo){
            this.btnMsg = 'Actualizar';
            this.idCliente = this.props.cliente.id;
            this.setState({
                cliente:this.props.cliente,
                lstContactos:this.props.cliente.contactos,
                lstDireccion:this.props.cliente.direccion
            });
        }
    }

    enviarFormulario = (event) =>{
        event.preventDefault();
        var cli = {
          nombre:this.nombreRef.current.value.toUpperCase(),
          rfc:this.rfcRef.current.value.toUpperCase(),
          activo:true,
        }
        var contacto={
          nombre:this.contactoRef.current.value,
          telefono:this.telRef.current.value,
          email:this.emailRef.current.value,
        }
        this.setState({
            cliente:cli,
            contacto:contacto,
            direccion:this.direccionRef.current.value,
        });
        
    }

  enviarCliente = () =>{
    if(this.validator.allValid()){
      var cliente = this.state.cliente;
      cliente.contactos = this.state.lstContactos;
      cliente.direccion = this.state.lstDireccion;
      if(this.btnMsg === 'Enviar'){
        Axios
          .post(Global.url+'cliente',cliente ,{ headers: authHeader() })
          .then(res=>{
              swal('Se inserto el cliente correctamente','','success');
              this.cancelarCli();
          })
          .catch(err=>{
              AuthService.isExpired(err.message);
          });
      }else{
        Axios
          .put(Global.url+'cliente/'+this.idCliente,cliente,{ headers: authHeader() })
          .then(
              res =>{
                  swal('Se actualizo correctamente el cliente','','success');
                  this.cancelarCli();
              }
          )
          .catch(err =>{
              AuthService.isExpired(err.message);
          });
      }
    }else{
        this.validator.showMessages();
        this.forceUpdate();
    }
  }
  
  addContacto = () =>{
    var lstcntc = this.state.lstContactos;
    if(this.state.idSelCntc===-1){
      lstcntc.push(this.state.contacto);
    }else{
      lstcntc[this.state.idSelCntc] = this.state.contacto;
    }
    this.setState({
      lstContactos:lstcntc,
      contacto:{
        nombre:'',
        telefono:'',
        email:''   
      }
    });
  }

  editContacto = () =>{
    this.setState({
      contacto:{
        nombre:this.state.lstContactos[this.state.idSelCntc].nombre,
        telefono:this.state.lstContactos[this.state.idSelCntc].telefono,
        email:this.state.lstContactos[this.state.idSelCntc].email
      }
    });
  }

  eliminaContacto = ()=>{
    if(this.state.idSelCntcr===-1){
      swal('Seleccione un contacto');
      return;
    }
    if(this.state.lstContactos.length===1){
      swal('Debe existir al menos un contacto');
      return;
    }
    var lstcontacos = this.state.lstContactos;
    lstcontacos.splice(this.state.idSelCntc,1);
    this.setState(
      {lstContactos:lstcontacos}
    );
  }

  addDireccion = () =>{
    var direccion = this.state.lstDireccion;
    if(this.state.idSelDir === -1){
      direccion.push(this.state.direccion);
    }else{
      direccion[this.state.idSelDir] = this.state.direccion;
    }
    this.direccionRef.current.value = '';
    this.setState({
        direccion:direccion
      });
  }

  editDireccion = ()=>{
    this.direccionRef.current.value =this.state.lstDireccion[this.state.idSelDir];
  }

  eliminaDireccion = ()=>{
    if(this.state.idSelDir===-1){
      swal('Selecciona una dirección');
      return;
    }
    if(this.state.lstDireccion.length===1){
      swal('Debe existir al menos una dirección');
      return;
    }
    var lstdireccion = this.state.lstDireccion;
    lstdireccion.splice(this.state.idSelDir,1);
    this.setState({
      lstDireccion:lstdireccion
    });
  }

  cancelarCli = () =>{
      this.setState({
          cliente:{}
      });
      this.props.cancelar();
  }

  selectRowContacto = (index)=>{
    this.setState(
      {idSelCntc:index}
    );
  }

  selectRowDir = (index)=>{
    this.setState({
      idSelDir:index
    });
  }

    render() {
        const cliente = this.state.cliente;
        const contacto = this.state.contacto;
        return (            
            <React.Fragment>
              <form onChange={this.enviarFormulario} onSubmit={this.enviarFormulario}> 
                <h2 className="center">Cliente</h2>
                <div className="grid">
                  <div className="showcase-form card">
                    <div className="form-control">
                        <input type="text" name="nombre" placeholder="Nombre del Cliente" ref={this.nombreRef} value={cliente.nombre}/>
                        {this.validator.message('nombre',this.state.cliente.nombre,'required')}
                    </div>
                    <div className="form-control" >
                      <input type="text" name="rfc" placeholder="RFC" ref={this.rfcRef}  value={cliente.rfc}/>
                      {this.validator.message('rfc',cliente.rfc,'required')}
                    </div>
                    <div className="form-control" >
                      <textarea type="text" name="dir" placeholder="Dirección" ref={this.direccionRef} />
                    </div>
                    <div className="barnav-cli" style={{marginTop:'10px',marginLeft:'10px',marginRight:'-5px'}}>
                      <nav>
                        <ul>
                          <li>
                            <Link to="#" onClick={this.addDireccion}>
                              <FontAwesomeIcon icon={faPlusSquare} />
                            </Link>
                          </li>
                          <li>
                            <Link to="#" onClick={this.editDireccion}>
                              <FontAwesomeIcon icon={faEdit} />
                            </Link>
                          </li>
                          <li>
                            <Link to="#" onClick={this.eliminaDireccion} >
                              <FontAwesomeIcon icon={faTrash} />
                            </Link>
                          </li>
                        </ul>
                      </nav>    
                    </div>
                  </div>
                  <div className="showcase-form card">
                    <div className="barnav-cli">
                      <nav>
                        <ul>
                          <li>
                            <Link to="#" onClick={this.addContacto}>
                              <FontAwesomeIcon icon={faPlusSquare} />
                            </Link>
                          </li>
                          <li>
                            <Link to="#" onClick={this.editContacto}>
                              <FontAwesomeIcon icon={faEdit} />
                            </Link>
                          </li>
                          <li>
                            <Link to="#" onClick={this.eliminaContacto} >
                              <FontAwesomeIcon icon={faTrash} />
                            </Link>
                          </li>
                        </ul>
                      </nav>    
                    </div>
                    <div className="form-control">
                      <input type="text" placeholder="Contacto" ref={this.contactoRef} value={contacto.nombre} />
                    </div>
                    <div className="form-control">
                      <input type="text" name="telefono" placeholder="Telefono" ref={this.telRef} value={contacto.telefono}/>
                    </div>
                    <div className="form-control">
                      <input type="text" placeholder="Correo Electronico" ref={this.emailRef} value={contacto.email}/>
                    </div>
                  </div>
                </div>
                <div className="container grid">
                  <div style={{border:'2px solid black',height:'200px'}}>
                    <table  className="table table-hover table-bordered" style={{width:'100%'}}>
                      <thead className="thead-dark">
                        <tr>
                          <th>Dirección</th>
                        </tr>
                      </thead>
                      <tbody>
                      {this.state.lstDireccion.map((dir,i)=>{
                        return(
                          <tr key={i} onClick={()=>{this.selectRowDir(i)}} onDoubleClick={()=>{this.editDireccion()}} className={this.state.idSelDir===i?'selected pointer':''}>
                            <td>{dir}</td>
                          </tr>
                        );
                      })}
                      </tbody>
                    </table>
                  </div>
                  <div style={{border:'2px solid black',height:'200px'}}>
                    <table className="table table-bordered table-hover" style={{width:'100%'}}>
                      <thead className="thead-dark">
                        <tr>
                          <th>Contacto</th>
                          <th>Teléfono</th>
                          <th>Correo</th>
                        </tr>
                      </thead>
                      <tbody>
                      {this.state.lstContactos.map((ctc,i)=>{
                        return(
                        <tr key={i} onClick={()=>this.selectRowContacto(i)}  onDoubleClick={()=>{this.editContacto()}} className={this.state.idSelCntc===i?'selected pointer':''}>
                          <td>{ctc.nombre}</td>
                          <td>{ctc.telefono}</td>
                          <td>{ctc.email}</td>
                        </tr>
                        );
                      })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="container grid">
                    <button className="btn btn-success" onClick={this.enviarCliente} disabled={this.state.lstContactos.length===0 || this.state.lstDireccion.length===0} >{this.btnMsg}</button>
                    <button className="btn btn-danger" onClick={this.cancelarCli}>Cancelar</button>
                </div>
              </form>
            </React.Fragment>
        )
    }
}
