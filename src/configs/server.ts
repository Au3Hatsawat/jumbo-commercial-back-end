import express from "express";
import cors from "cors";
import router from "../routes/index.route";
import path from "path";

const app = express();

app.use(cors({
    origin: "*"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api' , router);
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));
export default app;
