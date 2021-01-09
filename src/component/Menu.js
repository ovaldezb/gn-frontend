import React, { Component } from 'react'
import { Link } from "react-router-dom";

export default class Menu extends Component {
    render() {
        return (
            <div className="menu">
              <ul>
                <li><Link to={"/principal"}>Materia Prima</Link> </li>
                <li><Link to={"/proddispon"}>Producto Disponible</Link> </li>
                <li><Link to="#">Orden de Fabricación</Link> </li>
                <li><Link to="#">Producto Terminado</Link> </li>
                <li><Link to="#">Clientes</Link> </li>
                <li><Link to="#">Proveedores</Link> </li>
                <li><Link to="#">Usuarios</Link> </li>
                <li><Link to="#">Bitácora</Link> </li>
              </ul>
            </div>
        )
    }
}
