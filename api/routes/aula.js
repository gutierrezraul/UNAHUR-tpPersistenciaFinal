var express = require("express");
var router = express.Router();
var models = require("../models");

router.get("/", (req, res) => {
  console.log("Mensaje de control: GET");
  models.aula.findAll({attributes: ["id", "edificio","num_aula","capacidad","id_materia"],  // se agrega el campo relacionado: id_materia
    include:[{as:'Materia-EnCurso', 
      model:models.materia, attributes: ["nombre","id_carrera"], // Se omite "id" para no duplicar en pantalla
        include:[{as:'Carrera-Relacionada', 
          model:models.carrera, attributes: ["nombre"]   // Se omite "id" para no duplicar en pantalla
        }] // se incluye la relacion con el modelo carrera
    }]   // se incluye la relacion con el modelo materia
  })
  .then(aula => res.send(aula)).catch(() => res.sendStatus(500));
});

router.get("/paginado/", (req, res) => {
  console.log("Mensaje de control: GET");
  const numeroDePagina = parseInt(req.query.numeroDePagina); 
  const limiteDeObjetos = parseInt(req.query.limiteDeObjetos);

  models.aula.findAll({attributes: ["id", "edificio","num_aula","capacidad","id_materia"],  // se agrega el campo relacionado: id_materia
    include:[{as:'Materia-EnCurso', 
      model:models.materia, attributes: ["nombre","id_carrera"], // Se omite "id" para no duplicar en pantalla
        include:[{as:'Carrera-Relacionada', 
          model:models.carrera, attributes: ["nombre"]   // Se omite "id" para no duplicar en pantalla
        }] // se incluye la relacion con el modelo carrera
    }],   // se incluye la relacion con el modelo materia
    offset: (numeroDePagina-1) * limiteDeObjetos, // Numero de pPagina * Objetos a mostrar
    limit: limiteDeObjetos  // Cantidad de objetos a mostrar
  })
  .then(aula => res.send(aula)).catch(() => res.sendStatus(500));
});

router.post("/", (req, res) => {
  models.aula
    .create({ edificio: req.body.edificio, num_aula: req.body.num_aula, capacidad: req.body.capacidad, id_materia: req.body.id_materia })
    .then(aula => res.status(201).send({ id: aula.id }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findAula = (num_aula, { onSuccess, onNotFound, onError }) => {
  models.aula
    .findOne({
      attributes: ["id", "edificio" , "num_aula" , "id_materia"],
      include:[{as:'Materia-EnCurso', 
        model:models.materia, attributes: ["nombre","id_carrera"], // Se omite "id" para no duplicar en pantalla
          include:[{as:'Carrera-Relacionada', 
            model:models.carrera, attributes: ["nombre"]   // Se omite "id" para no duplicar en pantalla
          }] // se incluye la relacion con el modelo carrera
      }],
      where: { num_aula }  // se hace la busqueda por el numero de aula
    })
    .then(aula => (aula ? onSuccess(aula) : onNotFound()))
    .catch(() => onError());
};

const findIdAula = (id, { onSuccess, onNotFound, onError }) => {
  models.aula
    .findOne({
      attributes: ["id", "edificio" , "num_aula" , "id_materia"],
      include:[{as:'Materia-EnCurso', 
        model:models.materia, attributes: ["nombre","id_carrera"], // Se omite "id" para no duplicar en pantalla
          include:[{as:'Carrera-Relacionada', 
            model:models.carrera, attributes: ["nombre"]   // Se omite "id" para no duplicar en pantalla
          }] // se incluye la relacion con el modelo carrera
      }],
      where: { id }  // se hace la busqueda por el id del aula
    })
    .then(aula => (aula ? onSuccess(aula) : onNotFound()))
    .catch(() => onError());
};

router.get("/:num_aula", (req, res) => {    //el get se realiza en esta metodo sobre el numero de Aula
  findAula(req.params.num_aula, {
    onSuccess: aula => res.send(aula),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.get("/xid/:id", (req, res) => {    //el get se realiza en esta metodo sobre el id del Aula
  findIdAula(req.params.id, {
    onSuccess: aula => res.send(aula),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = aula =>
    aula.update({ edificio: req.body.edificio, num_aula: req.body.num_aula, capacidad: req.body.capacidad, id_materia: req.body.id_materia}, 
      { fields: ["edificio","num_aula","capacidad","id_materia"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findIdAula(req.params.id, {   // se utiliza la constante findIdAula
    onSuccess,  //constante con la actualizacion del ID encontrado
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = aula =>
    aula
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
    findIdAula(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;
