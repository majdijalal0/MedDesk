const {pool} = require('../database/db.js');
const {summarizeHistory} = require('../Services/aiService.js')


const addPatient = async (req, res) => {
  const user_id = req.user.id_user;
  const user_role = req.user?.role;
  const { first_name, last_name, date_naissance, sexe, telephone, ref_doctor_id } = req.body;

  if (!last_name || !first_name || !date_naissance || !sexe) return res.status(400).json({ error: "Veuillez compléter tous les champs nécessaires" });
  if (!['médecin', 'secrétaire'].includes(user_role)) return res.status(403).json({ error: "Rôle invalide" });
  if (!['M', 'F'].includes(sexe)) return res.status(400).json({ error: "Sexe invalide" });
  if (isNaN(Date.parse(date_naissance))) return res.status(400).json({ error: "Date invalide" });

  let informations_medicales = {};
  let doctor_id;

  try {
    if (user_role === 'médecin') {
      doctor_id = user_id;
      const pm = req.body.informations_medicales;
      if (pm !== undefined && pm !== null) {                     
        if (typeof pm !== 'object' || Array.isArray(pm)) return res.status(400).json({ error: "informations_medicales doit être un objet JSON" });
        informations_medicales = pm;
      }
    } else {                                                       
      if (!ref_doctor_id) return res.status(400).json({ error: "ID du médecin référent requis" });
      const assingment = await pool.query(
        "SELECT 1 FROM SecretaryAssignments WHERE secretary_id=$1 AND doctor_id=$2", [user_id, ref_doctor_id]); 
      if (assingment.rows.length === 0) return res.status(403).json({ error: "Vous ne pouvez pas ajouter de patients pour ce médecin" });
      doctor_id = ref_doctor_id;
    }

    const patient = await pool.query(
      `INSERT INTO Patients (nom_patient,prenom_patient,date_naissance,sexe,informations_medicales,id_medical_ref,telephone)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7) RETURNING *`,         
      [last_name.trim(), first_name.trim(), date_naissance, sexe, JSON.stringify(informations_medicales), doctor_id, telephone?.trim() || null]
    );
    
    return res.status(201).json({ patient: patient.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: "Le patient existe déjà pour ce médecin" });
    console.error("Error adding patient:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const getPatients = async (req,res)=>{
    const user_id = req.user.id_user;
    const user_role = req.user.role;
    try{
            
        let patient_info;
        if(user_role === 'secrétaire'){
            const ref_doctor_id = req.query.ref_doctor_id;
             if (!ref_doctor_id) 
                return res.status(400).send("ID du médecin référent requis");
            const med_patients = await pool.query(
                `SELECT p.id_patient,p.nom_patient,p.prenom_patient,p.date_naissance,p.sexe,p.telephone
                FROM Patients p JOIN SecretaryAssignments s ON p.id_medical_ref=s.doctor_id 
                WHERE s.secretary_id=$1 AND id_medical_ref=$2 ORDER BY p.id_patient`,
                [user_id,ref_doctor_id]);
            patient_info = med_patients.rows;
            
        }else if(user_role === 'médecin'){
            const med_patients = await pool.query("SELECT * FROM Patients WHERE id_medical_ref=$1",[user_id]);
            patient_info = med_patients.rows;
        }
    return res.status(200).json({patients:patient_info})
    }
    catch(err){
        console.error("Error finding patients:", err);
        return res.status(500).json({error:"Server error"})
    }
}

const getPatient = async (req,res)=>{
    const med_id = req.user.id_user;
    const pat_id = req.params.id;
    if (!/^\d+$/.test(pat_id)) return res.status(400).json({error:"ID invalide"});

    try{
    const pat_exists = await pool.query("SELECT * FROM Patients WHERE id_patient=$1 AND id_medical_ref=$2",[pat_id,med_id]);
    if(pat_exists.rows.length === 0) return res.status(404).json({error:"Le patient n'existe pas"})

    return res.status(200).json({patient:pat_exists.rows[0]})
    }
    catch(err){
        console.error("Error finding patient:", err);
        return res.status(500).json({error:"Server error"})
    }
}

const updatePatient = async (req,res)=>{
    const {first_name,last_name,sexe,date_naissance,informations_medicales} = req.body;
    const user_id = req.user.id_user;
    const pat_id = req.params.id;
    const user_role = req.user.role;
    if(!["secrétaire","médecin"].includes(user_role)) return res.status(400).send("Role invalide");
    let doctor_id;
    if(!first_name && !last_name && !sexe && !date_naissance && !informations_medicales) return res.status(400).send("Vous n'avez aucune information à modifier");
    if(sexe && !['M','F'].includes(sexe)) return res.status(400).send("Sexe invalide");
    if(date_naissance && isNaN(Date.parse(date_naissance))) return res.status(400).send("Date invalide");
    if (user_role === 'secrétaire' && informations_medicales) {
        return res.status(403).send("Les secrétaires ne sont pas autorisées à modifier les informations médicales.");
    }

    try{
        if(user_role === 'secrétaire'){
            const ref_doctor_id = req.body.ref_doctor_id;
            if(!ref_doctor_id) return res.status(400).send("Id du docteur ref non trouvé")
            const assingment = await pool.query("SELECT 1 FROM SecretaryAssignments WHERE secretary_id=$1 AND doctor_id=$2",[user_id,ref_doctor_id]);
            if(assingment.rows.length === 0) return res.status(400).send("Vous ne pouvez pas ajouter des patients pour ce médecin");
            doctor_id = ref_doctor_id;
        }else if(user_role === 'médecin'){
            doctor_id = user_id;
        }

        const pat_exists = await pool.query("SELECT * FROM Patients WHERE id_patient=$1 AND id_medical_ref=$2 ",[pat_id,doctor_id])
        if(pat_exists.rows.length === 0) return res.status(404).send("Id patient non valide");
        
        
        const updatedPatient = await pool.query(
            "UPDATE Patients SET prenom_patient=$1 , nom_patient = $2 , sexe = $3 , date_naissance = $4 , informations_medicales = $5 WHERE id_patient=$6 AND id_medical_ref=$7 RETURNING *",
        [first_name ?? pat_exists.rows[0].prenom_patient, last_name ?? pat_exists.rows[0].nom_patient,
        sexe ?? pat_exists.rows[0].sexe, date_naissance ?? pat_exists.rows[0].date_naissance, informations_medicales ?? pat_exists.rows[0].informations_medicales,
        pat_id,doctor_id]
        )
    
        return res.status(200).json({updatedPatient:updatedPatient.rows[0]})
    }
    catch(err){
        console.error("Error updating patient:", err);
        return res.status(500).send("Server error")
    }
}

const deletePatient = async (req,res)=>{
    const med_id = req.user.id_user;
    const pat_id = req.params.id;
    try{
        const result = await pool.query("DELETE FROM Patients WHERE id_patient=$1 AND id_medical_ref=$2",[pat_id,med_id])

         if (result.rowCount === 0) {
            return res.status(404).json({error:"Patient non trouvé ou vous n'avez pas l'autorisation de le supprimer"});
        }

        return res.status(200).json({message:"Le patient a été supprimé"})

    }
    catch(err){
        if (err.code === '23503') {
        return res.status(409).json({error: "Impossible de supprimer : ce patient a des notes ou rendez-vous associés."});
    }
        console.error("Error deleting patient:", err);
        return res.status(500).json({error:"Server error"})
    }
}

const generateSummary = async (req,res)=>{
    const med_id = req.user.id_user;
    const pat_id = req.params.id;
    if (!/^\d+$/.test(pat_id)) return res.status(400).json({error:"ID invalide"});

    try{
        const pat_exists = await pool.query("SELECT 1 FROM Patients WHERE id_patient=$1 AND id_medical_ref=$2",[pat_id,med_id]);
        if(pat_exists.rows.length === 0) return res.status(404).json({error:"Le patient n'existe pas"});

        const notes = await pool.query("SELECT date_creation,contenu_structure FROM Notes WHERE id_patient=$1  AND statut=$2 ORDER BY date_creation ASC "
            ,[pat_id,"validé"]
        )

        if(notes.rows.length === 0) return res.status(400).json({error:"Aucun note validé trouvé, veuillez ajouter des notes et les organiser"});

        const summary = await summarizeHistory(notes.rows);

        const result = await pool.query("UPDATE Patients SET resume=$1,date_resume=$2 WHERE id_patient=$3",
            [summary,new Date(),pat_id]
        )
        return res.status(200).json({summary});
    }catch(err){
        console.error("Error generating summary:", err);
        return res.status(500).json({error:"Server error"})
    }
}

module.exports = {addPatient,getPatients,getPatient,updatePatient,deletePatient,generateSummary}