console.log("XD");

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
import { Rangos } from "./models/Rangos.js";
import { Calificacion } from "./models/Calificacion.js";
import { TipoDocumento} from "./models/TipoDocumento.js";

const app = express();
const port = process.env.PORT || 3005;

app.use(cors());

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

app.get("/create-user", async function (req, res) {
  const nuevoUsuario = await Usuario.create({
    nombre: "Pepe",
    codigo: "20123254",
    edad: 30,
  });

  res.send("Usuario creado.");
});

app.get("/", function (req, res) {
  res.send("Se conectó correctamente");
  verificarConexion();
});

app.get("/prueba", async (req, res) => {

  const rangos = await Rangos.create({
    horaInicio : "9:00",
    horaFin : "10:00",
  })

  const rangos1 = await Rangos.create({
    horaInicio : "10:00",
    horaFin : "11:00"
  })

  const universidadPrueba = await Universidad.create({
    nombreUniversidad: "ULIMA",
  });

  const carreraPrueba = await Carrera.create({
    nombreCarrera: "Sistemas",
  });

  const uniCursoPrueba = await UniCarrera.create({
    carreraId: carreraPrueba.dataValues.id,
    universidadId: universidadPrueba.dataValues.id,
  });

  const cursoPrueba = await Curso.create({
    nombreCurso: "Progra web",
  });

  const cursoPrueba2 = await Curso.create({
    nombreCurso: "Progra web2",
  });

  const carreraCursoPrueba = await CarreraCurso.create({
    carreraId: carreraPrueba.dataValues.id,
    cursoId: cursoPrueba.dataValues.id,
  });

  const carreraCursoPrueba2 = await CarreraCurso.create({
    carreraId: carreraPrueba.dataValues.id,
    cursoId: cursoPrueba2.dataValues.id,
  });

  const usuarioDummyAlumno = await Usuario.create({
    nombreUsuario: "Jose",
    password: "123",
    correo: "xd@xd1",
    nombres: "Jose",
    apellidos: "jose",
    tipoDocumento: "a",
    nroDocumento: "xd",
    rol: "Estudiante",
    carreraId: carreraCursoPrueba.dataValues.id,
  });

  const usuarioDummyProfesor = await Usuario.create({
    nombreUsuario: "Hernan",
    password: "123",
    correo: "xd@xd3",
    nombres: "Jose",
    apellidos: "jose",
    tipoDocumento: "a",
    nroDocumento: "xd",
    rol: "Profesor",
    carreraId: carreraCursoPrueba.dataValues.id,
  });

  const usuarioDummyProfesor2 = await Usuario.create({
    nombreUsuario: "Pablito",
    password: "123",
    correo: "xd@xd4",
    nombres: "Pablo",
    apellidos: "jose",
    tipoDocumento: "a",
    nroDocumento: "xd",
    rol: "Profesor",
    carreraId: carreraCursoPrueba.dataValues.id,
  });

  const profesor1 = await Profesor.create({
    usuarioId: usuarioDummyProfesor.dataValues.id,
  });

  const profesor2 = await Profesor.create({
    usuarioId: usuarioDummyProfesor2.dataValues.id
  });

  const usuarioCursoEstudiante = await UsuarioCurso.create({
    usuarioId: usuarioDummyAlumno.dataValues.id,
    cursoId: cursoPrueba.dataValues.id,
  });

  const usuarioCursoProfesor = await UsuarioCurso.create({
    usuarioId: usuarioDummyProfesor.dataValues.id,
    cursoId: cursoPrueba.dataValues.id,
  });

  const usuarioCursoProfesor2 = await UsuarioCurso.create({
    usuarioId: usuarioDummyProfesor2.dataValues.id,
    cursoId: cursoPrueba.dataValues.id,
  });

  const estudiante1 = await Estudiante.create({
    usuarioId: usuarioDummyAlumno.dataValues.id,
  });


  const horario = await Horario.create({
    diaSemana: "Lunes",
    horaInicio: "8",
    horaFin: "10",
    enlaceSesion: "Zoom",
  });

  const horariouwu = await Horario.create({
    diaSemana : "Lunes",
    horaInicio : "9:00",
    horaFin :"11:00",
    rangoId : rangos.dataValues.id,
    profesorId : profesor1.dataValues.id
  })

  const horariouwu1 = await Horario.create({
    diaSemana : "Lunes",
    horaInicio : "9:00",
    horaFin :"11:00",
    rangoId : rangos1.dataValues.id,
    profesorId : profesor1.dataValues.id
  })

  /*const horarioProfe1 = await ProfesorHorario.create({
    profesorId: profesor1.dataValues.id,
    horarioId: horario.dataValues.id,
  });

  const horarioProfe2 = await ProfesorHorario.create({
    profesorId: profesor2.dataValues.id,
    horarioId: horario.dataValues.id,
  });*/

  const cita1 = await Cita.create({
    profesorId: profesor1.dataValues.id,
    estudianteId: estudiante1.dataValues.id,
    cursoId: cursoPrueba.dataValues.id,
    rangoId : rangos.dataValues.id
  });

  const cita2 = await Cita.create({
    profesorId: profesor2.dataValues.id,
    estudianteId: estudiante1.dataValues.id,
    cursoId: cursoPrueba2.dataValues.id,
  });

  //Esto te devuelve el objeto del estudiante con sus citas
  const citasAlumnoPrueba = await Estudiante.findAll({
    where: {
      id: estudiante1.dataValues.id,
    },
    include: Cita,
  });

  //Hace lo mismo pero con atributos en especifico
  const citasAlumnoPrueba2 = await Estudiante.findAll({
    where: {
      id: estudiante1.dataValues.id,
    },
    include: {
      model: Cita,
      attributes: ["estudianteId", "profesorId", "cursoId"],
    },
  });

  //Devuelve solo las citas dado un id de alumno
  const onlyCitasAlumnos = await Cita.findAll({
    where: {
      estudianteId: estudiante1.dataValues.id,
    },
  });

  //Misma vaina pero solo los atributos que tu quieres
  const onlyCitasAlumnos2 = await Cita.findAll({
    where: {
      estudianteId: estudiante1.dataValues.id,
    },
    attributes: ["estudianteId", "profesorId", "cursoId"],
  });

  //Que pro

  const megaQueProXd = await Cita.findAll({
    where: {
      estudianteId: estudiante1.dataValues.id,
    },
    attributes: [],
    include: [
      {
        model: Estudiante,
        attributes: ["id"],
        include: {
          model: Usuario,
          attributes: ["nombreUsuario"],
        },
      },
      {
        model: Profesor,
        attributes: ["id"],
        include:{
            model:Usuario,
            attributes: ["nombreUsuario"],
        }
      },
      {
        model: Curso,
        attributes: ["nombreCurso"],
      },
    ],
  });

  //algo mas realista a lo que deberia responder en este caso:
  var queProXD = []

  megaQueProXd.forEach(element => {
    
    const elemento = {
        profesor:{
            idProfesor: element.dataValues.Profesor.id,
            nombre: element.dataValues.Profesor.Usuario.nombreUsuario,
        },
        curso:{
            nombre: element.dataValues.Curso.nombreCurso
        },
        horario:{
        }
    }

    queProXD.push(elemento)

  });

  res.send(
    JSON.stringify({
      ejem1: citasAlumnoPrueba,
      ejem2: citasAlumnoPrueba2,
      ejem3: onlyCitasAlumnos,
      ejem4: onlyCitasAlumnos2,
      queProRaw: megaQueProXd,
      queProBonito: queProXD
    })
  );
});

app.listen(port, function () {
  console.log("Servidor ejecutándose en puerto " + port);
  verificarConexion();
});
