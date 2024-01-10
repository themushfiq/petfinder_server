import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import {
  MongoClient,
  ObjectId,
  ServerApiVersion,
} from 'mongodb';

dotenv.config();
const app = express();
app.use(cors());
const port = 6869;
const nodeEnv = process.env.MONGO_URI;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const uri = nodeEnv;
console.log(uri);
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const connectWithRetry = async () => {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    setTimeout(connectWithRetry, 5000);
  }
};
connectWithRetry();

const userCollection = client.db("test").collection("users");
const placedProducts = client.db("test").collection("userAndProducts");
const authentication = client.db("test").collection("authentication");
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
      let category = req.query.category;
      const query = category ? { category: category } : {}; // Update query structure here
      const result = await userCollection
        .find(query)
        .skip(skip)
        .limit(PAGE_SIZE)
        .toArray();
      res.status(200).send(result); // Use status().send() instead of res.send() with status code
    } catch (error) {
      res.status(500).send("Error fetching products"); // Sending an error message with status code
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

function getCurrentDateTime() {
  const currentDate = new Date(); 
  return currentDate.toLocaleString();
}
// Comment for a particular product....
app.post("/add-comment/:toolId", async (req, res) => {
  function generateFiveDigitNumber() {
    const min = 10000;
    const max = 99999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  try {
    const userId = generateFiveDigitNumber();
    const commentTime = getCurrentDateTime();
    const { toolId } = req.params;
    const commentAndRating = req.body;
    const tool = await userCollection.findOneAndUpdate(
      { _id: new ObjectId(toolId) },
      { $push: { comments: { userId: userId, commentAndRating, timeOfComment: commentTime, reviews: [] } } },
      { returnOriginal: false }
    );

    if (!tool) {
      return res.status(404).json({ message: "Tool not found" });
    }
    res.send(tool);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
// Comment deleted by admin
app.delete("/delete-comment/:toolId/:commentId", async (req, res) => {
  try {
    const { toolId, commentId } = req.params;
    const tool = await userCollection.findOneAndUpdate(
      {
        _id: new ObjectId(toolId),
        "comments.userId": parseInt(commentId) // Match comment by its custom commentId
      },
      {
        $pull: {
          comments: { userId: parseInt(commentId) } // Remove the matched comment
        }
      },
      { returnOriginal: false }
    );

    if (!tool) {
      return res.status(404).json({ message: "Tool or comment not found" });
    }

    res.send(tool);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});




// Review for a particular comment
app.post("/add-review/:toolId", async (req, res) => {
  try {
    const { toolId } = req.params;
    const { repliedCommentId, reviewerName, reviewerComment, reviewTime } = req.body;
    const tool = await userCollection.findOneAndUpdate(
      { 
        _id: new ObjectId(toolId),
        "comments.userId": repliedCommentId
      },
      { 
        $push: { 
          "comments.$.reviews": { repliedCommentId, reviewerName,reviewerComment,  reviewTime } // Update the matched comment
        }
      },
      { returnOriginal: false }
    );

    if (!tool) {
      return res.status(404).json({ message: "Tool or comment not found" });
    }
    res.send(tool);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete review by admin
app.post("/delete-review/:toolId/:commentId", async (req, res) => {
  try {
    const { toolId, commentId } = req.params;
    const {reviewDataToDelete} = req.body;
console.log(req.body);
    const tool = await userCollection.findOneAndUpdate(
      {
        _id: new ObjectId(toolId),
        "comments.userId": parseInt(commentId)
      },
      {
        $pull: {
          "comments.$[outer].reviews": {reviewerComment: reviewDataToDelete}
        }
      },
      {
        arrayFilters: [{ "outer.userId": parseInt(commentId) }],
        returnOriginal: false
      }
    );

    if (!tool) {
      return res.status(404).json({ message: "Tool or comment not found" });
    }
    res.send(tool);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Shelton user authentication
app.post("/signup", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  const user = req.body;
  const result = await authentication.insertOne(user);
  res.send(result);
});

app.get("/loggedin-users", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  const query = {};
  const result = await authentication.find(query).toArray();
  res.send(result);
});

app.listen(port, () => {
  console.log(`Task app listening on ${port}`);
});


app.get("/", (req, res) => {
  res.send("Bee raw application running successfully");
});