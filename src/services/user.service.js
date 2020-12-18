import axios from 'axios';
//import authHeader from './auth-header';
import Global from '../Global';

class UserService{
    url = Global.url;

    getPublicContent(){
        return axios.get(this.url+'all')
    }
}

export default UserService;
