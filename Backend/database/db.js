const {Pool} = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    user: process.env.db_user ,
    host: process.env.db_host  ,
    database: process.env.database ,
    password: process.env.db_password ,
    port: process.env.db_port ,
})

const initdb = async ()=>{
    try{
    await pool.query(`

        CREATE TABLE IF NOT EXISTS Utilisateurs (
            id_user SERIAL primary key,
            nom_user VARCHAR(90) NOT NULL,
            prenom_user VARCHAR(90) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            mot_de_passe VARCHAR(255) NOT NULL,
            role VARCHAR(90) NOT NULL CHECK (role IN ('médecin','secrétaire','admin')),
            is_active BOOLEAN DEFAULT true
        );

        CREATE TABLE IF NOT EXISTS Patients (
            id_patient SERIAL primary key,
            nom_patient VARCHAR(90) NOT NULL,
            prenom_patient VARCHAR(90) NOT NULL,
            date_naissance DATE NOT NULL,
            sexe CHAR(1) NOT NULL CHECK(sexe IN('M','F')),
            telephone VARCHAR(30),
            informations_medicales JSONB NOT NULL,
            id_medical_ref INTEGER REFERENCES Utilisateurs(id_user),
            resume TEXT,
            date_resume TIMESTAMP,
            UNIQUE (nom_patient, prenom_patient, date_naissance, id_medical_ref)
        );
        
        CREATE TABLE IF NOT EXISTS Notes(
            id_note SERIAL primary key,
            id_patient INTEGER REFERENCES Patients(id_patient) ON DELETE CASCADE,
            id_user INTEGER REFERENCES Utilisateurs(id_user) ON DELETE CASCADE,
            date_creation TIMESTAMP DEFAULT NOW(),
            contenu_brut TEXT NOT NULL,
            contenu_structure TEXT,
            statut VARCHAR(100) CHECK (statut IN ('en attente de validation' , 'validé')),
            type TEXT NOT NULL CHECK (type IN ('Consultation', 'Consultation de suivi', 'Urgence', 'Téléconsultation'))
        );

        CREATE TABLE IF NOT EXISTS Rendez_vous(
            id_rdv SERIAL primary key,
            id_patient INTEGER REFERENCES Patients(id_patient),
            id_user INTEGER REFERENCES Utilisateurs(id_user),
            date_rdv TIMESTAMP,
            statut VARCHAR(150) CHECK(statut IN ('En attente','Confirmé','Annulé','Terminé')),
            type TEXT CHECK (type IN ('Consultation', 'Consultation de suivi', 'Urgence', 'Téléconsultation'))
        );

        CREATE TABLE IF NOT EXISTS SecretaryAssignments(
            id SERIAL Primary Key,
            secretary_id INTEGER NOT NULL REFERENCES Utilisateurs(id_user) ON DELETE CASCADE,
            doctor_id INTEGER NOT NULL REFERENCES Utilisateurs(id_user) ON DELETE CASCADE,
            UNIQUE(secretary_id,doctor_id)
        );
        
        `)
        console.log("Database initiated")
    }
    catch(err){
        console.error(err)
    }

}

module.exports={initdb,pool}