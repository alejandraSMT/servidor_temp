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

//endpoint para modificar la universidad
app.get("/cambiar-universidad/:usuarioId/:universidadId", async function (req, res) {
  const usuarioId = req.params.usuarioId;
  const universidad = req.params.universidadId;
  const usuarioExistente = await Usuario.findOne({
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
  const usuarioExistente = await Usuario.findOne({
    where: {
      id: usuarioId
    }
  });
  usuarioExistente.carreraId = parseInt(carrera);
  await usuarioExistente.save();
  res.send(usuarioExistente);
})

app.post("/cambiar-password/:usuarioId/:cont1/:cont2/:cont3", async function (req, res) {
  const usuarioId = req.params.usuarioId;
  const cont1 = req.params.cont1;
  const cont2 = req.params.cont2;
  const cont3 = req.params.cont3;
  const usuarioExistente = await Usuario.findOne({
    where: {
      id: usuarioId
    }
  });
  // Verificar si cont1 es igual a usuarioExistente.password
  if (cont1 === usuarioExistente.password) {
    // Verificar si cont2 y cont3 son iguales
    if (cont2 === cont3) {
      // Si se cumple la condición, establecer usuarioExistente.password a cont2
      usuarioExistente.password = cont2;
    } else {
      // Si cont2 y cont3 no son iguales, enviar un mensaje de error al cliente
      return res.status(400).send({ error: "cont2 y cont3 deben ser iguales" });
    }
  } else {
    // Si cont1 no es igual a usuarioExistente.password, enviar un mensaje de error al cliente
    return res.status(400).send("cont1 no coincide con la contraseña actual");
  }
  await usuarioExistente.save();
  res.send(usuarioExistente);
})

app.post('/cambiar-usuario/:usuarioId/:nombreUsuario', async function (req, res) {
  const usuarioId = req.params.usuarioId
  const nombreUsuario = req.params.nombreUsuario

  const usuarioExistente = await Usuario.findOne({
    where: {
      id: usuarioId
    }
  })

  if (!usuarioExistente) {
    return res.status(404).json("Usuario no encontrado")
  }

  usuarioExistente.nombreUsuario = nombreUsuario
  await usuarioExistente.save()
  res.send(usuarioExistente)

})

app.post('/cambiar-presentacion/:usuarioId/:tituloPerfil/:presenPerfil', async function (req, res) {

  try {
    const usuarioId = req.params.usuarioId
    const tituloPerfil = req.params.tituloPerfil
    const presenPerfil = req.params.presenPerfil

    const usuarioExistente = await Usuario.findOne({
      where: {
        id: usuarioId
      }
    })

    if (!usuarioExistente) {
      return res.status(400).json("Usuario no encontrado")
    }

    usuarioExistente.tituloPerfil = tituloPerfil
    usuarioExistente.presenPerfil = presenPerfil
    await usuarioExistente.save()
    res.send(usuarioExistente)
  } catch (e) {
    console.log(e)
  }

})


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
      return res.status(404).json('Usuario no encontrado');
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

app.get("/obtener-datos-info-personal/:usuarioId", async function (req, res) { //para zona superior de perfil
  const usuarioId = req.params.usuarioId;
  const usuario = await Usuario.findOne({
    where: {
      id: usuarioId
    },
    include: [
      {
        model: Universidad
      },
      {
        model: Carrera
      }
    ]
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

    //res.send(nuevaRelacionUsuarioCurso)
    return res.status(200).json({
      message: "Relación UsuarioCurso creada exitosamente.",
      respuesta: JSON.stringify(nuevaRelacionUsuarioCurso)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

// ENDPOINTS POST
app.post("/datos-info-personal/:usuarioId/:nombres/:apellidos/:tipodoc/:numero", async function (req, res) {
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

app.get("/enviar-datos-presentacion/:usuarioId/:titulo/:presentacion", async function (req, res) {
  const usuarioId = req.params.usuarioId;
  const titulo = req.params.titulo;
  const presentacion = req.params.presentacion;
  const usuarioExistente = await Usuario.findOne({
    where: {
      id: usuarioId
    }
  });
  usuarioExistente.tituloPerfil = titulo;
  usuarioExistente.presenPerfil = presentacion;
  await usuarioExistente.save();
  res.send("usuarioExistente");
})

app.listen(port, function () {
  console.log("Servidor ejecutándose en puerto " + port);
  verificarConexion();
});
