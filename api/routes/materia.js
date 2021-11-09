var express = require("express");
var router = express.Router();
var models = require("../models");

router.get("/", (req, res) => {
  console.log("Mensaje de control: GET");
  models.materia.findAll({attributes: ["id", "nombre","id_carrera"],  // se agrega el campo relacionado: id_carrera 
    include:[{as:'Carrera-Relacionada', model:models.carrera, attributes: ["nombre"]}]   // se incluye la relacion con el modelo de carrera, sin el atributo "id"
  })
  .then(materia => res.send(materia)).catch(() => res.sendStatus(500));
});

router.get("/paginado/", (req, res) => {
  console.log("Mensaje de control: GET");
  const numeroDePagina = parseInt(req.query.numeroDePagina); 
  const limiteDeObjetos = parseInt(req.query.limiteDeObjetos);

  models.materia.findAll({attributes: ["id", "nombre","id_carrera"],  // se agrega el campo relacionado: id_carrera 
    include:[{as:'Carrera-Relacionada', model:models.carrera, attributes: ["nombre"]}],   // se incluye la relacion con el modelo de carrera, sin el atributo "id"
    offset: (numeroDePagina-1) * limiteDeObjetos, // Numero de pPagina * Objetos a mostrar
    limit: limiteDeObjetos  // Cantidad de objetos a mostrar
  })
  .then(materia => res.send(materia)).catch(() => res.sendStatus(500));
});

router.post("/", (req, res) => {
  models.materia
    .create({ nombre: req.body.nombre, id_carrera: req.body.id_carrera })
    .then(materia => res.status(201).send({ id: materia.id }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otra carrera con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findMateria = (id, { onSuccess, onNotFound, onError }) => {
  models.materia
    .findOne({
      attributes: ["id", "nombre", "id_carrera"],  // se lista solo el id y nombre, id_carrera
      include:[{as:'Carrera-Relacionada', model:models.carrera, attributes: ["nombre"]}], //se incluye la relacion con carrera para el GET sin "id"
      where: { id }
    })
    .then(materia => (materia ? onSuccess(materia) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findMateria(req.params.id, {
    onSuccess: materia => res.send(materia),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = materia =>
    // se actualiza no solo el nombre de la materia, sino tambien el id_carrera
    materia.update({ nombre: req.body.nombre,id_carrera: req.body.id_carrera }, 
        { fields: ["nombre","id_carrera"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra materia con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findMateria(req.params.id, {
    onSuccess,  //constante con la actualizacion del ID encontrado
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = materia =>
    materia
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findMateria(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;
