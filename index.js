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


// Obtener la información completa del profesor personal y sus cursos
app.get('/obtener-profesor-total/:usuarioId', async function(req, res) {
  const usuarioId = req.params.usuarioId;

  try {
    const usuario = await Profesor.findOne({
      where: {
        usuarioId: usuarioId,
      },
      include: [
        {
          model: Usuario,
          attributes: ["nombreCompleto", "correo", "apellidos", "tituloPerfil", "presenPerfil", "imgPerfil"],
          include: {
            model: UsuarioCurso,
            include: {
              model: Curso,
              attributes: ["nombreCurso"]
            }
          }
        }
      ],
      attributes: ["id"]
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


//ELIMINAR CITA POR ID
app.post('/delete-cita/:citaId', async function(req, res) {
  const citaId = req.params.citaId;

  try {
    // Busca el usuario a eliminar
    const cita = await Cita.findOne({
      where: {
        id: citaId,
        status: 0 //pendiente es 0, 1 es pasada. Calificacion del 1 al 5
      }
    });

    if (!cita) {
      return res.status(404).json({ error: "Cita no disponible para cancelar" });
    }

    // Elimina el usuario de la base de datos
    await cita.destroy();

    res.send({ message: "Cita eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar la cita" });
  }
});


//ACTUALIZAR FOTO DE USUARIO CON BUSQUEDA DE SU ID SUBIENDO FOTO EN BYTES (NO FUNCIONO PERO SE IMPLEMENTO/INTENTO)
import fs from 'fs';

app.post('/update-foto/:usuarioId', async function(req, res) {
  const usuarioId = req.params.usuarioId;

  try {
    const usuario = await Usuario.findOne({
      where: {
        id: usuarioId,
      },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
    }

    // Leer el archivo de imagen y convertirlo en un búfer de bytes
    const fotoBuffer = fs.readFileSync(req.file.path);

    // Actualizar los valores del usuario con el búfer de bytes de la imagen
    usuario.imgPerfil = fotoBuffer;

    // Guardar los cambios en la base de datos
    await usuario.save();

    // Eliminar el archivo subido temporalmente
    fs.unlinkSync(req.file.path);

    res.send(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
});


//ACTUALIZAR FOTO DE USUARIO CON BUSQUEDA DE SU ID CON SU URL

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

app.listen(port, function () {
  console.log("Servidor ejecutándose en puerto " + port);
  verificarConexion();
});
