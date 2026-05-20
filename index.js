const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();
const port = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
)

const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).send({
      message: "Unauthorized access",
    });
  }
  const token = header.split(" ")[1];
    if (!token) {
    return res.status(401).send({
      message: "Unauthorized access",
    });
  }

  try {
    const {payload} = await jwtVerify(token,JWKS)
    // console.log(payload);
      next();
  } catch (error) {
    return res.status(403).send({
      message: "Forbidden",
    });
  }

  // console.log(token);


};

async function run() {
  try {
    // await client.connect();
    const db = client.db("medisolt");
    const doctorsCollection = db.collection("doctors");
    const appointsCollection = db.collection("appoints");
    const userCollection = db.collection("user");

    app.get("/all-doctors", async (req, res) => {
      const result = await doctorsCollection.find().toArray();
      res.json(result);
    });

    app.get("/doctors/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      const result = await doctorsCollection.findOne({ _id: new ObjectId(id) });
      res.json(result);
    });

    app.get("/appointments/:userId", verifyToken, async (req, res) => {
      const { userId } = req.params;
      const result = await appointsCollection
        .find({ userId: userId })
        .toArray();
      res.send(result);
    });

    app.delete("/appointments/:Id",verifyToken, async (req, res) => {
      const { Id } = req.params;
      const result = await appointsCollection.deleteOne({
        _id: new ObjectId(Id),
      });
      res.json(result);
    });

    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const user = await userCollection.findOne(query);
      res.send(user);
    });

    app.patch("/users/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const userMod = req.body;
      const updateDoc = {
        $set: {
          name: userMod.name,
          image: userMod.image,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.patch("/appointments/:id",verifyToken, async (req, res) => {
      const { id } = req.params;
      const updatedData = req.body;
      console.log(updatedData);
      const result = await appointsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData },
      );
      res.send(result);
    });

    app.post("/appointments", verifyToken, async (req, res) => {
      const bookingsData = req.body;
      const result = await appointsCollection.insertOne(bookingsData);
      res.json(result);
    });

    app.get("/search-doctors", async (req, res) => {
      const search = req.query.search;
      console.log("🚀 ~ run ~ search:", search);
      let query = {};

      if (search) {
        console.log(search);
        query = {
          name: {
            $regex: search,
            $options: "i",
          },
        }
      }
      console.log(search);
      const result = await doctorsCollection.find(query).toArray();
      res.json(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server runnign fine");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
