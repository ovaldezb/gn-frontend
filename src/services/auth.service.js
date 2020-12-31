import axios from 'axios'
import Global from '../Global';

class AuthService{
    
    JWT_NAME = Global.JWT_NAME;
    url = Global.url;
    
    login(username,password){
        //console.log('En el login');
        const loginRequest = {
            username:username,
            password:password
        }
        return axios.post(this.url+'auth/signin',loginRequest)
        .then( res => {            
            if(res.data.accessToken){
                localStorage.setItem(this.JWT_NAME,JSON.stringify(res.data));
            }
            return res.data;
        }).catch(err=>{
            console.log(JSON.stringify(err));
            return 'error';
        });
    }

    logout(){
        localStorage.removeItem(this.JWT_NAME);
    }

    register(username,email,password){
        return axios.post(this.url+'auth/signup',{username,email,password})
        .then(res =>{
            console.log(res);
        });
    }

    getCurrentUser(){
        return JSON.parse(localStorage.getItem(this.JWT_NAME));
    }
}

export default new AuthService();