import Axios from "axios";
import React, { Component } from "react";
import Global from "../Global";
import authHeader from "../services/auth-header";
import authServices from '../services/auth.service';
import swal from "sweetalert";
import SimpleReactValidator from 'simple-react-validator'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faPlusCircle, faMinusCircle,  faEraser} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

export default class Addproddisp extends Component {
    style = {};
    styleBusqueda={border:"solid 1px red",width:"60%"};
    styleBusSel={}
    styleTblBus = {width:"100%"};
    col1B={width:"20%"};
    col2B={width:"60%"};
    col3B={width:"20%"};
    center = {textAlign:"center"}
    right = {textAlign:"right"}
    left = {textAlign:"left"}
    btnName = 'Enviar';
    codigoRef = React.createRef();
    descRef = React.createRef();
    unidadRef = React.createRef();
    cantidadRef = React.createRef();
    nombreRef = React.createRef();
    claveRef = React.createRef();
    isBusqueda = false;
    isReset = false;
    idPrdDisp = '';
    isUpdt=false;
    state = {
        //proddisp: {}, //Este es el que se va enviar
        codigo:'',
        desc:'',
        unidad:'', 
        lstMatPrim:[],
        cantidad:0,
        idSelPd:-1,
        idSelPdBus:-1,
        lstBusqDesc:[],
        nombre:'',
        clave:''
  };

  constructor(){
    super();
    this.url = Global.url;
    this.validator = new SimpleReactValidator({
        messages:{
            required:'requerido'
        }
    }); 
  }

  componentDidMount(){
      var prddisp = this.props.proddisp;
      
      if(!this.props.tipo){
        this.btnName = "Actualizar";
        this.idPrdDisp = this.props.proddisp.id;
        this.setState({
            nombre:prddisp.nombre,
            clave:prddisp.clave,
            lstMatPrim:prddisp.materiaPrimaUsada
        });
      }
  }
  
  busquedaDesc = (e)=>{
    if(e.keyCode === 13){
        if(this.state.desc !==''){
            Axios.get(Global.url+'matprimdisp/filter/'+this.state.desc,{ headers: authHeader() })
                .then(res =>{
                    this.setState({
                        lstBusqDesc:res.data
                    });
                })
                .catch();
        }else{
            Axios.get(Global.url+'matprimdisp',{ headers: authHeader() })
                .then(res =>{
                    this.setState({
                        lstBusqDesc:res.data
                    });
                })
                .catch();
        }
    }
  }

  busquedaCodigo = (e) =>{
      if(e.keyCode === 13){
        Axios.get(Global.url+'matprimdisp/'+this.state.codigo,{ headers: authHeader() })
        .then( res =>{
            this.setState({
                codigo:res.data.codigo,
                desc:res.data.descripcion,
                unidad:res.data.unidad
            });
        })
        .catch(err =>{
            if(err.message.includes("401")){
                this.setState({
                  status:'logout'
                });
                authServices.logout();
                swal("La sesión ha caducado","Por favor vuélvase a conectar","warning");
              }else{
                swal("Ha ocurrido un error, contacte al Administrador",err.message,"error");
              }
        });
      } 
  }

  addMatPrima = (e) =>{
      console.log('AddMP',this.isUpdt);
    let lstMpTmp;
    var res = this.state.lstMatPrim.filter(x => {
        return (x.codigo === this.state.codigo)
    });
    var matprima = {
        cantidad:this.cantidadRef.current.value,
        materiaprimadisponible:{
            codigo:this.codigoRef.current.value,    
            descripcion:this.descRef.current.value,
            unidad:this.state.unidad
        }
    }
    if(res.length > 0){
        swal('No se pueden agregar dos materiales del mismo codigo',this.state.codigo,'error');
        this.setState({
            codigo:'',
            desc:'',
            unidad:{}
        });
        return;
    }else if(this.state.cantidad === '' || Number(this.state.cantidad) === 0){
        swal('La cantidad no puede estar vacia o ser 0','Error','error');
        return;
    }else if(!this.isUpdt){
        console.log('agregar');
        lstMpTmp = this.state.lstMatPrim;
        lstMpTmp.push(matprima);
        /*this.setState({
            lstMatPrim:lstMpTmp,
            codigo:'',
            desc:'',
            cantidad:0,
            idSelPd:-1,
            unidad:{}
        });*/
    }else if(this.isUpdt){
        lstMpTmp = this.state.lstMatPrim;
        lstMpTmp[this.state.idSelPd] = matprima;
        this.isUpdt=false;
    }
    this.setState({
        lstMatPrim:lstMpTmp,
        codigo:'',
        desc:'',
        cantidad:0,
        idSelPd:-1,
        unidad:{}
    });
  }

  delMatPrim = () =>{
      var code = this.state.lstMatPrim[this.state.idSelPd].codigo;
      var lstTmp = this.state.lstMatPrim.filter((md) =>{
          return  (code !== md.codigo)
        });
      
      this.setState({
          lstMatPrim:lstTmp
      });
  }

  onSubmit = (e) =>{
    e.preventDefault();
    this.setState({
        desc:this.descRef.current.value,
        codigo:this.codigoRef.current.value,
        unidad: this.state.unidad,
        cantidad:this.cantidadRef.current.value,
        nombre:this.nombreRef.current.value,
        clave:this.claveRef.current.value
    }); 
  }

  saveProdDisp = () =>{
      var prdDispSave = {
          nombre:this.state.nombre,
          clave:this.state.clave,
          tipo:'vacio',
          materiaPrimaUsada: this.state.lstMatPrim
      };
      if(this.validator.allValid()){
        if(this.props.tipo){
          Axios.post(Global.url+'prodisp',prdDispSave,{ headers: authHeader() })
            .then(res =>{
              this.props.cancelar(prdDispSave);
              swal('Se inserto correctamente el Producto',prdDispSave.nombre,'success');
            })
            .catch(err=>{

            });
        }else{
            Axios.put(Global.url+'prodisp/'+this.idPrdDisp,prdDispSave,{ headers: authHeader() })
            .then(res =>{
              swal('Se actualizo correctamente el Producto',prdDispSave.nombre,'success');
              this.props.cancelar(res.data);
            })
            .catch(err=>{

            });
        }
      }else{
        this.validator.showMessages();
        this.forceUpdate();
      }
  }

  cancelAdd = (e) => {
    this.setState({
        lstMatPrim:[],
        nombre:'',
        clave:'',
        cantidad:''
    });
    this.props.cancelar(null);
  }

  clearBusqMP = () =>{
      this.setState({
          codigo:'',
          desc:'',
          cantidad:0,
          unidad:{}
      });
  }

  selectRow = (i) => {
    this.setState({
      idSelPd: i
    });
  };

  selectRowBus = (i)=>{
    this.setState({
        idSelPdBus:i
    });
  }

  selectRowBusSelected = (i) =>{
    this.setState({
        codigo: this.state.lstBusqDesc[i].codigo,
        desc:this.state.lstBusqDesc[i].descripcion,
        unidad:this.state.lstBusqDesc[i].unidad,
        lstBusqDesc:[],
        idSelPdBus:-1
    });
  }

  selUpdtMatPrim = (i) =>{
      console.log(this.state.lstMatPrim,i);
    this.setState({
        codigo:this.state.lstMatPrim[i].materiaprimadisponible.codigo,
        desc:this.state.lstMatPrim[i].materiaprimadisponible.descripcion,
        cantidad:this.state.lstMatPrim[i].cantidad,
        unidad:this.state.lstMatPrim[i].materiaprimadisponible.unidad
    });
    this.isUpdt = true;
  }

  render() {
    //const matdisp = this.state.matdisp;   
    if(this.state.lstBusqDesc.length > 0){
        var rowsBusq = this.state.lstBusqDesc.map((mdisp,i)=>{
            if(this.state.idSelPdBus === i){
                this.styleBusSel = "selected pointer";
            }else{
                this.styleBusSel ={};
            }
            return(
                <tr key={i} onClick={()=>{this.selectRowBus(i)}}  onDoubleClick={()=>{this.selectRowBusSelected(i)}} className={this.styleBusSel}>
                    <td>{mdisp.codigo}</td>
                    <td>{mdisp.descripcion}</td>
                    <td>{mdisp.unidad.unidadMedida}</td>
                </tr>
            );
        });
    } 
    if(this.state.lstMatPrim.length > 0 ){
        var rows = this.state.lstMatPrim.map((mpdis,i)=>{
            if (this.state.idSelPd === i) {
                this.style = "selected pointer";
              } else{
                this.style = {};
              }
            return(
                <tr key={i} onClick={() => {this.selectRow(i); }} onDoubleClick={()=>{this.selUpdtMatPrim(i)}} className={this.style}>
                    <td>{i+1}</td>
                    <td>{mpdis.materiaprimadisponible.codigo}</td>
                    <td>{mpdis.materiaprimadisponible.descripcion}</td>
                    <td>{mpdis.cantidad}</td>
                    <td>{mpdis.materiaprimadisponible.unidad.unidadMedida}</td>
                </tr>
            );
        });
    }
    
    return (
      <form onSubmit={this.onSubmit} onChange={this.onSubmit}>
        <div className="container-ng">
          <div className="showcase-form card">
            <div className="grid-2-3">
              <div className="form-control">
                <input type="text" name="nombre" placeholder="Nombre Producto" ref={this.nombreRef} value={this.state.nombre}  required/>
                {this.validator.message('nombre',this.state.nombre,'required')}
              </div>
              <div className="form-control">
                <input type="text" name="clave" placeholder="Clave" ref={this.claveRef} value={this.state.clave} />
                {this.validator.message('clave',this.state.clave,'required')}
              </div>
            </div>
          </div>
          <div className="showcase-form card">
            <h2 className="center">Materiales para el producto</h2>
            <p></p>
            <div className="row">
              <div className="col-2">
                <input type="text" placeholder="Codigo"  onKeyUp={this.busquedaCodigo} ref={this.codigoRef}  value={this.state.codigo}/>
              </div>
              <div className="col-4">
                <input type="text" placeholder="Descripcion" onKeyUp={this.busquedaDesc} ref={this.descRef} value={this.state.desc}/>
              </div>
              <div className="col-1">     
                <input type="text" placeholder="Unidad" disabled ref={this.unidadRef} defaultValue={this.state.unidad.unidadMedida} />  
              </div>
              <div className="col-2">
                <input type="number" placeholder="Cantidad" style={this.right} ref={this.cantidadRef} value={this.state.cantidad}/>
              </div>
              <div className="col-1">
              {this.state.unidad.unidadMedida &&
                <Link onClick={this.addMatPrima}>
                <FontAwesomeIcon icon={faPlusCircle} />
                </Link>
                }
              </div>
              <div className="col-1">
              {this.state.lstMatPrim.length > 0 && this.state.idSelPd >= 0 &&
                <Link onClick={this.delMatPrim}>
                    <FontAwesomeIcon icon={faMinusCircle}/>
                </Link>
              }
              </div>
              <div className="col-1">
              {(this.state.codigo || this.state.desc || this.state.cantidad > 0 ) &&
                <Link onClick={this.clearBusqMP}>
                    <FontAwesomeIcon icon={faEraser}/>
                </Link>
              }
              </div>              
            </div>
            {this.state.lstBusqDesc.length > 0 &&
            <div  className="table-ovfl-busq" style={this.styleBusqueda}>
                <table className="table " style={this.styleTblBus}>
                    <col width="25%"/>
                    <col width="60%"/>
                    <col width="15%"/>
                    <tbody>
                    {rowsBusq}
                    </tbody>
                </table>              
              
            </div>
            }
          </div>
          <div className="showcase-form card">
            <table className="table tab-header table-dark">
                <col width="15%"/>
                <col width="25%"/>
                <col width="20"/>
                <col width="20%"/>
                <col width="20%"/>
              <thead>
                <tr>
                  <td>#</td>
                  <td>Codigo</td>
                  <td>Descripcion</td>
                  <td>Cantidad</td>
                  <td>Unidad</td>
                </tr>
              </thead>
            </table>
            <div className="table-ovfl-prddisp">
                <table className="table">
                    <tbody>
                    {rows}
                    </tbody>
                </table>
            </div>
          </div>
          <div className="row">
              <div className="col-2">
                <input type="button" disabled={!this.state.lstMatPrim.length > 0} value={this.btnName} onClick={this.saveProdDisp} className="btn btn-success"/>        
              </div>
              <div className="col-2">
                <input type="button"  value="Cancelar"  onClick={this.cancelAdd} className="btn btn-danger"/>        
              </div>
          </div>
        </div>
      </form>
    );
  }
}
