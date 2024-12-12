const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());
const uri = process.env.DB;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const database = client.db('EquiSports');
        const userCollection = client.db('EquiSports').collection('users');
        const productCollection = database.collection('product');

        // get all products
        app.get('/products', async (req, res) => {
            // const cursor = productCollection.find().limit(6).sort({createdAt: -1 });
            const cursor = productCollection.find().sort({ createdAt: -1 });
            const result = await cursor.toArray();
            res.json(result); 
        });
        app.get('/allproducts', async (req, res) => {
            const cursor = productCollection.find().sort({ createdAt: -1 })
            const result = await cursor.toArray();
            res.json(result);
        });
        // gettin my productlist .  i created products 
        app.get('/products/:uid', async (req, res) => {
            const cursor = productCollection.find({ userId: req.params.uid }).sort({ createdAt: -1 })
            const result = await cursor.toArray();
            res.json(result);
        });

        // gettin a single product
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productCollection.findOne(query);
            res.json(result);
        })
        // add a product 
        app.post('/equipments', async (req, res) => {
            const newproduct = req.body;
            const result = await productCollection.insertOne(newproduct);
            res.json(result);
        });
        // update product
        app.put('/product/:id', async (req, res) => {
           try{
               const id = req.params.id;
               const filter = { _id: new ObjectId(id) };
               const options = { upsert: true };
               const updatedDoc = {
                   $set: req.body
               }

               const result = await productCollection.updateOne(filter, updatedDoc, options)
               res.send(result);
           }catch(err){

           }
        })
        // delete product
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.deleteOne(query);
            res.json(result);
        })


        // Users related apis===================================
        // get userlist
        app.get('/users', async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.json(result);
        });
        // create user
        // app.post('/users', async (req, res) => {
        //     let user;

        //     const emailExist = await userCollection.findOne({ email: req.body.email });
        //     if (emailExist) {
        //         const lastSignInTime = req.body?.lastSignInTime;
        //         const filter = { email };
        //         const updatedDoc = {
        //             $set: {
        //                 lastSignInTime,
        //             },
        //         };
        //        user= await userCollection.updateOne(filter, updatedDoc);
        //     }else{

        //         const newUser = req.body;
        //         const user = await userCollection.insertOne(newUser);
        //     }
        //     res.json(user);
        // });

        app.post('/users', async (req, res) => {
            try {
                const { email, lastSignInTime } = req.body;
                let user;
                const emailExist = await userCollection.findOne({ email });
                if (emailExist) {
                    const filter = { email };
                    const updatedDoc = {
                        $set: {
                            lastSignInTime,
                        },
                    };
                    await userCollection.updateOne(filter, updatedDoc);
                    user = await userCollection.findOne(filter);
                } else {
                    const newUser = req.body;
                    const result = await userCollection.insertOne(newUser);
                    user = await userCollection.findOne({ _id: result.insertedId });
                }
                // console.log(user)
                res.json(user);
            } catch (error) {
                console.error("Error handling user data:", error);
                res.status(500).send("An error occurred while processing user data");
            }
        });

     
        app.patch('/users', async (req, res) => {
            try {
                const email = req.body.email;
                const lastSignInTime = req.body?.lastSignInTime;

                let user = await userCollection.findOne({ email });

                if (user) {
                    const filter = { email };
                    const updatedDoc = {
                        $set: {
                            lastSignInTime,
                        },
                    };
                    await userCollection.updateOne(filter, updatedDoc);

                    user = await userCollection.findOne({ email });
                } else {
                    const newUser = { ...req.body };
                    const insertResult = await userCollection.insertOne(newUser);
                    user = await userCollection.findOne({ _id: insertResult.insertedId });
                }

                // console.log(user)
                res.send(user);
            } catch (error) {
                console.error("Error updating user:", error);
                res.status(500).send("An error occurred while processing the user");
            }
        });



        // delete user
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.json(result);
        })
    } finally {

    }
}
run().catch(console.dir);

// this is for testing if the server is running properly
app.get('/', (req, res) => {
    res.json('api is working ..............................')
})

app.listen(port, () => {
    console.log(`product is getting warmer in port: ${port}`);
})
