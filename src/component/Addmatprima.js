import React, { Component } from "react";
import "react-day-picker/lib/style.css";
import "moment/locale/es-mx";
import Moment from 'moment';
import SimpleReactValidator from 'simple-react-validator'
import Axios from "axios";
import Global from "../Global";
import swal from "sweetalert";
import authHeader from "../services/auth-header";
import Bitacora from '../services/bitacora-service';
import TextField from '@material-ui/core/TextField';


export default class Addmatprima extends Component {
  idMatPrima = '';
  fechaEntrada = '';
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
    materiaPrima:{},
    date: new Date('2019-12-06 00:00:00'),
    locale: { name: 'en-US', label: 'English' },
    existencia: {
        escaso:'',
        necesarioMin:'',
        necesarioMax:'',
        abundante:''
    }
  };

  constructor(){
    super();
    this.validator = new SimpleReactValidator({
        messages:{
            required:'requerido'
        }
    });
    
  }

  componentDidMount(){
    this.setState({
      materiaPrima:{}
    });
      Axios.get(Global.url+'utils/unidad',{ headers: authHeader() })
      .then(
          res =>{
              this.setState({
                  unidades:res.data
              });
          }
      );

      this.setState({
          materiaPrima:{
              escaso:this.props.matprima.escaso,
              necesario:this.props.matprima.necesario
          }
      });

      if(!this.props.tipo){
        this.btnName = "Actualizar";
        this.idMatPrima = this.props.matprima.id;
        this.setState({
          materiaPrima: this.props.matprima
        });
        let tipo = document.getElementById("tipo");
        tipo.value = this.props.matprima.tipo;
      } 
  }

  selectDayEnt = (day) => {
      Moment.locale('es-mx');
      var materiaprima ={
        descripcion:this.descripcionRef.current.value,
        cantidad: this.cantidadRef.current.value,
        unidad:this.state.unidades[this.unidadRef.current.value] ,
        codigo:this.claveRef.current.value,
        proveedor:this.proveedorRef.current.value,
        fechaEntrada:Moment(day).format('MM-DD-yyyy h:mm:ss'),
        fechaCaducidad:this.state.materiaPrima.fechaCaducidad,
        observaciones:this.observacionesRef.current.value,
        lote:this.loteRef.current.value,
        necesario:this.necesarioRef.current.value,
        escaso:this.escasoRef.current.value,
        tipo:this.tipoRef.current.value
    }
    this.setState({
      materiaPrima:materiaprima
    });
  };

  selectDayCad = (day) => {
    Moment.locale('es-mx');
    var materiaprima ={
        descripcion:this.descripcionRef.current.value,
        cantidad: this.cantidadRef.current.value,
        unidad:this.state.unidades[this.unidadRef.current.value] ,
        codigo:this.claveRef.current.value,
        proveedor:this.proveedorRef.current.value,
        fechaEntrada:this.state.materiaPrima.fechaEntrada,
        fechaCaducidad:Moment(day).format('MM-DD-yyyy h:mm:ss'),
        observaciones:this.observacionesRef.current.value,
        lote:this.loteRef.current.value,
        necesario:this.necesarioRef.current.value,
        escaso:this.escasoRef.current.value,
        tipo:this.tipoRef.current.value
    }
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
    var materiaprima ={
        descripcion:this.descripcionRef.current.value,
        cantidad: this.cantidadRef.current.value,
        unidad:this.state.unidades[this.unidadRef.current.value] ,
        codigo:this.claveRef.current.value,
        proveedor:this.proveedorRef.current.value,
        fechaEntrada:this.state.materiaPrima.fechaEntrada,
        fechaCaducidad:this.state.materiaPrima.fechaCaducidad,
        observaciones:this.observacionesRef.current.value,
        lote:this.loteRef.current.value,
        necesario:this.necesarioRef.current.value,
        escaso:this.escasoRef.current.value,
        tipo:this.tipoRef.current.value
    }
    this.setState({
      existencia: existeData,
      materiaPrima:materiaprima
    });
  };

  agregarMateriaPrima = () =>{
    if(this.validator.allValid()){
      if(this.props.tipo){
        Axios.post(Global.url+'matprima',this.state.materiaPrima,{ headers: authHeader() })
            .then(res => {
                if(res.data.id!==null && res.data.id!==undefined){
                  swal('Se insertó correctamente el producto',this.state.materiaPrima.descripcion,'success');
                  var matprimaAdded = res.data;
                  this.props.cancelar(matprimaAdded);
                  Bitacora(Global.ADD_MATPRIM,JSON.stringify(matprimaAdded));
                }
            }).catch(err=>{
                console.log(err);
                swal('Ourrio un error al inserta la Materia Prima',err.message,'error');
            });
      }else{
        Axios.put(Global.url+'matprima/'+this.idMatPrima,this.state.materiaPrima,{ headers: authHeader() })
        .then(res=>{
          swal('La materia prima se actualizo correctamente',this.state.materiaPrima.descripcion,'success');
          this.props.cancelar(res.data);
        })
        .catch(err=>{
          console.log(err);
        });
      }
    }else{
        this.validator.showMessages();
        this.forceUpdate();
    }
  }

  cancelarMp = (event) =>{
    this.setState({
      materiaPrima:{}
    });
      this.props.cancelar(null);      
  }
 
  render() {
      const matprima = this.state.materiaPrima;
      const fechaEntrada = matprima.fechaEntrada ? Moment(matprima.fechaEntrada,'DD-MM-YYYY').format('YYYY-MM-DD') : '';
      const fechaCaducidad = matprima.fechaCaducidad ? Moment(matprima.fechaCaducidad,'DD-MM-YYYY').format('YYYY-MM-DD') : '';
      
      if(this.state.unidades.length > 0){
          var optnLst = this.state.unidades.map((unidad,i)=>{
              return <option key={i} value={i}>{unidad.unidadMedida}</option>
          });
      }
    return (
      <React.Fragment>
      <form onSubmit={this.enviarFormulario} onChange={this.enviarFormulario}>
        <div className=" grid">
          <div>
            <div className="showcase-form card">
              <div className="form-control">
                <input type="text" name="descripcion" placeholder="Descripcion" ref={this.descripcionRef} defaultValue={matprima.descripcion} required/>
                {this.validator.message('descripcion',this.state.materiaPrima.descripcion,'required')}
              </div>
              <div className="form-control grid">
                <input type="number" name="cantidad" placeholder="Cantidad"  ref={this.cantidadRef} defaultValue={matprima.cantidad} required/>
                <select className="custom-select" ref={this.unidadRef}>
                  {optnLst}
                </select>
                {this.validator.message('cantidad',this.state.materiaPrima.cantidad,'required')}
              </div>
              <div className="form-control grid">
                <div>
                  <input type="text" placeholder="Clave" name="clave" ref={this.claveRef} defaultValue={matprima.codigo} required/>
                  {this.validator.message('clave',this.state.materiaPrima.codigo,'required')}
                </div>
                <div>
                  <input type="text" placeholder="Lote" name="lote" ref={this.loteRef} defaultValue={matprima.lote} required/>
                  {this.validator.message('lote',this.state.materiaPrima.lote,'required')}
                </div>
              </div>
              <div className="form-control">
                <input type="text" name="proveedor" placeholder="Proveedor"  ref={this.proveedorRef} defaultValue={matprima.proveedor} required />
                {this.validator.message('proveedor',this.state.materiaPrima.proveedor,'required')}
              </div>
              <div className="form-control"></div>
            </div>
          </div>
          <div>
            <div className="showcase-form card">
              <div className="form-control grid">
                <TextField id="fechaEnt" 
                  label="Fecha Entrada"
                  type="date"
                  value={fechaEntrada}
                  onChange={value => this.selectDayEnt(value)}
                  InputLabelProps={{shrink: true}}
                />
                
                  <TextField
                  id="fechaCad"
                  label="Fecha Caducidad"
                  type="date"
                  defaultValue={fechaCaducidad}
                  value={fechaCaducidad}
                  onChange={value => this.selectDayCad(value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
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
                  <input type="number" readOnly  value={(Number(this.state.materiaPrima.escaso) + 1)} />
                  <input type="number" required ref={this.necesarioRef} defaultValue={matprima.necesario} />
                </div>
                <div className="grid">
                  <input type="number" readOnly value={Number(this.state.materiaPrima.necesario) + 1} />
                </div>
              </div>
              <div className="form-control ">
                <input type="text" name="observaciones" placeholder="Observaciones" defaultValue={matprima.observaciones} ref={this.observacionesRef}/>
                {this.validator.message('observaciones',this.state.materiaPrima.observaciones,'required')}
              </div>
            </div>
          </div>
          <input type="submit" value={this.btnName} className="btn btn-primary" onClick={this.agregarMateriaPrima}/>
          <input type="submit" value="Cancelar" className="btn btn-primary" onClick={this.cancelarMp}/>
        </div>

      </form>
</React.Fragment>
    );
  }
}
