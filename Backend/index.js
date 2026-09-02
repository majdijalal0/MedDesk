const dotenv = require('dotenv');
const express = require('express');


const { initdb } = require('./database/db.js');
const authRoutes = require('./routes/authRoutes.js');
const noteRoutes = require('./routes/noteRoutes.js');
const patientRoutes = require('./routes/patientRoutes.js');
const rdvRoutes = require('./routes/appointementRoutes.js');
const teamRoutes = require('./routes/teamRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js')
const cors = require('cors');

const app = express();
const cookieParser = require('cookie-parser');
app.use(express.json()); 
app.use(cookieParser());

dotenv.config();

app.use(cors({
    origin: process.env.frontend_url,
    credentials:true
}));




app.use('/api/auth',authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/notes',noteRoutes);
app.use('/api/rdv',rdvRoutes);
app.use('/api/team',teamRoutes);
app.use('/api/admin',adminRoutes);

const port = process.env.port;



initdb().then(()=>{
    app.listen(port,()=>{console.log("Server running")})
}
)
