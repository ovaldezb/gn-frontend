import axios from 'axios'
import Global from '../Global';

class AuthService{

    login(username,password){
        const loginRequest = {
            username:username,
            password:password
        }
        return axios.post(Global.url+'auth/signin',loginRequest)
        .then( res => {          
            if(res.data.accessToken){
                localStorage.setItem(Global.JWT_NAME,JSON.stringify(res.data));
            }
            return res.data;
        }).catch(err=>{
            console.log(JSON.stringify(err));
            return 'error';
        });
    }

    logout(){
        
        localStorage.removeItem(Global.JWT_NAME);
    }

    register(username,email,password){
        return axios.post(Global.url+'auth/signup',{username,email,password})
        .then(res =>{
            //console.log(res);
        });
    }

    getCurrentUser(){
        //console.log(localStorage.getItem(Global.JWT_NAME));
        return JSON.parse(localStorage.getItem(Global.JWT_NAME));
    }
}

export default new AuthService();