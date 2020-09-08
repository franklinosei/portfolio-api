const express = require('express');
const knex = require('knex');
const cors = require('cors');
const nodemailer = require('nodemailer');
const router = express.Router();
const creds = require('./config');


const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    }
  });


const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/contact', router);



const transport = {
    host: "smtp.gmail.com",
    port: 465,
    auth: {
        user: creds.USER,
        pass: creds.PASS
    }
}

const transporter = nodemailer.createTransport(transport)

transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    }else {
        console.log('Server is ready!')
    }
})

app.post('/api/contact', (req, res, next) => {

    const name = req.body.name
    const email = req.body.email
    const message = req.body.message
    const content = `name: ${name} \n email: ${email} \n message: ${message}`

    const mail = {
        from: email,
        to: creds.USER,
        subject: "New Message from " + name,
        text: content
    }

    transporter.sendMail(mail, (err, data) => {
        if (err){
            res.json({
                status: 'fail'
            })
        }else {
            res.json({
                status: 'success'
            })
        }
    })
    

    transporter.sendMail(
      {  from: creds.USER,
        to: email,
        subject: "Thanks for Contacting me.",
        text: "Thank you for contacting me!\nI'll get back to you as soon as possible."
    }, function(error, info) {
        if (error) {
            console.log(error)
        }else {
            console.log("Message sent ");
        }
    }
    )
})


app.get('/api/project', (req, res) => {
    db.select('*').table('projects').then(project => {
        res.json(project)
    });
});

{/*
app.get('/api/work', (req, res) => {
    db.select('*').table('work').then(project => {
        res.json(project)
    });
});

app.get('/api/education', (req, res) => {
    db.select('*').table('education').then(project => {
        res.json(project)
    });
});

*/}

app.listen(process.env.PORT);