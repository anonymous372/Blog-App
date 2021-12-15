var express     = require('express'),
    bodyParser  = require('body-parser'),
    mongoose    = require('mongoose'),
    app         = express(),
    methodOverride = require('method-override'),
    expressSanitizer = require('express-sanitizer');


// APP Configuration
mongoose.connect("mongodb://localhost:27017/rest_blog_app");
app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine","ejs")
app.use(express.static("public"))
app.use(methodOverride("_method"))
// Sanitizer uses body-parser so it should always go after app.use(body-paser...
app.use(expressSanitizer())

const PORT = 3000

// Blog Schema
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now()} 
})

var Blog = mongoose.model("Blog",blogSchema) 

// Blog.create({
//     title: "My Laptop",
//     image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80",
//     body: "This is my first Laptop. Its amazingo!!"
// })

// RESTful Routes
// Home Page
app.get("/",function(req,res){
    res.redirect("/blogs")
})

//Index Page : List all blogs
app.get("/blogs",function(req,res){
    Blog.find({},function(err,blogs){
        if(err) console.log("Error : " + err)
        else{
            res.render("index",{blogs:blogs})
        }
    })
})

// New Route: Form Page to add new blog
app.get("/blogs/new",function(req,res){
    res.render("new")
})

// Create Route : Adds blog to DB 
app.post("/blogs",function(req,res){
    // Sanitization is bad/ugly/gross it causes wierd errors
    // (error was caused due to half open strong tag in 100 word desc. of a blog)
    // sanitize(remove script if any) the blog content/body
    // req.body.blog.body = req.sanitize(req.body.blog.body)

    Blog.create(req.body.blog,function(err,newBlog){
        if(err) console.log("Error: "+err)
        else{
            res.redirect("/blogs")
        }
    })
})

// Show Route: Show more info about specific blog
app.get("/blogs/:id",function(req,res){
   Blog.findById(req.params.id,function(err,foundBlog){
       if(err){
           console.log("Error: "+err)
           res.redirect("/blogs")
       }
       else{
           res.render("show",{blog: foundBlog})
       }
   })
})

// Edit Route: Edit content of a blog
app.get("/blogs/:id/edit",function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            console.log("Error: "+err)
            res.redirect("/blogs")
        }
        else{
            res.render("edit",{blog: foundBlog})
        }
    })
})

// Update Route: Update the blog in DB
app.put("/blogs/:id",function(req,res){
    // Sanitization is bad/ugly/gross it causes wierd errors
    // sanitize(remove script if any) the blog content/body
    // req.body.blog.body = req.sanitize(req.body.blog.body)
    
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
        if(err){
            console.log("Error: "+err)
            res.redirect("/blogs")
        }
        else{
            res.redirect("/blogs/" + req.params.id)
        }
    })
}) 

// Delete Route: Delete a blog 
app.delete("/blogs/:id",function(req,res){
    Blog.findByIdAndRemove(req.params.id,function(err,){
        if(err){
            console.log("Error: "+err)
        }
        res.redirect("/blogs")
    })
})

app.listen(PORT,function(req,res){
    console.log("Listening on http://localhost:"+PORT)
})
