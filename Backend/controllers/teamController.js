const {pool} = require('../database/db.js')

const getMyDoctors = async (req, res) => {
  try {
    if (req.user.role !== 'secrétaire') return res.status(200).json({ doctors: [] });
    const r = await pool.query(
      `SELECT u.id_user, u.nom_user, u.prenom_user
         FROM SecretaryAssignments sa
         JOIN Utilisateurs u ON u.id_user = sa.doctor_id
        WHERE sa.secretary_id = $1 ORDER BY u.nom_user`, [req.user.id_user]);
    return res.status(200).json({ doctors: r.rows });
  } catch (err) { console.error(err); return res.status(500).json({ error: "Server error" }); }
};


const getMyTeam = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT u.id_user, u.nom_user, u.prenom_user, u.email
         FROM SecretaryAssignments sa JOIN Utilisateurs u ON u.id_user = sa.secretary_id
        WHERE sa.doctor_id = $1 ORDER BY u.nom_user`, [req.user.id_user]);
    return res.status(200).json({ secretaries: r.rows });
  } catch (err) { console.error(err); return res.status(500).json({ error: "Server error" }); }
};

const addSecretary = async (req, res) => {
  const email = (req.body.email ?? '').trim().toLowerCase();      
  if (!email) return res.status(400).json({ error: "Email requis" });
  try {
    const u = await pool.query("SELECT id_user FROM Utilisateurs WHERE email=$1 AND role='secrétaire'", [email]);
    if (u.rows.length === 0) return res.status(404).json({ error: "Aucune secrétaire avec cet email" });
    await pool.query(
      `INSERT INTO SecretaryAssignments (secretary_id, doctor_id) VALUES ($1,$2)
       ON CONFLICT (secretary_id, doctor_id) DO NOTHING`, [u.rows[0].id_user, req.user.id_user]); 
    return res.status(200).json({ ok: true });
  } catch (err) { console.error(err); return res.status(500).json({ error: "Server error" }); }
};

const removeSecretary = async (req, res) => {
  try {
    const r = await pool.query(
      "DELETE FROM SecretaryAssignments WHERE doctor_id=$1 AND secretary_id=$2 RETURNING id",
      [req.user.id_user, parseInt(req.params.secretary_id)]);
    if (r.rows.length === 0) return res.status(404).json({ error: "Lien introuvable" });
    return res.status(200).json({ ok: true });
  } catch (err) { console.error(err); return res.status(500).json({ error: "Server error" }); }
};


module.exports = {getMyDoctors,getMyTeam,addSecretary,removeSecretary};