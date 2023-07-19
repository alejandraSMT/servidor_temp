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

const app = express();
const port = process.env.PORT || 3001;

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


// ENDPOINTS GET



//enpoint para colocar la info actual en los campos de informacion personal
app.get("/obtener-datos-info-personal/:usuarioId", async function (req, res) { //para zona superior de perfil
  const usuarioId = req.params.usuarioId;
  const usuario = await Usuario.findOne({
    where: {
      id: usuarioId
    },
  });
  if (!usuario) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }
  res.send(usuario);
})


//creo que esto no iria, ya que el usuario deberia ingresar esos datos, no recogerlos del servidor
app.get("/obtener-datos-usuario/:usuarioId", async function (req, res) { //para tab de usuario
  const usuarioId = req.params.usuarioId;
  const usuario = await Usuario.findOne({
    where: {
      id: usuarioId
    },
    attributes: ['nombreUsuario', 'password'],
  });
  if (!usuario) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }
  res.send(usuario);
})

app.get("/obtener-datos-presentacion/:usuarioId", async function (req, res) { //para tab de presentacion
  const usuarioId = req.params.usuarioId;
  const usuario = await Usuario.findOne({
    where: {
      id: usuarioId
    },
    attributes: ['tituloPerfil', 'presenPerfil'],
  });
  if (!usuario) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }
  res.send(usuario);
})

app.get("/obtener-universidades", async function (req, res) { //se obtiene la lista de todas las unis
  const universidades = await Universidad.findAll();
  res.send(universidades);
})

app.get("/obtener-carreras-universidad/:UniversidadId", async function (req, res) { //se obtienen las carreras de una universidad mediante el id de la universidad
  const universidadId = req.params.UniversidadId;
  const carreras = await UniCarrera.findAll({
    where: {
      universidadId: universidadId
    },
    attributes: ['carreraId'],
  });
  const carreraIds = carreras.map((carrera) => carrera.carreraId);

  // Realizar una nueva búsqueda en la tabla Carrera utilizando los carreraIds obtenidos
  const carrerasEncontradas = await Carrera.findAll({
    where: {
      id: carreraIds
    },
    attributes: ['id', 'nombreCarrera'],
  });

  res.send(carrerasEncontradas);
})

app.get("/obtener-cursos-carrera/:carreraId", async function (req, res) { //se obtienen los cursos de una carrera mediante el Id de la Carrera
  const carreraId = req.params.carreraId;
  const cursos = await CarreraCurso.findAll({
    where: {
      carreraId: carreraId
    },
    attributes: ['cursoId'],
  });
  const cursoIds = cursos.map((curso) => curso.cursoId);

  // Realizar una nueva búsqueda en la tabla Carrera utilizando los carreraIds obtenidos
  const cursosEncontrados = await Curso.findAll({
    where: {
      id: cursoIds
    },
    attributes: ['id', 'nombreCurso'],
  });

  res.send(cursosEncontrados);
})

//chatgpt
app.get("/obtener-cursos-usuario/:usuarioId", async function (req, res) {
  try {
    const usuarioId = req.params.usuarioId;

    // Obtener todas las relaciones UsuarioCurso asociadas con el usuario en cuestión
    const cursosUsuario = await UsuarioCurso.findAll({
      where: {
        usuarioId: usuarioId,
      },
      include: {
        model: Curso,
        attributes: ['id', 'nombreCurso'],
      },
    });

    // Obtener solo los datos de los cursos del resultado anterior
    const cursosEncontrados = cursosUsuario.map((usuarioCurso) => usuarioCurso.Curso);

    res.send(cursosEncontrados);
  } catch (error) {
    console.error("Error al obtener cursos del usuario:", error);
    res.status(500).send("Error al obtener cursos del usuario.");
  }
});

app.get("/obtener-datos-universidad/:usuarioId", async function (req, res) { //para tab de universidad, creo que esto no va
  const usuarioId = req.params.usuarioId;

  const carreras = await UniCarrera.findOne({
    where: {

      /// ???????????????????????????'
      universidadId: usuarioId
    },
    attributes: ['id', 'universidadId', 'carreraId'],
    include: [
      // Incluir la información de la universidad y sus carreras
      {
        model: Universidad,
        attributes: ['nombreUniversidad'],
        include: {
          model: Carrera,
          as: 'carreras',
          attributes: ['nombreCarrera'],
          include: {
            model: Curso,
            as: 'cursos',
            attributes: ['nombreCurso'],
          }
        },
      },
    ],
  });
  if (!carreras) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }
  res.send(carreras);
})


//endpoint de andrea
app.get("/cursos/:universidadId/:carreraId", async (req, res) => {
  const { universidadId, carreraId } = req.params;

  try {
    const cursos = await Curso.findAll({
      include: [
        {
          model: CarreraCurso,
          where: { carreraId: carreraId },
          include: [
            {
              model: Carrera,
              where: { id: carreraId },
              attributes: [],
              include: [
                {
                  model: UniCarrera,
                  where: { universidadId: universidadId },
                  attributes: [],
                },
              ],
            },
          ],
          attributes: []
        },
      ],
      attributes: ['id', 'nombreCurso'], // Seleccionar solo la columna 'nombreCurso', facil podria ir un 'id', para jalar el Id tambien
    });

    res.send(cursos);
    //return res.status(200).json(nombresCursos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});


app.get("/obtener-carreras-universidad/:UniversidadId", async function (req, res) { //se obtienen las carreras de una universidad mediante el id de la universidad
  const universidadId = req.params.UniversidadId;
  const carreras = await UniCarrera.findAll({
    where: {
      universidadId: universidadId
    },
    attributes: ['carreraId'],
  });
  const carreraIds = carreras.map((carrera) => carrera.carreraId);

  // Realizar una nueva búsqueda en la tabla Carrera utilizando los carreraIds obtenidos
  const carrerasEncontradas = await Carrera.findAll({
    where: {
      id: carreraIds
    },
    attributes: ['id', 'nombreCarrera'],
  });

  res.send(carrerasEncontradas);
})

app.post("/asignar-curso-usuario/:usuarioId/:cursoId", async (req, res) => {
  const usuarioId = req.params.usuarioId;
  const cursoId = req.params.cursoId;

  try {
    // Verificar si la relación ya existe en la tabla UsuarioCurso
    const usuarioCursoExistente = await UsuarioCurso.findOne({
      where: {
        usuarioId: usuarioId,
        cursoId: cursoId,
      },
    });

    if (usuarioCursoExistente) {
      return res.status(400).json({ message: "La relación UsuarioCurso ya existe." });
    }

    // Crear una nueva relación UsuarioCurso
    const maxIdResultUser = await UsuarioCurso.max("id");
    const nextIdUser = (maxIdResultUser || 0) + 1; // Calcula el próximo ID
    const nuevaRelacionUsuarioCurso = await UsuarioCurso.create({
      id: nextIdUser,
      usuarioId: usuarioId,
      cursoId: cursoId,
    });

    res.send(nuevaRelacionUsuarioCurso)
    return res.status(201).json({ message: "Relación UsuarioCurso creada exitosamente." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});



// ENDPOINTS POST




//para el componente de personal_info
app.get("/datos-info-personal/:usuarioId/:nombres/:apellidos/:tipodoc/:numero", async function (req, res) {
  const usuarioId = req.params.usuarioId;
  const nombres = req.params.nombres;
  const apellidos = req.params.apellidos;
  const tipodoc = req.params.tipodoc;
  const numero = req.params.numero;
  // const { usuarioId, nombres, apellidos, tipoDocumento, rol, nroDocumento } = req.body;

  const usuarioExistente = await Usuario.findOne({
    where: {
      id: usuarioId
    }
  });
  usuarioExistente.nombres = nombres;
  usuarioExistente.apellidos = apellidos;
  usuarioExistente.tipoDocumento = tipodoc;
  usuarioExistente.nroDocumento = numero;
  await usuarioExistente.save();

  res.send(usuarioExistente);
});

//para el tab de presentacion
app.get("/enviar-datos-presentacion/:usuarioId/:titulo/:presentacion", async function (req, res) { 
  const usuarioId = req.params.usuarioId;
  const titulo = req.params.titulo;
  const presentacion = req.params.presentacion;
  const usuarioExistente = await Usuario.findOne ({
    where: {
      id: usuarioId
    }
  });
  usuarioExistente.tituloPerfil = titulo;
  usuarioExistente.presenPerfil = presentacion;
  await usuarioExistente.save();
  res.send("usuarioExistente");
})

//endpoint para modificar la universidad
app.get("/cambiar-universidad/:usuarioId/:universidadId", async function (req, res) {
  const usuarioId = req.params.usuarioId;
  const universidad = req.params.universidadId;
  const usuarioExistente = await Usuario.findOne ({
    where: {
      id: usuarioId
    }
  });
  usuarioExistente.universidadId = parseInt(universidad);
  await usuarioExistente.save();
  res.send(usuarioExistente);
})

//endpoint para modificar la carrera
app.get("/cambiar-carrera/:usuarioId/:carreraId", async function (req, res) {
  const usuarioId = req.params.usuarioId;
  const carrera = req.params.carreraId;
  const usuarioExistente = await Usuario.findOne ({
    where: {
      id: usuarioId
    }
  });
  usuarioExistente.carreraId = parseInt(carrera);
  await usuarioExistente.save();
  res.send(usuarioExistente);
})

//a para el tab de datos
app.get("/enviar-datos-datos/:usuarioId/:nombreUsuario/:cont1/:cont2/:cont3", async function (req, res) {
  const usuarioId = req.params.usuarioId;
  const nombreUsuario = req.params.nombreUsuario;
  const cont1 = req.params.cont1;
  const cont2 = req.params.cont2;
  const cont3 = req.params.cont3;
  const usuarioExistente = await Usuario.findOne ({
    where: {
      id: usuarioId
    }
  });
  //usuarioExistente.nombreUsuario = parseInt(nombreUsuario);
  // Verificar si cont1 es igual a usuarioExistente.password
  if (cont1 === usuarioExistente.password) {
    // Verificar si cont2 y cont3 son iguales
    if (cont2 === cont3) {
      // Si se cumple la condición, establecer usuarioExistente.password a cont2
      usuarioExistente.password = cont2;
    } else {
      // Si cont2 y cont3 no son iguales, enviar un mensaje de error al cliente
      return res.status(400).send("cont2 y cont3 deben ser iguales");
    }
  } else {
    // Si cont1 no es igual a usuarioExistente.password, enviar un mensaje de error al cliente
    return res.status(400).send("cont1 no coincide con la contraseña actual");
  }
  await usuarioExistente.save();
  res.send(usuarioExistente);
})

//endpoint frank
app.post('/update-foto2/:usuarioId', async function (req, res) {
  const usuarioId = req.params.usuarioId;
  const nuevaFoto = req.body.imagenNueva; // Cambio aquí, ahora usamos req.body en lugar de req.params
  try {
    const usuario = await Usuario.findOne({
      where: {
        id: usuarioId,
      },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Actualizar la columna "imgPerfil" con la URL proporcionada
    usuario.imgPerfil = nuevaFoto;

    // Guardar los cambios en la base de datos
    await usuario.save();

    res.send(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
});





// app.get("/prueba", async (req, res) => {

//   const rangos = await Rangos.create({
//     horaInicio : "9:00",
//     horaFin : "10:00",
//   })

//   const rangos1 = await Rangos.create({
//     horaInicio : "10:00",
//     horaFin : "11:00"
//   })

//   const universidadPrueba = await Universidad.create({
//     nombreUniversidad: "ULIMA",
//   });

//   const carreraPrueba = await Carrera.create({
//     nombreCarrera: "Sistemas",
//   });

//   const uniCursoPrueba = await UniCarrera.create({
//     carreraId: carreraPrueba.dataValues.id,
//     universidadId: universidadPrueba.dataValues.id,
//   });

//   const cursoPrueba = await Curso.create({
//     nombreCurso: "Progra web",
//   });

//   const cursoPrueba2 = await Curso.create({
//     nombreCurso: "Progra web2",
//   });

//   const carreraCursoPrueba = await CarreraCurso.create({
//     carreraId: carreraPrueba.dataValues.id,
//     cursoId: cursoPrueba.dataValues.id,
//   });

//   const carreraCursoPrueba2 = await CarreraCurso.create({
//     carreraId: carreraPrueba.dataValues.id,
//     cursoId: cursoPrueba2.dataValues.id,
//   });

//   const usuarioDummyAlumno = await Usuario.create({
//     nombreUsuario: "Jose",
//     password: "123",
//     correo: "xd@xd1",
//     nombres: "Jose",
//     apellidos: "jose",
//     tipoDocumento: "a",
//     nroDocumento: "xd",
//     rol: "Estudiante",
//     carreraId: carreraCursoPrueba.dataValues.id,
//   });

//   const usuarioDummyProfesor = await Usuario.create({
//     nombreUsuario: "Hernan",
//     password: "123",
//     correo: "xd@xd3",
//     nombres: "Jose",
//     apellidos: "jose",
//     tipoDocumento: "a",
//     nroDocumento: "xd",
//     rol: "Profesor",
//     carreraId: carreraCursoPrueba.dataValues.id,
//   });

//   const usuarioDummyProfesor2 = await Usuario.create({
//     nombreUsuario: "Pablito",
//     password: "123",
//     correo: "xd@xd4",
//     nombres: "Pablo",
//     apellidos: "jose",
//     tipoDocumento: "a",
//     nroDocumento: "xd",
//     rol: "Profesor",
//     carreraId: carreraCursoPrueba.dataValues.id,
//   });

//   const profesor1 = await Profesor.create({
//     usuarioId: usuarioDummyProfesor.dataValues.id,
//   });

//   const profesor2 = await Profesor.create({
//     usuarioId: usuarioDummyProfesor2.dataValues.id
//   });

//   const usuarioCursoEstudiante = await UsuarioCurso.create({
//     usuarioId: usuarioDummyAlumno.dataValues.id,
//     cursoId: cursoPrueba.dataValues.id,
//   });

//   const usuarioCursoProfesor = await UsuarioCurso.create({
//     usuarioId: usuarioDummyProfesor.dataValues.id,
//     cursoId: cursoPrueba.dataValues.id,
//   });

//   const usuarioCursoProfesor2 = await UsuarioCurso.create({
//     usuarioId: usuarioDummyProfesor2.dataValues.id,
//     cursoId: cursoPrueba.dataValues.id,
//   });

//   const estudiante1 = await Estudiante.create({
//     usuarioId: usuarioDummyAlumno.dataValues.id,
//   });


//   const horario = await Horario.create({
//     diaSemana: "Lunes",
//     horaInicio: "8",
//     horaFin: "10",
//     enlaceSesion: "Zoom",
//   });

//   const horariouwu = await Horario.create({
//     diaSemana : "Lunes",
//     horaInicio : "9:00",
//     horaFin :"11:00",
//     rangoId : rangos.dataValues.id,
//     profesorId : profesor1.dataValues.id
//   })

//   const horariouwu1 = await Horario.create({
//     diaSemana : "Lunes",
//     horaInicio : "9:00",
//     horaFin :"11:00",
//     rangoId : rangos1.dataValues.id,
//     profesorId : profesor1.dataValues.id
//   })

//   const horarioProfe1 = await ProfesorHorario.create({
//     profesorId: profesor1.dataValues.id,
//     horarioId: horario.dataValues.id,
//   });

//   const horarioProfe2 = await ProfesorHorario.create({
//     profesorId: profesor2.dataValues.id,
//     horarioId: horario.dataValues.id,
//   });

//   const cita1 = await Cita.create({
//     profesorId: profesor1.dataValues.id,
//     estudianteId: estudiante1.dataValues.id,
//     cursoId: cursoPrueba.dataValues.id,
//     rangoId : rangos.dataValues.id
//   });

//   const cita2 = await Cita.create({
//     profesorId: profesor2.dataValues.id,
//     estudianteId: estudiante1.dataValues.id,
//     cursoId: cursoPrueba2.dataValues.id,
//   });

//   //Esto te devuelve el objeto del estudiante con sus citas
//   const citasAlumnoPrueba = await Estudiante.findAll({
//     where: {
//       id: estudiante1.dataValues.id,
//     },
//     include: Cita,
//   });

//   //Hace lo mismo pero con atributos en especifico
//   const citasAlumnoPrueba2 = await Estudiante.findAll({
//     where: {
//       id: estudiante1.dataValues.id,
//     },
//     include: {
//       model: Cita,
//       attributes: ["estudianteId", "profesorId", "cursoId"],
//     },
//   });

//   //Devuelve solo las citas dado un id de alumno
//   const onlyCitasAlumnos = await Cita.findAll({
//     where: {
//       estudianteId: estudiante1.dataValues.id,
//     },
//   });

//   //Misma vaina pero solo los atributos que tu quieres
//   const onlyCitasAlumnos2 = await Cita.findAll({
//     where: {
//       estudianteId: estudiante1.dataValues.id,
//     },
//     attributes: ["estudianteId", "profesorId", "cursoId"],
//   });

//   //Que pro

//   const megaQueProXd = await Cita.findAll({
//     where: {
//       estudianteId: estudiante1.dataValues.id,
//     },
//     attributes: [],
//     include: [
//       {
//         model: Estudiante,
//         attributes: ["id"],
//         include: {
//           model: Usuario,
//           attributes: ["nombreUsuario"],
//         },
//       },
//       {
//         model: Profesor,
//         attributes: ["id"],
//         include:{
//             model:Usuario,
//             attributes: ["nombreUsuario"],
//         }
//       },
//       {
//         model: Curso,
//         attributes: ["nombreCurso"],
//       },
//     ],
//   });

//   //algo mas realista a lo que deberia responder en este caso:
//   var queProXD = []

//   megaQueProXd.forEach(element => {

//     const elemento = {
//         profesor:{
//             idProfesor: element.dataValues.Profesor.id,
//             nombre: element.dataValues.Profesor.Usuario.nombreUsuario,
//         },
//         curso:{
//             nombre: element.dataValues.Curso.nombreCurso
//         },
//         horario:{
//         }
//     }

//     queProXD.push(elemento)

//   });

//   res.send(
//     JSON.stringify({
//       ejem1: citasAlumnoPrueba,
//       ejem2: citasAlumnoPrueba2,
//       ejem3: onlyCitasAlumnos,
//       ejem4: onlyCitasAlumnos2,
//       queProRaw: megaQueProXd,
//       queProBonito: queProXD
//     })
//   );
// });

app.listen(port, function () {
  console.log("Servidor ejecutándose en puerto " + port);
  verificarConexion();
});
