import Axios from "axios";
import Global from "../Global";
import authHeader from "./auth-header";

export default function bitacora(actividad,valPrevio, valActual){
    const JWT_NAME = Global.JWT_NAME;
    const url = Global.url;
    const user = JSON.parse(localStorage.getItem(JWT_NAME));
    
    let bitacora_event={
        tipoEvento: {
            name: actividad
        },
        user:{
            id:user.id
        },
        valPrevio:valPrevio,
        valActual:valActual
    }
    
    Axios.post(url+'bitacora',bitacora_event,{headers:authHeader()})
        .then(res =>{
            //console.log('Se guardo');
        })
        .catch(err=>{
            console.log(err);
        });
}