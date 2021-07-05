import Axios from "axios";
import React, { Component } from "react";
import Global from "../Global";
import authHeader from "../services/auth-header";
import AuthService from '../services/auth.service';
import swal from "sweetalert";
import SimpleReactValidator from 'simple-react-validator'
import NumberFormat from 'react-number-format';
import Moment from 'moment';
//import Bitacora from '../services/bitacora-service';

export default class Addbase extends Component {
    style = {};
    styleBusSel={}
    col1B={width:"20%"};
    col2B={width:"60%"};
    col3B={width:"20%"};
    center = {textAlign:"center"}
    right = {textAlign:"right"}
    left = {textAlign:"left"}
    idBase = null;
    btnName = Global.GUARDAR;
    isProdDisp = false;
    validator = new SimpleReactValidator({
      className: 'text-danger',
      messages:{
        required:'requerido'
      }
    });
    codigoRef = React.createRef();
    nombreRef = React.createRef();
    loteRef = React.createRef();
    cantProdRef = React.createRef();
    isErrorInit = false;
    isReset = false;
    idPrdDisp = '';
    isUpdt=false;
    state = {
      codigo:'',
      desc:'',
      lstMatPrim:[],
      idSelPd:-1,
      lstMatPrimResp:[],
      lstErr:[],
      nombre:'',
      lote:'',
      tipoProducto:'P',
      cantProd:'',
      proddisp:{}
  };

  async componentDidMount(){
    if(!this.props.tipo){
      this.idBase = this.props.base.id;
      this.btnName = Global.ACTUALIZAR;
      this.isErrorInit = true;
      this.isProdDisp = true;
      await this.setState({
          codigo:this.props.base.codigo,
          lote:this.props.base.lote,
          lstMatPrimResp:this.props.base.materiaPrimaOrdFab,
          cantProd:this.props.base.cantidadOriginal
      });
      this.obtieneBase(null);
    }
  }
  
  onSubmit = (e) =>{
    e.preventDefault();
    this.setState({
        codigo:this.codigoRef.current.value.toUpperCase(),
        lote:this.loteRef.current.value.toUpperCase(),
        cantProd:this.cantProdRef.current.value
    }); 
    this.loteRef.current.value = this.loteRef.current.value.toUpperCase();
  }

  calcularMP = () =>{
    if(this.validator.allValid()){
      this.isErrorInit = true;
      this.setState({
        lstMatPrimResp:[],
        lstErr:[]
      });
      this.state.proddisp.materiaPrimaUsada.forEach((matPrim,i)=>{
        Axios.get(Global.url+'bases/verificar/'+matPrim.materiaprimadisponible.codigo+'/'+matPrim.porcentaje+'/'+this.state.cantProd,{ headers: authHeader() })
        .then(res=>{
          var lstTmpMP = this.state.lstMatPrimResp;
          var lstErrTmp = this.state.lstErr
          if(res.data[0].estatus==='ERROR'){
             lstErrTmp.push(res.data[0]);
          }
          res.data.forEach((mpr,i)=>{
             lstTmpMP.push(mpr);
           });
           this.setState({
             lstMatPrimResp:lstTmpMP,
             lstErr:lstErrTmp
            });
        })
        .catch(err =>{
            AuthService.isExpired(err.message);
          });
      });
    }else{
      this.validator.showMessages();
      this.forceUpdate();
    }
  }

  guardarBase =()=>{
    let base = {
      codigo: this.state.codigo,
      nombre: this.state.proddisp.nombre,
      lote: this.state.lote,
      fechaProducccion:Moment(new Date()).format('MM-DD-yyyy h:mm:ss'),
      cantidadOriginal:this.state.cantProd,
      cantidadRestante:this.state.cantProd,
      apartado:0,
      aprobado:false,
      materiaPrimaOrdFab:this.state.lstMatPrimResp,
      estatus:Global.OPEN
    }
    
    if(this.btnName===Global.GUARDAR)
    {
      Axios.post(Global.url+'bases',base, { headers: authHeader() })
      .then(res =>{
        this.props.cancelar();
        swal("Se creó correctamente la base",base.codigo,"success");
      })
      .catch(err=>{
        AuthService.isExpired(err.message);
      });
    }else{
      Axios.put(Global.url+'bases/'+this.idBase,base,{ headers: authHeader() })
      .then(res=>{
        swal('Se actualizó correctamente la base');
        this.props.cancelar();
      })
      .catch(err=>{
        AuthService.isExpired(err.message);
      });
    }
  }

  cancelAdd = (e) => {
    this.setState({
        lstMatPrim:[],
        nombre:'',
        lote:'',
    });
    this.props.cancelar();
  }

  selectRow = (i) => {
    this.setState({
      idSelPd: i
    });
  }

  selUpdtMatPrim = (i) =>{
    this.setState({
        codigo:this.state.lstMatPrim[i].materiaprimadisponible.codigo,
        desc:this.state.lstMatPrim[i].materiaprimadisponible.descripcion,
    });
    this.isUpdt = true;
  }

  validaLote = () =>{
    Axios.get(Global.url+'bases/lote/'+this.state.lote,{ headers: authHeader() })
    .then(res=>{
      if(res.data.nombre ){
        swal('Ya existe un lote con este código',this.state.lote,'warning');
        this.loteRef.current.value = '';
      }
    })
    .catch(err=>{
      AuthService.isExpired(err.message);
    });
  }

  obtieneBase = (e) =>{
    if((e !==null && e.keyCode===13) || this.isProdDisp){
      let apiRes = null;
      Axios.get(Global.url+'bases/'+this.state.codigo,{ headers: authHeader() })
      .then(
        res =>{
          apiRes = res;
          this.isProdDisp = false;
          this.setState({
            proddisp:res.data
          });
        }
      ).catch(err =>{
        apiRes = err.response;
        AuthService.isExpired(err.message);
      })
      .finally( x =>
        {
          if(apiRes.status === 404){
            swal("No se encontró la base con código "+this.state.codigo);
          }
        }
      );
    }
  }

  descChange = () =>{

  }

  render() {
  return (
    <React.Fragment>
      <form onSubmit={this.onSubmit} onChange={this.onSubmit}>
        <h4 className="center">Gestion de Bases</h4>
        <div className="container-ng">
          <div className="showcase-form card tbl-padding">
            <div className="grid-3">
              <div>
                <input type="text" placeholder="Código" ref={this.codigoRef} title="Introduzca el número de código y presione ENTER" onKeyUp={this.obtieneBase} defaultValue={this.state.codigo} />
                {this.validator.message('codigo',this.state.codigo,'required')}
              </div>
              <div className="form-control">
                <input type="text" name="nombre" placeholder="Nombre de la Base" value={this.state.proddisp.nombre}  disabled/>
              </div>
              <div className="form-control">
                <input type="text" name="lote"  className="center" placeholder="Lote" ref={this.loteRef} defaultValue={this.state.lote} onBlur={this.validaLote} onChange={this.descChange}/>
                {this.validator.message('lote',this.state.lote,'required')}
              </div>
            </div>
            <div className="grid-1-2">
                <div>
                  <input type="number" placeholder="Cantidad a Producir en Kgs" ref={this.cantProdRef} defaultValue={this.state.cantProd}/>
                  {this.validator.message('cantidad',this.state.cantProd,'required')}
                </div>
                <div></div>
            </div>
          </div>
        </div>
      </form>
      <div className="card">
        <div className="row">
          <div className="col-2">
            <input type="button"  value="Validar" onClick={this.calcularMP} className="btn btn-success" disabled={this.state.proddisp.nombre === undefined || this.state.cantProd ===''}/>        
          </div>
          <div className="col-2">
            <button onClick={this.guardarBase} className="btn btn-success" disabled={!this.isErrorInit || this.state.lstErr.length > 0}>{this.btnName}</button>        
          </div>
          <div className="col-2">
            <input type="button"  value="Cancelar"  onClick={this.cancelAdd} className="btn btn-danger"/>        
          </div>
        </div>
      </div>
      <div className="showcase-form">
        <table className="table table-dark table-bordered">
          <colgroup>
            <col width="15%"/>
            <col width="54%"/>
            <col width="10%"/>
            <col width="12%"/>
            <col width="9%"/>
          </colgroup>
          <thead>
            <tr>
              <td style={this.center}>Código</td>
              <td style={this.center}>Materia Prima</td>
              <td style={this.center}>Cantidad</td>
              <td style={this.center}>Lote</td>
              <td style={this.center}>Estatus</td>
            </tr>
          </thead>
        </table>
        <div className="table-ovfl-prddisp">
          <table className="table table-bordered tbl-lesshead">
            <colgroup>
              <col width="15%"/>
              <col width="54%"/>
              <col width="10%"/>
              <col width="12%"/>
              <col width="9%"/>
            </colgroup>
            <tbody>
              {this.state.lstMatPrimResp.map((matprimres,i)=>{
                var style = {};
                if(matprimres.estatus===Global.OK){
                  style = "suficiente";
                }else if(matprimres.estatus===Global.ERROR){
                  style = "escaso";
                }
                return(
                  <tr key={i} onClick={() => {this.selectRow(i); }} className={this.style}>
                    <td>{matprimres.codigo}</td>
                    <td>{matprimres.nombre}</td>
                    <td><NumberFormat value={Number(matprimres.cantidad).toFixed(2)} displayType={'text'} thousandSeparator={true} />Kgs</td>
                    <td>{matprimres.lote}</td>
                    <td className={style} style={this.center} title={matprimres.comentarios}>{matprimres.estatus}</td>
                  </tr>
                );
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    </React.Fragment>
    );
  }
}
