const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");

// URL de conexión a MongoDB Atlas
const url =
  "mongodb+srv://pruebas:123456789a@cluster0.mudy3h0.mongodb.net/Luxynema?retryWrites=true&w=majority";

const client = new MongoClient(url);

app.use(express.json());

client
  .connect()
  .then(() => {
    console.log("Conexión exitosa a MongoDB");
  })
  .catch((error) => {
    console.error("Error al conectar a MongoDB:", error);
  });

//Get de peliculas
app.get("/api/peliculas", async (req, res) => {
  try {
    const db = client.db("Luxynema");
    const collection = db.collection("peliculas");
    const items = await collection.find({}).toArray();
    res.json(items);
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    res.status(500).send(error);
  }
});

//Post de documentos de las peliculas
app.post("/api/peliculas", async (req, res) => {
  try {
    const db = client.db("Luxynema");
    const collection = db.collection("peliculas");
    const nuevoDocumento = req.body;
    const result = await collection.insertOne(nuevoDocumento);
  } catch (error) {
    console.error("Error al agregar documento:", error);
    res.status(500).send(error);
  }
});

//get de las salas y
app.get("/api/asientos", async (req, res) => {
  try {
    const db = client.db("Luxynema");
    const collection = db.collection("asientos");
    const items = await collection.find({}).toArray();
    res.json(items);
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    res.status(500).send(error);
  }
});

app.get("/api/asientos/sala/:sala", async (req, res) => {
  try {
    const sala = req.params.sala;
    const db = client.db("Luxynema");
    const collection = db.collection("asientos");
    const items = await collection.findOne({ sala: sala });

    if (items) {
      res.json(items);
    } else {
      res.status(404).send("Sala no encontrada");
    }
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    res.status(500).send(error);
  }
});

//get por sala y asiento
//Get de ejemplo: http://localhost:3000/api/asientos/sala/A/posicion/4
app.get("/api/asientos/sala/:sala/posicion/:posicion", async (req, res) => {
  try {
    const sala = req.params.sala;
    const posicion = parseInt(req.params.posicion);
    const db = client.db("Luxynema");
    const collection = db.collection("asientos");
    const salaData = await collection.findOne({ sala: sala });

    if (salaData && posicion >= 0 && posicion < salaData.asientos.length) {
      const asiento = salaData.asientos[posicion];
      res.json(asiento);
    } else {
      res.status(404).send("Sala o posición de asiento no encontrada");
    }
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    res.status(500).send(error);
  }
});

//put de los asientos para cambias a false o true
app.put("/api/asientos/sala/:sala/posicion/:posicion", async (req, res) => {
  try {
    const sala = req.params.sala;
    const posicion = parseInt(req.params.posicion);
    const db = client.db("Luxynema");
    const collection = db.collection("asientos");
    const salaData = await collection.findOne({ sala: sala });

    if (salaData && posicion >= 0 && posicion < salaData.asientos.length) {
      const asiento = salaData.asientos[posicion];
      asiento.id = req.body.id;
      asiento.estado = req.body.estado;

      const filter = { sala: sala };
      const update = { $set: { "asientos.$[elem]": asiento } };
      const options = { arrayFilters: [{ "elem.id": asiento.id }] };

      const result = await collection.updateOne(filter, update, options);

      if (result.modifiedCount > 0) {
        res.json(asiento);
      } else {
        res.status(500).send("No se pudo actualizar el asiento");
      }
    } else {
      res.status(404).send("Sala o posición de asiento no encontrada");
    }
  } catch (error) {
    console.error("Error al actualizar el asiento:", error);
    res.status(500).send(error);
  }
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

process.on("SIGINT", () => {
  client.close().then(() => {
    console.log("Conexión de cliente de MongoDB cerrada");
    process.exit(0);
  });
});
