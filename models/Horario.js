import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Rangos } from "./Rangos.js";
import { Profesor } from "./Profesor.js";

export const Horario = sequelize.define(
    "Horario", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        diaSemana: {
            type: DataTypes.STRING
        },
        horaInicio: {
            type: DataTypes.STRING,
            /*get() {
                return moment(this.getDataValue('horaInicio')).format('h:mm');
            }*/
        },
        horaFin: {
            type: DataTypes.STRING,
        },
        enlaceSesion: {
            type: DataTypes.STRING
        },
    }, {
        freezeTableName: true,
        timestamps : false
    }
)

Horario .belongsTo(Profesor,{
    foreignKey : "profesorId",
    sourceKey : "id"
})

Profesor .hasMany(Horario,{
    foreignKey : "profesorId",
    targetKey : "id"
})

Horario .belongsTo(Rangos,{
    foreignKey : "rangoId",
    sourceKey: "id"
})

Rangos .hasMany(Horario,{
    foreignKey: "rangoId",
    targetKey : "id"
})
