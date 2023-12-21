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

// All products
app.get("/get-all-products", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  const query = {};
  const result = await userCollection.find(query).toArray();
  res.send(result);
});

app.get("/categorized-products", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  const PAGE_SIZE = 5;
  try {
    const distinctCategories = await userCollection.aggregate([
      { $group: { _id: "$category" } },
      { $project: { _id: 0, category: "$_id" } }
    ]).toArray();

    const result = [];
    for (const { category } of distinctCategories) {
      const products = await userCollection.find({ category }).limit(PAGE_SIZE).toArray();
      result.push({ category, products });
    }

    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching products", error);
  }
});



// Products for specific category.....
app.get("/get-products", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const PAGE_SIZE = 20;
  let page = parseInt(req.query.page) || 1;
  let skip = (page - 1) * PAGE_SIZE;

  try {
    let category = '';
    if (req.query.category) {
      const categoryArray = JSON.parse(req.query.category);
      if (Array.isArray(categoryArray) && categoryArray.length > 0) {
        category = categoryArray[0].category || '';
      }
    }

    const query = category ? { category: { $elemMatch: { category: category } } } : {};

    const result = await userCollection
      .find(query)
      .skip(skip)
      .limit(PAGE_SIZE)
      .toArray();

    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching products", error);
  }
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


app.put("/accepted-order-by-admin/:productId", async (req, res) => {
  const { productId } = req.params;
  const updatedData = req.body;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  try {
    const result = await placedProducts.updateOne(
      { _id: new ObjectId(productId)},
      { $set: updatedData }
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'Failed to update your product.' });
  }
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