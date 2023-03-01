const express=require('express');
const app=express();
require('dotenv').config()
const PORT=process.env.PORT || 5000;
const cors=require('cors');
const {Pool}=require('pg');
const pool=new Pool({connectionString:process.env.ELEPHANT_SQL_CONNECTION_STRING,})

var conString=process.env.CONNECTION_STRING;
app.use(express.json());
app.use(cors());
var conString=process.env.CONNECTION_STRING;

app.get("/", (req, res) => {
  res.send("<h1>Movie API</h1>");
});

app.get('/api/movies',(req,res)=>{
   pool
   .query("SELECT * FROM movies;")
   .then((data)=>{
    console.log(data);
    res.json(data.rows);
   })
   .catch((e)=>res.status(500).status({message:e.message}));
     
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
app.post('/api/movies',(req,res)=>{
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
app.put('/api/movies/:id',(req,res)=>{
  const id=req.params.id;
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


app.listen(PORT,()=>{console.log(`Server is running on the Port ${PORT}`)})