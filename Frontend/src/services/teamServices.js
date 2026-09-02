import apiClient from "./api";

const getMyDoctors = async ()=>{
    try{
        const result = await apiClient.get('/team/my-doctors');
        console.log(result.data)
        return result.data;
    }catch(err){
        const data = err.response?.data; 
        return data || { error: err.message }; 
    }
}

const getMySecretaries = async ()=>{
    try{
        const result = await apiClient.get('/team/my-secretaries');
        return result.data;
    }catch(err){
        const data = err.response?.data; 
        return data || { error: err.message } ;
    }
}

const addSecretary = async (email)=>{
    try{
        const result = await apiClient.post('/team/add-secretary',{email});
        return result.data;
    }catch(err){
        const data = err.response?.data; 
        return data || { error: err.message }; 
    }
}

const removeSecretary = async (id)=>{
    try{
        const result = await apiClient.delete(`/team/${parseInt(id)}/remove-secretary`);
        return result.data;
    }catch(err){
        const data = err.response?.data; 
        return data || { error: err.message }; 
    }
}

export {getMyDoctors,getMySecretaries,addSecretary,removeSecretary}