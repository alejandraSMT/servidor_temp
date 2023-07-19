console.log("XD");

import { sequelize } from "./database/database.js";
import express from "express";
import cors from "cors";
import {Op} from "sequelize";
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

app.put("/calificar-cita-pasada/:citaId/:puntaje", async function (req, res) {
  try {
    const citaId = parseInt(req.params.citaId);
    const puntajeLleno = parseInt(req.params.puntaje);
    const comentarioIngresado = req.body.comentario; // Obtén el comentario del cuerpo de la solicitud

    // Validación de datos
    if (isNaN(citaId) || isNaN(puntajeLleno)) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    // Verificar si existe la cita
    const cita = await Cita.findOne({ where: { id: citaId } });
    if (!cita) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    // Realizar la actualización
    await Cita.update(
      { puntaje: puntajeLleno, comentario: comentarioIngresado}, // Guarda el comentario en la variable correspondiente de tu base de datos
      { where: { id: citaId } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al modificar la cita" });
  }
});


app.get("/consultar-calificaciones/:usuarioId", async function(req, res) {
  const usuarioId = req.params.usuarioId;

  try {
    const usuario = await Usuario.findOne({
      where: {
        id: usuarioId
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const profesor = await Profesor.findOne({
      where: {
        usuarioId: usuario.id
      }
    });

    const citas = await Cita.findAll({
      where: {
        profesorId: profesor.id,
        puntaje: {
          [Op.not]: null
        }
      },
      attributes: ["puntaje", "comentario", "dia", "mes", "anio", "hora", "estudianteId"]
    });

    const estudiantesIds = citas.map(cita => cita.estudianteId);
    const estudiantes = await Estudiante.findAll({
      where: {
        id: estudiantesIds
      },
      attributes: ["id", "usuarioId"]
    });

    const usuariosIds = estudiantes.map(estudiante => estudiante.usuarioId);
    const usuariosEstudiantes = await Usuario.findAll({
      where: {
        id: usuariosIds
      },
      attributes: ["id", "nombreCompleto"]
    });

    const usuariosEstudiantesMap = usuariosEstudiantes.reduce((map, usuario) => {
      map[usuario.id] = usuario.nombreCompleto;
      return map;
    }, {});

    const citasConNombres = citas.map(cita => ({
      puntaje: cita.puntaje,
      comentario: cita.comentario,
      dia: cita.dia,
      mes: cita.mes,
      anio: cita.anio,
      hora: cita.hora,
      nombreEstudiante: usuariosEstudiantesMap[estudiantes.find(estudiante => estudiante.id === cita.estudianteId).usuarioId]
    }));

    const nombreProfesor = usuario.nombreCompleto;
    const respuesta = {
      profesor: nombreProfesor,
      citas: citasConNombres
    };
    res.send(respuesta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las citas del usuario" });
  }
});

app.get("/consultar-cita-pasada/:usuarioId", async function(req, res) {
  const usuarioId = req.params.usuarioId;

  try {
    const usuario = await Usuario.findOne({
      where: {
        id: usuarioId
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const estudiante = await Estudiante.findOne({
      where: {
        usuarioId: usuario.id
      }
    });

    const citas = await Cita.findAll({
      where: {
        estudianteId: estudiante.id,
        status: {
          [Op.not]: 0
        }
      },
      attributes: ["puntaje", "comentario", "dia", "mes", "anio", "hora", "estudianteId"]
    });

    const estudiantesIds = citas.map(cita => cita.estudianteId);
    const estudiantes = await Estudiante.findAll({
      where: {
        id: estudiantesIds
      },
      attributes: ["id", "usuarioId"]
    });

    const usuariosIds = estudiantes.map(estudiante => estudiante.usuarioId);
    const usuariosEstudiantes = await Usuario.findAll({
      where: {
        id: usuariosIds
      },
      attributes: ["id", "nombreCompleto"]
    });

    const usuariosEstudiantesMap = usuariosEstudiantes.reduce((map, usuario) => {
      map[usuario.id] = usuario.nombreCompleto;
      return map;
    }, {});

    const citasConNombres = citas.map(cita => ({
      puntaje: cita.puntaje,
      comentario: cita.comentario,
      dia: cita.dia,
      mes: cita.mes,
      anio: cita.anio,
      hora: cita.hora,
      nombreEstudiante: usuariosEstudiantesMap[estudiantes.find(estudiante => estudiante.id === cita.estudianteId).usuarioId]
    }));

    const nombreProfesor = usuario.nombreCompleto;
    const respuesta = {
      profesor: nombreProfesor,
      citas: citasConNombres
    };
    res.send(respuesta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las citas del usuario" });
  }
});

//-----------------------------------------------------------------------------
app.get("/citas-pasadas/:usuarioId", async function (req, res) {
  const usuarioId = req.params.usuarioId

  let usuario = null
  usuario = await Usuario.findOne({
    where: {
      id: usuarioId
    },
  })

  var seleccionado = null
  if (usuario.dataValues.rol == 0) {
    seleccionado = await Estudiante.findOne({
      where: {
        usuarioId: usuario.dataValues.id
      }
    })
  } else {
    seleccionado = await Profesor.findOne({
      where: {
        usuarioId: usuario.dataValues.id
      }
    })
  }

  var citas = null
  if (usuario.dataValues.rol == 0) {
    citas = await Cita.findAll({
      where: {
        estudianteId: seleccionado.id,
        status: 1
      },
      include : [
        {
          model : Profesor,
          include : [
            {
              model: Usuario,
              attributes: ["id", "nombres", "apellidos", "imgPerfil", "tituloPerfil"]
            }
          ]
        },
        {
          model : Curso
        },
        {
          model : Carrera,
          attributes: ["id","nombreCarrera"]
        }
      ]
    })
  } else if(usuario.dataValues.rol == 1) {
    citas = await Cita.findAll({
      where: {
        profesorId: seleccionado.id,
        status: 1
      },
      include : [
        {
          model : Estudiante,
          include : [
            {
              model: Usuario,
              attributes: ["id", "nombres", "apellidos", "imgPerfil", "tituloPerfil"]
            }
          ]
        },
        {
          model : Curso
        }
      ]
    })
  }

  var citasMostrar = []

  if (usuario.dataValues.rol == 0) {
    citas.forEach(cita => {
      const elemento = {
        usuario: {
          id: usuario.dataValues.id,
          nombres: usuario.dataValues.nombres,
          apellidos: usuario.dataValues.apellidos,
          cita: {
            id: cita.dataValues.id,
            dia: cita.dataValues.dia,
            mes: cita.dataValues.mes,
            anio: cita.dataValues.anio,
            diaSemana: cita.dataValues.diaSemana,
            hora: cita.dataValues.hora,
            status: cita.dataValues.status,
            nombreCurso: cita.dataValues.Curso.nombreCurso,
            calificacion: cita.dataValues.puntaje,
            nombreCarrera: cita.dataValues.Carrera.nombreCarrera,
            persona: {
              id: cita.dataValues.Profesor.Usuario.id,
              nombres: cita.dataValues.Profesor.Usuario.nombres,
              apellidos: cita.dataValues.Profesor.Usuario.apellidos,
              imgPerfil: cita.dataValues.Profesor.Usuario.imgPerfil,
              tituloPerfil: cita.dataValues.Profesor.Usuario.tituloPerfil,
            }
          }
        }
      }
      // si calificado es null, poner No calificado y que se pueda calificar, sino desactivar el botón y cuando califique pintar el puntaje
      citasMostrar.push(elemento)
    })
  } else {
    citas.forEach(cita => {
      const elemento = {
        usuario: {
          id: usuario.dataValues.id,
          nombres: usuario.dataValues.nombres,
          apellidos: usuario.dataValues.apellidos,
          cita: {
            id: cita.dataValues.id,
            dia: cita.dataValues.dia,
            mes: cita.dataValues.mes,
            anio: cita.dataValues.anio,
            diaSemana: cita.dataValues.diaSemana,
            hora: cita.dataValues.hora,
            status: cita.dataValues.status,
            nombreCurso: cita.dataValues.Curso.nombreCurso,
            calificacion: cita.dataValues.puntaje,
            persona: {
              id: cita.dataValues.Estudiante.Usuario.id,
              nombres: cita.dataValues.Estudiante.Usuario.nombres,
              apellidos: cita.dataValues.Estudiante.Usuario.apellidos,
              imgPerfil: cita.dataValues.Estudiante.Usuario.imgPerfil,
              tituloPerfil: cita.dataValues.Estudiante.Usuario.tituloPerfil,
            }
          }
        }
      }
      // si calificado es null, poner No calificado y que se pueda calificar, sino desactivar el botón y cuando califique pintar el puntaje
      citasMostrar.push(elemento)
    })
  }
  res.send(citasMostrar)
})

//---------------------------------------------------
app.listen(port, function () {
  console.log("Servidor ejecutándose en puerto " + port);
  verificarConexion();
});


