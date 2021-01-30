import Axios from "axios";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import Global from "../Global";
import SimpleReactValidator from "simple-react-validator";
import authHeader from "../services/auth-header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import swal from "sweetalert";
import Bitacora from "../services/bitacora-service";
import Paginacion from "./Paginacion";

export default class Usuarios extends Component {
  nombreRef = React.createRef();
  apellidoRef = React.createRef();
  usernameRef = React.createRef();
  //emailRef = React.createRef();
  passwordRef = React.createRef();
  passwordverifRef = React.createRef();
  estatusRef = React.createRef();
  areaRef = React.createRef();
  filterRef = React.createRef();

  state = {
    lstUsers: [],
    lstAreas: [],
    usuario: { activo: false },
    usuarioPrevio: {},
    idSelMp: -1,
    btnNombre: "Enviar",
    pageOfItems: [],
    page: 1,
    filtro: "",
  };

  constructor() {
    super();
    this.validator = new SimpleReactValidator({
      messages: {
        required: "requerido",
      },
    });
  }

  componentDidMount() {
    this.getListUsers();
    this.getAreas();
  }

  getListUsers() {
    Axios.get(Global.url + "usuario", { headers: authHeader() })
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

  getAreas() {
    Axios.get(Global.url + "utils/areas", { headers: authHeader() })
      .then((res) => {
        this.setState({
          lstAreas: res.data,
        });
      })
      .catch((err) => {});
  }

  onChangeFormulario = (event) => {
    event.preventDefault();

    let user = {
      nombre: this.nombreRef.current.value,
      apellido: this.apellidoRef.current.value,
      username: this.usernameRef.current.value,
      password: this.passwordRef.current.value,
      area: { id: this.areaRef.current.value },
      activo: this.estatusRef.current.checked,
    };

    this.setState({
      usuario: user,
    });
    
  };

  submitFormulario = (event) => {
    event.preventDefault();
    let user = {
      nombre: this.nombreRef.current.value,
      apellido: this.apellidoRef.current.value,
      username: this.usernameRef.current.value,
      password: this.passwordRef.current.value,
      area: { id: this.areaRef.current.value },
      activo: this.estatusRef.current.checked,
    };

    this.setState({
      usuario: user,
    });
    if (this.validator.allValid()) {
      if(!(this.passwordRef.current.value === this.passwordverifRef.current.value)){
        
        swal('La contraseña no coincide','Favor de corregir','warning');
        return;
      }

      if (this.state.btnNombre === "Enviar") {
        Axios.post(Global.url + "auth/signup", this.state.usuario, {headers: authHeader()})
          .then((res) => {
            if (res.status === 200) {
              Bitacora(Global.ADD_USER, "", JSON.stringify(res.data));              
              this.getListUsers();
              this.clearForm();
              swal("Se ha insertado el usuario correctamente", "", "success");
            }
          })
          .catch((err) => {
            swal("Ocurrio un error al crear el usuario", "Error", "error");
          });
      } else {
        Axios.put(
          Global.url +
            "usuario/" +
            this.state.lstUsers[(this.state.page - 1) * 10 + this.state.idSelMp]
              .id,
          this.state.usuario,
          { headers: authHeader() }
        )
          .then((res) => {
            if (res.status === 200) {
              //lstTmp[this.state.idSelMp] = res.data;
              this.getListUsers();
              Bitacora(
                Global.UPDT_USER,
                JSON.stringify(this.state.usuarioPrevio),
                JSON.stringify(res.data)
              );
              this.clearForm();
              swal("Se actualizo el usuario correctamente", "", "success");
            }
          })
          .catch((err) => {
            swal("Ocurrio un error al crear el usuario", "Error", "error");
          });
      }
    } else {
      this.validator.showMessages();
      this.forceUpdate();
    }
  };

  updatePopulateUser = () => {
    if (this.state.idSelMp !== -1) {
      this.setState({
        usuario: this.state.lstUsers[
          (this.state.page - 1) * 10 + this.state.idSelMp
        ],
        usuarioPrevio: this.state.lstUsers[
          (this.state.page - 1) * 10 + this.state.idSelMp
        ],
        btnNombre: "Actualizar",
      });

      let sel = document.getElementById("estatus");
      sel.checked = this.state.lstUsers[this.state.idSelMp].activo;
      let area = document.getElementById("area");
      area.value = this.state.lstUsers[this.state.idSelMp].area.id;
    }
  };

  deleteUser = () => {
    swal({
      title: "Estas seguro?",
      text: "Una vez eliminado, no se podrá recuperar el usuario",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        Axios.delete(
          Global.url +
            "usuario/" +
            this.state.lstUsers[(this.state.page - 1) * 10 + this.state.idSelMp]
              .id,
          { headers: authHeader() }
        )
          .then((res) => {
            console.log(res.status);
            if (res.status === Global.HTTP_OK) {
              Bitacora(
                Global.ADD_USER,
                JSON.stringify(
                  this.state.lstUsers[
                    (this.state.page - 1) * 10 + this.state.idSelMp
                  ]
                ),
                ""
              );
              //this.state.lstUsers.splice(this.state.idSelMp,1);
              this.getListUsers();
              swal("El usuario ha sido eliminado!", { icon: "success" });
              this.setState({
                idSelMp: -1,
              });
            }
          })
          .catch((err) => {
            console.log("Error " + err.message);
          });
      }
    });
  };

  clearForm = () => {
    this.setState({
      usuario: {
        nombre: "",
        apellido: "",
        area: "",
        username: "",
        password: "",
        passwordrepeat: "",
        activo: false,
      },
      btnNombre: "Enviar",
    });
    let estatus = document.getElementById("estatus");
    estatus.checked = false;
    let area = document.getElementById("area");
    area.value = this.state.lstAreas[0].id;
  };

  onChangePage = (pageOfItems, page) => {
    // update state with new page of items
    this.setState({ pageOfItems: pageOfItems, page: page });
  };

  selectRow = (i) => {
    this.setState({
      idSelMp: i,
    });
  };

  filter = () => {
    var filter = this.filterRef.current.value;
    var td, found, i, j;
    var tabla = document.getElementById("usuarios");

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
  };

  render() {
    const usuario = this.state.usuario;
    var style = {};

    var rows = this.state.pageOfItems.map((user, i) => {
      if (this.state.idSelMp === i) {
        style = "selected pointer";
      } else {
        style = "pointer";
      }
      return (
        <tr key={i} onClick={() => {this.selectRow(i); }} onDoubleClick={() => {this.updatePopulateUser();}} className={style}>
          <td>
            {user.nombre} {user.apellido}
          </td>
          <td>{user.username}</td>
          <td>{user.area.name}</td>
          <td>{user.activo ? "Activo" : "Inactivo"}</td>
        </tr>
      );
    });
    return (
      <React.Fragment>
        <form onSubmit={this.onChangeFormulario} onChange={this.onChangeFormulario}>
          <div className="container-gn grid-1-2">
            <div className="showcase-form card">
              <div className="form-control">
                <input type="text" name="nombre" placeholder="Nombre" ref={this.nombreRef} defaultValue={usuario.nombre} value={usuario.nombre} />
                {this.validator.message("nombre",this.state.usuario.nombre,"required")}
              </div>
              <div className="form-control">
                <input type="text" name="apellido" placeholder="Apellido" ref={this.apellidoRef} defaultValue={usuario.apellido} value={usuario.apellido} />
                {this.validator.message(
                  "apellido",
                  this.state.usuario.apellido,
                  "required"
                )}
              </div>
              <div className="container grid-1-3">
                <label className="label">Area:</label>
                <select name="area" id="area" className="custom-select" ref={this.areaRef}>
                  {this.state.lstAreas.map((area, i) => {
                    return (
                      <option key={i} value={area.id}>
                        {area.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="container grid-1-2">
                <label className="label">Estatus:</label>
                <label className="switch">
                  <input
                    type="checkbox"
                    ref={this.estatusRef}
                    value={this.state.usuario.activo}
                    id="estatus"
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="form-control">
                <input
                  type="text"
                  placeholder="username"
                  ref={this.usernameRef}
                  defaultValue={usuario.username}
                  value={usuario.username}
                />
                {this.validator.message(
                  "username",
                  this.state.usuario.username,
                  "required"
                )}
              </div>

              <div className="form-control">
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  ref={this.passwordRef}
                  value={usuario.password}
                />
              </div>
              <div className="form-control">
                <input
                  type="password"
                  name="passwordrepeat"
                  placeholder="Confirmar Contraseña"
                  ref={this.passwordverifRef}
                  value={usuario.passwordrepeat}
                />
              </div>
            </div>
            <div className="showcase-form card">
              <div className="barnav">
                <div className="container flex-gn">
                  <ul>
                    <li>Filtro:&nbsp;</li>
                    <li>
                      <input
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
                        <Link to="#" onClick={this.updatePopulateUser}>
                          <FontAwesomeIcon icon={faEdit} />
                        </Link>
                      </li>
                      <li>
                        <Link to="#" onClick={this.deleteUser}>
                          <FontAwesomeIcon icon={faTrash} />
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
              <table className="table table-bordered table-dark center">
                <col width="26%" />
                <col width="22%" />
                <col width="37%" />
                <col width="15%" />
                <thead className="thead-light">
                  <tr>
                    <td>Nombre</td>
                    <td>Usuario</td>
                    <td>Area</td>
                    <td>Estatus</td>
                  </tr>
                </thead>
              </table>
              <div className="table-ovfl-user tbl-lesshead">
                <table className="table table-hover" id="usuarios">
                  <col width="26%" />
                  <col width="22%" />
                  <col width="37%" />
                  <col width="15%" />
                  <tbody>{rows}</tbody>
                </table>
              </div>
              <div className="center paginacio-marg-top">
                <Paginacion
                  items={this.state.lstUsers}
                  onChangePage={this.onChangePage}
                />
              </div>
            </div>
          </div>
          <div className="grid">
          <button className="btn btn-success" onClick={this.submitFormulario}>{this.state.btnNombre}</button>
          <button className="btn btn-danger" onClick={this.clearForm}>Limpiar</button>
        </div>
        </form>
        
      </React.Fragment>
    );
  }
}
