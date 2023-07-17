import { Sequelize } from "sequelize";

// cambiar 1234 por postgres en su caso
export const sequelize = new Sequelize("BD_G05", "postgres", "postgres", {
    host: "localhost",
    dialect: "postgres"
})

// esto es para conexión con la nube
/*export const sequelize = new Sequelize(
    process.env.DATABASE_URL,{
        dialectOptions: {
            ssl:{
                require: true,
                rejectUnauthorized : false
            }
        }
    }
)*/