const {pool} = require('../database/db.js');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');


const addUser = async (req,res)=>{
    const {first_name,last_name,email,password,role} = req.body;
    if(!first_name || !last_name || !email || !password || !role ) return res.status(400).json({error:"Informations manquantes"})
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try{
        const hashed_password = await bcrypt.hash(password,12);
        const newUser = await pool.query(`INSERT INTO Utilisateurs (nom_user,prenom_user,email,mot_de_passe,role) 
            VALUES ($1,$2,$3,$4,$5) RETURNING nom_user,prenom_user,email,role`,
        [last_name,first_name,email,hashed_password,role])

        if(newUser.rows.length === 0 ) return res.status(400).json({error:"Utilisateur non crée"})
        res.status(201).json({user:newUser.rows[0]})

    }catch(err){
        console.error(err)
        res.status(500).json({error:err})
    }
}


const getUsers = async (req,res)=>{
    try{
        const users = await pool.query("SELECT id_user,nom_user,prenom_user,email,role,is_active FROM Utilisateurs")
        
        res.status(200).json({users:users.rows})

    }catch(err){
        console.error(err)
        res.status(500).json({error:err})
    }
}

const changeStatus = async (req,res)=>{
    const is_active = req.body.is_active;

    const id_user = req.params.id_user;

    if (id_user === undefined || is_active === undefined) {
        return res.status(400).json({ error: "Données manquantes (id_user ou is_active)" });
    }
    
    if (String(req.user.id_user) === String(id_user) && is_active === false) {
        return res.status(400).json({ error: "Vous ne pouvez pas désactiver votre propre compte administrateur." });
    }

    try{
        const user = await pool.query("UPDATE Utilisateurs SET is_active=$1 WHERE id_user=$2 RETURNING id_user,nom_user,prenom_user,email,role",[is_active,id_user]);
        res.status(201).json({user:user.rows[0]})

    }catch(err){
        console.error(err)
        res.status(500).json({error:err})
    }
}

module.exports={addUser,changeStatus,getUsers}