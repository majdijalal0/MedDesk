import apiClient from "./api";

const login = async (informations)=>{
    try{
        const result = await apiClient.post('/auth/login',informations);
        const user = result.data?.user || result.data ;
        console.log("User logged in");
        
        return {user}; 
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

const register = async (informations)=>{
    try{

        const result = await apiClient.post('/auth/register',informations);
        const data = result.data;
        console.log("User created");
        return data;
    }catch(err){
        const errors = err.response?.data;
        if(errors){
            console.error(errors)
            return errors;
        }
        console.error("Server error :",err)
        return {error:"Inscription échouée"}
    }
}




export  {login,register};