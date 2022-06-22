const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const schema = require("./server/schema/schema");
//const testSchema = require("./schema/types_schema");

const app = express();

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(
  "/graphql",
  graphqlHTTP({
    graphiql: true,
    schema: schema,
  })
);

// connect to mongodb
// mongoose.connect(
//   `mongodb+srv://${process.env.mongoUserName}:${process.env.mongoPass}@devmeetprofile.tyx9m.mongodb.net/${process.env.mongoDatabase}?retryWrites=true&w=majority`
// );

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@devmeetprofile.tyx9m.mongodb.net/${process.env.DB_NAME}`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log("Server is listening on port 4000");
    });
  })
  .catch((e) => {
    console.log("Error" + e);
  });

mongoose.connection.once("open", () => {
  console.log("Yes!  We are connected!");
});

// app.listen(4000, () => {
//   console.log("Server is listening on port 4000");
// });
