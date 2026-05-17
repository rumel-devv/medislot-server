const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
app.use(cors())
app.use(express.json());
dotenv.config();
const port = process.env.PORT || 5000 ;
const uri =process.env.MONGODB_URI


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
     const db = client.db("medisolt");
    const doctorsCollection = db.collection("doctors");




    app.get("/doctors", async (req, res) => {
      const result = await doctorsCollection.find().toArray();
      res.json(result);
    });


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Server runnign fine')
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
