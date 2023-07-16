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


// Obtener la información completa del profesor personal y sus cursos
app.get('/obtener-profesor-total/:usuarioId', async function(req, res) {
  const usuarioId = req.params.usuarioId;

  try {
    const usuario = await Usuario.findOne({
      where: {
        id: usuarioId,
        rol: "1"
      },
      attributes: ["nombreCompleto", "correo", "apellidos", "tituloPerfil", "presenPerfil", "imgPerfil"],
      include: {
        model: UsuarioCurso,
        include: {
          model: Curso,
          attributes: ["nombreCurso"]
        }
      }
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



app.get("/", function (req, res) {
  res.send("Se conectó correctamente");
  verificarConexion();
});

/* solo son ejemplo de un endpoint basico

app.get("/obtener-cursos", async (req, res) => {
  try {
    const cursos = await Curso.findAll();
    res.json(cursos);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener la lista de cursos.");
  }
});

app.get("/obtener-usuarios", async(req,res)=>{
  try{
    const usuarios = await Usuario.findAll();
    res.json(usuarios);
  } catch ( error){
    console.error(error);
    res.status(500).send("Error al obtener la lista de usuarios");
  }
});
*/



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
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    // Elimina el usuario de la base de datos
    await cita.destroy();

    res.send({ message: "Cita eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar la cita" });
  }
});


//ACTUALIZAR FOTO DE USUARIO CON BUSQUEDA DE SU ID
app.post('/update-foto/:usuarioId', async function(req, res) {
  const usuarioId = req.params.usuarioId;
  
  try {
    const usuario = await Usuario.findOne({
      where: {
        id: usuarioId,
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Actualiza los valores del usuario
    
    usuario.imgPerfil = "Holaa";

    // Guarda los cambios en la base de datos
    await usuario.save();

    res.send(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el usuario" });
  }
});


/*
//OBTENER LOS CURSOS DE LOS PROFESORES BUSCANDOLO POR SU ID Y TENIENDO COMO CONDICION SU ROL
app.get('/obtener-cursos-profesor/:usuarioId', async function(req, res) {
  const usuarioId = req.params.usuarioId;

  try {
    const usuario = await Usuario.findOne({
      where: {
        id: usuarioId,
        rol: "1" //profesor es 1
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }

    const usuCurso = await UsuarioCurso.findAll({
      where: {
        usuarioId: usuario.id
      }
    });

    const cursoIds = usuCurso.map(uc => uc.cursoId);

    const cursos = await Curso.findAll({
      where: {
        id: cursoIds
      },
      attributes: ["nombreCurso"]
    });

    res.send(cursos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los cursos del profesor" });
  }
});
*/

/*
//OBTENER LA INFORMACION DEL PROFESOR TENIENDO EN CUENTA SU ID Y QUE TENIENDO COMO CONDICION SU ROL
app.get('/obtener-profesor/:usuarioId', async function(req, res) {
  const usuarioId = req.params.usuarioId;

  try {
    //busca primero profesor y trae sus datos
    const usuario = await Usuario.findOne({
      where: {
        id: usuarioId,
        rol: "1"
      },
      attributes: ["nombres", "correo", "apellidos", "tituloPerfil", "presenPerfil", "imgPerfil"],
      
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
*/

app.listen(port, function () {
  console.log("Servidor ejecutándose en puerto " + port);
  verificarConexion();
});