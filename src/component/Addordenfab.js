import Axios from "axios";
import React, { Component } from "react";
import swal from "sweetalert";
import Global from "../Global";
import authHeader from "../services/auth-header";
import SimpleReactValidator from 'simple-react-validator';
import NumberFormat from 'react-number-format';


export default class Addordenfab extends Component {
  ocRef = React.createRef();
  loteRef = React.createRef();
  piezasRef = React.createRef();
  obsRef =React.createRef();
  selAllRef = React.createRef();
  valorRef = React.createRef()
  center = {textAlign:"center"}
  right = {textAlign:"right"}
  left = {textAlign:"left"}
  btnNameValida = 'Validar OF';
  isErrorInit = true;
  selAll = false;
  state={
      ordenfab:{},
      proddisp:{},
      lstMatPrim:[],
      lstMatPrimResp:[],
      counter:0,
      lstErr:[],
      clave:'',
      valor:'',
      cliente:''
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

  componentDidUpdate(){
    if(this.valorRef.current !== null){
      this.valorRef.current.focus();
    }
  }

  getCounter(){
    Axios.get(Global.url+'ordenfab/count')
    .then(res=>{
      this.setState({
        counter:this.pad(Number(res.data.counter) + 1,Global.SIZE_DOC)
      });
    })
    .catch();
  }

   validarOF = () =>{
    if(this.btnNameValida === 'Reset'){
      this.cancelarOF(true);
    }else if(this.validator.allValid()){
      if(this.btnNameValida === 'Validar OF'){
        this.isErrorInit = false;
        this.setState({
          lstMatPrimResp:[]
        });
        Axios.get(Global.url+'prodisp/'+this.state.clave,{ headers: authHeader() })
        .then(
          lstMatPrim =>{
            lstMatPrim.data.materiaPrimaUsada.forEach((matPrim,i)=>{
              Axios.get(Global.url+'ordenfab/validar/'+
                    matPrim.materiaprimadisponible.codigo+'/'+
                    matPrim.porcentaje+'/'+
                    this.state.ordenfab.piezas+'/'+this.state.ordenfab.presentacion,
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
                let lstErrTmp = this.state.lstMatPrimResp.filter(mpr =>{
                  return mpr.estatus === 'ERROR';
                });
                this.setState({
                  lstErr:lstErrTmp
                });
                this.btnNameValida = 'Reset'
            });
          }
        ).catch(err =>{
          console.log(err);
        });
      }else{

      }
    }else{
      this.validator.showMessages();
      this.forceUpdate();
    }
  }

  guardaOf = () =>{
    var msg = '';
    this.state.lstMatPrimResp.forEach((mp,i)=>{
      if(!document.getElementById("val"+i).checked){
        msg = msg +'->'+mp.nombre+'\n';
      }
    });
    if(msg!==''){
      swal('Es necesario aprobar la(s) MP:\n'+msg);
      return;
    }

    this.isErrorInit = true;
    var ordenFabTmp = this.state.ordenfab;
    ordenFabTmp.noConsecutivo=Number(this.state.counter);
    ordenFabTmp.matprima=this.state.lstMatPrimResp;
    ordenFabTmp.estatus=Global.TEP;    
    
    Axios.post(Global.url+'ordenfab',ordenFabTmp,{ headers: authHeader() })
      .then(res=>{
          swal('Se guardó la Orden de Fabricación con éxito',this.state.ordenfab.noConsecutivo,'success');
          this.clean();
          this.props.cancelar(res.data);
      })
      .catch(err=>{

      });
  }

  cancelarOF = (isReset) => {
    this.isErrorInit = true;
    /*var ordenFabTmp = {
      matprima:this.state.lstMatPrimResp,
    };*/
    /*if(this.state.lstMatPrimResp.length > 0){
      Axios.post(Global.url+'ordenfab/cancelar',ordenFabTmp,{ headers: authHeader() })
        .then( res =>{
          if(isReset){
            this.btnNameValida = 'Validar OF';
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
    }*/
    this.btnNameValida = 'Validar OF';
    this.clean();
    if(!isReset){
      this.props.cancelar(null);
    }
  }

  enviarFormulario = (e) =>{
    e.preventDefault();
    var ordenFab = this.state.ordenfab;
    ordenFab.oc=this.ocRef.current.value;
    ordenFab.lote=this.loteRef.current.value;
    ordenFab.noConsecutivo=this.state.counter;
    ordenFab.piezas=this.piezasRef.current.value;
    ordenFab.observaciones=this.obsRef.current.value;
    //ordenFab.presentacion:this.state.ordenfab.presentacion,    
    this.setState({
      ordenfab:ordenFab,
      piezasPendientes:this.state.piezasTotales - this.piezasRef.current.value
    });
  }

  /*buscaOC = (e) =>{
    if(e.keyCode === 13){
      Axios.get(Global.url+'ordencompra/oc/'+this.state.ordenfab.oc,{ headers: authHeader() })
      .then(res =>{
        this.setState({
          ordenfab:{
            presentacion:res.data.presentacion,
            nombre:res.data.nombreProducto
          },
          piezasPendientes:res.data.piezas - res.data.piezasFabricadas,
          piezasTotales:res.data.piezas - res.data.piezasFabricadas,
          clave:res.data.clave,
        });
      })
      .catch(err =>{
        console.log(err);
      });
    }
  }*/
  
  clean = () =>{
    this.setState({
      ordenfab:{
        oc:'',
        lote:'',
        piezas:'',
       observaciones:''
      },
      lstMatPrimResp:[],
      piezasPendientes:''
    });
  }

  selectAll = () =>{
  this.state.lstMatPrimResp.forEach((mp,i)=>{
    document.getElementById("val"+i).checked = !this.selAll;
  });
  this.selAll = !this.selAll;
  }

  updateQty = (i,qty) =>{
    if(document.getElementById("val"+i).checked){
      return;
    }
    let mpArray = this.state.lstMatPrimResp.map((mp,j)=>{
      if(i===j){
        mp.valor = Number(qty);
        return mp;
      }else{
        mp.valor = -1;
        return mp;
      }
    });
    this.setState({
      lstMatPrimResp:mpArray,
      valor:Number(qty)
    });
    
  }

  validaOF = (e) =>{
    if(e.keyCode === 13 || e._reactName === 'onBlur'){
      
      if(this.state.ordenfab.oc === undefined){
        return;
      }
      Axios.get(Global.url+'ordencompra/oc/'+this.state.ordenfab.oc,{ headers: authHeader() })
      .then(res=>{
        let of = this.state.ordenfab;
        of.presentacion=res.data.presentacion;
        of.nombre=res.data.nombreProducto;
        this.setState({
          ordenfab:of,
          piezasPendientes:res.data.piezas - res.data.piezasFabricadas,
          piezasTotales:res.data.piezas - res.data.piezasFabricadas,
          clave:res.data.clave,
        });
      })
      .catch(err=>{
        //console.log(err);
          swal('No existe la OC '+this.state.ordenfab.oc,'no es posible continuar con la OF','warning');
          let of = this.state.ordenfab;
          of.oc = ''
          this.setState({
            ordenfab: of,
            piezasPendientes:''
          });
      });
    }
  }

  updtRow = (i) =>{
    
    let mpArray = this.state.lstMatPrimResp;
    mpArray[i].cantidad = Number(this.valorRef.current.value);
    mpArray[i].valor = -1;
    this.setState({
      lstMatPrimResp:mpArray,
    });
  }

  getCantUpdt = () =>{
    this.setState({
      valor:Number(this.valorRef.current.value)
    });
  }
  onChange = () =>{

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
          <h2 className="center" >Agregar Orden de Fabricación</h2>
          <div className="grid">
            <div className="showcase-form card">
              <div className="form-control grid">
                <h3>OF: {this.state.counter}</h3>
                <label>{this.state.cliente}</label>
              </div>
              <div className="form-control grid">
                <div>
                  <input type="text" name="oc" placeholder="Orden de Compra" ref={this.ocRef} value={this.state.ordenfab.oc} onKeyUp={this.validaOF} onBlur={this.validaOF} />
                  {this.validator.message('oc',this.state.ordenfab.oc,'required')}
                </div>
                <div>
                  <input type="text" name="lote" placeholder="Lote" ref={this.loteRef} value={this.state.ordenfab.lote} />
                  {this.validator.message('lote',this.state.ordenfab.lote,'required')}
                </div>
              </div>
            </div>
            <div className="showcase-form card">
              <div className="form-control grid-3">
                <div>
                  <input type="number" name="piezas" placeholder="Piezas" ref={this.piezasRef} value={this.state.ordenfab.piezas} onChange={this.onChange}/>
                  {this.validator.message('piezas',this.state.ordenfab.piezas,'required')}
                </div>
                <div>
                  <NumberFormat value={this.state.piezasPendientes} displayType={'text'} thousandSeparator={true} />                  
                </div>
                <div></div>
              </div>
              <div className="form-control">
                <textarea placeholder="Observaciones" ref={this.obsRef} value={this.state.ordenfab.observaciones}></textarea>
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
                  <th style={this.center}><button className="btn is-small" onClick={this.selectAll}>Seleccionar</button></th>
                </tr>
              </thead>
            </table>
          
            <div className="table-ovfl-of-val">
              <table className="table table-bordered table-hover header-font">
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
                    <td>{matprimres.codigo}</td>
                    <td>{matprimres.nombre}</td>
                    {((!matprimres.valor && matprimres.valor===undefined) || matprimres.valor===-1) && 
                      <td style={this.right} onClick={()=>{this.updateQty(i,Number(matprimres.cantidad).toFixed(2))}}><NumberFormat value={Number(matprimres.cantidad).toFixed(2)} displayType={'text'} thousandSeparator={true} /></td>
                    }
                    {matprimres.valor && matprimres.valor !==-1 &&
                      <td><input type="number" className="valor" value={this.state.valor} ref={this.valorRef} onChange={this.getCantUpdt} onBlur={()=>{this.updtRow(i)}}/></td>
                    }
                    <td>{matprimres.lote}</td>
                    <td className={style} style={this.center}>{matprimres.estatus}</td>
                    <td><input type="checkbox" name={'val'+i} id={'val'+i} /></td>
                  </tr>
                  )
                })}
                </tbody>
              </table>
            </div>
          </div>
          }
      </form>
      <div className="container grid-3">
            <button className="btn btn-success" onClick={this.validarOF}>{this.btnNameValida} </button>
            <button className="btn btn-danger" onClick={() =>{this.cancelarOF(false)}}>Cancelar</button>
            <button className="btn btn-warning" onClick={this.guardaOf} disabled={(this.isErrorInit || this.state.lstErr.length >= 1 )} >Guardar</button>
          </div>
      </React.Fragment>
    );
  }
}
