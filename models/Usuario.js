import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

import { Universidad } from "./Universidad.js";
import { Carrera } from "./Carrera.js";
import { Curso } from "./Curso.js";

export const Usuario = sequelize.define(
    "Usuario", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombreUsuario: {
            type: DataTypes.STRING,
            unique : true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        correo: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        nombres: {
            type: DataTypes.STRING,
            allowNull: false
        },
        apellidos: {
            type: DataTypes.STRING,
            allowNull: false
        },

        nroDocumento: {
            type: DataTypes.STRING,
            allowNull: false
        },
        rol: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tituloPerfil: {
            type: DataTypes.STRING
        },
        presenPerfil: {
            type: DataTypes.STRING
        },
        nombreRango : {
            type: DataTypes.STRING
        },
        imgPerfil: {
            type: DataTypes.STRING
        }

    }, {
        freezeTableName: true,
        timestamps : false
    }
)

Usuario .belongsTo(Universidad, {
    foreignKey: "universidadId",
})

Universidad .hasMany(Usuario, {
    foreignKey: "universidadId",
})

Usuario .belongsTo(Carrera, {
    foreignKey: "carreraId",
})

Carrera .hasMany(Usuario, {
    foreignKey: "carreraId",
})
