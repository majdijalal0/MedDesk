import apiClient from "./api";

const getNotes = async (patient_id) =>{
    try{
        const id = Number(patient_id)
        const response = await apiClient.get(`/notes/${id}`);
        const notes = response.data.notes;
        console.log("Notes received");
        return notes;
    }catch(err){
         const data= err.response?.data
    
        console.error("Error getting patient notes ", data || err.message)
        return data || { error: err.message };
    }
}

const createNote = async (patient_id, payload) => {
  try {
    const res = await apiClient.post(`/notes/${Number(patient_id)}`, payload);
    return res.data; 
  } catch (err) {
    const data = err.response?.data;
    return data || { error: err.message };
  }
};


const organizeNote = async (id_patient,contenu,type) => {
    try{
        const res = await apiClient.post(`/notes/organize`,{id_patient, contenu_brut: contenu , type });
        console.log(res.data);
        return res.data; 
    }catch(err){
        const data = err.response?.data;
        return data || { error: err.message };
    }
    
};

const validateNote = async (id_note,modifiedContent) => {
    try{
        const res = await apiClient.put(`/notes/${id_note}/validate`,{modified_content: modifiedContent });
        console.log(res.data);
        return res.data; 
    }catch(err){
        const data = err.response?.data;
        return data || { error: err.message };
    }
    
};

const organizeSavedNote = async (id_note) => {
    try{
        const res = await apiClient.post(`/notes/${id_note}/organize`);
        return res.data; 
    }catch(err){
        const data = err.response?.data;
        return data || { error: err.message };
    }
    
};

const updateNote = async (id_note,payload) => {
  try {
    const res = await apiClient.put(`/notes/${Number(id_note)}`,payload);
    console.log(res.data);
    return res.data; 
  } catch (err) {
    const data = err.response?.data;
    return data || { error: err.message };
  }
};


const deleteNote = async (id_note) => {
  try {
    const res = await apiClient.delete(`/notes/${Number(id_note)}`);
    return res.data; 
  } catch (err) {
    const data = err.response?.data;
    return data || { error: err.message };
  }
};

 const NOTE_TYPES = ['Consultation', 'Consultation de suivi', 'Urgence', 'Téléconsultation'];

export {getNotes,createNote,organizeNote,organizeSavedNote,deleteNote,validateNote,updateNote,NOTE_TYPES};