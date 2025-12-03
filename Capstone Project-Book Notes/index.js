import express from "express";
import env from "dotenv";
import { Client } from "pg";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import ejs from "ejs";


const port = 3000;
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
env.config();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static(__dirname));





const db = new Client({
    user: "postgres",
    password: "password",
    host: "localhost",
    port: 5432,
    database: "Books Notes"
});

db.connect();



app.get("/", async (req, res) => {

    try {
        const result = await db.query("SELECT * FROM books_read");
        res.render("index.ejs", {
            Notes: result.rows
        });
    } catch (err) {
        console.log(err);

    }

})

app.get("/title", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM books_read ORDER BY id ASC");
        res.render("index.ejs", {
            Notes: result.rows
        });
    } catch (err) {
        console.log(err);
        res.send(err);

    }
});

app.get("/newest", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM books_read ORDER BY date_of_read DESC");
        res.render("index.ejs", {
            Notes: result.rows
        });

    } catch (err) {
        console.log(err);
        res.send(err);
    }
});

app.get("/best", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM books_read ORDER BY rating DESC");
        res.render("index.ejs", {
            Notes: result.rows
        });
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});

app.get("/aboutme", (req, res) => {
    res.render("aboutme.ejs");
});

app.get("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const result = await db.query("SELECT * FROM books_read WHERE id=$1", [id]);
        res.render("note.ejs", {
            Note: result.rows[0],
        });

    } catch (err) {
        console.log(err);
        res.send(err);

    }
})






app.listen(port, () => {
    console.log("Listening on Port: ", port);

})


/*
Cover API:
I want to fetch the cover which is an image from the api. To do that: 



*/