import React, { Component } from "react";
//import "react-day-picker/lib/style.css";
import "moment/locale/es-mx";
import Moment from 'moment';
import SimpleReactValidator from 'simple-react-validator'
import Axios from "axios";
import Global from "../Global";
import swal from "sweetalert";
import authHeader from "../services/auth-header";
import Bitacora from '../services/bitacora-service';
import {TextField} from '@material-ui/core';
import AuthService from '../services/auth.service';

export default class Addmatprima extends Component {
  idMatPrima = '';
  btnName = 'Enviar';
  fechaCaducidad = '';
  descripcionRef = React.createRef();
  cantidadRef = React.createRef();
  unidadRef = React.createRef();
  claveRef = React.createRef();
  loteRef = React.createRef();
  proveedorRef = React.createRef();
  observacionesRef = React.createRef();
  escasoRef = React.createRef();
  necesarioRef = React.createRef();
  tipoRef = React.createRef();

  state = {
    selectedDayEnt: null,
    unidades:[],
    lstProv:[],
    materiaPrima:{
      unidad:{
        unidadMedida:''
      }
    },
    date: new Date('2019-12-06 00:00:00'),
    locale: { name: 'en-US', label: 'English' },
    existencia: {
        escaso:'',
        necesarioMin:'',
        necesarioMax:'',
        abundante:''
    }
  };
  validator = new SimpleReactValidator({
    messages:{
        required:'requerido'
    }
  });
  
  componentDidMount(){
    if(!this.props.tipo){
      this.btnName = "Actualizar";
      this.idMatPrima = this.props.matprima.id;
      this.fechaEntrada = this.props.matprima.fechaEntrada;
      this.fechaCaducidad = this.props.matprima.fechaCaducidad;
      
      this.setState({
        materiaPrima: this.props.matprima
      });
      let tipo = document.getElementById("tipo");
      tipo.value = this.props.matprima.tipo;
    } 
      this.getUnidades();
      this.getProveedores();
  }

  getUnidades = () =>{
    Axios.get(Global.url+'utils/unidad',{ headers: authHeader() })
    .then(
        res =>{
            this.setState({
                unidades:res.data
            });
        }
    );
  }

  getProveedores = () =>{
    Axios.get(Global.url+'proveedor',{ headers: authHeader() })
    .then(
        res =>{
            this.setState({
              lstProv:res.data
            });
        }
    ).catch(err=>{
      AuthService.isExpired(err.message);
    });
  }

  selectDayEnt = (event) => {
    var materiaprima = this.state.materiaPrima;
    materiaprima.fechaEntrada = Moment(event.target.value).format('MM-DD-yyyy h:mm:ss');
    this.setState({
      materiaPrima:materiaprima
    });
  };

  selectDayCad = (event) => {
    var materiaprima = this.state.materiaPrima;
    materiaprima.fechaCaducidad = Moment(event.target.value).format('MM-DD-yyyy h:mm:ss');
    this.setState({
      materiaPrima:materiaprima
    });
};

  enviarFormulario = (e) => {
    e.preventDefault();
    var existeData = {
      escaso: this.escasoRef.current.value,
      necesarioMin:Number(this.escasoRef.current.value)+1,
      necesarioMax:this.necesarioRef.current.value,
      abundante:Number(this.necesarioRef.current.value) + 1
    };
    var materiaprima = this.state.materiaPrima;
    materiaprima.descripcion=this.descripcionRef.current.value.toUpperCase();
    materiaprima.cantidad=this.cantidadRef.current.value;
    //materiaprima.unidad=this.state.unidades[this.unidadRef.current.value];
    materiaprima.unidad.id=this.unidadRef.current.value;
    materiaprima.codigo=this.claveRef.current.value;
    materiaprima.proveedor= this.state.lstProv[this.proveedorRef.current.selectedIndex];
    materiaprima.observaciones=this.observacionesRef.current.value;
    materiaprima.lote=this.loteRef.current.value;
    materiaprima.necesario=this.necesarioRef.current.value;
    materiaprima.escaso=this.escasoRef.current.value;
    materiaprima.tipo=this.tipoRef.current.value;
    this.setState({
      existencia: existeData,
      materiaPrima:materiaprima
    });
  };

  agregarMateriaPrima = () =>{
    if(this.validator.allValid()){
      if(this.props.tipo){
        let matprim = this.state.materiaPrima
        Axios.post(Global.url+'matprima',matprim,{ headers: authHeader() })
            .then(res => {
                if(res.data.id!==null && res.data.id!==undefined){
                  swal('Se insertó correctamente el producto',this.state.materiaPrima.descripcion,'success');
                  var matprimaAdded = res.data;
                  this.props.cancelar(matprimaAdded);
                  Bitacora(Global.ADD_MATPRIM,null,JSON.stringify(matprimaAdded));
                }
            }).catch(err=>{
              AuthService.isExpired(err.message);
            });
      }else{
        Axios.put(Global.url+'matprima/'+this.idMatPrima,this.state.materiaPrima,{ headers: authHeader() })
        .then(res=>{
          swal('La materia prima se actualizo correctamente',this.state.materiaPrima.descripcion,'success');
          this.props.cancelar(res.data);
          Bitacora(Global.UPDT_MATPRIM ,JSON.stringify(this.props.matprima),JSON.stringify(res.data));
        })
        .catch(err=>{
          AuthService.isExpired(err.message);
        });
      }
    }else{
        this.validator.showMessages();
        this.forceUpdate();
    }
  }

  onChange = () =>{

  }

  cancelarMp = (event) =>{
    this.setState({
      materiaPrima:{}
    });
      this.props.cancelar(null);      
  }
 
  render() {
      const matprima = this.state.materiaPrima;
      const fechaEntrada = matprima.fechaEntrada ? Moment(matprima.fechaEntrada,'MM-DD-YYYY').format('YYYY-MM-DD') : '';
      const fechaCaducidad = matprima.fechaCaducidad ? Moment(matprima.fechaCaducidad,'MM-DD-YYYY').format('YYYY-MM-DD') : '';
      if(this.state.unidades.length > 0){
          var optnLst = this.state.unidades.map((unidad,i)=>{
              return <option key={i} value={unidad.id}>{unidad.unidadMedida}</option>
          });
      }
    return (
      <React.Fragment>
      <form onSubmit={this.enviarFormulario} onChange={this.enviarFormulario}>
        <h3 className="center">Materia Prima</h3>
        <div className="grid">
          <div>
            <div className="showcase-form card">
              <div className="form-control">
                <input type="text" name="descripcion" placeholder="Descripcion" ref={this.descripcionRef} value={matprima.descripcion}  onChange={this.onChage} required/>
                {this.validator.message('descripcion',matprima.descripcion,'required')}
              </div>
              <div className="form-control grid">
                <input type="number" name="cantidad" placeholder="Cantidad"  ref={this.cantidadRef} defaultValue={matprima.cantidad} required/>
                <select className="custom-select" ref={this.unidadRef} value={matprima.unidad!==undefined ? matprima.unidad.id : '' }>
                  {optnLst}
                </select>
                {this.validator.message('cantidad',matprima.cantidad,'required')}
              </div>
              <div className="form-control grid">
                <div>
                  <input type="text" placeholder="Clave" name="clave" ref={this.claveRef} defaultValue={matprima.codigo} required/>
                  {this.validator.message('clave',matprima.codigo,'required')}
                </div>
                <div>
                  <input type="text" placeholder="Lote" name="lote" ref={this.loteRef} defaultValue={matprima.lote} required/>
                  {this.validator.message('lote',matprima.lote,'required')}
                </div>
              </div>
              <div className="form-control">
                <select value={matprima.proveedor!==undefined ? matprima.proveedor.id : '' } ref={this.proveedorRef} onChange={this.onChange}>
                  {
                    this.state.lstProv.map((prov,i)=>{
                      return(
                        <option key={i} value={prov.id}>{prov.nombre}</option>
                      );
                    })
                  }
                </select>
              </div>
              <div className="form-control"></div>
            </div>
          </div>
          <div>
            <div className="showcase-form card">
              <div className="form-control grid">
                {matprima.fechaEntrada  && 
                <TextField
                  id="fechaEnt"
                  label="Fecha de Entrada"
                  type="date"
                  defaultValue={fechaEntrada}
                  onChange={event =>{this.selectDayEnt(event)}}
                  InputLabelProps={{
                    shrink: true,
                  }}/>
              }
              {!matprima.fechaEntrada  && 
                <TextField
                  id="fechaEnt"
                  label="Fecha de Entrada"
                  type="date"                  
                  onChange={event =>{this.selectDayEnt(event)}}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  
                />
              }
              {matprima.fechaCaducidad &&
              <TextField
                id="date"
                label="Fecha de Caducidad"
                type="date"
                defaultValue={fechaCaducidad}
                onChange={event =>{this.selectDayCad(event)}}
                InputLabelProps={{
                  shrink: true,
                }}
                
              />
              }
              {!matprima.fechaCaducidad &&
              <TextField
                id="date"
                label="Fecha de Caducidad"
                type="date"                
                onChange={event =>{this.selectDayCad(event)}}
                InputLabelProps={{
                  shrink: true,
                }}
                
              />
              }
              </div>
              <div className="form-control grid">
                  <legend>Tipo de MP:</legend>
                  <select className="custom-select" id="tipo" name="tipo" ref={this.tipoRef}>
                    <option value="I">I & D</option>
                    <option value="P">Producción</option>
                  </select>
              </div>
              <div className="form-control grid-3 legenda">
                <legend>Escaso</legend>
                <legend>Necesario</legend>
                <legend>Abundante</legend>
              </div>
              <div className="form-control grid-3"> 
                <div className="grid">
                  <input type="number" value="0" readOnly />
                  <input type="number"  name="escaso" required ref={this.escasoRef} defaultValue={matprima.escaso}/>
                </div>
                <div className="grid">
                  <input type="number" readOnly  value={(Number(this.state.materiaPrima.escaso) + 1)}  onChange={this.onChage}/>
                  <input type="number" required ref={this.necesarioRef} defaultValue={matprima.necesario} />
                </div>
                <div className="grid">
                  <input type="number" readOnly value={Number(this.state.materiaPrima.necesario) + 1} onChange={this.onChage} />
                </div>
              </div>
              <div className="form-control ">
                <input type="text" name="observaciones" placeholder="Observaciones" defaultValue={matprima.observaciones} ref={this.observacionesRef}/>
                {this.validator.message('observaciones',this.state.materiaPrima.observaciones,'required')}
              </div>
            </div>
          </div>
        </div>
      </form>
      <div className="grid">
        <input type="submit" value={this.btnName} className="btn btn-success" onClick={this.agregarMateriaPrima}/>
        <input type="submit" value="Cancelar" className="btn btn-danger" onClick={this.cancelarMp}/>
      </div>
</React.Fragment>
    );
  }
}
