import apiClient from "./api";

const getPatient = async (id)=>{
    try{
    const response = await apiClient.get(`/patients/${id}`);
    const patient_data = response.data;
    console.log("Patient info retrived")
    return patient_data
    }catch(err){
      console.log(err)
        const data= err.response?.data
       console.log(data.error)
        console.error("Error getting patient info ", data || err.message)
        return { error: data || err.message };
        
    }
}

const getPatients = async (activeDoctorId)=>{

    try{
      const url = activeDoctorId 
      ? `/patients/getpatients?ref_doctor_id=${activeDoctorId}` 
      : `/patients/getpatients`;

      const response = await apiClient.get(url);
      return response.data;

    }catch(err){

        const data= err.response?.data
    
        console.error("Error getting patient info ", data || err.message)
        return data || { error: err.message };
    }

}

const summarizeHistory = async (patient_id) => {
  try {
    const res = await apiClient.post(`/patients/${Number(patient_id)}/summarize`); 
    return res.data;
  } catch (err) {
    const data = err.response?.data;
    return data || { error: err.message };
  }
};


const createPatient = async (patient_info)=>{
    try {
    const res = await apiClient.post(`/patients/addpatient`,patient_info); 
    return res.data;
  } catch (err) {
    const data = err.response?.data;
    return data || { error: err.message };
  }
}


 const updatePatient = async (patientId, patientData) => {
  try {
    const result = await apiClient.put(`/patients/${patientId}`, patientData);
    return result.data;
  } catch (err) {
    const data = err.response?.data;
    return data || { error: err.message };
  }
};

 const deletePatient = async (patientId) => {
  try {
    const result = await apiClient.delete(`/patients/${patientId}`);
    console.log(result.data)
    return result.data;
  } catch (err) {
    const data = err.response?.data;
    return data || { error: err.message };
  }
};


const MED_FIELDS = [
  { key: 'groupe_sanguin', label: 'Groupe sanguin', type: 'select', options: ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  { key: 'categorie_suivi', label: 'Catégorie de suivi', type: 'text' },
  { key: 'allergies', label: 'Allergies', type: 'tags', fullWidth: true },
  { key: 'antecedents', label: 'Antécédents', type: 'tags', fullWidth: true },
  { key: 'medicaments', label: 'Médicaments en cours', type: 'tags', fullWidth: true },
  { key: 'pathologies_chroniques', label: 'Pathologies chroniques', type: 'tags', fullWidth: true },
  { key: 'ta', label: 'Tension (TA)', type: 'text', mono: true, compact: true },
  { key: 'pouls', label: 'Pouls (bpm)', type: 'text', mono: true, compact: true },
  { key: 'imc', label: 'IMC', type: 'text', mono: true, compact: true },
];



export  {getPatient,getPatients,summarizeHistory,createPatient,updatePatient,deletePatient,MED_FIELDS}