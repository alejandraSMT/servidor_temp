import { sequelize } from "./database/database.js";
import express from "express";
import cors from "cors";

// Importar modelos
import { Usuario } from "./models/Usuario.js";
import { Profesor } from "./models/Profesor.js";
import { Estudiante } from "./models/Estudiante.js";
import { Universidad } from "./models/Universidad.js";
import { Carrera } from "./models/Carrera.js";
import { CarreraCurso } from "./models/CarreraCurso.js";
import { UniCarrera } from "./models/UniCarrera.js";
import { Curso } from "./models/Curso.js";
import { UsuarioCurso } from "./models/UsuarioCurso.js";
import { Horario } from "./models/Horario.js";
import { Cita } from "./models/Citas.js";

import { capitalizeFirstLetter } from "./utils/funcionesBienUtiles.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin : "*",
  optionsSuccessStatus:200
}))

app.use(express.json());

async function verificarConexion() {
  try {
    await sequelize.authenticate();
    console.log("Conexion a BD exitosa.");
    await sequelize.sync({ force: false });
  } catch (error) {
    console.error("Conexion no se logro.", error);
  }
}

app.post("/register", async(req, res) => {
  const usuario = req.body.user;
  const correo = req.body.email;
  const password = req.body.password;
 
  const nombres = capitalizeFirstLetter(req.body.names);
  const apellidos = capitalizeFirstLetter(req.body.surnames);
  const nombreCompleto = nombres + " " + apellidos;
  
  const tipoDoc = req.body.tdoc;
  const nroDoc = req.body.ndoc;
  const rol = req.body.rol;

  const maxIdResultUser = await Usuario.max("id");
  const nextIdUser = (maxIdResultUser || 0) + 1; // Calcula el próximo ID

  const alreadyRegistered_Name = await Usuario.findAll({
    where: {
      nombreUsuario: usuario
    },
  });

  const alreadyRegistered_Email = await Usuario.findAll({
    where: {
      correo: correo
    },
  });

  const alreadyRegistered_Doc = await Usuario.findAll({
    where: {
      nroDocumento: nroDoc
    },
  });

  if (alreadyRegistered_Name == 0 && alreadyRegistered_Email == 0 && alreadyRegistered_Doc == 0){
    const newUser = Usuario.create({
      id: nextIdUser,
      nombreUsuario: usuario,
      password: password,
      correo: correo,
      nombres: nombres,
      apellidos: apellidos,
      nombreCompleto: nombreCompleto,
      nroDocumento: nroDoc,
      tipoDocumento:tipoDoc,
      rol: rol
    });

    if(rol == "0"){
      const maxIdResultStud = await Estudiante.max("id");
      const nextIdStud = (maxIdResultStud || 0) + 1; // Calcula el próximo ID
      
      const newStudent = Estudiante.create({
        id: nextIdStud,
        usuarioId: nextIdUser
      });
    }
    else{
      const maxIdResultTea = await Profesor.max("id");
      const nextIdTea = (maxIdResultTea || 0) + 1; // Calcula el próximo ID

      const newTeacher = Profesor.create({
        id: nextIdTea,
        usuarioId: nextIdUser
      });
    }

    res.send("Usuario creado.")
  }
  else{
    res.send("Usuario ya existente")
  }

});

app.post("/login", async (req, res) => {
  const input = req.body.input;
  const password = req.body.password;

  const userGetByName = await Usuario.findAll({
    where: {
      nombreUsuario: input,
      password: password,
    },
  });
  
  const userGetByEmail = await Usuario.findAll({
    where: {
      correo: input,
      password: password,
    },
  });

  if (userGetByName.length == 0 || userGetByEmail.length == 0) 
  {
    res.send({
      verify: true,
    });
  } 
  else 
  {
    res.send({
      verify: false,
    });
  }
});

app.get("/", function (req, res) {
  res.send("Se conectó correctamente");
  verificarConexion();
});

app.listen(port, function () {
  console.log("Servidor ejecutándose en puerto " + port);
  verificarConexion();
});
