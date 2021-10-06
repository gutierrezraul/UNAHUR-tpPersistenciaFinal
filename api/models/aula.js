'use strict';
module.exports = (sequelize, DataTypes) => {
  const aula = sequelize.define('aula', {
    edificio: DataTypes.STRING,
    num_aula: DataTypes.INTEGER,
    capacidad: DataTypes.INTEGER,
    id_materia: DataTypes.INTEGER
  }, {});
  aula.associate = function(models) {
    
    // Seccion para agregar al modelo la relacion mediante la FK
    // con id_materia, asociando con el id de la tabla materia:
  	aula.belongsTo(models.materia, {as : 
      'Materia-EnCurso',        // nombre de la relacion
      foreignKey: 'id_materia'     // campo con el que va a establecer la relacion
    })

  };
  return aula;
};