const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const {pool} = require('../database/db.js')
dotenv.config();

const protect = async (req,res,next)=>{
    try{
    const token = req.cookies.token;
    if (!token) {
            return res.status(401).json({error:"Jeton manquant"});
        }

    const decoded = jwt.verify(token,process.env.SECRET_KEY);
    const user_id = decoded.id;
    console.log(user_id);

    const userResult = await pool.query(
            "SELECT id_user, role, is_active FROM Utilisateurs WHERE id_user = $1",
            [user_id]
        );
    console.log('query result rows:', userResult.rows); 
    
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: "Utilisateur introuvable" });
        }
        

    const user = userResult.rows[0];
    
    req.user = user;
    if (!user.is_active) {
            return res.status(403).json({ error: "Votre compte est désactivé" });
        }


    next();
    
    }
    catch(err){
        console.log(err.name, err.message);
        return res.status(401).send("Jeton expiré ou invalide")
    }
}

const restrictTo = (...allowedRoles)=>{
    return (req,res,next)=>{
        if(!req.user) return res.status(500).send("Utilisateur non identifié")
        if(! allowedRoles.includes(req.user.role)) return res.status(403).send("Accés refusé")

        next();
    }
}

module.exports = {protect , restrictTo};