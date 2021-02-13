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
  presRef = React.createRef();
  clienteRef = React.createRef();
  piezasRef = React.createRef();
  obsRef =React.createRef();
  tipoPresRef = React.createRef();
  loteRef = React.createRef();
  btnName = 'Guardar';
  isErrorInit = true;
  right = {textAlign:"right"}
  center = {textAlign:"center"}
  state={
      ordencompra:{},
      lstMatPrim:[],
      lstMatPrimResp:[],
      lstErr:[],
      lstCliente:[],
      idCliente:'',
      idOrdenCompra:'',
      
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
            ordencompra: this.props.ordencompra,
            idCliente:this.props.ordencompra.cliente.id,
            idOrdenCompra:this.props.ordencompra.id
          });
      }
  }

  buscaCliente = (event) =>{
    if(event.keyCode === 13){
      Axios.get(Global.url+'cliente/'+(this.clienteRef.current.value === '' ? 'vacio':this.clienteRef.current.value),{ headers: authHeader() })
      .then(res =>{

        if(res.data.length === 1){
          let oc = this.state.ordencompra;
          oc.cliente = res.data[0];
          this.setState({
            ordencompra:oc,
            idCliente:res.data[0].id
          });
        }else if(res.data.length > 1){
          this.setState({
            lstCliente:res.data
          });
        }
      })
      .catch(err=>{   });
    }
  }

  busProductoClave = (event) =>{
    if(event.keyCode === 13 || event._reactName === 'onBlur'){
      Axios.get(Global.url+'prodisp/'+this.state.ordencompra.clave,{ headers: authHeader() })
          .then(res=>{
            let oc = this.state.ordencompra;
            if(res.data !== null){     
              oc.clave = res.data.clave;
              oc.producto = res.data;              
              this.setState({
                ordencompra:oc,
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
    var ordenCompraTmp = this.state.ordencompra;
    if(this.btnName==='Guardar'){
      if(ordenCompraTmp.cliente === undefined || ordenCompraTmp.cliente.rfc===''){
          swal('No se ha hecho la búsqueda del Cliente','EL campo de RFC debe contener algún valor','warning');
          return;
      }
      
      ordenCompraTmp.estatus=Global.OPEN;
      ordenCompraTmp.piezasCompletadas=0;
      ordenCompraTmp.piezasEntregadas=0;
      ordenCompraTmp.aprobado = false;
      Axios.post(Global.url+'ordencompra',ordenCompraTmp,{ headers: authHeader() })
        .then(res=>{
          console.log(res);
            swal('Se guardó la Orden de Compra con éxito',ordenCompraTmp.oc,'success');
            this.cancelarOC();
        })
        .catch(err=>{
          console.log(err);
        });
    }else{
      Axios.put(Global.url+'ordencompra/'+this.state.idOrdenCompra,ordenCompraTmp,{ headers: authHeader() })
      .then(res=>{
          swal('Se actualizó la Orden de Compra con éxito',''+res.data.oc,'success');
          this.cancelarOC(res.data);
      })
      .catch(err=>{
        console.log(err);
      });
    }
  }

  cancelarOC = () => {
    this.clean();
    this.props.cancelar();
  }

  enviarFormulario = (e) =>{
    e.preventDefault();

    var ordenComp = this.state.ordencompra;
    ordenComp.oc=this.ocRef.current.value;
    ordenComp.clave=this.claveRef.current.value;    
    if(ordenComp.cliente !== undefined){
      if(this.clienteRef.current.value===''){
        ordenComp.cliente.rfc=''
      }
      ordenComp.cliente.nombre = this.clienteRef.current.value;    
    }    
    ordenComp.fechaFabricacion=this.state.ordencompra.fechaFabricacion;
    ordenComp.fechaEntrega=this.state.ordencompra.fechaEntrega;
    ordenComp.piezas=this.piezasRef.current.value;
    ordenComp.presentacion=this.presRef.current.value;
    ordenComp.observaciones=this.obsRef.current.value;
    ordenComp.tipoPresentacion=this.tipoPresRef.current.value;
    ordenComp.lote = this.loteRef.current.value;

    this.setState({
      ordencompra:ordenComp
    });
    
  }

  selectDayFab = (day) => {
    var ordenComp = this.state.ordencompra;
    ordenComp.fechaFabricacion = Moment(day.target.value).format('MM-DD-yyyy h:mm:ss');
    this.setState({
      ordencompra:ordenComp
    });
  }

  selectDayEnt = (day) => {
    var ordenComp = this.state.ordencompra;
    ordenComp.fechaEntrega= Moment(day.target.value).format('MM-DD-yyyy h:mm:ss');
    this.setState({
      ordencompra:ordenComp
    });
  }

  selCliente = (index) =>{
    let oc = this.state.ordencompra;
    oc.cliente = this.state.lstCliente[index];    
    let id = this.state.lstCliente[index].id;
    this.setState({
      ordencompra:oc,
      idCliente:id,
      lstCliente:[]
    });
  }

  clean = () =>{
    this.setState({
      ordencompra:{
        clave:'',
        producto:{},
        oc:'',
        cliente:{nombre:''},
        piezas:'',
       observaciones:'',
       presentacion:''
      }
    });
  }

  occhange = () =>{
    
  }

  pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
  }

  render() {
    const ordencompra = this.state.ordencompra;
    const fechaFabricacion = ordencompra.fechaFabricacion ?  Moment(ordencompra.fechaFabricacion,'MM-DD-YYYY').format('YYYY-MM-DD') : '';
    const fechaEntrega = ordencompra.fechaEntrega ?  Moment(ordencompra.fechaEntrega,'MM-DD-YYYY').format('YYYY-MM-DD') : '';

    return (
      
      <React.Fragment>
        <form onSubmit={this.enviarFormulario} onChange={this.enviarFormulario}>
          <h3 className="center">Orden de Compra</h3>
          <div className="grid">
            <div className="showcase-form card">
              <div className="form-control grid-3">
                <div>
                  {ordencompra.cliente && 
                  <input type="text" 
                    name="cliente" 
                    placeholder="Cliente" 
                    ref={this.clienteRef} 
                    value={ordencompra.cliente.nombre} 
                    onKeyUp={this.buscaCliente} onChange={this.occhange}/>                  
                  }
                  {!ordencompra.cliente && 
                  <input type="text" 
                    name="cliente" 
                    placeholder="Cliente" 
                    ref={this.clienteRef}                     
                    onKeyUp={this.buscaCliente} onKeyBlur={this.buscaCliente} />                  
                  }
                  {ordencompra.cliente && this.validator.message('cliente',ordencompra.cliente.nombre,'required')}
                  {this.state.lstCliente.length > 1 &&
                  <div className="cli-search">
                    <table className="tbl-cli">
                      <tbody>
                        {this.state.lstCliente.map((cli,i)=>{
                          return(
                            <tr key={i} onClick={()=>{this.selCliente(i)}}>
                              <td>{cli.nombre}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    </div>
                  }
                </div>
                <div className="center">
                  {ordencompra.cliente && 
                    <legend>{ordencompra.cliente.rfc}</legend>
                  }
                  {(!ordencompra.cliente || ordencompra.cliente.rfc==='')   && 
                    <legend>RFC</legend>
                  }
                </div>
                <div>
                  <input type="number" name="piezas" style={this.center} placeholder="Piezas Totales" ref={this.piezasRef} value={this.state.ordencompra.piezas} onChange={this.occhange}/>
                  {this.validator.message('piezas',ordencompra.piezas,'required')}
                </div>
              </div>
            <div className="form-control grid">
                <div>
                  <input type="text" name="oc" placeholder="Orden de Compra" ref={this.ocRef} value={ordencompra.oc} onChange={this.occhange} />
                  {this.validator.message('oc',ordencompra.oc,'required')}
                </div>
                <div>
                <input type="text" name="lote" placeholder="Lote" ref={this.loteRef} value={ordencompra.lote} onChange={this.occhange} />
                  {this.validator.message('lote',ordencompra.lote,'required')}
                </div>
              </div>
              <div className="form-control grid-1-2">
                <div>
                  <input type="text" name="clave" placeholder="Clave Prod Disp" onKeyUp={this.busProductoClave} ref={this.claveRef} value={ordencompra.clave} onBlur={this.busProductoClave} onChange={this.occhange}/>
                  {this.validator.message('clave',ordencompra.clave,'required')}
                </div>
                <div>
                  {ordencompra.producto && 
                  <legend><b>{ordencompra.producto.nombre}</b></legend>
                  }
                </div>
              </div>
              
            </div>
            <div className="showcase-form card">
              <div className="form-control grid">
                <input type="number" placeholder="Presentación" ref={this.presRef} value={ordencompra.presentacion} onChange={this.occhange}/>
                <div>
                    <select ref={this.tipoPresRef}>
                      <option value="milimililitros">mililitros</option>
                      <option value="gramos">gramos</option>
                    </select>
                </div>
              </div>
              <div className="form-control grid">  
              {ordencompra.fechaFabricacion && 
                <TextField id="fechaFab" 
                  label="Fecha Fabricación"
                  type="date"
                  defaultValue={fechaFabricacion}
                  onChange={value => this.selectDayFab(value)}
                  InputLabelProps={{shrink: true}}
                />
              }
              {!ordencompra.fechaFabricacion && 
                <TextField id="fechaFab" 
                  label="Fecha Fabricación"
                  type="date"
                  defaultValue={fechaFabricacion}
                  onChange={value => this.selectDayFab(value)}
                  InputLabelProps={{shrink: true}}
                />
              }
              {ordencompra.fechaEntrega && 
                <TextField id="fechaEnt" 
                  label="Fecha Entrega"
                  type="date"
                  defaultValue={fechaEntrega}
                  onChange={value => this.selectDayEnt(value)}
                  InputLabelProps={{shrink: true}}
                />    
              }
              {!ordencompra.fechaEntrega && 
                <TextField id="fechaEnt" 
                  label="Fecha Entrega"
                  type="date"
                  defaultValue={fechaEntrega}
                  onChange={value => this.selectDayEnt(value)}
                  InputLabelProps={{shrink: true}}
                />    
              }
              </div>
              
              <div className="form-control">
                <textarea placeholder="Observaciones" ref={this.obsRef}></textarea>
              </div>
              
            </div>
          </div>
      </form>
        <div className="container">
            <div className="grid">
                <button className="btn btn-success" onClick={this.guardaOC}>{this.btnName}</button>
                <button className="btn btn-danger" onClick={this.cancelarOC}>Cancelar</button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
