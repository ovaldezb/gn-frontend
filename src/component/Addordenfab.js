import React, { Component } from "react";
import DayPickerInput from "react-day-picker/DayPickerInput";
import "react-day-picker/lib/style.css";
import MomentLocaleUtils, {
    formatDate,
    parseDate,
  } from "react-day-picker/moment";

export default class Addordenfab extends Component {

  state={
      ordenfab:{}
  }

  agregaOF = () =>{
      this.props.cancelar(null);
  }

  cancelarOF = () => {
      console.log('Cancelar');
    this.setState({
        ordenfab:{}
    });
    this.props.cancelar(null);
  }

  enviarFormulario = (e) =>{
    e.preventDefault();
    console.log('Se envia el formulario');
  }
  render() {
    return (
      <form onSubmit={this.enviarFormulario} onChange={this.enviarFormulario}>
        <div className="container-gn grid">
          <div className="showcase-form card">
            <div className="form-control">
                <input type="text" placeholder="OC"/>
            </div>
            <div className="form-control">
                <input type="text" placeholder="Nombre del Producto"/>
            </div>
            <div className="form-control">
                <input type="text" placeholder="Clave" />
            </div>
            <div className="form-control">
                <input type="text" placeholder="Lote" />
            </div>
          </div>
          <div className="showcase-form card">
              <div className="form-control">
                <input type="text" placeholder="Cliente" />
              </div>
              <div className="form-control">
                <input type="text" placeholder="Piezas" />
              </div>
              <div className="form-control grid">
                <DayPickerInput name="fechaFab" 
                    formatDate={formatDate} 
                    parseDate={parseDate} 
                    format="l"
                    placeholder="Fecha Fabricacion" 
                    dayPickerProps={{
                        locale: "es",
                        localeUtils: MomentLocaleUtils,
                      }}
                    required/>
                    <DayPickerInput name="fechaFab" 
                    formatDate={formatDate} 
                    parseDate={parseDate} 
                    format="l"
                    placeholder="Fecha Fabricacion" 
                    required/>
              </div>
              <div className="form-control">
                
              </div>
          </div>
          <button   className="btn btn-outline-info" onClick={this.agregaOF} >Enviar</button>
          <input type="submit" value="Cancelar" className="btn btn-danger" onClick={this.cancelarOF} />
        </div>
      </form>
    );
  }
}
