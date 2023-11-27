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
  res.send(result);
});


app.post("/userInfoForPlacedProduct", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  const product = req.body;
  const result = await placedProducts.insertOne(product);
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
  res.send(result);
});



// Product Delete 
app.delete("/deleteProduct/:productId", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  const { productId } = req.params;
  try {
    const result = await placedProducts.deleteOne({_id: new ObjectId(productId)});
    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Product deleted successfully." });
    } else {
      res.status(404).json({ message: "Product not found." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting the product." });
  }
});


app.delete("/deleteProductByAdmin/:productId", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  const { productId } = req.params;
  try {
    const result = await userCollection.deleteOne({_id: new ObjectId(productId)});
    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Product deleted successfully." });
    } else {
      res.status(404).json({ message: "Product not found." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting This product." });
  }
});



// Put request
app.put("/update-user", async (req, res) => {
  const { userId } = req.query;
  const formData = req.body;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  const result = await placedProducts.deleteOne({ _id: ObjectId(productId) });
  res.send(result);
});


app.put("/edit-product/:productId", async (req, res) => {
  const { productId } = req.params;
  const updatedData = req.body;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  try {
    const result = await userCollection.updateOne(
      { _id: new ObjectId(productId)},
      { $set: updatedData }
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'Failed to update your product.' });
  }
});


app.listen(port, () => {
  console.log(`Task app listening on ${port}`);
});

app.get("/", (req, res) => {
  res.send("This project is running successfully");
});