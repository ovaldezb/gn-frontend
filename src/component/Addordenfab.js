import Axios from "axios";
import React, { Component } from "react";
import swal from "sweetalert";
import Global from "../Global";
import authHeader from "../services/auth-header";
import SimpleReactValidator from 'simple-react-validator';
import NumberFormat from 'react-number-format';
import AuthService from '../services/auth.service';

export default class Addordenfab extends Component {
  loteRef = React.createRef();
  obsRef =React.createRef();
  selAllRef = React.createRef();
  valorRef = React.createRef()
  loteAguaRef = React.createRef();
  center = {textAlign:"center"}
  right = {textAlign:"right"}
  left = {textAlign:"left"}
  btnNameValida = 'Validar OF';
  btnEnviar = 'Guardar';
  isErrorInit = true;
  selAll = false;
  lstMatPrimRespBase=[];
  state={
      ordenfab:{oc:{oc:''}},
      proddisp:{},
      lstMatPrim:[],
      lstMatPrimResp:[],
      counter:0,
      lstErr:[],
      clave:'',
      valor:'',
      cliente:'',
      lstLotes:[],
      piezasFabricadas:0
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

  async componentDidMount(){
    if(!this.props.tipo){
      this.isErrorInit=false;
      this.btnEnviar = 'Actualizar';
      await this.setState({
        ordenfab:this.props.ordenfab,
        lstMatPrimResp:this.props.ordenfab.matprima,
        counter:this.pad(Number(this.props.ordenfab.noConsecutivo) ,Global.SIZE_DOC)
      });
      this.selAll = false;
      this.selectAll();
      await this.setState({          
        
        piezasLote:this.props.ordenfab.piezasLote,
        clave:this.props.ordenfab.clave,
        cliente:this.props.ordenfab.oc.cliente.nombre,
        producto:this.props.ordenfab.oc.producto.nombre
      });
      
    }else{
      this.getCounter();
    }
    
  }

  componentDidUpdate(){
    if(this.valorRef.current !== null){
      this.valorRef.current.focus();
    }
    if(this.loteAguaRef.current !== null){
      this.loteAguaRef.current.focus();
    }
  }

  getCounter(){
    Axios.get(Global.url+'ordenfab/count',{ headers: authHeader() })
    .then(res=>{
      this.setState({
        counter:this.pad(Number(res.data.counter) + 1,Global.SIZE_DOC)
      });
    })
    .catch(err=>{
      AuthService.isExpired(err.message);
    });
  }

  guardaOf = () =>{
    var msg = '';
    var loteagua = false;
    this.state.lstMatPrimResp.forEach((mp,i)=>{
      if(!document.getElementById("val"+i).checked){
        msg = msg +'->'+mp.nombre+'\n';
      }
      if(mp.codigo===Global.CODIGO_AGUA && !mp.lote){
        loteagua = true;
      }
    });
    if(msg!==''){
      swal('Es necesario aprobar la(s) MP:\n'+msg);
      return;
    }

    if(loteagua){
      swal('Es necesario agregar un lote al Agua');
      return;
    }

    this.isErrorInit = true;
    var ordenFabTmp = this.state.ordenfab;
    ordenFabTmp.matprima=this.state.lstMatPrimResp;
    if(this.btnEnviar === 'Guardar'){
      ordenFabTmp.oc = {id:this.state.ordenfab.oc.id}
      ordenFabTmp.estatus=Global.TEP;
      ordenFabTmp.piezas=this.state.piezasLote; 
      
      Axios.post(Global.url+'ordenfab',ordenFabTmp,{ headers: authHeader() })
      .then(res=>{
          if(res.data.length > 0){
            swal("No se puedo generar la orden de fabriacion, verifique las cantidades");
            this.setState({
              lstMatPrimResp:res.data
            });
          }else{
            swal('Se guardó la Orden de Fabricación con éxito',this.pad(ordenFabTmp.noConsecutivo,Global.SIZE_DOC),'success');
            this.clean();
            this.props.cancelar(res.data);
          }
      })
      .catch(err=>{
        AuthService.isExpired(err.message);
      });
    }else{
      Axios.put(Global.url+'ordenfab/'+ordenFabTmp.id,ordenFabTmp,{ headers: authHeader() })
      .then(res=>{
        this.btnEnviar = 'Guardar';
        swal('La OF se actualizo correctamente');
        this.cancelarOF(false);
      })
      .catch(err=>{
        AuthService.isExpired(err.message);
      });
    }
  }

  cancelarOF = (isReset) => {
    this.isErrorInit = true;
    this.btnNameValida = 'Validar OF';
    this.clean();
    if(!isReset){
      this.props.cancelar(null);
    }
  }

  enviarFormulario = (e) =>{
    e.preventDefault();
    var ordenFab = this.state.ordenfab;
    ordenFab.lote=this.loteRef.current.value;
    ordenFab.noConsecutivo=this.state.counter;
    ordenFab.observaciones=this.obsRef.current.value;  
    if(this.loteAguaRef.current){
      this.setState({
        loteAgua: this.loteAguaRef.current.value
      });
    }
  }
  
  clean = () =>{
    this.setState({
      ordenfab:{
        oc:{oc:''},
        piezas:'',
       observaciones:''
      },
      cliente:'',
      lstMatPrimResp:[],
    });
    this.lstMatPrimRespBase=[];
    this.loteRef.current.value = '';
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

  updateFolioAgua = (index,loteAgua) =>{
    if(this.state.lstMatPrimResp[index].codigo === Global.CODIGO_AGUA){
      let mpArray = this.state.lstMatPrimResp.map((mp,j)=>{
        if(index === j){
          mp.loteAgua = true;
          return mp;
        }else{
          mp.loteAgua = false;
          return mp;
        }
      });
      this.setState({
        lstMatPrimResp:mpArray,
        loteAgua:loteAgua
      });
    }
  }

  //|| e._reactName === 'onBlur'
  validaLote = (e) =>{
    if(e.keyCode === 13 ){
      Axios.get(Global.url+'lote/val/'+(this.state.ordenfab.lote===undefined?'vacio':this.state.ordenfab.lote===''?'vacio':this.state.ordenfab.lote),{ headers: authHeader() })
      .then(res=>{     
        if(res.data.length===1){
          if(res.data[0].fabricado){
            swal('Este Lote ya fue fabricado','Error','warning');
            this.loteRef.current.value="";
            return;
          }
          let of = this.state.ordenfab;
          of.presentacion=res.data[0].oc.presentacion;
          of.nombre=res.data[0].oc.producto.nombre;
          of.oc = res.data[0].oc;
          of.lote = res.data[0].lote;
          this.loteRef.current.value=res.data[0].lote;
          this.lstMatPrimRespBase = JSON.parse(JSON.stringify(res.data[0].materiaprima));
          this.setState({
            ordenfab:of,
            piezasLote:res.data[0].piezasLote,
            piezasFabricadas:res.data[0].oc.piezasFabricadas,
            clave:res.data[0].oc.clave,
            cliente:res.data[0].oc.cliente.nombre,
            producto:res.data[0].oc.producto.nombre,
            lstMatPrimResp:res.data[0].materiaprima
          });
        }else if(res.data.length>1){
          this.setState({
            lstLotes:res.data
          });
        }
      })
      .catch(err=>{
        AuthService.isExpired(err.message);
        if(err.message.includes("400")){
          swal('El lote '+this.state.ordenfab.lote+' no existe o aún no ha sido aprobado','No se puede iniciar la fabricación','error');
          this.loteRef.current.value="";
          let of = this.state.ordenfab;
          of.lote = ''
          this.setState({
            ordenfab: of,
            piezasLote:'',
            clave:'',
            cliente:'',
            producto:''
          });
        }
      });
    }
  }

  updtRow = (i) =>{
    let mpArray = this.state.lstMatPrimResp;
    mpArray[i].cantidad = Number(this.valorRef.current.value);
    mpArray[i].delta = Number(this.valorRef.current.value) - Number(this.lstMatPrimRespBase[i].cantidad) ;
    mpArray[i].valor = -1;
    this.setState({
      lstMatPrimResp:mpArray,
    });
  }

  updtRowLote = (i) =>{
    let mpArray = this.state.lstMatPrimResp;
    if(this.loteAguaRef.current){
      mpArray[i].lote = this.loteAguaRef.current.value;
    }    
    mpArray[i].loteAgua = false;
    this.setState({
      lstMatPrimResp:mpArray,
      loteAgua:mpArray[i].lote
    });
  }

  getCantUpdt = () =>{
    this.setState({
      valor:Number(this.valorRef.current.value)
    });
  }
  
  selLote = (index) =>{
    let of = this.state.ordenfab;
    of.presentacion=this.state.lstLotes[index].oc.presentacion;
    of.nombre=this.state.lstLotes[index].oc.producto.nombre;
    of.oc = this.state.lstLotes[index].oc;
    of.lote = this.state.lstLotes[index].lote;
    this.loteRef.current.value=this.state.lstLotes[index].lote;
    this.lstMatPrimRespBase = JSON.parse(JSON.stringify(this.state.lstLotes[index].materiaprima ));
    this.setState({
      ordenfab:of,
      piezasLote:this.state.lstLotes[0].piezasLote,
      clave:this.state.lstLotes[index].oc.clave,
      cliente:this.state.lstLotes[index].oc.cliente.nombre,
      producto:this.state.lstLotes[index].oc.producto.nombre,
      lstMatPrimResp:this.state.lstLotes[index].materiaprima,
      lstLotes:[]
    });
  }

  pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
  }

  render() {
    const width={width:'100%'}
    return (
      <React.Fragment>
        <form onSubmit={this.enviarFormulario} onChange={this.enviarFormulario}>
          <h2 className="center">Orden de Fabricación</h2>
          <div className="grid">
            <div className="showcase-form card">
              <div className="form-control grid">
                <h4>OF:{this.state.counter}</h4>
                <h3>{this.state.cliente}</h3>
              </div>
              <div className="form-control grid">
                <div>
                  <input type="text" name="lote" placeholder="Lote" ref={this.loteRef} defaultValue={this.state.ordenfab.lote} onKeyUp={this.validaLote} />
                  {this.validator.message('lote',this.state.ordenfab.lote,'required')}
                  {this.state.lstLotes.length > 1 &&
                  <div className="tbl-oc">
                    <table style={width}>
                      <tbody>
                        {this.state.lstLotes.map((lote,i)=>{
                          return(
                            <tr key={i} onClick={()=>{this.selLote(i)}}>
                              <td className="pointer">{lote.lote}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    </div>
                  }
                </div>
                <div className="producto">
                  <legend>
                  Piezas: <NumberFormat value={this.state.piezasLote} displayType={'text'} thousandSeparator={true} />
                  </legend> 
                </div>
              </div>
            </div>
            <div className="showcase-form card">
              <div className="form-control">
                <div>
                <div className="producto">{this.state.producto}</div>
                </div>
              </div>
              <div className="form-control">
                <input type="text" className="input" placeholder="Observaciones" ref={this.obsRef} defaultValue={this.state.ordenfab.observaciones}></input>
              </div>
            </div>
          </div>
          
          {this.state.lstMatPrimResp.length > 0 &&
          <div className="container">
            <table className="table table-dark table-bordered tbl-lesshead-1 header-font">
              <colgroup>
              <col width="15%"/>
              <col width="34%"/>
              <col width="10%"/>
              <col width="12%"/>
              <col width="9%"/>
              <col width="20%"/>
              </colgroup>
              <thead>
                <tr>
                  <th style={this.center}>Codigo</th>
                  <th style={this.center}>Materia prima</th>
                  <th style={this.center}>Cantidad</th>
                  <th style={this.center}>Lote</th>
                  <th style={this.center}>Estatus</th>
                  <th style={this.center}><button className="btn btn-select-all" onClick={this.selectAll}>Seleccionar</button></th>
                </tr>
              </thead>
            </table>
            <div className="table-ovfl-of-val">
              <table className="table table-bordered table-hover header-font">
                <colgroup>
                  <col width="15%"/>
                  <col width="33%"/>
                  <col width="10%"/>
                  <col width="12%"/>
                  <col width="9%"/>
                  <col width="19%"/>
                </colgroup>
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
                    
                    {( matprimres.loteAgua===undefined || matprimres.loteAgua===false) &&
                      <td onClick={()=>{this.updateFolioAgua(i,this.state.loteAgua)}}>{matprimres.lote}</td>
                    }

                    {( matprimres.loteAgua===true) &&
                      <td><input type="text" className="valor" ref={this.loteAguaRef} defaultValue={this.state.loteAgua} onBlur={() => this.updtRowLote(i)}/></td>
                    }
                    
                    <td className={style} style={this.center} title={matprimres.comentarios}>{matprimres.estatus}</td>
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
      <div className="container grid" >
        <button className="btn btn-warning" onClick={this.guardaOf} disabled={this.state.lstMatPrimResp.length===0} >{this.btnEnviar}</button>
        <button className="btn btn-danger" onClick={() =>{this.cancelarOF(false)}}>Cancelar</button>
          </div>
      </React.Fragment>
    );
  }
}
