import Global from '../Global';
import Axios from 'axios';
import React, { Component } from 'react';
import SimpleReactValidator from 'simple-react-validator';
import swal from 'sweetalert';
import authHeader from "../services/auth-header";
import AuthService from '../services/auth.service';

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
        cliente:{}
    }
    validator = new SimpleReactValidator({
        messages:{
            required:'requerido'
    }});

    componentDidMount(){
        if(this.props.tipo){
            this.btnMsg = 'Actualizar';
            this.idCliente = this.props.cliente.id;
            this.setState({
                cliente:this.props.cliente
            });
        }
    }


    enviarFormulario = (event) =>{
        event.preventDefault();
        var cli = {
            nombre:this.nombreRef.current.value.toUpperCase(),
            direccion:this.direccionRef.current.value,
            telefono:this.telRef.current.value,
            email:this.emailRef.current.value,
            rfc:this.rfcRef.current.value.toUpperCase(),
            contacto:this.contactoRef.current.value,
            activo:true
        }
        this.setState({
            cliente:cli
        });
        
    }

    enviarCliente = () =>{
        if(this.validator.allValid()){
            if(this.btnMsg === 'Enviar'){
              Axios
                .post(Global.url+'cliente', this.state.cliente,{ headers: authHeader() })
                .then(res=>{
                    swal('Se inserto el cliente correctamente','','success');
                    this.cancelarCli();
                })
                .catch(err=>{
                    AuthService.isExpired(err.message);
                });
            }else{
              Axios
                .put(Global.url+'cliente/'+this.idCliente,this.state.cliente,{ headers: authHeader() })
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

    cancelarCli = () =>{
        this.setState({
            cliente:{}
        });
        this.props.cancelar();
    }

    render() {
        const cliente = this.state.cliente;
        return (            
            <React.Fragment>
              <form onChange={this.enviarFormulario} onSubmit={this.enviarFormulario}> 
                <h2 className="center">Agregar Cliente</h2>
                <div className="grid">
                    <div className="showcase-form card">
                        <div className="form-control">
                            <input type="text" name="nombre" placeholder="Nombre del Cliente" ref={this.nombreRef} value={cliente.nombre}/>
                            {this.validator.message('nombre',this.state.cliente.nombre,'required')}
                        </div>
                        <div className="form-control">
                            <textarea type="text" name="dir" placeholder="Dirección" ref={this.direccionRef} value={cliente.direccion} />
                            {this.validator.message('dir',this.state.cliente.direccion,'required')}
                        </div>
                        <div className="form-control">
                            <input type="text" name="telefono" placeholder="Telefono" ref={this.telRef} value={cliente.telefono}/>
                            {this.validator.message('telefono',this.state.cliente.telefono,'required')}
                        </div>
                    </div>
                    <div className="showcase-form card">
                        <div className="form-control">
                            <input type="text" placeholder="Correo Electronico" ref={this.emailRef} value={cliente.email}/>
                        </div>
                        <div className="form-control">
                            <input type="text" placeholder="RFC" ref={this.rfcRef}  value={cliente.rfc}/>
                        </div>
                        <div className="form-control">
                            <input type="text" placeholder="Contacto" ref={this.contactoRef} value={cliente.contacto} />
                        </div>
                    </div>
                </div>
                <div className="container grid">
                    <button className="btn btn-success" onClick={this.enviarCliente} >{this.btnMsg}</button>
                    <button className="btn btn-danger" onClick={this.cancelarCli}>Cancelar</button>
                </div>
              </form>
            </React.Fragment>
        )
    }
}
