import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

export const Rangos = sequelize.define(
    "Rangos", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        horaInicio : {
            type : DataTypes.STRING
        },
        horaFin: {
            type : DataTypes.STRING
        },

    },{
        freezeTableName: true,
        timestamps : false
    }
)



