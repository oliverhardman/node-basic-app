// require express 
const express = require('express')
path = require('path')
const app = express();
/// J-query 
app.use(require('express-jquery')('/jquery.js'));
// Handlebars
const exphbs = require('express-handlebars');
// Mongoose 
const mongoose = require('mongoose');
/// Body Parser //
var bodyParser = require('body-parser');
// require multer
const multer = require('multer');
// news api
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('07416a40beac409283cd4f2e3f26f33c');

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('myImage');

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

const methodOverride = require('method-override')
// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))


// Establish connection to Mongoose 
mongoose.connect('mongodb://localhost/olie-dev', { useNewUrlParser: true })
.then(() => console.log("Connected to Database: 'olie-dev'"))
.catch((err) => console.log(err));

// All middlewares starts here 
// middleware for static css files
app.use(express.static('public'));
// Middleware Handlebars
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Middleware for body-parser ///
/// Parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({
    extended: false
}))
/// Parse application/json 
app.use(bodyParser.json())

// require the blog model
require('./models/Blog')
// create a Blog model
const Blog = mongoose.model('blogs');

// Routing 
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/gallery', (req, res) => {
    res.render('gallery');
});

app.get('/video', (req, res) => {
    res.render('video');
});

app.get('/upload', (req, res) => {
    res.render('upload')
});
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if(err){
      res.render('', {
        msg: err
      });
    } else {
      if(req.file == undefined){
        res.render('viedo', {
          msg: 'Error: No File Selected!'
        });
      } else {
        res.render('video', {
          msg: 'File Uploaded!',
          file: `uploads/${req.file.filename}`
        });
      }
    }
  });
});



// add form
app.get('/blogs/new', (req, res) => {
    res.render('blogs/new');
 });
 
 // post route to save to the db
 app.post('/blogs',(req, res) => {
   console.log(req.body);
   // res.send('ok');
   let errors = [];
   if (!req.body.title) {
     errors.push({text: "Title must be present"});
   }
   if (!req.body.description) {
     errors.push({text: "Description must be present"});
   }
   if (errors.length > 0) {
     res.render('blogs/new', {
       title: req.body.title,
       description: req.body.description,
       errors: errors,
     });
 
   } else {
     // save to db
     // res.send('passed');
     let newBlog = {
       title: req.body.title,
       description: req.body.description
     }
     new Blog(newBlog)
     .save()
     .then(blogs => {
       console.log(blogs)
       res.redirect('/blogs');
     })
     .catch(err => console.log(err));
   }
 });
 // show all blogs from  database
 app.get('/blogs', (req, res) =>{
   Blog.find()
   .then(blogs => {
     console.log(blogs);
     res.render('blogs/index', {
       blogs: blogs
     });
   })
   .catch(err => console.log(err));
 });
 
 // edit a blog
 
 app.get('/blogs/:id/edit', (req, res) => {
   Blog.findById({
     _id: req.params.id
   })
   .then(blog => {
     console.log(blog)
     res.render('blogs/edit', {
        blog: blog
     })
   })
 });
 // update the database
 app.put('/blogs/:id', (req, res) => {
   // find the blog
   Blog.findById({
     _id: req.params.id
   })
   .then(blog => {
     // update the blog with new valus from the form
     blog.title = req.body.title,
     blog.description = req.body.description
     // save the update blog
     blog.save()
       .then(() => res.redirect('/blogs'))
   })
   .catch((err) => console.log(err));
 });
 
 // delete the blog
 app.delete('/blogs/:id', (req, res) => {
   Blog.remove({
     _id: req.params.id
   })
   .then(() => res.redirect('/blogs'))
   .catch( err => console.log(err));
 });
 //app.use('/users', users);
 // start a server

// new api 
newsapi.v2.topHeadlines({

  category: 'politics',
  language: 'en',
  country: 'us'
}).then(response => {
  console.log(response);
  /*
    {
      status: "ok",
      articles: [...]
    }
  */
});
 

/////////////////////////////////////////////// Establish Server on Port: 3030 //////////////////////////////////////////////////////////////////////////////////////////
app.listen(3030, () => console.log("Server running on Port 3030"))
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////