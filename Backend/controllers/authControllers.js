const bcrypt = require('bcrypt');
const {pool} = require('../database/db.js')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { validationResult } = require('express-validator');

dotenv.config();


const generateToken = (res,user)=>{
     const token = jwt.sign({id: user.id_user , role : user.role },process.env.SECRET_KEY,{
            algorithm: 'HS256',
            expiresIn: '1h'
            })

         res.cookie('token', token, {
            httpOnly: true, 
            secure: false,  
            sameSite: 'lax', 
            maxAge: 3600000 
        });
}

const register = async (req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    let client;

    try{
        const {last_name,first_name,email,password,role} = req.body;
        if(!last_name || !first_name || !email || !password || !role) return res.status(400).json({error:"Veuillez compléter tous les champs"});
        
        client = await pool.connect();

        const normEmail = email.trim().toLowerCase();
        const hashed_password = await bcrypt.hash(password,12);
        
        let newUser;
        try{
            await client.query("BEGIN");

            newUser = await client.query("INSERT INTO Utilisateurs (nom_user,prenom_user,email,mot_de_passe,role) VALUES ($1,$2,$3,$4,$5) RETURNING id_user,nom_user,prenom_user,email,role"
            ,[last_name,first_name,normEmail,hashed_password,role]);
        }catch(err){
            await client.query("ROLLBACK");
            if(err.code === '23505') return res.status(409).json({error:"Utilisateur existe déjà"})
            throw err;
        }
        


        await client.query("COMMIT")
    
        generateToken(res,newUser.rows[0])

        return res.status(200).json({user : newUser.rows[0]});
    }
    catch(err){
        console.error("Server error while registering :",err)
        return res.status(500).json({error:"Server error while registering"})
    }finally{
        client?.release();
    }

}

const login = async (req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {email,password} = req.body;
        if(!email || !password) return res.status(400).json({error:"Veuillez compléter tous les champs"});

        const normEmail = email.trim().toLowerCase();

        const foundUser = await pool.query("SELECT * FROM Utilisateurs WHERE email=$1",[normEmail]);
        
        if(foundUser.rows.length === 0) return res.status(400).json({error:"Email ou mot de passe faux"});

  
        const isRightPassword = await bcrypt.compare(password,foundUser.rows[0].mot_de_passe); 
        if(!isRightPassword) return res.status(400).json({error:"Email ou mot de passe faux"});

        const user = foundUser.rows[0];
        
        generateToken(res,user);

        const {mot_de_passe, ...returnUser} = user; 
        return res.status(200).json({user:returnUser})
    }catch(err){
        console.error("Server error while logging :",err)
        return res.status(500).json({error:"Server error while logging"})
    }
}

const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id_user,nom_user,prenom_user,email,role FROM Utilisateurs WHERE id_user = $1", [req.user.id_user]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Utilisateur introuvable" });

    return res.status(200).json({ user : result.rows[0] });
  } catch (err) {
    console.error("/me error:", err);
    return res.status(500).json({ error: "Server error" });
  }

};





module.exports={register,login,getMe};