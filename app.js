import express from 'express'
import todoRoutes from './routes/todoRoutes.js'
import dotenv from "dotenv";
dotenv.config();

import connectToDatabase from './config/db.js' // Import the database configuration
const app = express()
const port = 3000
// Middleware to parse JSON requests
app.use(express.json());


connectToDatabase() // Call the function to connect to the database

// Connect to the database
 


app.use(express.json())

app.use("/api/v1/",todoRoutes)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})