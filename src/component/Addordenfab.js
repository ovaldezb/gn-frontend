import Axios from "axios";
import React, { Component } from "react";
//import "react-day-picker/lib/style.css";
import swal from "sweetalert";
import Global from "../Global";
import authHeader from "../services/auth-header";
import SimpleReactValidator from 'simple-react-validator';
import NumberFormat from 'react-number-format';
import Moment from 'moment';
import {TextField} from '@material-ui/core';

export default class Addordenfab extends Component {
  ocRef = React.createRef();
  claveRef = React.createRef();
  nombreRef = React.createRef();
  loteRef = React.createRef();
  clienteRef = React.createRef();
  piezasRef = React.createRef();
  obsRef =React.createRef();
  center = {textAlign:"center"}
  right = {textAlign:"right"}
  left = {textAlign:"left"}
  btnNameValida = 'Validar OF';
  isErrorInit = true;

  state={
      ordenfab:{},
      proddisp:{},
      lstMatPrim:[],
      lstMatPrimResp:[],
      counter:0,
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
    this.getCounter();
  }

  componentWillUnmount(){
    if(this.state.lstMatPrimResp.length > 0){
      this.cancelarOF(true);
    }
  }

  getCounter(){
    Axios.get(Global.url+'ordenfab/count')
    .then(res=>{
      this.setState({
        counter:this.pad(Number(res.data.counter) + 1,6)
      });
    })
    .catch();
  }

  busPdClave = (event) =>{
    if(event.keyCode === 13){
      Axios.get(Global.url+'prodisp/'+this.state.ordenfab.clave,{ headers: authHeader() })
          .then(res=>{
            if(res.data !== null){     
              this.setState({
                proddisp:res.data,
                ordenfab:{
                  clave:res.data.clave,
                  nombre:res.data.nombre                  
                },
                lstMatPrim:res.data.materiaPrimaUsada
              });
            }else{
              swal('Producto no encontrado',this.state.ordenfab.clave,'error');
            }
          })
          .catch(err=>{

          });
    }
  }

   validarOF = () =>{
    if(this.btnNameValida === 'Reset'){
      console.log('Cancel desde validar');
      this.cancelarOF(true);
    }else if(this.validator.allValid()){
      if(this.btnNameValida === 'Validar OF'){
        this.isErrorInit = false;
        this.setState({
          lstMatPrimResp:[]
        });
        this.state.lstMatPrim.forEach((matprim,i) =>{
          Axios.get(Global.url+'ordenfab/validar/'+
                    matprim.materiaprimadisponible.codigo+'/'+
                    matprim.cantidad+'/'+
                    this.state.ordenfab.piezas,
                    { headers: authHeader() })
            .then( res =>{
              var lstTmpMP = this.state.lstMatPrimResp;
              lstTmpMP.push(res.data[0]);
              this.setState({
                lstMatPrimResp:lstTmpMP
              });
              
            })
            .catch(err =>{
              console.log(err);
            }); 
        });
        let lstErrTmp = this.state.lstMatPrimResp.filter(mpr =>{
            return mpr.estatus === 'ERROR';
        });
        this.setState({
          lstErr:lstErrTmp
        });
        this.btnNameValida = 'Reset'
      }else{

      }
    }else{
      this.validator.showMessages();
      this.forceUpdate();
    }
  }

  guardaOf = () =>{
    this.isErrorInit = true;
    var ordenFabTmp = {
      oc:this.state.ordenfab.oc,
      clave:this.state.ordenfab.clave,
      nombre:this.state.ordenfab.nombre,
      lote:this.state.ordenfab.lote,
      cliente:this.state.ordenfab.cliente,
      fechaFabricacion:this.state.ordenfab.fechaFabricacion,
      fechaEntrega:this.state.ordenfab.fechaEntrega,
      noConsecutivo:this.state.counter,
      piezas:this.state.ordenfab.piezas,
      observaciones:this.state.ordenfab.observaciones,
      matprima:this.state.lstMatPrimResp,
      estatus:'TEP'
    };
    
    Axios.post(Global.url+'ordenfab',ordenFabTmp,{ headers: authHeader() })
      .then(res=>{
        console.log(res.data);
          swal('Se guardó la Orden de Fabricación con éxito',this.state.ordenfab.noConsecutivo,'success');
          this.clean();
      })
      .catch(err=>{

      });
  }

  cancelarOF = (isReset) => {
    this.isErrorInit = true;
    var ordenFabTmp = {
      //oc:this.state.ordenfab.oc,
      //clave:this.state.ordenfab.clave,
      //nombre:this.state.ordenfab.nombre,
      //lote:this.state.ordenfab.lote,
      //cliente:this.state.ordenfab.cliente,
      //fechaFabricacion:this.state.ordenfab.fechaFabricacion,
      //fechaEntrega:this.state.ordenfab.fechaEntrega,
      //noConsecutivo:this.state.counter,
      //piezas:this.state.ordenfab.piezas,
      //observaciones:this.state.ordenfab.observaciones,
      matprima:this.state.lstMatPrimResp,
      //estatus:'TEP'
    };
    if(this.state.lstMatPrimResp.length > 0){
      Axios.post(Global.url+'ordenfab/cancelar',ordenFabTmp,{ headers: authHeader() })
        .then( res =>{
          if(isReset){
            swal('Se reseteo la Orden de Fabricación',this.state.ordenfab.noConsecutivo,'success');
          }else{
            swal('Se canceló la Orden de Fabricación',this.state.ordenfab.noConsecutivo,'success');
          }
          this.clean();
        })
        .catch(err =>{
        });
    }else{
      this.clean();
    }
    
    if(!isReset){
      this.props.cancelar(null);
    }
  }

  enviarFormulario = (e) =>{
    e.preventDefault();
    var ordenFab = {
      oc:this.ocRef.current.value,
      clave:this.claveRef.current.value,
      nombre:this.nombreRef.current.value,
      lote:this.loteRef.current.value,
      cliente:this.clienteRef.current.value,
      fechaFabricacion:this.state.ordenfab.fechaFabricacion,
      fechaEntrega:this.state.ordenfab.fechaEntrega,
      noConsecutivo:this.state.counter,
      piezas:this.piezasRef.current.value,
      observaciones:this.obsRef.current.value
    };
    this.setState({
      ordenfab:ordenFab
    });
  }

  selectDayFab = (day) => {
    var ordenFab = {
      oc:this.ocRef.current.value,
      clave:this.claveRef.current.value,
      nombre:this.nombreRef.current.value,
      lote:this.loteRef.current.value,
      cliente:this.clienteRef.current.value,
      fechaFabricacion:Moment(day).format('MM-DD-yyyy h:mm:ss'),
      fechaEntrega:this.state.ordenfab.fechaEntrega,
      noConsecutivo:this.state.counter,
      piezas:this.piezasRef.current.value,
      observaciones:this.obsRef.current.value
    };
    this.setState({
      ordenfab:ordenFab
    });
  }

  selectDayEnt = (day) => {
    var ordenFab = {
      oc:this.ocRef.current.value,
      clave:this.claveRef.current.value,
      nombre:this.nombreRef.current.value,
      lote:this.loteRef.current.value,
      cliente:this.clienteRef.current.value,
      fechaFabricacion:this.state.ordenfab.fechaFabricacion,
      fechaEntrega:Moment(day).format('MM-DD-yyyy h:mm:ss'),
      noConsecutivo:this.state.counter,
      piezas:this.piezasRef.current.value,
      observaciones:this.obsRef.current.value
    };
    this.setState({
      ordenfab:ordenFab
    });
  }

  clean = () =>{
    this.setState({
      ordenfab:{
        clave:'',
        nombre:'',
        oc:'',
        lote:'',
        cliente:'',
        piezas:'',
       observaciones:''
      },
      lstMatPrimResp:[]
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
    return (
      <React.Fragment>
        <form onSubmit={this.enviarFormulario} onChange={this.enviarFormulario}>
          <div className="grid">
            <div className="showcase-form card">
              <div className="form-control">
                <h2>Orden: {this.state.counter}</h2>
              </div>
              <div className="form-control grid-1-2">
                <div>
                  <input type="text" name="clave" placeholder="Clave" onKeyUp={this.busPdClave} ref={this.claveRef} value={this.state.ordenfab.clave}/>
                  {this.validator.message('clave',this.state.ordenfab.clave,'required')}
                </div>
                <div>
                  <input type="text" name="nombre" placeholder="Nombre del Producto" ref={this.nombreRef}  value={this.state.ordenfab.nombre}/>
                  {this.validator.message('nombre',this.state.ordenfab.nombre,'required')}
                </div>
              </div>
              <div className="form-control grid">
                <div>
                  <input type="text" name="oc" placeholder="OC" ref={this.ocRef} value={this.state.ordenfab.oc} />
                  {this.validator.message('oc',this.state.ordenfab.oc,'required')}
                </div>
                <div>
                  <input type="text" name="lote" placeholder="Lote" ref={this.loteRef} value={this.state.ordenfab.lote} />
                  {this.validator.message('lote',this.state.ordenfab.lote,'required')}
                </div>
              </div>
            </div>
            <div className="showcase-form card">
              <div className="form-control grid-2-1">
                <div>
                  <input type="text" name="cliente" placeholder="Cliente" ref={this.clienteRef} value={this.state.ordenfab.cliente} />
                  {this.validator.message('cliente',this.state.ordenfab.cliente,'required')}
                </div>
                <div>
                  <input type="number" name="piezas" placeholder="Piezas" ref={this.piezasRef} value={this.state.ordenfab.piezas} />
                  {this.validator.message('piezas',this.state.ordenfab.piezas,'required')}
                </div>
              </div>
              
              <div className="form-control grid">  
              <TextField id="fechaFab" 
                  label="Fecha Fabricación"
                  type="date"
                  value={new Date()}
                  onChange={value => this.selectDayFab(value)}
                  InputLabelProps={{shrink: true}}
                />
                <TextField id="fechaEnt" 
                  label="Fecha Entrega"
                  type="date"
                  value={new Date()}
                  onChange={value => this.selectDayEnt(value)}
                  InputLabelProps={{shrink: true}}
                />    
              </div>
              <div className="form-control">
                <textarea placeholder="Observaciones" ref={this.obsRef}></textarea>
              </div>
            </div>
          </div>
          
          {this.state.lstMatPrimResp.length > 0 &&
          <div className="container">
            <table className="table table-dark table-bordered tbl-lesshead-1 header-font">
              <col width="15%"/>
              <col width="34%"/>
              <col width="10%"/>
              <col width="12%"/>
              <col width="9%"/>
              <col width="20%"/>
              <thead>
                <tr>
                  <th style={this.center}>Codigo</th>
                  <th style={this.center}>Materia prima</th>
                  <th style={this.center}>Cantidad</th>
                  <th style={this.center}>Lote</th>
                  <th style={this.center}>Estatus</th>
                  <th style={this.center}>Comentarios</th>
                </tr>
              </thead>
            </table>
          
            <div className="table-ovfl-of-val">
              <table className="table table-bordered header-font">
                <col width="15%"/>
                <col width="35%"/>
                <col width="10%"/>
                <col width="10%"/>
                <col width="9%"/>
                <col width="21%"/>
                <tbody>
                {this.state.lstMatPrimResp.map((matprimres,i)=>{
                  var style = {};
                  if(matprimres.estatus===Global.OK){
                    style = "suficiente";
                  }else if(matprimres.estatus===Global.ERROR){

                    style = "escaso";
                  }
                  return (
                  <tr key={i}>
                    <td>{matprimres.codigo}A</td>
                    <td>{matprimres.nombre}</td>
                    <td style={this.right}><NumberFormat value={Number(matprimres.cantidad).toFixed(2)} displayType={'text'} thousandSeparator={true} /></td>
                    <td>{matprimres.lote}</td>
                    <td className={style} style={this.center}>{matprimres.estatus}</td>
                    <td>{matprimres.comentarios}</td>
                  </tr>
                  )
                })}
                </tbody>
              </table>
            </div>
          </div>
          }
      </form>
      <div className="grid-3">
            <button className="btn btn-success" onClick={this.validarOF}>{this.btnNameValida} </button>
            <button className="btn btn-danger" onClick={() =>{this.cancelarOF(false)}}>Cancelar</button>
            <button className="btn btn-warning" onClick={this.guardaOf} disabled={(this.isErrorInit || this.state.lstErr.length >= 1 )} >Guardar</button>
          </div>
      </React.Fragment>
    );
  }
}
