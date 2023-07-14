import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Cita } from "./Citas.js";

export const Calificacion = sequelize.define(
    "Calificacion",{
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        puntaje:{
            type: DataTypes.STRING
        },
        comentario:{
            type:DataTypes.STRING
        }
    }, {
        freezeTableName: true,
        timestamps : false
    }
)

Cita .belongsTo(Calificacion,{
    foreignKey: "calificacionId"
})