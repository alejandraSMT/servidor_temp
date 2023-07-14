INSERT INTO "Universidad" ("nombreUniversidad")
VALUES ('Universidad Nacional de Lima'),
       ('Universidad Católica de Lima'),
       ('Universidad San Marcos'),
       ('Universidad del Pacífico'),
       ('Universidad de Lima');


INSERT INTO "Curso" ("nombreCurso")
VALUES ('Matemáticas'),
       ('Historia'),
       ('Inglés'),
       ('Programación'),
       ('Economía');

INSERT INTO "Carrera" ("nombreCarrera")
VALUES ('Ingeniería Civil'),
       ('Administración de Empresas'),
       ('Medicina'),
       ('Derecho'),
       ('Arquitectura');


INSERT INTO "Rangos" ("horaInicio", "horaFin")
VALUES ('08:00', '09:00'),
       ('09:00', '10:00'),
       ('10:00', '11:00'),
       ('11:00', '12:00'),
       ('12:00', '13:00'),
       ('13:00', '14:00'),
       ('14:00', '15:00'),
       ('15:00', '16:00'),
       ('16:00', '17:00'),
       ('17:00', '18:00'),
       ('18:00', '19:00'),
       ('19:00', '20:00'),
       ('20:00', '21:00');


INSERT INTO "UniCarrera" ("universidadId", "carreraId")
VALUES (1, 1),
       (1, 2),
       (1, 4),
       (1, 5),
       (2, 4),
       (2, 1),
       (2, 2),
       (3, 4),
       (4, 2),
       (4, 4),
       (5, 1),
       (5, 2),
       (5, 3),
       (5, 4),
       (5, 5);

INSERT INTO "CarreraCurso" ("carreraId", "cursoId")
VALUES (1, 1),
       (1, 3),
       (2, 1),
       (2, 5),
       (2, 4),
       (3, 3),
       (4, 2),
       (4, 3),
       (5, 1),
       (5, 4);

INSERT INTO "TipoDocumento" ("nombreCategoria")
VALUES('DNI'),
      ('Carné de extranjería'),
      ('Pasaporte')
