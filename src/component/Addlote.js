import Axios from 'axios';
import React, { Component } from 'react'
import SimpleReactValidator from 'simple-react-validator';
import swal from 'sweetalert';
import Global from '../Global';
import authHeader from "../services/auth-header";
import AuthService from '../services/auth.service';
import NumberFormat from 'react-number-format';

export default class Addlote extends Component {

  ocRef = React.createRef();
  noPiezasRef = React.createRef();
  numeroRef = React.createRef();
  isErrorInit = false;
  state={
    lstErr:[],
    lstMatPrimResp:[],
    oc:{
      producto:{
        nombre:'',
        materiaPrimaUsada:[]
      },
      cliente:{
        nombre:''
      }
    },
    lote:{
      oc:{
        oc:''
      },
      piezasLote:'',
      numero:''
    }
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
          lote: this.props.lote,
          oc:this.props.lote.oc,
          lstMatPrim:this.props.lote.oc.producto.materiaPrimaUsada,
          lstMatPrimResp:this.props.lote.materiaprima
        });
    }
  }

  onbtieneOC = (event)=>{
    event.preventDefault();
    if(event.keyCode === 13 && this.state.lote.oc.oc !== ''){
      Axios.get(Global.url+'ordencompra/clave/'+this.state.lote.oc.oc,{ headers: authHeader() })
      .then(res =>{
        if(res.data){
          if(res.data.piezas === res.data.piezasLote){
            swal("Las piezas de esta OF ya se encuentran en lotes");
            this.ocRef.current.value = '';
            return;
          }else if(res.data.estatus === Global.CANCEL){
            swal('Esta Orden de Compra ha sido Cancelada, no se pueden generar mas Lotes');
            this.ocRef.current.value = '';
            return;
          }
          this.setState({
            oc:res.data
          })
        }else{
          swal('No se encontro la OC: '+this.state.lote.oc.oc);
          this.ocRef.current.value='';
        }
      })
      .catch(err=>{
        AuthService.isExpired(err.message);
      });
    }
  }

  validarLote = ()=>{
    console.log('Validar')
    if(this.state.lote.piezasLote !== ''){
      if(this.state.lote.oc.oc!=='' && this.state.lote.piezasLote!=='' && this.state.oc.clave ){
        this.isErrorInit = true;
        this.setState({
          lstMatPrimResp:[],
          lstErr:[]
        });
        this.state.oc.producto.materiaPrimaUsada.forEach((matPrim,i)=>{
          Axios.get(Global.url+'ordenfab/validar/'+
              matPrim.materiaprimadisponible.codigo+'/'+
              matPrim.porcentaje+'/'+
              this.state.lote.piezasLote+'/'+this.state.oc.presentacion+'/'+matPrim.materiaprimadisponible.tipo,{ headers: authHeader() })
          .then( res =>{
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
    }else{
      swal('Ingrese la cantidad de piezas para este lote');
    }
  }

  creaLote = ()=>{
    if(this.validator.allValid()){ 
      let lote = {
        lote:this.state.lote.numero,
        piezasLote:this.state.lote.piezasLote,
        estatus:Global.OPEN,
        aprobado:false,
        fabricado:false,
        oc:{
          id:this.state.oc.id
        },
        materiaprima:this.state.lstMatPrimResp
      }
      Axios.get(Global.url+'lote/existe/'+lote.lote,{ headers: authHeader() })
      .then(resl=>{
        if(!resl.data){
          Axios.post(Global.url+'lote',lote,{ headers: authHeader() })
          .then(res=>{
            if(res.data){
              swal('El lote se ha creado',this.state.lote.numero,'success');
              this.cancelarLote();
            }
          })
          .catch(err=>{
            //validar si la respuesta es un 400, para mandar el mensaje de que hay lotes de MP duplicados
            AuthService.isExpired(err.message);
          });
        }else{
          swal('El lote '+lote.lote+' ya existe, no se pueden generar dos lotes con el mismo número');
          return;
        }
      })
      .catch(errl =>{
        AuthService.isExpired(errl.message);
      });
    }
  }

  cancelarLote = () =>{
    this.setState({
      lstErr:[],
    lstMatPrimResp:[],
    oc:{
      producto:{
        nombre:'',
        materiaPrimaUsada:[]
      },
      cliente:{
        nombre:''
      }
    },
    lote:{
      oc:{
        oc:''
      },
      piezasLote:'',
      numero:''
    }
    });
    this.props.cancelar();
  }

  enviarFormulario = (event)=>{
    event.preventDefault();
    let lote = this.state.lote;
    lote.oc.oc = this.ocRef.current.value;
    lote.piezasLote = this.noPiezasRef.current.value;
    lote.numero = this.numeroRef.current.value;
    this.setState({
      lote:lote
    });
  }

  render() {
    const lote = this.state.lote;
    const oc = this.state.oc;
    return (
      <React.Fragment>
        <form onSubmit={this.enviarFormulario} onChange={this.enviarFormulario}>
          <h3 className="center">Lote de Producto</h3>  
          <div className="showcase-form card">
            <div className="form-control grid-3">
              <input type="text" name="oc" placeholder="Orden de Compra" onKeyUp={this.onbtieneOC} ref={this.ocRef} defaultValue={lote.oc.oc}/>
              {this.validator.message('oc',lote.oc.oc,'required')}
              <input type="number" name="piezas" className="center" placeholder="Piezas a fabricar"  ref={this.noPiezasRef} defaultValue={lote.piezasLote}/>
              {this.validator.message('piezas',lote.piezasLote,'required')}
              <input type="text" name="lote" placeholder="Lote"  ref={this.numeroRef} className="center" defaultValue={lote.lote}/>
              {this.validator.message('lote',lote.numero,'required')}
            </div>
            
            <div className="form-control grid-4">
            {oc.piezas &&
            <React.Fragment>
              <legend className="producto">{oc.producto.nombre}</legend>
              <legend className="producto">{oc.cliente.nombre}</legend>
              <legend className="producto">Piezas Totales: {oc.piezas}</legend>
              <legend className="producto">Piezas Pendientes: {oc.piezas-oc.piezasLote}</legend>
              </React.Fragment>
            }
            </div>
          </div>
        </form>

        <div className="container grid-3">
              <button className="btn btn-toolbar" onClick={this.validarLote}>Verificar</button>
              {this.state.lstErr.length === 0 && this.isErrorInit &&
              <button className="btn btn-success" onClick={this.creaLote}>Crear Lote</button>
              }
              <button className="btn btn-danger" onClick={this.cancelarLote} >Cancelar</button>
        </div>
        <br></br>
        {this.state.lstMatPrimResp.length > 0 &&
        <div className="container">
          <table className="table table-dark table-bordered tbl-lesshead-1 header-font">
            <colgroup>
              <col width="15%"/>
              <col width="54%"/>
              <col width="10%"/>
              <col width="12%"/>
              <col width="9%"/>
            </colgroup>
            <thead>
              <tr>
                <th style={this.center}>Código</th>
                <th style={this.center}>Materia Prima</th>
                <th style={this.center}>Cantidad</th>
                <th style={this.center}>Lote</th>
                <th style={this.center}>Estatus</th>
              </tr>
            </thead>
          </table>
          <div className="table-ovfl-of-val">
            <table className="table table-bordered table-hover header-font">
              <colgroup>
                <col width="15%"/>
                <col width="52%"/>
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
                return (
                <tr key={i}>
                  <td>{matprimres.codigo}</td>
                  <td>{matprimres.nombre}</td>
                  <td><NumberFormat value={Number(matprimres.cantidad).toFixed(2)} displayType={'text'} thousandSeparator={true} /></td>
                  <td>{matprimres.lote}</td>
                  <td className={style} style={this.center} title={matprimres.comentarios}>{matprimres.estatus}</td>
                </tr>
                )
              })}
              </tbody>
            </table>
          </div>
        </div>
        }
      </React.Fragment>
    )
  }
}
