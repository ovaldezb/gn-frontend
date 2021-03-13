import Axios from "axios";
import React, { Component } from "react";
import Global from "../Global";
import authHeader from "../services/auth-header";
import AuthService from '../services/auth.service';
import swal from "sweetalert";
import SimpleReactValidator from 'simple-react-validator'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faPlusCircle, faMinusCircle,  faEraser} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Bitacora from '../services/bitacora-service';

export default class Addproddisp extends Component {
    style = {};
    styleBusSel={}
    col1B={width:"20%"};
    col2B={width:"60%"};
    col3B={width:"20%"};
    center = {textAlign:"center"}
    right = {textAlign:"right"}
    left = {textAlign:"left"}
    btnName = 'Guardar';
    codigoRef = React.createRef();
    descRef = React.createRef();
    porcentajeRef = React.createRef();
    nombreRef = React.createRef();
    claveRef = React.createRef();
    prodxcajaRef = React.createRef();
    isBusqueda = false;
    isReset = false;
    idPrdDisp = '';
    isUpdt=false;
    state = {
        codigo:'',
        desc:'',
        lstMatPrim:[],
        porcentaje:'',
        idSelPd:-1,
        idSelPdBus:-1,
        lstBusqDesc:[],
        nombre:'',
        clave:'',
        sumaPorcentaje:0
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
      let sumPor = 0;
      this.btnName = "Actualizar";
      this.idPrdDisp = this.props.proddisp.id;
      for(let i=0;i<prddisp.materiaPrimaUsada.length;i++){
        sumPor += Number(Number(prddisp.materiaPrimaUsada[i].porcentaje).toFixed(2));
      }
      this.setState({
          nombre:prddisp.nombre,
          clave:prddisp.clave,
          lstMatPrim:prddisp.materiaPrimaUsada,
          prodxcaja:prddisp.prodxcaja,
          sumaPorcentaje:Number(sumPor).toFixed(2)
      });
    }
  }
  
  busquedaDesc = (e)=>{
    if(this.state.desc !==''){
        Axios.get(Global.url+'matprimdisp/filter/'+this.state.desc.toUpperCase(),{ headers: authHeader() })
            .then(res =>{
                this.setState({
                    lstBusqDesc:res.data
                });
            })
            .catch(err=>{
              AuthService.isExpired(err.message);
            });
    }else{
      this.setState({
        lstBusqDesc:[]
      });
    }  
  }

  busquedaCodigo = (e) =>{
      if(e.keyCode === 13){
        Axios.get(Global.url+'matprimdisp/'+this.state.codigo,{ headers: authHeader() })
        .then( res =>{
            this.setState({
                codigo:res.data.codigo,
                desc:res.data.descripcion
            });
        })
        .catch(err =>{
          AuthService.isExpired(err.message);
        });
      } 
  }

  addMatPrima = (e) =>{
    let lstMpTmp;
    var res = this.state.lstMatPrim.filter(x => {
        return (x.codigo === this.state.codigo)
    });
    var matprima = {
        porcentaje:Number(this.porcentajeRef.current.value).toFixed(2),
        materiaprimadisponible:{
            codigo:this.codigoRef.current.value,    
            descripcion:this.descRef.current.value,
        }
    }
    if(res.length > 0){
        swal('No se pueden agregar dos materiales del mismo codigo',this.state.codigo,'error');
        this.setState({
            codigo:'',
            desc:'',
        });
        return;
    }else if(this.state.porcentaje === '' || Number(this.state.porcentaje) === 0){
        swal('La porcentaje no puede estar vacia o ser 0','Error','error');
        return;
    }else if(!this.isUpdt){
        lstMpTmp = this.state.lstMatPrim;
        lstMpTmp.push(matprima);
    }else if(this.isUpdt){
        lstMpTmp = this.state.lstMatPrim;
        lstMpTmp[this.state.idSelPd] = matprima;
        this.isUpdt=false;
    }

    let sumPor = 0;
    for(let i=0;i<this.state.lstMatPrim.length;i++){
      sumPor += Number(Number(this.state.lstMatPrim[i].porcentaje).toFixed(2));
    }
    this.setState({
        lstMatPrim:lstMpTmp,
        codigo:'',
        desc:'',
        porcentaje:0,
        idSelPd:-1,
        sumaPorcentaje:Number(sumPor).toFixed(2)
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
        porcentaje:this.porcentajeRef.current.value,
        nombre:this.nombreRef.current.value.toUpperCase(),
        clave:this.claveRef.current.value,
        prodxcaja:this.prodxcajaRef.current.value
    }); 
  }

  saveProdDisp = () =>{
      var prdDispSave = {
          nombre:this.state.nombre,
          clave:this.state.clave,
          tipo:'vacio',
          materiaPrimaUsada: this.state.lstMatPrim,
          prodxcaja:this.state.prodxcaja
      };
      if(this.validator.allValid()){
        if(this.props.tipo){
          Axios.post(Global.url+'prodisp',prdDispSave,{ headers: authHeader() })
            .then(res =>{
              this.props.cancelar(prdDispSave);
              swal('Se insertó correctamente el producto',prdDispSave.nombre,'success');
              Bitacora(Global.ADD_PRDDISP,'',JSON.stringify(prdDispSave));
            })
            .catch(err=>{
              AuthService.isExpired(err.message);
            });
        }else{
            Axios.put(Global.url+'prodisp/'+this.idPrdDisp,prdDispSave,{ headers: authHeader() })
            .then(res =>{
                if(res.data.id){
                    swal('Se actualizó correctamente el producto',prdDispSave.nombre,'success');
                    this.props.cancelar(res.data);
                }
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

  cancelAdd = (e) => {
    this.setState({
        lstMatPrim:[],
        nombre:'',
        clave:'',
        porcentaje:'',
        sumaPorcentaje:'0'
    });
    this.props.cancelar(null);
  }

  clearBusqMP = () =>{
      this.setState({
          codigo:'',
          desc:'',
          porcentaje:0
      });
  }

  selectRow = (i) => {
    this.setState({
      idSelPd: i
    });
  }

  selectRowBusSelected = (i) =>{
    this.setState({
        codigo: this.state.lstBusqDesc[i].codigo,
        desc:this.state.lstBusqDesc[i].descripcion,
        lstBusqDesc:[],
        idSelPdBus:-1
    });
  }

  selUpdtMatPrim = (i) =>{
    this.setState({
        codigo:this.state.lstMatPrim[i].materiaprimadisponible.codigo,
        desc:this.state.lstMatPrim[i].materiaprimadisponible.descripcion,
        porcentaje:this.state.lstMatPrim[i].porcentaje
    });
    this.isUpdt = true;
  }

  validaClave = () =>{
    Axios.get(Global.url+'prodisp/'+this.state.clave,{ headers: authHeader() })
    .then(res=>{
      if(res.data.nombre ){
        swal('Ya existe un producto con este código',this.state.clave,'warning');
        this.claveRef.current.value = '';
      }
    })
    .catch(err=>{
      AuthService.isExpired(err.message);
    });
  }

  descChange = () =>{

  }

  render() {
    var styleBusqueda={};
    var height = '0px';
    if(this.state.lstBusqDesc.length > 0){
      height = this.state.lstBusqDesc.length < 4 ? this.state.lstBusqDesc.length * 50 : 200
      styleBusqueda={border:"solid 1px red",width:"60%",overflow:"auto",height:height+'px'};
        var rowsBusq = this.state.lstBusqDesc.map((mdisp,i)=>{
            if(this.state.idSelPdBus === i){
                this.styleBusSel = "selected pointer";
            }else{
                this.styleBusSel ={};
            }
            return(
                <tr key={i}   onClick={()=>{this.selectRowBusSelected(i)}} className={this.styleBusSel}>
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
                    <td style={this.center}>{i+1}</td>
                    <td>{mpdis.materiaprimadisponible.codigo}</td>
                    <td>{mpdis.materiaprimadisponible.descripcion}</td>
                    <td style={this.center}>{mpdis.porcentaje}%</td>
                </tr>
            );
        });
    }
    
    return (
      
      <form onSubmit={this.onSubmit} onChange={this.onSubmit}>
        <h4 className="center">Producto Disponible</h4>
        <div className="container-ng">
          <div className="showcase-form card tbl-padding">
            <div className="grid-2-1">
              <div className="form-control">
                <input type="text" name="nombre" placeholder="Nombre Producto" ref={this.nombreRef} value={this.state.nombre}  onChange={this.descChange} required/>
                {this.validator.message('nombre',this.state.nombre,'required')}
              </div>
              <div className="form-control">
                <input type="text" name="clave"  className="center" placeholder="Clave" ref={this.claveRef} defaultValue={this.state.clave} onBlur={this.validaClave}/>
                {this.validator.message('clave',this.state.clave,'required')}
              </div>
            </div>
            <div className="grid-1-2">
              <div className="form-control">
                <input type="number" name="empxcaja" placeholder="Productos por caja" ref={this.prodxcajaRef} defaultValue={this.state.prodxcaja} />
                {this.validator.message('empxcaja',this.state.prodxcaja,'required')}
              </div>
              <div>
                {this.state.sumaPorcentaje===Global.PORCENTAJE_MAX &&
                  <legend className="porcentaje-ok">{this.state.sumaPorcentaje}%</legend>
                }
                {this.state.sumaPorcentaje!==Global.PORCENTAJE_MAX &&
                  <legend className="porcentaje-nok">{this.state.sumaPorcentaje}%</legend>
                }
              </div>
            </div>
          </div>
          <div className="showcase-form card tbl-padding">
            <h4 className="center">Materia prima para el producto</h4>
            <p></p>
            <div className="row">
              <div className="col-2">
                <input type="text" placeholder="Codigo"  onKeyUp={this.busquedaCodigo} ref={this.codigoRef} defaultValue={this.state.codigo}/>
              </div>
              <div className="col-4">
                <input type="text" placeholder="Descripcion" onKeyUp={this.busquedaDesc} ref={this.descRef} value={this.state.desc} onChange={this.descChange}/>
              </div>
              
              <div className="col-2">
                <input type="number" placeholder="Porcentaje" style={this.center} ref={this.porcentajeRef}  value={this.state.porcentaje} onChange={this.descChange}/>
              </div>
              <div className="col-1">
              
              {this.state.codigo && this.state.desc && this.state.porcentaje > 0 && 
                <Link to="#" onClick={this.addMatPrima}>
                  <FontAwesomeIcon icon={faPlusCircle} title="Agregar la MP seleccionada" />
                </Link>
              }
              </div>
              <div className="col-1">
              {this.state.lstMatPrim.length > 0 && this.state.idSelPd >= 0 &&
                <Link to="#" onClick={this.delMatPrim}>
                    <FontAwesomeIcon icon={faMinusCircle} title="Elimina la MP seleccionada"/>
                </Link>
              }
              </div>
              <div className="col-1">
              {(this.state.codigo || this.state.desc || this.state.porcentaje > 0 ) &&
                <Link to="#" onClick={this.clearBusqMP}>
                    <FontAwesomeIcon icon={faEraser} title="Limpia los campos de la Materia prima"/>
                </Link>
              }
              </div>              
            </div>
            {this.state.lstBusqDesc.length > 0 &&
            <div  style={styleBusqueda}>
                <table className="table table-hover " style={{width:'100%',cursor:'pointer'}}>
                  <colgroup>
                    <col width="25%"/>
                    <col width="60%"/>
                    <col width="15%"/>
                  </colgroup>
                  <tbody>
                    {rowsBusq}
                  </tbody>
                </table>              
            </div>
            }
          </div>
          <div className="showcase-form">
            <table className="table table-dark table-bordered">
              <colgroup>
                <col width="10%"/>
                <col width="20%"/>
                <col width="50%"/>
                <col width="20%"/>
              </colgroup>
              <thead>
                <tr>
                  <td style={this.center}>#</td>
                  <td>Codigo</td>
                  <td>Descripcion</td>
                  <td style={this.center}>Porcentaje</td>
                </tr>
              </thead>
            </table>
            <div className="table-ovfl-prddisp">
                <table className="table table-bordered tbl-lesshead">
                  <colgroup>
                    <col width="10%"/>
                    <col width="20%"/>
                    <col width="50%"/>
                    <col width="20%"/>
                  </colgroup>
                    <tbody>
                    {rows}
                    </tbody>
                </table>
            </div>
          </div>
          <div className="row">
              <div className="col-2">
                <input type="button" disabled={!this.state.lstMatPrim.length > 0 || this.state.sumaPorcentaje!=='100.00'} value={this.btnName} onClick={this.saveProdDisp} className="btn btn-success"/>        
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
