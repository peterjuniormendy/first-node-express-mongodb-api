const express = require("express");
const mongoose = require("mongoose");
const Contacts = require("./models/Contact");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

app.use(cors);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
mongoose.set("strictQuery", true);

const port = 3000;
mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch((error) => {
    console.log(error);
  });

app.get("/", async (req, res) => {
  res.json({ message: "Welcome to the Express API" });
});

app.get("/contacts", async (req, res) => {
  const contacts = await Contacts.find();
  const response = {
    status: "Success",
    message: "Request successful",
    data: contacts,
  };

  res.json(response);
});

app.get("/contacts/:id", async (req, res) => {
  const contactId = req.params.id;
  const contact = await Contacts.findById(contactId);

  const response = {
    status: "Success",
    message: "Request successful",
    data: contact,
  };

  if (!contact) {
    response.status = "Failure";
    response.message = "Contact not found";
    response.data = null;
    res.statusCode = 404;

    return res.json(response);
  }

  res.json(response);
});

app.patch("/contacts/:id", async (req, res) => {
  const response = {
    status: "Success",
    message: "Contact successfully updated",
  };

  const contactId = req.params.id;

  const contact = await Contacts.findById(contactId);

  if (!contact) {
    response.status = "Failure";
    response.message = "Contact not found";
    response.data = null;
    res.statusCode = 404;

    return res.json(response);
  }

  const { name, phone } = req.body;

  // validate the fields
  if (!name || !phone) {
    res.statusCode = 400;

    response.status = "Failure";
    response.message = "Bad request";
    response.data = null;
    response.error = "Both the Name and Phone are required";

    return res.json(response);
  }

  await Contacts.findByIdAndUpdate(contactId, {
    name: name,
    phone: phone,
  });

  response.data = {
    name: name,
    phone: phone,
  };

  res.json(response);
});

// Implement Post

app.post("/contacts", async (req, res) => {
  const response = {
    status: "Success",
    message: "Contact successfully created",
  };

  const { name, phone } = req.body;

  // Validate fields
  if (!name || !phone) {
    res.statusCode = 400;

    response.status = "Failure";
    response.message = "Bad request";
    response.data = null;
    response.error = "Both name and phone are required";

    return res.json(response);
  }

  const contact = new Contacts({ name: name, phone: phone });

  await Contacts.create(contact);

  response.data = contact;

  res.json(response);
});

// Implement Delete

app.delete("/contacts/:id", async (req, res) => {
  const response = {
    status: "Success",
    message: "Contact successfully deleted",
  };

  const contactId = req.params.id;

  const contact = await Contacts.findById(contactId);

  // Validate contact
  if (!contact) {
    res.statusCode = 404;

    response.status = "Failure";
    response.message = "Bad request";
    response.error = "Contact not found";

    return res.json(response);
  }

  await Contacts.findByIdAndDelete(contactId);

  res.json(response);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
