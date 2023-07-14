const express = require('express')
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
// const bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileupload');

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
// app.use(bodyParser.json())
// or
app.use(express.json())
app.use(fileUpload());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u9lnx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
      await client.connect();
      const database = client.db("winSocialMedia");
      const postsCollection = database.collection('posts');
      const aboutCollection = database.collection('about');
      

    app.get('/posts', async (req, res) => {
      const cursor = postsCollection.find({});
      const data = await cursor.toArray();
      res.json(data);
    });

    app.get('/posts/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const data = await postsCollection.findOne(query);
        res.json(data);
    });

    app.post('/posts', async (req, res) => {
        const userName = req.body.userName;
        const userPhoto = req.body.userPhoto;
        const post = req.body.post;
        const email = req.body.email;
        const pic = req.files.image;
        const picData = pic.data;
        const encodedPic = picData.toString('base64');
        const imageBuffer = Buffer.from(encodedPic, 'base64');
        const data = {
            userName,
            userPhoto,
            post,
            email,
            reaction: [],
            comment: [],
            image: imageBuffer
        }
        const result = await postsCollection.insertOne(data);
        res.json(result);
    })


    app.get('/about', async (req, res) => {
      const cursor = aboutCollection.find({});
      const data = await cursor.toArray();
      res.json(data);
    });

    app.patch('/about/:id', async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = { $set: data };
      const result = await aboutCollection.findOneAndUpdate(filter, updateDoc);
      res.json(result);
      console.log( result)
  })

    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Win-Social-Media Ok Server')
})

app.listen(port, () => {
  console.log('Win-Social-Media Server Running', port)
})
