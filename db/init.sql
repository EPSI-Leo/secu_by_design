-- Base, utilisateur et table demandées
CREATE DATABASE IF NOT EXISTS testvault;
CREATE USER IF NOT EXISTS 'testvault'@'%' IDENTIFIED BY 'changeme';
GRANT ALL PRIVILEGES ON testvault.* TO 'testvault'@'%';
FLUSH PRIVILEGES;

USE testvault;
CREATE TABLE IF NOT EXISTS livre(
  id    INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(255) NOT NULL
);

INSERT INTO livre(titre) VALUES
  ('Le Comte de Monte-Cristo'),
  ('Les Misérables'),
  ('Voyage au centre de la Terre');
