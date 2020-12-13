import axios from 'axios'
import Global from '../Global';

class AuthService{
    
    USER = 'user';
    url = Global.url;
    
    login(username,password){
        const loginRequest = {
            username:username,
            password:password
        }
        
        return axios.post(this.url+'auth/signin',loginRequest)
        .then( res => {            
            if(res.data.accessToken){
                localStorage.setItem(this.USER,JSON.stringify(res.data));
            }
            return res.data;
        }).catch(err=>{
            console.log(err);
        });
    }

    logout(){
        localStorage.removeItem(this.USER);
    }

    register(username,email,password){
        return axios.post(this.url+'auth/signup',{username,email,password})
        .then(res =>{
            console.log(res);
        });
    }

    getCurrentUser(){
        return JSON.parse(localStorage.getItem(this.USER));
    }
}

export default new AuthService();