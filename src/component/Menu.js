import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faPumpSoap, faBong, 
  faListOl, faReceipt, 
  faArchive, faUserTie, 
  faUsers, faHandshake, 
  faShoppingCart,faTruckLoading,
  faFillDrip,
  faClipboardList} from "@fortawesome/free-solid-svg-icons";
import React, { Component } from 'react'
import { Link } from "react-router-dom";

export default class Menu extends Component {
  
  state={
    lstActive:[false,false],
    prev:0
  }

  click = (i) =>{
    let arr = this.state.lstActive;
    arr[i] = true;
    this.setState({
      lstActive:arr
    });
  }


    render() {
        return (
            <div className="menu">
              <ul>
                <li>
                  <Link to={"/usuarios"}>
                    <span>
                      <FontAwesomeIcon icon={faUsers}className="icon-menu" />
                    </span>
                    Usuarios</Link> 
                </li>
                <li>
                  <Link to="clientes" >
                    <span>
                      <FontAwesomeIcon icon={faHandshake}className="icon-menu" />
                    </span>
                    Clientes
                  </Link> 
                </li>
                <li>
                  <Link to="proveedores">
                    <span><FontAwesomeIcon icon={faUserTie}className="icon-menu" /></span>
                    Proveedores
                  </Link> 
                </li>
                <li>
                  <Link to={"/principal"} onClick={()=>{this.click(0)}} className={this.state.lstActive[0] ? 'selected' : ''}>
                    <span><FontAwesomeIcon icon={faBong} size="1x" className="icon-menu" /></span>
                    Materia Prima
                  </Link> 
                </li>
                <li>
                  <Link to={"/bases"}>
                  <span>
                    <FontAwesomeIcon icon={faFillDrip} size="1x" className="icon-menu"/>
                  </span>
                  Bases
                  </Link>
                </li>
                <li>
                  <Link to={"/proddispon"} onClick={()=>{this.click(1)}} className={this.state.lstActive[1] ? 'selected':''} >
                    <span><FontAwesomeIcon icon={faReceipt} size="1x" className="icon-menu" /></span>
                    Producto Disponible
                  </Link> 
                </li>
                <li>
                  <Link to={"/ordencompra"} >
                    <span><FontAwesomeIcon icon={faShoppingCart} size="1x" className="icon-menu" /></span>
                   Orden de Compra
                   </Link> 
                </li>
                <li>
                  <Link to={"/lotes"}>
                    <span>
                      <FontAwesomeIcon icon={faClipboardList} className="icon-menu" /> Lotes de Producto
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to={"/ordenfabricacion"}>
                    <span><FontAwesomeIcon icon={faListOl} size="1x" className="icon-menu" /></span>
                   Orden de Fabricación
                   </Link> 
                </li>
                <li>
                  <Link to={"/prodterminado"} >
                    <span>
                      <FontAwesomeIcon icon={faPumpSoap}className="icon-menu" />
                    </span>
                    Producto Terminado
                  </Link> 
                </li>
                <li>
                  <Link to={"/productoentregado"} >
                    <span>
                      <FontAwesomeIcon icon={faTruckLoading}className="icon-menu" />
                    </span>
                    Producto Entregado
                  </Link> 
                </li>
                <li>
                  <Link to={"/bitacora"}>
                    <span><FontAwesomeIcon icon={faArchive}className="icon-menu" /></span>
                    Bitácora
                  </Link> 
                  </li>
              </ul>
            </div>
        )
    }
}
