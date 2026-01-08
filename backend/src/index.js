
import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({
    path: join(__dirname, '../.env')
});

console.log('CORS_ORIGIN from .env:', process.env.CORS_ORIGIN);
console.log('PORT from .env:', process.env.PORT);

connectDB()
.then(() => {

     app.on("error", (error) => {
      console.log("ERROR:", error);
      throw error;
    });

    app.listen(process.env.PORT || 8000, () => {
        console.log(` server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGODB connection failed !!!",err);
})
