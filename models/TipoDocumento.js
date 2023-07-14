import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Cita } from "./Citas.js";
import { Usuario } from "./Usuario.js";

export const TipoDocumento = sequelize.define(
    "TipoDocumento",{
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombreCategoria:{
            type: DataTypes.STRING
        }
    }, {
        freezeTableName: true,
        timestamps : false
    }
)


Usuario .belongsTo(TipoDocumento,{
    foreignKey: "tipoDocumentoId"
})