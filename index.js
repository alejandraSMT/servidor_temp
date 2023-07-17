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
import { Model, where } from "sequelize";



const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin : "http://localhost:3000",
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

app.get("/", function (req, res) {
  res.send("Se conectó correctamente");
  verificarConexion();
});

app.get('/obtener-profesor-total/:usuarioId', async function(req, res) {
  const usuarioId = req.params.usuarioId;

  try {
    const usuario = await Profesor.findOne({
      where: {
        usuarioId: usuarioId
      },
      include : [
        {
          model : Usuario,
          attributes :  ["id","nombreCompleto", "correo", "apellidos", "tituloPerfil", "presenPerfil", "imgPerfil"],
          include: {
            model: UsuarioCurso,
            include: {
              model: Curso,
              attributes: ["nombreCurso"]
            }
          }
        }  
      ],
    });

    if (!usuario) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }

    console.log(usuario);
    res.send(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el profesor" });
  }
});

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
      include: [
        {
          model: Profesor,
          include: [
            {
              model: Usuario,
              attributes: ["id", "nombres", "apellidos", "imgPerfil", "tituloPerfil"]
            },
          ]
        },
        {
          model: Curso
        }
      ]
    })
  } else {
    citas = await Cita.findAll({
      where: {
        profesorId: seleccionado.id,
        status: 0
      },
      include: [
        {
          model: Estudiante,
          include: [
            {
              model: Usuario,
              attributes: ["id", "nombres", "apellidos", "imgPerfil", "tituloPerfil"]
            }
          ]
        },
        {
          model: Curso
        },
      ]
    })
  }

  var citasMostrar = []

  if (usuario.dataValues.rol == 0) {
    citas.forEach(cita => {
      const elemento = {
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
      // si calificado es null, poner No calificado y que se pueda calificar, sino desactivar el botón y cuando califique pintar el puntaje
      citasMostrar.push(elemento)
    })
  } else {
    citas.forEach(cita => {
      const elemento = {
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
      include: [
        {
          model: Profesor,
          include: [
            {
              model: Usuario,
              attributes: ["id", "nombres", "apellidos", "imgPerfil", "tituloPerfil"]
            }
          ]
        },
        {
          model: Curso
        }
      ]
    })
  } else if (usuario.dataValues.rol == 1) {
    citas = await Cita.findAll({
      where: {
        profesorId: seleccionado.id,
        status: 1
      },
      include: [
        {
          model: Estudiante,
          include: [
            {
              model: Usuario,
              attributes: ["id", "nombres", "apellidos", "imgPerfil", "tituloPerfil"]
            }
          ]
        },
        {
          model: Curso
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

// debería llamarse al momento que se abre la ventana principal
app.get("/principal-citas/:usuarioId", async function (req, res) {
  const usuarioId = req.params.usuarioId

  let usuario = null
  usuario = await Usuario.findOne({
    where: {
      id: usuarioId
    },
  })

  var seleccionado = null
  var citas = null
  if (usuario.dataValues.rol == 0) {
    seleccionado = await Estudiante.findOne({
      where: {
        usuarioId: usuario.dataValues.id
      }
    })

    citas = await Cita.findAll({
      where: {
        estudianteId: seleccionado.dataValues.id,
        status: 0
      },
      include: {
        model: Profesor,
        include: [
          {
            model: Usuario
          },
        ],
      },
      attributes: ["id", "dia", "mes", "anio", "hora", "diaSemana"]
    })

  } else if (usuario.dataValues.rol == 1) {
    seleccionado = await Profesor.findOne({
      where: {
        usuarioId: usuario.dataValues.id
      }
    })
    citas = await Cita.findAll({
      where: {
        profesorId: seleccionado.dataValues.id,
        status: 0
      },
      include: {
        model: Estudiante,
        include: [
          {
            model: Usuario
          },
        ],
      },
      attributes: ["id", "dia", "mes", "anio", "hora", "diaSemana"]
    })
  }

  //res.send(citas)

  const citasPrincipal = []

  if (usuario.dataValues.rol == 0) {

    citas.forEach(cita => {
      const elemento = {
        cita: {
          id: cita.dataValues.id,
          dia: cita.dataValues.dia,
          mes: cita.dataValues.mes,
          anio: cita.dataValues.anio,
          hora: cita.dataValues.hora,
          persona: {
            id: cita.dataValues.Profesor.Usuario.id,
            nombres: cita.dataValues.Profesor.Usuario.nombres,
            apellidos: cita.dataValues.Profesor.Usuario.apellidos,
            imgPerfil: cita.dataValues.Profesor.Usuario.imgPerfil
          }
        }
      }
      citasPrincipal.push(elemento)
    })
  } else if (usuario.dataValues.rol == 1) {
    citas.forEach(cita => {
      const elemento = {
        cita: {
          id: cita.dataValues.id,
          dia: cita.dataValues.dia,
          mes: cita.dataValues.mes,
          anio: cita.dataValues.anio,
          hora: cita.dataValues.hora,
          persona: {
            id: cita.dataValues.Estudiante.Usuario.id,
            nombres: cita.dataValues.Estudiante.Usuario.nombres,
            apellidos: cita.dataValues.Estudiante.Usuario.apellidos,
            imgPerfil: cita.dataValues.Profesor.Usuario.imgPerfil
          }
        }
      }
      citasPrincipal.push(elemento)
    })
  }

  res.send(citasPrincipal)

})

app.get("/datos-usuario/:usuarioId", async function(req,res){

  const usuarioId = req.params.usuarioId

  const usuario = await Usuario.findOne({
    where: {
      id : usuarioId
    }
  })
  res.send(usuario)
})

// /:dia/:mes/:anio
app.get("/consultar-disponibilidad/:diaSemana/:dia/:mes/:anio/:profesorId", async function (req, res) {

  // const [diaSemana,dia,mes,anio,profesorId] = req.params
  const {diaSemana,dia,mes,anio,profesorId} = req.params

  const citas = await Cita.findAll({
    where: {
      profesorId: profesorId,
      dia : dia,
      mes : mes,
      anio : anio
    },
    attributes: ["status", "hora"]
  })

  const horario = await Horario.findOne({
    where: {
      profesorId: profesorId,
      diaSemana: diaSemana
    },
    attributes: ["diaSemana", "horaInicio", "horaFin"]
  })

  var hi = horario.dataValues.horaInicio
  var hf = horario.dataValues.horaFin
  var contador = hi
  var citasBD = []
  while (contador != hf) {
    citasBD.push({
      horaInicio: contador,
      horaFin: contador + 1
    })
    contador++
  }

  console.log(citasBD)

  citas.forEach(cita => {
    citasBD.forEach(citaBD => {
      if (cita.dataValues.hora == citaBD.horaInicio) {
        var index = citasBD.indexOf(citaBD)
        citasBD.splice(index, 1)
      }
    })
  })
  res.send(citasBD)

})

app.post("/reservar-cita/:diaSemana/:dia/:mes/:anio/:hora/:profesorId/:usuarioId/:cursoId", async function (req, res) {

  const { diaSemana, dia, mes, anio, hora, profesorId, usuarioId, cursoId } = req.params

  const estudiante = await Estudiante.findOne({
    where: {
      usuarioId: usuarioId
    },
    include: {
        model: Usuario,
      }
  })

  const profesor = await Profesor.findOne({
    where: {
      id: profesorId
    },
    include: {
      model: Usuario,
      include: {
        model: Carrera
      }
    }
  })

  const cita = await Cita.create({
    dia: dia,
    mes: mes,
    anio: anio,
    hora: hora,
    diaSemana: diaSemana,
    status: 0,
    profesorId: profesorId,
    estudianteId: estudiante.dataValues.id,
    cursoId: cursoId,
    carreraId: profesor.dataValues.Usuario.Carrera.id
  })

  res.send(cita)

})


app.listen(port, function () {
  console.log("Servidor ejecutándose en puerto " + port);
  verificarConexion();
});