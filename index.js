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
const port = 5000;
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

  // Check if the email already exists in the database
  const existingUser = await authentication.findOne({ email: user.email });

  if (existingUser) {
    // If the email already exists, return a message and do not save the data
    return res.status(400).json({ message: "Email already registered" });
  }

  // If email does not exist, insert the new user into the database
  const result = await authentication.insertOne(user);
  res.status(201).send(result);
});



app.post("/login", async (req, res) => {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    const { email, password } = req.body;
    
    // Check if the email exists in the database
    const user = await authentication.findOne({ email: email });

    if (!user) {
      return res.status(401).send({ message: "Invalid email or password" }); // Email not found
    }

    // Check if the password matches
    if (user.password !== password) {
      return res.status(401).send({ message: "Invalid email or password" }); // Incorrect password
    }

    // Login successful
    res.send({ message: "Login successful", user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});


app.listen(port, () => {
  console.log(`Task app listening on ${port}`);
});

app.get("/", (req, res) => {
  res.send("Pet Adoption application running successfully");
});