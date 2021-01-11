import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faPumpSoap, faBong, 
  faListOl, faReceipt, 
  faArchive, faUserTie, faUsers, faHandshake } from "@fortawesome/free-solid-svg-icons";
import React, { Component } from 'react'
import { Link } from "react-router-dom";

export default class Menu extends Component {
    render() {
        return (
            <div className="menu">
              <ul>
                <li><Link to={"/principal"}>
                <span>
                      <FontAwesomeIcon icon={faBong} size="1x" className="icon-menu" />
                    </span>
                  Materia Prima</Link> </li>
                <li><Link to={"/proddispon"}>
                <span>
                      <FontAwesomeIcon icon={faReceipt} size="1x" className="icon-menu" />
                    </span>
                  Producto Disponible</Link> </li>
                <li><Link to={"/ordenfabricacion"}>
                <span>
                      <FontAwesomeIcon icon={faListOl} size="1x" className="icon-menu" />
                    </span>
                  Orden de Fabricación</Link> </li>
                <li>
                  <Link to={"/prodterminado"}>
                    <span>
                      <FontAwesomeIcon icon={faPumpSoap}className="icon-menu" />
                    </span>
                    Producto Terminado
                  </Link> 
                  
                  </li>
                <li><Link to="#">
                <span>
                      <FontAwesomeIcon icon={faHandshake}className="icon-menu" />
                    </span>
                  Clientes</Link> </li>
                <li><Link to="#">
                <span>
                      <FontAwesomeIcon icon={faUserTie}className="icon-menu" />
                    </span>
                  Proveedores</Link> </li>
                <li><Link to={"/usuarios"}>
                <span>
                      <FontAwesomeIcon icon={faUsers}className="icon-menu" />
                    </span>
                  Usuarios</Link> </li>
                <li><Link to={"/bitacora"}>
                <span>
                      <FontAwesomeIcon icon={faArchive}className="icon-menu" />
                    </span>
                  Bitácora</Link> </li>
              </ul>
            </div>
        )
    }
}
