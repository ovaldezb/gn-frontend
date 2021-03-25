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

export default class Addproveedor extends Component {
    btnMsg = 'Enviar';
    nombreRef = React.createRef();
    direccionRef = React.createRef();
    telRef = React.createRef();
    telfPralRef = React.createRef();
    emailRef = React.createRef();
    rfcRef = React.createRef();
    contactoRef = React.createRef();
    idProveedor = '';
    state={
        proveedor:{},
        lstContactos:[],
        idSelCntc:-1,
        contacto:{
          nombre:'',
          telefono:'',
          email:''
        }
    }
    validator = new SimpleReactValidator({
      className: 'text-danger',
      messages:{
        required:'requerido'
    }});

    componentDidMount(){
        if(this.props.tipo){
            this.btnMsg = 'Actualizar';
            this.idProveedor = this.props.proveedor.id;
            this.setState({
                proveedor:this.props.proveedor,
                lstContactos: this.props.proveedor.contactos
            });
        }
    }


  enviarFormulario = (event) =>{
      event.preventDefault();
      var prov = {
          nombre:this.nombreRef.current.value.toUpperCase(),
          direccion:this.direccionRef.current.value,
          rfc:this.rfcRef.current.value.toUpperCase(),
          telefonoPrincipal:this.telfPralRef.current.value,
          activo:true
      }
      this.nombreRef.current.value = this.nombreRef.current.value.toUpperCase();
      this.rfcRef.current.value = this.rfcRef.current.value.toUpperCase();
      this.setState({
          proveedor:prov,
          contacto:{
            nombre:this.contactoRef.current.value,
            telefono:this.telRef.current.value,
            email:this.emailRef.current.value
          }
      });
  }

  enviarProveedor = () =>{
    var proveedor;
    proveedor = this.state.proveedor;
    proveedor.contactos = this.state.lstContactos;
    if(this.validator.allValid()){
      if(this.btnMsg === 'Enviar'){
        Axios
        .post(Global.url+'proveedor', proveedor,{ headers: authHeader() })
        .then(res=>{
          swal('Se inserto el proveedor correctamente','','success');
          this.cancelarProv();
        })
        .catch(err=>{
          AuthService.isExpired(err.message);
        });
      }else{
        Axios
          .put(Global.url+'proveedor/'+this.idProveedor,proveedor,{ headers: authHeader() })
          .then(
            res =>{
              swal('Se actualizo correctamente el proveedor','','success');
              this.cancelarProv();
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
      if(this.state.contacto.nombre === ''){
        swal('Debe ingresar el nombre');
        return;
      }
      if(this.state.contacto.telefono === ''){
        swal('Debe ingresar el teléfono');
        return;
      }
      if(this.state.contacto.email === ''){
        swal('Debe ingresar el correo electrónico');
        return;
      }
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
      this.contactoRef.current.value = '';
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
      if(this.state.idSelCntc===-1){
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

  selectRowContacto = (index)=>{
    this.setState(
      {idSelCntc:index}
    );
  }
   
  cancelarProv = () =>{
    this.setState({
        proveedor:{}
    });
    this.props.cancelar();
  }

  OnChange = ()=>{}

    render() {
        const proveedor = this.state.proveedor;
        const contacto = this.state.contacto;
        return (            
            <React.Fragment>
              <form onChange={this.enviarFormulario} onSubmit={this.enviarFormulario}> 
                <h2 className="center">Proveedor</h2>
                <div className="grid">
                    <div className="showcase-form card">
                        <div className="form-control">
                            <input type="text" name="nombre" placeholder="Nombre del Proveedor" ref={this.nombreRef} defaultValue={proveedor.nombre}/>
                            {this.validator.message('nombre',this.state.proveedor.nombre,'required')}
                        </div>
                        <div className="form-control">
                            <input type="text" name="telefono" placeholder="Telefono Principal" ref={this.telfPralRef} defaultValue={proveedor.telefonoPrincipal}/>
                            {this.validator.message('telefono',proveedor.telefonoPrincipal,'required')}
                        </div>
                        <div className="form-control">
                          <input type="text" placeholder="RFC"  name="rfc" ref={this.rfcRef}  defaultValue={proveedor.rfc}/>
                          {this.validator.message('rfc',proveedor.rfc,'required')}
                        </div>
                        <div className="form-control">
                            <textarea type="text" name="dir" placeholder="Dirección" ref={this.direccionRef} defaultValue={proveedor.direccion} rows={1} />
                            {this.validator.message('dir',this.state.proveedor.direccion,'required')}
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
                            {this.state.idSelCntc === -1 && 
                            <Link to="#" >
                              <FontAwesomeIcon icon={faEdit} style={{color:'grey'}} />
                            </Link>
                            }
                            {this.state.idSelCntc !== -1 && 
                            <Link to="#" onClick={this.editContacto}>
                              <FontAwesomeIcon icon={faEdit} />
                            </Link>
                            }
                          </li>
                          <li>
                            {this.state.idSelCntc === -1 && 
                            <Link to="#" >
                              <FontAwesomeIcon icon={faTrash} style={{color:'grey'}} />
                            </Link>
                            }
                            {this.state.idSelCntc !== -1 && 
                            <Link to="#" onClick={this.eliminaContacto} >
                              <FontAwesomeIcon icon={faTrash}  />
                            </Link>
                            }
                          </li>
                        </ul>
                      </nav>    
                    </div>
                      <div className="form-control">
                        <input type="text" placeholder="Contacto" ref={this.contactoRef} value={contacto.nombre} onChange={this.OnChange} />
                      </div>
                      <div className="form-control">
                        <input type="text" placeholder="Teléfono Contacto" ref={this.telRef} value={contacto.telefono} onChange={this.OnChange}/>
                      </div>
                      <div className="form-control">
                        <input type="text" placeholder="Correo Electrónico" ref={this.emailRef} value={contacto.email} onChange={this.OnChange}/>
                      </div>
                    </div>
                </div>
                <div className="container grid">
                  <div></div>
                  <div style={{border:'2px solid black',height:'250px'}}>
                    <table className="table table-bordered center" style={{width:'100%'}}>
                      <colgroup>
                        <col width="35%" />
                        <col width="30%" />
                        <col width="35%" />
                      </colgroup>
                      <thead className="thead-dark">
                        <tr>
                          <th>Contacto</th>
                          <th>Teléfono</th>
                          <th>Correo</th>
                        </tr>
                      </thead>
                      </table>
                      <div className="table-ovfl-proveedor tbl-lesshead">
                        <table className="table table-bordered" style={{cursor:'pointer'}}>
                          <colgroup>
                            <col width="35%" />
                            <col width="30%" />
                            <col width="35%" />
                          </colgroup>
                          <tbody>
                        {this.state.lstContactos.map((cntc,i)=>{
                          return(
                            <tr key={i} onClick={()=>this.selectRowContacto(i)}  onDoubleClick={()=>{this.editContacto()}} className={this.state.idSelCntc===i?'selected pointer':''}>
                            <td className="font14">{cntc.nombre}</td>
                            <td className="font14">{cntc.telefono}</td>
                            <td className="font14">{cntc.email}</td>
                          </tr>
                          );
                          })} 
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="container grid">
                    <button className="btn btn-success" onClick={this.enviarProveedor} >{this.btnMsg}</button>
                    <button className="btn btn-danger" onClick={this.cancelarProv}>Cancelar</button>
                </div>
              </form>
            </React.Fragment>
        )
    }
}
