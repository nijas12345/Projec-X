import express,{Application} from 'express'
import morgan from 'morgan';
import { createServer } from 'http';
import DB_Connection from './Config/database_config'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import { startCronJob } from './Config/cron_config';
import { configSocketIO } from './Config/socket_config';
import user_router from './Routes/user_route';
import admin_router from './Routes/admin_route';
import AdminRepository from './Repositories/adminRepository';
import AdminController from './Controllers/adminController';
import AdminServices from './Services/adminServices';
import Admin from './Model/adminModal';
import User from './Model/userModal';
import Payment from './Model/paymentModal';
dotenv.config()
const adminRepository = new AdminRepository(Admin,User,Payment)
const adminService = new AdminServices(adminRepository)
const adminController = new AdminController(adminService)

DB_Connection()
const app:Application = express()
app.use(cors({
    origin:["https://projec-x-uz6p.vercel.app/",'http://localhost:5173'],
    credentials:true
}))
const server = createServer(app)
configSocketIO(server);
startCronJob()
app.use(cookieParser())
app.use(morgan('dev'));
app.use('/webhook',express.raw({ type: 'application/json' }),adminController.handleWebhook);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'uploads')));
app.use('/',user_router)
app.use('/admin',admin_router)

server.listen(process.env.PORT,():void=>{
    console.log(`Server is started on port ${process.env.PORT}`);  
})