'use strict';
module.exports = (sequelize, DataTypes) => {
  const materia = sequelize.define('materia', {
    nombre: DataTypes.STRING,
    id_carrera: DataTypes.INTEGER
  }, {});
  materia.associate = function(models) {
    
    // Seccion donde se agrega al modelo la relacion mediante la FK
    //de id_carrera, asociadada al id de la tabla carrera:
  	materia.belongsTo(models.carrera, {as : 
        'Carrera-Relacionada',        // nombre de la relacion
        foreignKey: 'id_carrera'     // campo con el que va a establecer la relacion
      })
  
  };
  return materia;
};