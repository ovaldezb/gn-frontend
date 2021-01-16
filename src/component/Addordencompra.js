import Axios from "axios";
import React, { Component } from "react";
import swal from "sweetalert";
import Global from "../Global";
import authHeader from "../services/auth-header";
import SimpleReactValidator from 'simple-react-validator';
import Moment from 'moment';
import {TextField} from '@material-ui/core';

export default class Addordencompra extends Component {
  ocRef = React.createRef();
  claveRef = React.createRef();
  nombreRef = React.createRef();
  presRef = React.createRef();
  clienteRef = React.createRef();
  piezasRef = React.createRef();
  obsRef =React.createRef();
  btnName = 'Guardar';
  isErrorInit = true;
  right = {textAlign:"right"}
  state={
      ordencompra:{},
      proddisp:{},
      lstMatPrim:[],
      lstMatPrimResp:[],
      lstErr:[]
  }

  constructor(){
    super();
    this.validator = new SimpleReactValidator({
      className: 'text-danger',
      messages:{
          required:'Requerido'
      }
    });
    
  }

  componentDidMount(){
      if(!this.props.tipo){
        this.btnName = "Actualizar";
        this.setState({
            ordencompra: this.props.ordencompra
          });
      }
  }

  busPdClave = (event) =>{
    if(event.keyCode === 13){
      Axios.get(Global.url+'prodisp/'+this.state.ordencompra.clave,{ headers: authHeader() })
          .then(res=>{
            if(res.data !== null){     
              this.setState({
                proddisp:res.data,
                ordencompra:{
                  clave:res.data.clave,
                  nombre:res.data.nombre                  
                },
                lstMatPrim:res.data.materiaPrimaUsada
              });
            }else{
              swal('Producto no encontrado',this.state.ordencompra.clave,'error');
            }
          })
          .catch(err=>{

          });
    }
  }

  guardaOC = () =>{
    this.isErrorInit = true;
    var ordenCompraTmp = {
      oc:this.state.ordencompra.oc,
      clave:this.state.ordencompra.clave,
      nombreProducto:this.state.ordencompra.nombreProducto,
      //lote:this.state.ordencompra.lote,
      cliente:this.state.ordencompra.cliente,
      fechaFabricacion:this.state.ordencompra.fechaFabricacion,
      fechaEntrega:this.state.ordencompra.fechaEntrega,
      //noConsecutivo:this.state.counter,
      piezas:this.state.ordencompra.piezas,
      observaciones:this.state.ordencompra.observaciones,
      presentacion:this.state.ordencompra.presentacion,
      estatus:{codigo:'TEP'}
    };

    Axios.post(Global.url+'ordencompra',ordenCompraTmp,{ headers: authHeader() })
      .then(res=>{
          swal('Se guardó la Orden de Compra con éxito',this.state.ordencompra.noConsecutivo,'success');
          this.clean();
        this.cancelarOC();
      })
      .catch(err=>{

      });
  }

  cancelarOC = () => {
    this.props.cancelar(null);
  }

  enviarFormulario = (e) =>{
    e.preventDefault();
    var ordenComp = {
      oc:this.ocRef.current.value,
      clave:this.claveRef.current.value,
      nombreProducto:this.nombreRef.current.value,
      //lote:this.loteRef.current.value,
      cliente:this.clienteRef.current.value,
      fechaFabricacion:this.state.ordencompra.fechaFabricacion,
      fechaEntrega:this.state.ordencompra.fechaEntrega,
      noConsecutivo:this.state.counter,
      piezas:this.piezasRef.current.value,
      presentacion:this.presRef.current.value,
      observaciones:this.obsRef.current.value
    };
    this.setState({
      ordencompra:ordenComp
    });
  }

  selectDayFab = (day) => {
    var ordenComp = this.state.ordencompra;
    ordenComp.fechaFabricacion = Moment(day).format('MM-DD-yyyy h:mm:ss');
    this.setState({
      ordencompra:ordenComp
    });
  }

  selectDayEnt = (day) => {
    var ordenComp = this.state.ordencompra;
    ordenComp.fechaEntrega= Moment(day).format('MM-DD-yyyy h:mm:ss');
    this.setState({
      ordencompra:ordenComp
    });
  }

  clean = () =>{
    this.setState({
      ordencompra:{
        clave:'',
        nombreProducto:'',
        oc:'',
        cliente:'',
        piezas:'',
       observaciones:''
      }
    });
  }

  keyUp = () =>{
    console.log('keyUp');
  }

  pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
  }

  render() {
      const ordencompra = this.state.ordencompra;
      const fechaFabricacion = ordencompra.fechaFabricacion ?  Moment(ordencompra.fechaEntrada,'MM-DD-YYYY').format('YYYY-MM-DD') : '';
      const fechaEntrega = ordencompra.fechaEntrega ?  Moment(ordencompra.fechaEntrega,'MM-DD-YYYY').format('YYYY-MM-DD') : '';
    return (
      <React.Fragment>
        <form onSubmit={this.enviarFormulario} onChange={this.enviarFormulario}>
          <h3 className="center">Agregar orden de compra</h3>
          <div className="grid">
            <div className="showcase-form card">
            <div className="form-control grid">
                <div>
                  <input type="text" name="oc" placeholder="Orden de Compra" ref={this.ocRef} value={ordencompra.oc} />
                  {this.validator.message('oc',ordencompra.oc,'required')}
                </div>
                <div>
                  
                </div>
              </div>
              <div className="form-control grid-1-2">
                <div>
                  <input type="text" name="clave" placeholder="Clave" onKeyUp={this.busPdClave} ref={this.claveRef} value={this.state.ordencompra.clave}/>
                  {this.validator.message('clave',this.state.ordencompra.clave,'required')}
                </div>
                <div>
                  <input type="text" name="nombre" placeholder="Nombre del Producto" ref={this.nombreRef}  value={this.state.ordencompra.nombre}/>
                  {this.validator.message('nombre',this.state.ordencompra.nombreProducto,'required')}
                </div>
              </div>
              <div className="form-control grid-2-1">
                <div>
                  <input type="text" name="cliente" placeholder="Cliente" ref={this.clienteRef} value={this.state.ordencompra.cliente} />
                  {this.validator.message('cliente',this.state.ordencompra.cliente,'required')}
                </div>
                <div>
                  <input type="number" name="piezas" style={this.right} placeholder="Piezas Totales" ref={this.piezasRef} value={this.state.ordencompra.piezas} />
                  {this.validator.message('piezas',this.state.ordencompra.piezas,'required')}
                </div>
              </div>
            </div>
            <div className="showcase-form card">
              <div className="form-control grid">
                <input type="number" placeholder="Presentación" ref={this.presRef} value={this.state.ordencompra.presentacion}/>
                <div>
                    <legend>mililitros</legend>
                </div>
              </div>
              <div className="form-control grid">  
              
              <TextField id="fechaFab" 
                  label="Fecha Fabricación"
                  type="date"
                  defaultValue={fechaFabricacion}
                  onChange={value => this.selectDayFab(value)}
                  InputLabelProps={{shrink: true}}
                />
                
                
                <TextField id="fechaEnt" 
                  label="Fecha Entrega"
                  type="date"
                  defaultValue={fechaEntrega}
                  onChange={value => this.selectDayEnt(value)}
                  InputLabelProps={{shrink: true}}
                />    
                
              </div>
              
              <div className="form-control">
                <textarea placeholder="Observaciones" ref={this.obsRef}></textarea>
              </div>
              
            </div>
          </div>
      </form>
        <div className="container center">
            <div className="grid">
                <button className="btn btn-success" onClick={this.guardaOC}>{this.btnName}</button>
                <button className="btn btn-danger" onClick={this.cancelarOC}>Cancelar</button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
