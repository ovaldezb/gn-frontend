import Global from '../Global'
export default function authHeader(){
    const user = JSON.parse(localStorage.getItem(Global.JWT_NAME));

    if(user && user.accessToken){
        return { Authorization: 'Bearer '+user.accessToken , 'Content-Type': 'application/json'};
    }else{
        return {};
    }
}