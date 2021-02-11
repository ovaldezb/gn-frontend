import Axios from "axios";
import React, { Component } from "react";
import swal from "sweetalert";
import Global from "../Global";
import authHeader from "../services/auth-header";
import SimpleReactValidator from 'simple-react-validator';
import NumberFormat from 'react-number-format';


export default class Addordenfab extends Component {
  ocRef = React.createRef();
  piezasRef = React.createRef();
  obsRef =React.createRef();
  selAllRef = React.createRef();
  valorRef = React.createRef()
  loteAguaRef = React.createRef();
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
      cliente:'',
      lstOC:[],
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
      await this.setState({
        ordenfab:this.props.ordenfab,
        lstMatPrimResp:this.props.ordenfab.matprima,
        counter:this.pad(Number(this.props.ordenfab.noConsecutivo) ,Global.SIZE_DOC)
      });
      this.selAll = false;
      this.selectAll();
      Axios.get(Global.url+'ordencompra/oc/'+this.props.ordenfab.oc,{ headers: authHeader() })
      .then(res=>{        
        if(res.data.length===1){
          this.setState({          
            piezasPendientes:res.data[0].piezas - res.data[0].piezasFabricadas,
            piezasTotales:res.data[0].piezas,
            piezasFabricadas:res.data[0].piezasFabricadas,
            clave:res.data[0].clave,
            cliente:res.data[0].cliente.nombre,
            producto:res.data[0].producto.nombre
          });
        }
      }).catch(err=>{
        console.log(err);
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
    //ordenFabTmp.noConsecutivo=Number(this.state.counter);
    ordenFabTmp.matprima=this.state.lstMatPrimResp;
    ordenFabTmp.estatus=Global.TEP;
    //esto se hace para enviar solo el id
    ordenFabTmp.oc = {id:this.state.ordenfab.id}
    Axios.post(Global.url+'ordenfab',ordenFabTmp,{ headers: authHeader() })
      .then(res=>{
          swal('Se guardó la Orden de Fabricación con éxito',this.pad(ordenFabTmp.noConsecutivo,Global.SIZE_DOC),'success');
          this.clean();
          this.props.cancelar(res.data);
      })
      .catch(err=>{
        console.log(err);
      });
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
    ordenFab.oc=this.ocRef.current.value;
    ordenFab.noConsecutivo=this.state.counter;
    ordenFab.observaciones=this.obsRef.current.value;  
    if(this.state.piezasTotales - this.state.piezasFabricadas - this.piezasRef.current.value < 0){
      ordenFab.piezas = '';
      swal('La cantidad de piezas a fabricar excede la cantidad de piezas requeridas en la OC '+this.state.ordenfab.oc);
      this.setState({
        ordenfab:ordenFab,
        piezasPendientes:this.state.piezasTotales -  this.state.piezasFabricadas
      });
    }else{
      ordenFab.piezas=this.piezasRef.current.value;
      this.setState({
        ordenfab:ordenFab,
        piezasPendientes:this.state.piezasTotales -  this.state.piezasFabricadas - this.piezasRef.current.value
      });
    }
    if(this.loteAguaRef.current){
      this.setState({
        loteAgua: this.loteAguaRef.current.value
      });
    }
  }
  
  clean = () =>{
    this.setState({
      ordenfab:{
        oc:'',
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
  validaOC = (e) =>{
    if(e.keyCode === 13 ){
      Axios.get(Global.url+'ordencompra/oc/'+(this.state.ordenfab.oc===undefined?'vacio':this.state.ordenfab.oc===''?'vacio':this.state.ordenfab.oc),{ headers: authHeader() })
      .then(res=>{        
        if(res.data.length===1){
          let of = this.state.ordenfab;
          of.presentacion=res.data[0].presentacion;
          of.nombre=res.data[0].producto.nombre;
          of.oc = res.data[0].oc;
          of.id = res.data[0].id;
          of.lote = res.data[0].lote;
          this.setState({
            ordenfab:of,
            piezasPendientes:res.data[0].piezas - res.data[0].piezasFabricadas,
            piezasTotales:res.data[0].piezas,
            piezasFabricadas:res.data[0].piezasFabricadas,
            clave:res.data[0].clave,
            cliente:res.data[0].cliente.nombre,
            producto:res.data[0].producto.nombre
          });
        }else if(res.data.length>1){
          this.setState({
            lstOC:res.data
          });
        }
      })
      .catch(err=>{
        if(err.message.includes("400")){
          swal('La orden de compra '+this.state.ordenfab.oc+' no existe o aún no ha sido aprobada','No se puede iniciar la fabricación','error');
          let of = this.state.ordenfab;
          of.oc = ''
          this.setState({
            ordenfab: of,
            piezasPendientes:'',            
            piezasTotales:'',
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
  
  selOC = (index) =>{
    let of = this.state.ordenfab;
    of.presentacion=this.state.lstOC[index].presentacion;
    of.nombre=this.state.lstOC[index].producto.nombre;
    of.oc = this.state.lstOC[index].oc;
    of.id = this.state.lstOC[index].id;
    of.lote = this.state.lstOC[index].lote;
    this.setState({
      ordenfab:of,
      piezasPendientes:this.state.lstOC[index].piezas - this.state.lstOC[index].piezasFabricadas,
      piezasTotales:this.state.lstOC[0].piezas,
      clave:this.state.lstOC[index].clave,
      cliente:this.state.lstOC[index].cliente.nombre,
      producto:this.state.lstOC[index].producto.nombre,
      lstOC:[]
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
          <h2 className="center"> Orden de Fabricación</h2>
          <div className="grid">
            <div className="showcase-form card">
              <div className="form-control grid">
                <h3>OF: {this.state.counter}</h3>
                <h3>{this.state.cliente}</h3>
                
              </div>
              <div className="form-control grid">
                <div>
                  <input type="text" name="oc" placeholder="Orden de Compra" ref={this.ocRef} defaultValue={this.state.ordenfab.oc} onKeyUp={this.validaOC} />
                  {this.validator.message('oc',this.state.ordenfab.oc,'required')}
                  {this.state.lstOC.length > 1 &&
                  <div className="tbl-oc">
                    <table style={width}>
                      <tbody>
                        {this.state.lstOC.map((oc,i)=>{
                          return(
                            <tr key={i} onClick={()=>{this.selOC(i)}}>
                              <td className="pointer">{oc.oc}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    </div>
                  }
                </div>
                <div>
                  <legend className="producto">{this.state.ordenfab.lote}</legend>
                </div>
              </div>
            </div>
            <div className="showcase-form card">
              <div className="form-control grid-3-l">
                <div>
                  <input type="number" name="piezas" placeholder="Piezas" ref={this.piezasRef} value={this.state.ordenfab.piezas} />
                  {this.validator.message('piezas',this.state.ordenfab.piezas,'required')}
                </div>
                <div>
                  <NumberFormat value={this.state.piezasPendientes} displayType={'text'} thousandSeparator={true} />                  
                </div>
                <div>
                <div className="producto">{this.state.producto}</div>
                </div>
              </div>
              <div className="form-control">
                <textarea placeholder="Observaciones" ref={this.obsRef} value={this.state.ordenfab.observaciones}></textarea>
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
                  <th style={this.center}><button className="btn is-small" onClick={this.selectAll}>Seleccionar</button></th>
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
