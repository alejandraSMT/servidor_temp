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
