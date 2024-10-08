import { ConnectDB } from './db-connection';
// ConnectDB();
ConnectDB().then(()=>{
    console.log("DB Connected!");
}).catch((err)=> console.log(err));