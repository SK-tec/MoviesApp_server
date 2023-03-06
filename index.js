const express=require('express');
const app=express();
const {body,validationResult}=require('express-validator');
require('dotenv').config()
const PORT=process.env.PORT || 5000;
const cors=require('cors');
const {Pool}=require('pg');
const pool=new Pool({connectionString:process.env.ELEPHANT_SQL_CONNECTION_STRING,})
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send("<h1>Movie API</h1>");
});

app.get('/api/movies',(req,res)=>{
   pool
   .query("SELECT * FROM movies;")
   .then((data)=>{
    console.log(data.rows);
    res.json(data.rows);
   })
   .catch((e)=>res.status(500).status({message:e.message}));
     
});
app.get(`/api/comments`,(req,res)=>{
  pool
  .query("SELECT * FROM comments;")
  .then((data)=>{
    res.json(data.rows);
    res.end();
  })
  .catch((e)=>res.status(500).status({message:e.message}))  
});
app.get('/api/comments/:id',(req,res)=>{
  const id=req.params.id;
  pool
  .query("SELECT * FROM comments WHERE id=$1;",[id])
  .then((data)=>{
   
    res.json(data.rows)
    res.end();
  })
  .catch((e)=>res.status(500).json({message:e.message}))
});

app.get('/api/movies/:id',(req,res)=>{
  const id=req.params.id;
  pool
  .query("SELECT * FROM movies WHERE id=$1;",[id])
  .then((data)=>{
    console.log(data);
    if(data.rowCount===0){
      res.status(404).json({message:"Movie not found"})
    }
    res.json(data.rows[0])
  })
  .catch((e)=>res.status(500).json({message:e.message}))
});

app.post('/api/movies',
body('title').trim().notEmpty().withMessage('Title Must not be empty!'),
body('year').isNumeric().withMessage('Please enter only Numeric value'),
body('rating').isNumeric().withMessage('Please enter only Numeric value'),
(req,res)=>{
  const errors=validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }
 
  const {title,director,year,rating,poster,synopsis}=req.body;
  pool.query(
    "INSERT INTO movies(title,director,year,rating,poster,synopsis) VALUES($1,$2,$3,$4,$5,$6) RETURNING *;",[title,director,year,rating,poster,synopsis]
  )
  .then((data)=>{
    console.log(data);
    res.status(201).json(data.rows[0]);
  })
  .catch((e)=>res.status(500).json({message:e.message}));
});
app.post('/api/comments',
body('comments').trim().notEmpty().withMessage('Comments Must not be empty!'),
(req,res)=>{
  console.log("Post executed")
  console.log(req.body)
  const errors=validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  } 
  const {id,comments}=req.body;

  pool.query(
    "INSERT INTO comments(id,comments) VALUES($1,$2) RETURNING *;",[id,comments]
  )
  .then((data)=>{
    console.log(data);
    res.status(201).json(data.rows);
    res.end();
  })
  .catch((e)=>res.status(500).json({message:e.message}));
});
app.put('/api/movies/:id',
body('title').trim().notEmpty().withMessage('Title Must not be empty!'),
body('year').isNumeric().withMessage('Please enter only Numeric value'),
body('rating').isNumeric().withMessage('Please enter only Numeric value'),
(req,res)=>{
  const id=req.params.id;
  const errors=validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }
  const {title,director,year,rating,poster,synopsis}=req.body;
  console.log(title);
  pool
  .query(
    "UPDATE movies SET title=$1,director=$2,year=$3,rating=$4,poster=$5,synopsis=$6 WHERE id=$7 RETURNING *;",
    [title,director,year,rating,poster,synopsis,id]
  )
  .then((data) => {
    console.log(data);
    res.status(201).json(data.rows[0]);
  })
  .catch((e) => res.status(500).json({ message: e.message }));
});
app.put('/api/comments/:comment_id',
body('comments').trim().notEmpty().withMessage('Comments Must not be empty!'),
(req,res)=>{
  const comment_id=req.params.comment_id;
  console.log(comment_id)
  const errors=validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }
  const {id,comments}=req.body;
  console.log(id,comments);
  pool
  .query(
    "UPDATE comments SET id=$1,comments=$2 WHERE comment_id=$3 RETURNING *;",
    [id,comments,comment_id]
  )
  .then((data) => {
    console.log(data);
    res.status(201).json(data.rows[0]);
  })
  .catch((e) => res.status(500).json({ message: e.message }));
});
app.delete('/api/movies/:id',(req,res)=>{
  const id=parseInt(req.params.id)
  pool
  .query("DELETE FROM movies WHERE id=$1 RETURNING *;",[id])
  .then((data)=>{
    console.log(data);
    res.json(data.rows[0]);
  })
  .catch((e)=>res.status(500).json({message:e.message}));
});
app.delete('/api/comments/:comment_id',(req,res)=>{
  const comment_id=parseInt(req.params.comment_id)
  pool
  .query("DELETE FROM comments WHERE comment_id=$1 RETURNING *;",[comment_id])
  .then((data)=>{
    console.log(data);
    res.json(data.rows[0]);
    res.end();
  })
  .catch((e)=>res.status(500).json({message:e.message}));
});


app.listen(PORT,()=>{console.log(`Server is running on the Port ${PORT}`)})
