import Global from '../Global';
import Axios from 'axios';
import React, { Component } from 'react';
import SimpleReactValidator from 'simple-react-validator';
import swal from 'sweetalert';
import authHeader from "../services/auth-header";
import AuthService from '../services/auth.service';

export default class Addproveedor extends Component {
    btnMsg = 'Enviar';
    nombreRef = React.createRef();
    direccionRef = React.createRef();
    telRef = React.createRef();
    emailRef = React.createRef();
    rfcRef = React.createRef();
    contactoRef = React.createRef();
    idProveedor = '';
    state={
        proveedor:{}
    }
    validator = new SimpleReactValidator({
        messages:{
            required:'requerido'
    }});

    componentDidMount(){
        if(this.props.tipo){
            this.btnMsg = 'Actualizar';
            this.idProveedor = this.props.proveedor.id;
            this.setState({
                proveedor:this.props.proveedor
            });
        }
    }


    enviarFormulario = (event) =>{
        event.preventDefault();
        var prov = {
            nombre:this.nombreRef.current.value.toUpperCase(),
            direccion:this.direccionRef.current.value,
            telefono:this.telRef.current.value,
            email:this.emailRef.current.value,
            rfc:this.rfcRef.current.value.toUpperCase(),
            contacto:this.contactoRef.current.value,
            activo:true
        }
        this.setState({
            proveedor:prov
        });
        
    }

    enviarProveedor = () =>{
        if(this.validator.allValid()){
            if(this.btnMsg === 'Enviar'){
              Axios
                .post(Global.url+'proveedor', this.state.proveedor,{ headers: authHeader() })
                .then(res=>{
                    swal('Se inserto el proveedor correctamente','','success');
                    this.cancelarProv();
                })
                .catch(err=>{
                    AuthService.isExpired(err.message);
                });
            }else{
              Axios
                .put(Global.url+'proveedor/'+this.idProveedor,this.state.proveedor,{ headers: authHeader() })
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

    cancelarProv = () =>{
        this.setState({
            proveedor:{}
        });
        this.props.cancelar();
    }

    render() {
        const proveedor = this.state.proveedor;
        return (            
            <React.Fragment>
              <form onChange={this.enviarFormulario} onSubmit={this.enviarFormulario}> 
                <h2 className="center">Agregar Proveedor</h2>
                <div className="grid">
                    <div className="showcase-form card">
                        <div className="form-control">
                            <input type="text" name="nombre" placeholder="Nombre del Proveedor" ref={this.nombreRef} value={proveedor.nombre}/>
                            {this.validator.message('nombre',this.state.proveedor.nombre,'required')}
                        </div>
                        <div className="form-control">
                            <textarea type="text" name="dir" placeholder="Dirección" ref={this.direccionRef} value={proveedor.direccion} />
                            {this.validator.message('dir',this.state.proveedor.direccion,'required')}
                        </div>
                        <div className="form-control">
                            <input type="text" name="telefono" placeholder="Telefono" ref={this.telRef} value={proveedor.telefono}/>
                            {this.validator.message('telefono',this.state.proveedor.telefono,'required')}
                        </div>
                    </div>
                    <div className="showcase-form card">
                        <div className="form-control">
                            <input type="text" placeholder="Correo Electronico" ref={this.emailRef} value={proveedor.email}/>
                        </div>
                        <div className="form-control">
                            <input type="text" placeholder="RFC" ref={this.rfcRef}  value={proveedor.rfc}/>
                        </div>
                        <div className="form-control">
                            <input type="text" placeholder="Contacto" ref={this.contactoRef} value={proveedor.contacto} />
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
