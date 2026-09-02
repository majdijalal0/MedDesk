import apiClient from "./api";
import { NOTE_TYPES } from "./noteServices";

export const RDV_TYPES = NOTE_TYPES; 

export const RDV_STATUS = {
  'En attente': { label: 'En attente', cls: 'bg-gray/15 text-gray' },
  'Confirmé' : {label : 'Confirmé' , cls : 'bg-teal/10 text-teal'},
  'Annulé' : {label : 'Annulé' , cls : 'bg-gray/15 text-gray'},
  'Terminé':    { label: 'Terminé',    cls: 'bg-teal/10 text-teal' },

};

const getRdvs = async (id_patient)=>{
    try{
        const result = await apiClient.get(`/rdv/${parseInt(id_patient)}/rdvs`);
        return result.data;
    }catch(err){
        const data = err.response?.data;
        return data || { error: err.message }
    }
}

const createRdv = async (id_patient,date_rdv,type,id_doctor)=>{
    try{
        console.log(date_rdv)
        const result = await apiClient.post(`/rdv/${parseInt(id_patient)}`,{date_rdv , type , id_doctor });
        return result.data;
    }catch(err){
        const data = err.response?.data;
        return data || { error: err.message }
    }
}

const updateRdvStatut = async (id_rdv,statut,doctorId)=>{
    try{
        const result = await apiClient.put(`/rdv/${parseInt(id_rdv)}/rdv`,{statut,id_user:doctorId});
        return result.data;
    }catch(err){
        const data = err.response?.data;
        return data || { error: err.message }
    }
}

const getDoctorRdvs = async (doctorId)=>{
    try{
        const result = await apiClient.get(`/rdv/rdvs/?doctor_id=${doctorId}`);
        return result.data;
    }catch(err){
        const data = err.response?.data;
        return data || { error: err.message }
    }
}

const getTodayRdvs = async ()=>{
    try{
        const result = await apiClient.get(`/rdv/tdrdvs`);
        return result.data;
    }catch(err){
        const data = err.response?.data;
        return data || { error: err.message }
    }
}

const getRefDoctorRdvs = async (ref_doctor_id)=>{
    try{
        const result = await apiClient.get(`/rdv/secretary/?doctor_id=${ref_doctor_id}`);
        return result.data;
    }catch(err){
        const data = err.response?.data;
        return data || { error: err.message }
    }
}

const updateRdv = async (id_rdv,payload)=>{
    try{
        const result = await apiClient.put(`/rdv/${id_rdv}/rdv`,payload);
        return result.data;
    }catch(err){
        const data = err.response?.data;
        return data || { error: err.message }
    }
}

const deleteRdv = async (id_rdv,doctorId)=>{
    try{
        const result = await apiClient.delete(`/rdv/${id_rdv}/rdv`, {data : {id_doctor:doctorId} });
        return result.data;
    }catch(err){
        const data = err.response?.data;
        return data || { error: err.message }
    }
}


const SEG = {
  "En attente": { bar: "bg-amber-500", swatch: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  "Confirmé":   { bar: "bg-teal",       swatch: "bg-teal",       badge: "bg-teal/10 text-teal border-teal/20" },
  "Terminé":    { bar: "bg-emerald-500",swatch: "bg-emerald-500",badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "Annulé":     { bar: "bg-gray/30",    swatch: "bg-gray/40",    badge: "bg-gray/10 text-gray border-gray/20" },
};

const ORDER = ["En attente", "Confirmé", "Terminé", "Annulé"];




export {getRdvs,createRdv,updateRdvStatut,getDoctorRdvs,getTodayRdvs,getRefDoctorRdvs,updateRdv,deleteRdv,SEG,ORDER}