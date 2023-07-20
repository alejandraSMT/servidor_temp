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

// Endpoint to retrieve all horarios, FALTA IMPLEMENTAR EN LA VISTA=----------------------------------------
app.get("/horarios", async (req, res) => {
  try {
    const horarios = await Horario.findAll({
      include: [Profesor],
    });
    const horariosData = horarios.map((horario) => ({
      id: horario.id,
      diaSemana: horario.diaSemana,
      horaInicio: horario.horaInicio,
      horaFin: horario.horaFin,
      enlaceSesion: horario.enlaceSesion,
    }));

    res.send(horariosData);
    console.log(horariosData);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve horarios" });
  }
});

//Endpoint para agregar un nuevo Horario.
//Apartir de este se puede aramar para eliminar uno de la base de datos

app.get("/horarios/:diaSemana/:horaInicio/:horaFin/:enlaceSesion",
  async (req, res) => {
    try {
      const diaSemana = req.params.diaSemana;
      const horaInicio = req.params.horaInicio;
      const horaFin = req.params.horaFin;
      const enlaceSesion = req.params.enlaceSesion;
      const horario = await Horario.create({
        diaSemana: diaSemana,
        horaInicio: horaInicio,
        horaFin: horaFin,
        enlaceSesion: enlaceSesion,
      });
      res.send(horario);
      console.log(horario);
    } catch (error) {
      res.json({ error: "No se pudo agregar el horario" });
    }
  }
);

//Al presionar el boton X de la columna de Horarios, se debe enviar esta peticion
app.get("/remover-horario/:idHorario",
  async (req, res) => {
    try {
      const id = req.params.idHorario;
      const deletedRows = await Horario.destroy({
        where: {
          id: id,
        },
      });
      if (deletedRows > 0) {
        res.send("Horario Eliminado")
        res.status(200).json({ message: 'Horario deleted successfully' });
      } else {
        res.status(404).json({ message: 'Horario not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete the horario' });
    }
  }
);










app.get("/buscar-citas/:usuarioId", async function (req, res) {
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
        status: 0
      },
      include : [
        {
          model : Profesor,
          include : [
            {
              model: Usuario,
              attributes: ["id", "nombres", "apellidos", "imgPerfil", "tituloPerfil"]
            },
          ]
        },
        {
          model : Curso
        }
      ]
    })
  } else {
    citas = await Cita.findAll({
      where: {
        profesorId: seleccionado.id,
        status: 0
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
        },
      ]
    })
  }

  var citasMostrar = []

  if (usuario.dataValues.rol == 0) { //Para Estudiante
    citas.forEach(cita => 
      {
      const elemento = {
        cita: {
          id : cita.dataValues.id,
          dia: cita.dataValues.dia,
          mes: cita.dataValues.mes,
          anio: cita.dataValues.anio,
          diaSemana: cita.dataValues.diaSemana,
          hora: cita.dataValues.hora,
          status: cita.dataValues.status,
          nombreCurso: cita.dataValues.Curso.nombreCurso,
          calificacion: cita.dataValues.puntaje,
          persona: {
            id: cita.dataValues.Profesor.Usuario.id,
            nombres: cita.dataValues.Profesor.Usuario.nombres,
            apellidos: cita.dataValues.Profesor.Usuario.apellidos,
            imgPerfil: cita.dataValues.Profesor.Usuario.imgPerfil,
            tituloPerfil: cita.dataValues.Profesor.Usuario.tituloPerfil,
          }
        }
      }
      // si calificado es null, poner No calificado y que se pueda calificar, sino desactivar el botón y cuando califique pintar el puntaje
      citasMostrar.push(elemento)
    })
  } else {  //Para profesor
    citas.forEach(cita => {
      const elemento = {
        cita: {
          id : cita.dataValues.id,
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
            nombres: cita.dataValues.Estudiante.dataValues.Usuario.nombres,
            apellidos: cita.dataValues.Estudiante.Usuario.apellidos,
            imgPerfil: cita.dataValues.Estudiante.Usuario.imgPerfil,
            tituloPerfil: cita.dataValues.Estudiante.Usuario.tituloPerfil,
          }
        }
      }
      // si calificado es null, poner No calificado y que se pueda calificar, sino desactivar el botón y cuando califique pintar el puntaje
      citasMostrar.push(elemento)
    })
  }
  res.send(citasMostrar)
})



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

app.listen(port, function () {
  console.log("Servidor ejecutándose en puerto " + port);
  verificarConexion();
});
