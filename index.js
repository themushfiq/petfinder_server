import cors from 'cors';
import express from 'express';
import {
  MongoClient,
  ObjectId,
  ServerApiVersion,
} from 'mongodb';

const app = express();
app.use(cors());
const port = 5000;
// const nodeEnv = process.env.MONGO_URI; 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connection with mongodb 
// const mongoUri = process.env.MONGO_URI;

const uri = "mongodb+srv://be-reaw-users:S5gNQKAqCbSy3yrF@cluster0.omy4x9q.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const connectWithRetry = () => {
  return client.connect()
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch(err => {
      console.error('Error connecting to MongoDB:', err);
      setTimeout(connectWithRetry, 5000);
    });
};
connectWithRetry();

const userCollection = client.db("test").collection("users");
const placedProducts = client.db("test").collection("userAndProducts");
async function run() {
  try {
    await client.connect();clearImmediate
    await client.db("users").command({ ping: 1 });
    console.log("Database is connected successfully.");
  } finally {
  }
}
run().catch(console.dir);

// Mahfuj.....

// utility - 306 taka
// wifi - 250 taka

app.post("/add-productByAdmin", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  const product = req.body;
  const result = await userCollection.insertOne(product);
  console.log(result);
  res.send(result);
});


app.post("/userInfoForPlacedProduct", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  const product = req.body;
  const result = await placedProducts.insertOne(product);
  console.log(result);
  res.send(result);
});



app.get("/get-products", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  const query = {};
  const result = await userCollection.find(query).toArray();
  res.send(result);
});


app.get("/get-product/:productId", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  const productId = req.params.productId;
  const query = {_id: new ObjectId(productId)};
  try{
    const product = await userCollection.findOne(query);
    console.log(product);
    if (product) {
      res.send(product);
    }else{
      res.send('There is nothing.');
    }
  }catch(error){
    res.send(error);
  }
});



app.get("/get-orders", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  const query = {};
  const result = await placedProducts.find(query).toArray();
  console.log(result);
  res.send(result);
});



// Product Delete 
app.delete("/deleteProduct/:productId", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  const { productId } = req.params;
  console.log(productId);
  try {
    const result = await placedProducts.deleteOne({_id: new ObjectId(productId)});

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Product deleted successfully." });
    } else {
      res.status(404).json({ message: "Product not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting the product." });
  }
});




app.put("/update-user", async (req, res) => {
  const { userId } = req.query;
  const formData = req.body;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  const result = await placedProducts.deleteOne({ _id: ObjectId(productId) });
  res.send(result);
});

app.listen(port, () => {
  console.log(`Task app listening on ${port}`);
});

app.get("/", (req, res) => {
  res.send("This project is running successfully");
});