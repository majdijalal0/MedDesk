const {pool} = require('../database/db.js');

const addAppointement = async (req,res)=>{
    const user_id = req.user.id_user;
    const patient_id = req.params.id;
    const {date_rdv,type} = req.body;

      let doctor_id;
    if(req.user.role === 'médecin'){
        doctor_id = user_id;
    }else if(req.user.role === 'secrétaire'){
        doctor_id = req.body.id_doctor;
        if(!doctor_id) return res.status(400).send("Médecin non précisé");
    }else{
        return res.status(403).send("Rôle non autorisé à créer un rendez-vous");
    }


    if(!date_rdv || !type) return res.status(400).send("Date rendez-vous non précisée");

    const validTypes = ['Consultation', 'Consultation de suivi', 'Téléconsultation'];

    if (!validTypes.includes(type)) {
        return res.status(400).send("Type invalide");
    }

    try{  
        const existingPatient = await pool.query("SELECT 1 FROM Patients WHERE id_patient=$1 AND id_medical_ref=$2",
            [patient_id,doctor_id]
        )
        if(existingPatient.rows.length === 0) return res.status(403).send("Le patient n'existe pas ou vous n'avez pas accés à ce patient")
        const existingApp = await pool.query("SELECT 1 FROM Rendez_vous WHERE id_user=$1 AND date_rdv=$2",
            [doctor_id,date_rdv]
        )
        if(existingApp.rows.length >0) return res.status(409).send("Vous avez déjà un rendez-vous à ce temps là");

        const newApp = await pool.query("INSERT INTO Rendez_vous (id_patient,id_user,date_rdv,statut,type) VALUES ($1,$2,$3,$4,$5) RETURNING *" ,
            [patient_id,doctor_id,date_rdv,"En attente",type]
        );

        return res.status(200).json({newApp:newApp.rows[0]})

    }catch(err){
        console.error("Server error while adding appointement :",err);
        return res.status(500).json({error:"Server error while adding appointement"});
    }

}

const getAppointement = async (req,res)=>{
    const user_id = req.user.id_user;
    const app_id = req.params.id;
    try{
        const existingApp = await pool.query("SELECT * FROM Rendez_vous WHERE id_rdv=$1 AND id_user=$2",
            [app_id,user_id]
        )
        if(existingApp.rows.length === 0) return res.status(404).send("Le rendez-vous n'est pas trouvé");

        return res.status(200).json({app:existingApp.rows[0]})
    }
    catch(err){
        console.error("Server error while getting appointement:",err);
        return res.status(500).send("Server error while getting appointement");
    }
}

const getAppointements = async (req,res)=>{
    const user_id = req.user.id_user;
    const user_role = req.user.role;
    try{
        let doctor_id;
            if(user_role === 'médecin'){
                doctor_id = user_id;
            }else{
                doctor_id = req.query.doctor_id;
            }
        const appointements = await pool.query(`SELECT r.*, p.nom_patient, p.prenom_patient
         FROM Rendez_vous r JOIN Patients p ON r.id_patient=p.id_patient
        WHERE r.id_user = $1 ORDER BY r.date_rdv DESC`,
            [doctor_id]
        )

        return res.status(200).json({app:appointements.rows})
    }
    catch(err){
        console.error("Server error while getting appointement :",err);
        return res.status(500).send("Server error while getting appointement");
    }
}



const getPatientAppointements = async (req,res)=>{
    const user_id = req.user.id_user;
    const id_patient = req.params.id;
    try{
        const appointements = await pool.query("SELECT * FROM Rendez_vous WHERE  id_user=$1 AND id_patient=$2",
            [user_id,id_patient]
        )
        return res.status(200).json({app:appointements.rows})
    }
    catch(err){
        console.error("Server error while getting appointement :",err);
        return res.status(500).json({error:"Server error while getting appointement"});
    }
}

const updateAppointement = async(req,res)=>{
    const user_id = req.user.id_user;
    const app_id = req.params.id;
    const user_role = req.user.role;
    const {date_rdv,statut,type} = req.body;
    const validStatuses = ['En attente','Confirmé','Annulé','Terminé'];
    if (statut && !validStatuses.includes(statut)) {
        return res.status(400).send("Statut invalide");
    }
    const validTypes = ['Consultation', 'Consultation de suivi', 'Téléconsultation'];
    if (type && !validTypes.includes(type)) {
        return res.status(400).send("Type invalide");
    }

    let doctor_id;
         if(user_role === 'médecin'){
                doctor_id = user_id;
        }else{
                doctor_id = req.body.id_user;
                if(!doctor_id) return res.status(404).json({error:"ID du docteur referant non trouvé"})
        }

    try{
        const existingAppointement = await pool.query("SELECT * FROM Rendez_vous WHERE id_user=$1 AND id_rdv=$2",
            [doctor_id,app_id]
        )
        if(existingAppointement.rows.length === 0) return res.status(404).send("Auncun rendez-vous n'est trouvé");

         const oldDate = existingAppointement.rows[0].date_rdv;
        const finalDate = date_rdv || oldDate;
        const finalStatut = statut || existingAppointement.rows[0].statut;
        const finalType = type || existingAppointement.rows[0].type;

        if (date_rdv && new Date(date_rdv).getTime() !== new Date(oldDate).getTime()) {
             const doctorBusy = await pool.query(
                 "SELECT 1 FROM Rendez_vous WHERE id_user=$1 AND date_rdv=$2 AND id_rdv != $3",
                 [doctor_id, finalDate, app_id]
             );
             if(doctorBusy.rows.length > 0) return res.status(409).json({error: "Vous avez déjà un rendez-vous à cette date/heure"});
        }

        const updatedAppointement = await pool.query("UPDATE Rendez_vous SET date_rdv=$1,statut=$2,type=$3 WHERE id_user=$4 AND id_rdv=$5 RETURNING *",
            [finalDate,finalStatut,finalType,doctor_id,app_id]
        )
        return res.status(200).json({app:updatedAppointement.rows[0]})
    }
    catch(err){
        console.error("Server error while updating appointement :",err);
        return res.status(500).send("Server error while updating appointement");
    }
}

const getTodayAppointements =  async (req, res) => {
  const id = req.user.id_user;
  try {

    const today = await pool.query(
      `SELECT r.id_rdv, r.statut, r.type, r.date_rdv,
              p.id_patient, p.nom_patient, p.prenom_patient
         FROM Rendez_vous r JOIN Patients p USING (id_patient)
        WHERE r.id_user = $1 AND r.date_rdv::date = CURRENT_DATE AND  r.statut <> 'Annulé'
        ORDER BY r.date_rdv`, [id]);

    const next = await pool.query(
      `SELECT r.id_rdv, r.type, r.date_rdv, p.id_patient, p.nom_patient, p.prenom_patient
         FROM Rendez_vous r JOIN Patients p USING (id_patient)
        WHERE r.id_user = $1 AND r.statut IN ('En attente','Confirmé') AND r.date_rdv > NOW()
        ORDER BY r.date_rdv ASC LIMIT 3`, [id]);

    const pending = await pool.query(
      `SELECT n.id_note, n.date_creation, p.id_patient, p.nom_patient, p.prenom_patient
         FROM Notes n JOIN Patients p USING (id_patient)
        WHERE n.id_user = $1 AND n.statut = 'en attente de validation'
        ORDER BY n.date_creation DESC LIMIT 5`, [id]);

    const rows = today.rows;

    return res.status(200).json({
      progress: { seen: rows.filter((r) => r.statut === 'Terminé').length, total: rows.length },
      next: next.rows,
      pending: pending.rows,
     
    });
  } catch (err) {
    console.error("home error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


const getRefDoctorAppointements = async (req, res) => {
  if (req.user.role !== 'secrétaire') return res.status(403).json({ error: "Réservé aux secrétaires" });
  const doctor_id = parseInt(req.query.doctor_id);
  if (!doctor_id) return res.status(400).json({ error: "Médecin requis" });

  try {
    const ok = await pool.query(
      "SELECT 1 FROM SecretaryAssignments WHERE secretary_id=$1 AND doctor_id=$2", [req.user.id_user, doctor_id]);
    if (ok.rows.length === 0) return res.status(403).json({ error: "Accès non autorisé à ce médecin" });

    const today = await pool.query(
      `SELECT r.statut FROM Rendez_vous r
        WHERE r.id_user = $1 AND r.date_rdv::date = CURRENT_DATE`, [doctor_id]);

    const next = await pool.query(
      `SELECT r.id_rdv, r.type, r.date_rdv, p.id_patient , p.nom_patient, p.prenom_patient
         FROM Rendez_vous r JOIN Patients p USING (id_patient)
        WHERE r.id_user = $1 AND r.statut IN ('En attente','Confirmé') AND r.date_rdv > NOW()
        ORDER BY r.date_rdv ASC LIMIT 3`, [doctor_id]);

    const pending = await pool.query(
      `SELECT r.id_rdv, r.type, r.date_rdv, p.nom_patient, p.prenom_patient, p.telephone
         FROM Rendez_vous r JOIN Patients p USING (id_patient)
        WHERE r.id_user = $1 AND r.statut = 'En attente' AND r.date_rdv >= NOW()
        ORDER BY r.date_rdv ASC LIMIT 6`, [doctor_id]);

    const breakdown = { 'En attente': 0, 'Confirmé': 0, 'Terminé': 0, 'Annulé': 0, total: today.rows.length };
    today.rows.forEach((r) => { if (r.statut in breakdown) breakdown[r.statut]++; });

    return res.status(200).json({ breakdown, next: next.rows, pending: pending.rows });
  } catch (err) {
    console.error("secretary home error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const deleteAppointement = async (req,res)=>{
    const user_id = req.user.id_user;
    const app_id = req.params.id;
    try{
        let doctor_id;
        if(req.user.role === 'médecin'){
            doctor_id=user_id
        }else if (req.user.role === 'secrétaire'){
            doctor_id = req.body.id_doctor
        }
        const result = await pool.query("DELETE FROM Rendez_vous WHERE id_user=$1 AND id_rdv=$2",
            [doctor_id,app_id]
        )
        if(result.rowCount === 0 ) return res.status(404).json({error:"Le rendez-vous n'est pas trouvé"})
        return res.status(200).json({msg:"Le rendez-vous a été supprimé"})
    }
    catch(err){
        console.error("Server error while deleting appointement :",err);
        return res.status(500).json({error:"Server error while deleting appointement"});
    }
}



module.exports = {addAppointement,getAppointement,getAppointements,getPatientAppointements,updateAppointement,deleteAppointement,getTodayAppointements,getRefDoctorAppointements};