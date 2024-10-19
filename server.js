const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();

const dbConfig = {
    user: process.env.DB_USERNAME,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
};

// creating a connection

async function createConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log("Connected to the database");
        return connection;
    } catch (error) {
        console.error("Error connecting to the database:", error);
        process.exit(1);
    }
}

// Question 1 goes here

app.get("/patients", async (req, res) => {
    const connection = await createConnection();
    try {
        const [rows] = await connection.execute(
            "SELECT patient_id, first_name, last_name, date_of_birth FROM patients"
        );
        res.json(rows);
    } catch (error) {
        console.error("Error retrieving patients:", error);
        res.status(500).json({ error: "Error retrieving patients" });
    } finally {
        connection.end();
    }
});

// Question 2 goes here

app.get("/providers", async (req, res) => {
    const connection = await createConnection();
    try {
        const [rows] = await connection.execute(
            "SELECT first_name, last_name, provider_specialty FROM providers"
        );
        res.json(rows);
    } catch (error) {
        console.error("Error retrieving providers:", error);
        res.status(500).json({ error: "Error retrieving providers" });
    } finally {
        connection.end();
    }
});

// Question 3 goes here
app.get("/patients/search", async (req, res) => {
    let connection;
    try {
        const firstName = req.query.first_name;

        // Validate that first_name parameter exists
        if (!firstName) {
            return res.status(400).json({
                error: "First name parameter is required (use ?first_name=)",
            });
        }

        connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(
            `
            SELECT patient_id, first_name, last_name, date_of_birth 
            FROM patients 
            WHERE first_name LIKE ?
        `,
            [`%${firstName}%`]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "No patients found with that first name",
            });
        }

        res.json(rows);
    } catch (error) {
        console.error("Error retrieving patients:", error);
        res.status(500).json({
            error: "An error occurred while retrieving patients",
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Question 4 goes here
app.get("/providers/filter", (req, res) => {
    const { provider_specialty } = req.query;
    const filter_by_specialty =
        "SELECT * FROM providers where provider_specialty = ?";
    if (!provider_specialty) {
        console.log("Provider specialty is required");
        return res.status(400).send("Provider specialty is required");
    }

    db.query(filter_by_specialty, [provider_specialty], (err, results) => {
        if (err) {
            console.log("Database query error");
            return res.status(500).send("Database query error");
        }
        if (results.length === 0) {
            console.log("No provider found with that specialty");
            return res
                .status(404)
                .send("No provider found with that specialty");
        }
        res.json(results);
        console.log("Response sent successfully!");
    });
});

// incase a requested path isnt available

// listen to the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`server is runnig on http://localhost:${PORT}`);
});
