const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const multer = require('multer');
const path = require('path');
const User = require('./model/userSchema')
const dotenv = require('dotenv').config()
const registerUser = require('./model/registerUser');
const { log } = require('console');
const PORT = process.env.PORT;
app.use(express.json());
app.use(cors())

app.use(express.static('public'))


//Storage to store posts

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'public/images')
    },
    filename: ( req,file,cb)=>{
        cb(null,file.fieldname+'_'+Date.now()+ path.extname(file.originalname))
    }
    
})

//for Single fileds
const upload = multer({
storage:storage
})


app.post('/sendmail',upload.array('file',10),(req,res)=>{

    const{from,to,subject,message,bulkmailId,sendtime} = req.body;
    // const {file} = req.file;
    // console.log(req.files);
    // console.log(sendtime);
    const fromMail = from;
    var toMail = bulkmailId?bulkmailId:to;
    const sub = subject;
    const count = req.files
    var filesName = req.files.filename 
    
        
    if(req.files.length == 0) filesName = ''
    else {
         filesName = count.map(a=>a.filename)
    }

    var toMailArray = toMail.split(',');
    // console.log(toMailArray);
    User.create({fromMail,toMail:toMailArray,sub,message,files:filesName,sendtime})
    .then(result => console.log('created'))
    .catch(err => console.log(err))


    //check for user
        // let FromMail = fromMail
    registerUser.findOne({email:fromMail})
    .then(result=>{
        // console.log(result)
        var passkey = result.key
        // console.log(passkey);
    // to send mail
    var nodemailer = require('nodemailer')
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user:fromMail,
            pass: passkey
        }
    })

    //check user upload file or not 
        if(req.files.length == 0){
        
                var mailOptions = {
                    from : 'kannansrinivasanrs@gmail.com',
                    to: toMailArray,
                    subject:sub,
                    text: message,
                    html: `<h1> welcome to the new email application</h1>
                    
                    <a href='www.google.com'>
                    Google</a>
                    <p>${message}</p>
                    `
                
                };
        }
        else{       

                    //to send multiple attachments
                    const multiFile = count.map((file)=>{
                    
                        return({
                            filename: `${file.filename}`,
                            path:`public/images/${file.filename}`
                        })
                            
                      });

                    //   console.log(multiFile);

                    var mailOptions = {
                        from : 'kannansrinivasanrs@gmail.com',
                        to: toMailArray,
                        subject:sub,
                        text: message,
                        html: `<h1> welcome to the new email application</h1>
                        
                        <a href='www.google.com'>
                        Google</a>`,
                        
                        attachments:multiFile
                           
                        
                      };
            }

            transporter.sendMail(mailOptions,(err,info)=>{

                if(err){
                    console.log(err);
                }
                else{
                    console.log('message send to '+toMail);
                    return res.send('success')
                }
            })

    })
    .catch(err=>console.log(err))
})

//sent mail history

app.post('/sent',(req,res)=>{
    const{EMAIL} = req.body
    // console.log(EMAIL);
    User.find({fromMail:EMAIL})
    .then(data =>res.json(data))
    .catch(err=>res.json(err))
})

//View Mail detail
app.get('/getmail/:id',(req,res)=>{
    const{id} = req.params
    User.findOne({_id:id})
    .then(result=>res.json(result))
    .catch(err => console.log(err))
})

//get open and view file

app.delete('/deletemail/:id',(req,res)=>{

        const{id} = req.params
        // console.log(id);
        User.findByIdAndDelete({_id:id})
        .then(data=>res.json('deleted'))
        .catch(err =>res.json(err))

})


//register user
app.post('/register',(req,res)=>{
    const{firstName,lastName,email,key} = req.body
    // console.log(firstName,lastName,email,key)
    registerUser.create(req.body)
    .then(result => res.json('registered'))
    .catch(err => console.log(err))
})



//authentication check user
app.get('/getUser',(req,res)=>{
        registerUser.find()
        .then(result=>{
            // console.log('get');
            res.json(result)})
        .catch(err => res.json(err))
})


//get user profile

app.post('/getProfile',(req,res)=>{
    const {Email} = req.body
    // console.log(Email);
    registerUser.find({email:Email})
    .then(data=>res.json(data))
    .catch(err => console.log(err))
})
//connecting to Database
mongoose.connect(process.env.DB)
.then(result => console.log('DB connected sucessfully'))
.catch(err => console.log(err))




app.listen(PORT,()=>{
    console.log('Server running in port ',PORT)
})
