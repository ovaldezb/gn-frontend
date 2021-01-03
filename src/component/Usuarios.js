import Axios from "axios";
import React, { Component } from "react";
import {  Link } from "react-router-dom";
import Global from "../Global";
import Header from "./Header";
import SimpleReactValidator from 'simple-react-validator';
import authHeader from '../services/auth-header';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit,faTrash } from "@fortawesome/free-solid-svg-icons";
import swal from "sweetalert";
import Bitacora from '../services/bitacora-service';

export default class Usuarios extends Component {
  url = Global.url;
  nombreRef = React.createRef();
  apellidoRef = React.createRef();
  usernameRef = React.createRef();
  emailRef = React.createRef();
  passwordRef = React.createRef();
  passwordverifRef = React.createRef();
  noempleadoRef = React.createRef();
  rolesRef = React.createRef();
  estatusRef = React.createRef();

  state = {
    lstUsers: [],
    lstRoles:[],
    usuario:{},
    usuarioPrevio:{},
    idSelMp: -1,
    btnNombre:'Enviar'
  };

  constructor(){
    super();
    this.validator = new SimpleReactValidator({
        messages:{
            required:'requerido'
        }
    });
  }

  componentDidMount() {
    this.getListUsers();
    this.getAllRoles();
  }

  getListUsers() {
     Axios.get(this.url + "usuario",{ headers: authHeader() })
       .then((res) => {
         if (res.data.length > 0) {
           this.setState({
             lstUsers: res.data,
           });
         }
       })
       .catch((err) => {
         console.log(err);
       });
  }

  getAllRoles(){
    Axios.get(this.url + "role",{ headers: authHeader() })
    .then((res) => {
      if (res.data.length > 0) {
        this.setState({
            lstRoles: res.data,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
  }

  onChangeFormulario = (event) =>{
    event.preventDefault();
    let user = {
        nombre:this.nombreRef.current.value,
        apellido:this.apellidoRef.current.value,
        username:this.usernameRef.current.value,
        email:this.emailRef.current.value,
        roles:[{'id':this.rolesRef.current.value}],
        password:this.passwordRef.current.value,
        noEmpleado:this.noempleadoRef.current.value,
        activo:this.estatusRef.current.value
    };

    this.setState({
        usuario:user
    });
  }

  submitFormulario = (event) =>{
    event.preventDefault();
    let lstTmp = this.state.lstUsers;
    let user = {
        nombre:this.nombreRef.current.value,
        apellido:this.apellidoRef.current.value,
        username:this.usernameRef.current.value,
        email:this.emailRef.current.value,
        roles:[{'id':this.rolesRef.current.value}],
        password:this.passwordRef.current.value,
        noEmpleado:this.noempleadoRef.current.value,
        activo:this.estatusRef.current.value
    };

    this.setState({
        usuario:user
    });
    if(this.validator.allValid()){
        if(this.state.btnNombre === 'Enviar'){
            Axios.post(this.url+'auth/signup',this.state.usuario,{ headers: authHeader() })
            .then(res =>{
                console.log(res);
                if(res.status === 200){
                    Bitacora(Global.ADD_USER,'',JSON.stringify(res.data));
                    lstTmp.push(res.data);
                    this.setState({
                        lstUsers:lstTmp,
                        usuario:{
                            nombre:'',
                            apellido:'',
                            email:'',
                            noEmpleado:'',
                            username:'',
                            password:'',
                            passwordrepeat:'',
                            activo:true,
                            roles:[]
                        }
                    });
                    swal('Se ha insertado el usuario correctamente','','success');
                }
            })
            .catch(err=>{
                swal('Ocurrio un error al crear el usuario','Error','error');
            });
        }else{
            Axios.put(this.url+'usuario/'+this.state.lstUsers[this.state.idSelMp].id,this.state.usuario,{ headers: authHeader() })
            .then(res =>{
                if(res.status === 200){
                    lstTmp[this.state.idSelMp] = res.data;
                    
                    Bitacora(Global.UPDT_USER,JSON.stringify( this.state.usuarioPrevio),JSON.stringify(res.data));
                    this.setState({
                        lstUsers:lstTmp,
                        usuario:{
                            nombre:'',
                            apellido:'',
                            email:'',
                            noEmpleado:'',
                            username:'',
                            password:'',
                            passwordrepeat:'',
                            activo:true
                        },
                        btnNombre:'Enviar'
                    });
                    swal('Se actualizo el usuario correctamente','','success');
                }
            })
            .catch(err=>{
                swal('Ocurrio un error al crear el usuario','Error','error');
            });
        }
    }else{
        this.validator.showMessages();
        this.forceUpdate();
    }
  }

  updatePopulateUser = () =>{
      if(this.state.idSelMp !==-1){
        this.setState({
            usuario:this.state.lstUsers[this.state.idSelMp],
            usuarioPrevio:this.state.lstUsers[this.state.idSelMp],
            btnNombre:'Actualizar'
        });
        
        let sel = document.getElementById("estatus");
        sel.value = this.state.lstUsers[this.state.idSelMp].activo;
        let roles = document.getElementById('roles');
        roles.value = this.state.lstUsers[this.state.idSelMp].roles[0].id;

      }
  }

  deleteUser = () =>{
    swal({
        title: "Estas seguro?",
        text: "Una vez eliminado, no se podrá recuperar la Materia Prima",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {
          Axios.delete(this.url+'usuario/'+this.state.lstUsers[this.state.idSelMp].id,{ headers: authHeader() })
            .then(res=>{
                if(res.state === 200){
                    Bitacora(Global.ADD_USER,JSON.stringify(this.state.lstUsers[this.state.idSelMp]),'');
                    this.state.lstUsers.splice(this.state.idSelMp,1);
                    swal("El usuario ha sido eliminad!", {icon: "success",});
                    this.setState({
                        idSelMp:-1
                    });
                }
            //this.forceUpdate();
                }).catch(
                err =>{
                    console.log('Error '+err.message);
                });
            } 
      });
  }

  clearForm = ()=>{
    this.setState({
        usuario:{
            nombre:'',
            apellido:'',
            email:'',
            noEmpleado:'',
            username:'',
            password:'',
            passwordrepeat:'',
            activo:true
        },
        btnNombre:'Enviar'
    });
  }

  selectRow = (i) => {
    this.setState({
      idSelMp: i,
    });
  };

    render() {
        const usuario = this.state.usuario;
        var style = {};
        var rowsRoles = this.state.lstRoles.map((role,i)=>{
            return <option key={i} value={role.id}>{role.label}</option>
        });
        var rows = this.state.lstUsers.map((user,i)=>{
            if (this.state.idSelMp === i) {
                style = "selected pointer";
              }else{
                style = "pointer";
              }
            return (
                <tr key={i} onClick={() => {
                    this.selectRow(i);}}  onDoubleClick={()=>{this.updatePopulateUser()}} className={style}>
                    <td>{i+1}</td>
                    <td>{user.nombre}</td>
                    <td>{user.apellido}</td>
                    <td>{user.username}</td>
                    <td>{user.activo?'Activo':'Inactivo'}</td>
                </tr>
            );
        });
        return (
        <React.Fragment>
          <Header />
          <form onSubmit={this.submitFormulario} onChange={this.onChangeFormulario}>
            <div className="container-gn grid-2-1">
              <div className="showcase-form card">
                <div className="barnav">
                    <div className="container flex-gn">
                        <div></div>
                        <nav>
                            <ul>
                                <li>
                                    <Link to="#" onClick={this.updatePopulateUser}>
                                    <FontAwesomeIcon icon={faEdit} />
                                    </Link>
                                </li>
                                <li>
                                    <Link to="#" onClick={this.deleteUser} >
                                    <FontAwesomeIcon icon={faTrash} />
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
                <table className="table">
                    <thead>
                        <tr>
                            <td>#</td>
                            <td>Nombre</td>
                            <td>Apellido</td>
                            <td>Usuario</td>
                            <td>Estatus</td>
                        </tr>
                    </thead>
                </table>
                <div className="table-ovfl-user">
                    <table className="table">
                        <tbody>
                        {rows}
                        </tbody>
                    </table>
                </div>
              </div>
              <div className="showcase-form card">
                <div className="form-control">
                    <input type="text" name="nombre" placeholder="Nombre" ref={this.nombreRef} defaultValue={usuario.nombre} value={usuario.nombre} required/>
                    {this.validator.message('nombre',this.state.usuario.nombre,'required')}
                </div>
                <div className="form-control">
                    <input type="text" name="apellido" placeholder="Apellido" ref={this.apellidoRef} defaultValue={usuario.apellido} value={usuario.apellido} required/>
                    {this.validator.message('apellido',this.state.usuario.apellido,'required')}
                </div>
                <div className="form-control">
                    <input type="email" name="correo" placeholder="Correo Electrónico" ref={this.emailRef} defaultValue={usuario.email} value={usuario.email} />
                </div>
                <div className="form-control">
                    <input type="text" name="noempleado" placeholder="No Empleado" ref={this.noempleadoRef} defaultValue={usuario.noEmpleado} value={usuario.noEmpleado} />
                </div>
                <div className="container grid">
                    <label className="label">Estatus:</label>
                    <div className="">
                        <select ref={this.estatusRef} id="estatus">
                            <option value="true">Activo</option>
                            <option value="false">Inactivo</option>
                        </select>
                    </div>
                </div>
                <div className="container grid">
                    <label className="label">Tipo:</label>
                        <select  ref={this.rolesRef} id="roles">
                        {rowsRoles}
                        </select>
                </div>
                
                <div className="form-control">
                    <input type="text"  placeholder="username" ref={this.usernameRef} defaultValue={usuario.username}  value={usuario.username} required/>
                    {this.validator.message('username',this.state.usuario.username,'required')}
                </div>
                <div className="container grid ">
                    <div className="form-control">    
                        <input type="password" name="password" placeholder="Contraseña" ref={this.passwordRef}  value={usuario.password} />
                    </div>
                    <div className="form-control">
                        <input type="password" name="passwordrepeat" placeholder="Confirmar Contraseña" ref={this.passwordverifRef} value={usuario.passwordrepeat} />
                    </div>
                </div>
                <div className="container grid">
                    <input type="submit" value={this.state.btnNombre} className="btn btn-primary" />
                    <input type="submit" value="Cancelar" className="btn btn-primary" onClick={this.clearForm} />
                </div>
              </div>
            </div>
          </form>
        </React.Fragment>
      );
    
  }
}
