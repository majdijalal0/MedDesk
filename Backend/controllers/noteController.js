const {pool} = require('../database/db.js');
const {organizeNoteContent} = require('../Services/aiService.js');

const addNote = async (req,res)=>{
    const med_id = req.user.id_user;
    const id_patient = parseInt(req.params.patient_id);
    const {contenu_brut,contenu_structure,type,statut} = req.body;

    if(!id_patient ||  !type || type.trim() === '') return res.status(400).json({error:"Informations manquantes"});

    const raw = (contenu_brut || '').trim();
     const allowed = ['validé', 'en attente de validation'];
     const st = allowed.includes(statut) ? statut : 'validé';

    try{
      
        const newNote = await pool.query(
            "INSERT INTO Notes (id_patient,id_user,contenu_brut,contenu_structure,type,statut) SELECT $1,$2,$3,$4,$5,$6 FROM Patients WHERE id_patient=$1 AND id_medical_ref=$2 RETURNING *",
            [parseInt(id_patient),med_id,contenu_brut,contenu_structure || null ,type,st]);
        if(newNote.rows.length === 0) return res.status(404).json({error:"Le patient n'est pas trouvé"})
        return res.status(201).json({note:newNote.rows[0]})
    }
    catch(err){
        console.error("Error adding note:", err);
        return res.status(500).json({error:"Server error"})
    }
}

const getPatientNotes = async (req,res)=>{
    const med_id = req.user.id_user;
    const id_patient = req.params.patient_id;

    try{

        const patientNotes = await pool.query("SELECT N.* FROM Notes N JOIN Patients P ON N.id_patient=P.id_patient WHERE N.id_patient=$1 AND N.id_user=$2 ORDER BY date_creation DESC"
            ,[parseInt(id_patient),med_id]);

        return res.status(200).json({notes:patientNotes.rows});
    }catch(err){
       console.error("Error fetching note:", err);
        return res.status(500).send("Server error")
    }
}


const updateNote = async (req,res)=> {
    const med_id = req.user.id_user;
    const note_id = req.params.id_note;
    const {contenu_brut,contenu_structure} = req.body;
    const hasStructuredContent = typeof contenu_structure === 'string' && contenu_structure.trim() !== '';
    const hasBrutContent = typeof contenu_brut === 'string' && contenu_brut.trim() !== '';

    if (!hasStructuredContent && !hasBrutContent) {
        return res.status(400).json({ error: "Aucune modification fournie" });
    }
    const brut_content = hasBrutContent ? contenu_brut : null;
    const structured_content = hasStructuredContent    ? contenu_structure   : null;
    try{
        const updatedNote = await pool.query("UPDATE Notes SET contenu_brut=COALESCE($1,contenu_brut),contenu_structure=COALESCE($2,contenu_structure) WHERE id_note=$3 AND id_user=$4 RETURNING *",
            [brut_content,structured_content,parseInt(note_id),med_id]
        )

        if(updatedNote.rows.length === 0) return res.status(404).json({error:"Note non trouvé"})

        return res.status(200).json({note:updatedNote.rows[0]})

    }catch(err){
        if (err.code === '23514') return res.status(400).json({ error: "Type de note invalide" });
        console.error("Error updating note:", err);
        return res.status(500).json({error:"Server error"})
    }
}

const deleteNote = async (req,res)=>{
    const med_id = req.user.id_user;
    const note_id = req.params.id_note;

    try{
        const result = await pool.query("DELETE FROM Notes WHERE id_note=$1 AND id_user=$2",[parseInt(note_id),med_id])
        if(result.rowCount === 0) return res.status(404).json({error:"Erreur lors de la suppression de la note"});

        return res.status(200).json({message:"La note a été supprimée"});
    }
    catch(err){
        console.error("Error deleting note:", err);
        return res.status(500).json({error:"Server error"})
    }
}



const organizeNote = async (req,res)=>{
      const note_id = parseInt(req.params.id_note);
      const med_id = req.user.id_user;

      let id_patient,contenu_brut,type;
      try{
        let content;
        if(note_id){
        const existingNote = await pool.query("SELECT * FROM Notes WHERE id_note=$1 AND id_user=$2",[note_id,med_id])
        if(existingNote.rows.length === 0 ) return res.status(404).json({error:"La note n'existe pas ou vous n'avez pas accés à ce contenu"});

        if (existingNote.rows[0].contenu_structure) {
            return res.status(409).json({error:"Cette note a déjà été organisée et ne peut pas être modifiée"});
        }
        content =  existingNote.rows[0].contenu_brut;
        }
        else{
            id_patient=req.body.id_patient;
            contenu_brut=req.body.contenu_brut;
            type=req.body.type;

            if (!id_patient || !type || !contenu_brut?.trim())
             return res.status(400).json({ error: "Patient, type et note brute requis" });
            content = contenu_brut;
        }

        if(!content) return res.status(400).json({error:"La note est vide"});

        const organizedNote = await organizeNoteContent(content);
        
        if(note_id){
        const updatedNote = await pool.query("UPDATE Notes SET contenu_structure=$1,statut=$2 WHERE id_note=$3 AND id_user=$4 RETURNING *",
            [organizedNote,"en attente de validation",note_id,med_id])
        return res.status(200).json({newNote : updatedNote.rows[0]})
        }

         const newNote = await pool.query("INSERT INTO Notes (id_patient,id_user,contenu_brut,contenu_structure,type,statut) VALUES ($1,$2,$3,$4,$5,$6)  RETURNING *",
            [id_patient,med_id,content,organizedNote,type, "en attente de validation"]
        );
         return res.status(200).json({ newNote: newNote.rows[0] }); 
      }
      catch(err){
        console.error("Error organizing note:", err);
        return res.status(500).json({error:"Server error"})
      }

}

const validateNote = async (req,res)=>{
    const med_id = req.user.id_user;
    const note_id = parseInt(req.params.id_note);
    const {modified_content} = req.body;
    
    try{
        if (modified_content !== undefined) {
            if (typeof modified_content !== 'string' || modified_content.trim().length === 0) {
                return res.status(400).json({error:"Votre note modifiée est vide"});
            }
        }
        

        const existingNote = await pool.query("SELECT * FROM Notes WHERE id_note=$1 AND id_user=$2",[note_id,med_id])
        if(existingNote.rows.length === 0 ) return res.status(404).json({error:"La note n'existe pas ou vous n'avez pas accés à ce contenu"});

        const statut = existingNote.rows[0].statut;
        if(statut !== 'en attente de validation') return res.status(409).json({error:"La note ne peut pas être validée"});

        
        const oldContent = existingNote.rows[0].contenu_structure;
        if(!oldContent) return res.status(400).json({error:"Pas de contenu organisé"});

        const finalContent = modified_content !== undefined ? modified_content : oldContent;

        const newNote = await pool.query("UPDATE Notes SET contenu_structure=$1,statut=$2 WHERE id_note=$3 AND id_user=$4 RETURNING *",
            [finalContent, "validé",note_id,med_id]
        );

        return res.status(200).json({newNote:newNote.rows[0]});
    
    }catch(err){
        console.error("Error validating note:", err);
        return res.status(500).json({error:"Server error"})
    }

}

module.exports = {addNote,getPatientNotes,updateNote,deleteNote,organizeNote,validateNote}