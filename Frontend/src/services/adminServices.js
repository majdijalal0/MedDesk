import apiClient from '../services/api';

const createUser = async (payload)=>{
    try{
        const result = await apiClient.post('/admin',payload);
        console.log("User logged in");
        
        return result.data; 
    }catch(err){
         const errors = err.response?.data;
        if(errors){
            console.error("Server problem : ",errors)

            return errors
        }
        
        console.error("Server problem : ",err)

        return {error:"Connexion échouée"}

    }

    }
const getUsers = async ()=>{
    try{
        const result = await apiClient.get('/admin')
        return result.data;

    }catch(err){

        const data= err.response?.data
    
        console.error("Error getting patient info ", data || err.message)
        return data || { error: err.message };

    }
}

const changeStatus = async (id,status)=>{
    try{
        const result = await apiClient.patch(`/admin/${id}`, {
        is_active: status
      });
        return result.data;

    }catch(err){

        const data= err.response?.data
    
        console.error("Error getting patient info ", data || err.message)
        return data || { error: err.message };

    }
}

export  {createUser,getUsers,changeStatus}