
import express, { response } from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { Client } from "pg";
import bcrypt from "bcrypt";
import env from "dotenv";
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";
import ejs from "ejs";



env.config();
const { DATABASE_USER, DATABASE_PASSWORD, DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, SALT_ROUNDS } = process.env;
const app = express();
const saltRounds = Number(SALT_ROUNDS);
const __dirname = dirname(fileURLToPath(import.meta.url)); //This is the path from the root directory to the current directory
const port = 3000;
app.use(express.static("public"));
app.use(express.static(__dirname));

app.use(bodyParser.urlencoded({ extended: true }));
// Session
app.use(session({
    secret: "My-secret",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.authenticate('session'));





const client = new Client({
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    host: DATABASE_HOST,
    port: Number(DATABASE_PORT),
    database: DATABASE_NAME,
});
await client.connect();




app.listen(port, () => {
    console.log(`Listening on Port: ${port}. `)
});


app.get("/", async (req, res) => {
    console.log("Iam working");

    try {
        const response = await client.query("SELECT * FROM userblogs ORDER BY date_of_creation DESC LIMIT 5");

        if (req.isAuthenticated()) {
            const [{ id, fname }] = req.user;
            console.log("session message: ", req.session.message);

            res.render("index.ejs", {
                userName: fname,
                userId: id,
                message: req.session.message,
                blogs: response.rows,
            })
        }
        else {
            res.render("index.ejs", {
                blogs: response.rows,
            });
        }
    } catch (err) {
        console.log(err);
        res.send(err);

    }


});
app.get("/about", (req, res) => {
    if (req.isAuthenticated()) {
        const [{ id, fname }] = req.user;
        res.render("about.ejs", {
            userName: fname,
            userId: id,
        })
    } else {
        res.render("about.ejs");
    }
});




app.get("/blogs", async (req, res) => {

    try {
        const response = await client.query("SELECT * FROM userblogs");
        if (req.isAuthenticated()) {
            const [{ id, fname }] = req.user;
            res.render("allblogs.ejs", {
                blogs: response.rows,
                userName: fname,
                userId: id,
            });
        } else {
            res.render("allblogs.ejs", {
                blogs: response.rows,
            });

        }

    } catch (err) {
        console.log(err);
        res.send(err);

    }
})


app.get("/blogs/:id", async (req, res) => {


    try {
        const id = Number(req.params.id);
        const response = await client.query("SELECT * FROM userblogs WHERE blogid=$1", [id]);
        const [{ blogtitle, blogcontent, authorname, blogid, userid, date_of_creation, imagelink }] = response.rows
        if (req.isAuthenticated() === true && (req.user[0].id === userid)) {
            res.render("Blog.ejs", {
                title: blogtitle,
                content: blogcontent,
                author: authorname,
                Authorized: true,
                id: id,
                userid: userid,
                date: date_of_creation,
                imageLink: imagelink
            });
        } else {
            res.render("Blog.ejs", {
                title: blogtitle,
                content: blogcontent,
                author: authorname,
                date: date_of_creation,
                imageLink: imagelink
            });
        }

    }

    catch (err) {
        console.log(err);
        res.send(err);

    }
})

app.get("/contact", (req, res) => {

    if (req.isAuthenticated()) {
        const [{ id, fname }] = req.user;
        res.render("contact.ejs", {
            userName: fname,
            userId: id,
        });
    } else {
        res.render("contact.ejs")
    }
});

app.get("/addBlog", (req, res) => {

    if (req.isAuthenticated()) {
        const [{ id, fname }] = req.user;
        res.render("addBlog.ejs", {
            userName: fname,
            userId: id,
        });
    } else {
        res.redirect("/signin");
    }
})

// myblogs.ejs will be the page where all blogs of the single user will be shown
app.get("/myblogs", async (req, res) => {


    if (req.isAuthenticated()) {

        try {

            const [{ id, fname }] = req.user;
            const response = await client.query("SELECT * FROM userblogs WHERE userid=$1", [id]);
            console.log(response.rows);

            res.render("myblogs.ejs", {
                blogs: response.rows,
                userName: fname,
                userId: id
            })
        } catch (err) {

        }
    } else {
        res.redirect("/signin");
    }

})

app.get("/edit/:userid&:id", async (req, res) => {

    const idOfUser = Number(req.params.userid);
    const id = Number(req.params.id);


    // Here is one problem which is that User A can access the User B or other user's blogs for editing.
    if (req.isAuthenticated() === true && (idOfUser === req.user[0].id)) {
        try {
            const response = await client.query("SELECT * FROM userblogs WHERE blogid=$1", [id]);

            res.render("addBlog.ejs", {
                blog: response.rows[0],
            })
        } catch (err) {
            console.log(err);
            res.send(err);

        }
    } else if (req.isAuthenticated() === true && (idOfUser !== req.user[0].id)) {
        res.redirect("/")
    }
    else {
        res.redirect("/signin");
    }
})

app.post("/edit/:userid&:id", async (req, res) => {
    if (req.isAuthenticated()) {



        try {
            const { userid, id } = req.params;
            const { title, content } = req.body;
            await client.query("UPDATE userblogs SET blogtitle=$1, blogcontent=$2 WHERE blogid=$3", [title, content, Number(id)]);
            res.redirect(`/blogs/${Number(id)}`);
        } catch (err) {
            console.log(err);
            res.send(err);

        }
    } else {
        res.redirect("/signin");
    }
})


app.get("/signup", (req, res) => {
    res.render("signUp.ejs")
});

app.get("/signin", (req, res) => {
    if (req.isAuthenticated()) {
        req.session.message = "User is already signed in."
        res.redirect("/");
    } else {
        res.render("signin.ejs")
    }
})





app.post("/signup", async (req, res) => {

    // Important: How to use db.end(). As it is giving some errors if I use it here.



    const { fName, lName, age, email, password, Cpassword } = req.body

    if (password !== Cpassword) {
        res.render("signUp.ejs", {
            notSame: "Please Enter the same password in both fields."
        });
    } else {


        try {
            console.log("This is before query");
            bcrypt.hash(Cpassword, saltRounds, async function (err, hash) {
                if (err) {
                    console.log(err);
                    res.send(err);
                } else {
                    await client.query("INSERT INTO users(fName,lName,age,email,password) VALUES($1,$2,$3,$4,$5)", [fName, lName, age, email, hash]);
                    res.redirect("/signin");
                }
            })

            console.log("This is after query");

        }
        catch (err) {
            console.log(err);
            res.send(err);
        }
    }


})
app.post("/signin", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/signin",
}
))


// End of the sign up and sign in backend program.






// Post Creation OR Blog creation by the user.



app.post("/addblogs", async (req, res) => {

    if (req.isAuthenticated()) {
        const { title, content, dateOfCreation } = req.body;
        const [{ id, fname }] = req.user;
        try {
            await client.query("INSERT INTO userblogs(userid,authorname,blogtitle,blogcontent,date_of_creation) VALUES($1,$2,$3,$4,$5)", [id, fname, title, content, dateOfCreation]);
            res.redirect("/myblogs");
        } catch (err) {
            console.log(err);
            res.send(err);
        }
    } else {
        res.redirect("/signin");
    }
})

// Delete request:

app.get("/delete/:id", async (req, res) => {
    if (req.isAuthenticated()) {
        const blogid = Number(req.params.id);
        console.log(blogid);

        try {
            await client.query("DELETE FROM userblogs WHERE blogid=$1", [blogid]);
            res.redirect("/myblogs");
        } catch (err) {
            console.log(err);
            res.send(err);

        }
    } else {
        res.redirect("/signin");
    }

})


/*


I want 1 Blog on each Page. 
And I want all the blogs with small details on the blogs page.


*/


// Passport Authentication

passport.use(new LocalStrategy(async function verify(username, password, cb) {

    try {
        const response1 = await client.query(`SELECT id FROM users WHERE email='${username}'`);
        const id = response1.rows[0].id;

        try {
            const response = await client.query(`SELECT * FROM users WHERE id=${id}`,)
            const hashPassword = response.rows[0].password;
            bcrypt.compare(password, hashPassword, function (err, result) {
                if (result) {
                    return cb(null, response.rows)
                }
                else {
                    return cb(null, false, { message: "Incorrect username or password." });

                }

            })
            // console.log(r);

        }
        catch (err) {
            return cb(err)
        }
    } catch (err) {
        return cb(err);
    }

}))


// Serialize and deserialize User-Start

passport.serializeUser(function (user, cb) {
    console.log("From serialize USer: ", user);
    return cb(null, user);

});

passport.deserializeUser(function (user, cb) {

    console.log("From deserialize USer: ", user);
    return cb(null, user);

});


// Serialize and deserialize User-End

app.get("/signout", (req, res) => {
    req.logOut(function (err) {
        if (err) { return next(err) }
        res.redirect("/");
    })
})