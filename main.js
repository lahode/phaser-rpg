/**
 * Configuration de Phaser
 */
const config = {
  type: Phaser.AUTO,        // Rendu graphique Phaser.CANVAS, Phaser.WEBGL ou Phaser.AUTO
  width: 800,               // Largeur de l'écran
  height: 600,              // Hauteur de l'écran
  parent: "game-container", // ID de la div HTML parente (défini dans index.html)
  pixelArt: true,           // Active le mode "Pixel Art" lorsqu'on zoom sur le jeu pour éviter que les images deviennent flous
  physics: {                // Obligatoire pour la création d'un joueur
    default: "arcade",      // Type de physique appliquée sur le jeu
    arcade: {
      gravity: { y: 0 }     // Détermine s'il y a une gravité à appliquer
    }
  },
  scene: {
    preload: preload, // Méthode appelée avant la création (chargement) du jeu
    create: create,   // Méthode appelée à la création du jeu
    update: update    // Méthode exécutée lorsque lors de la mise à jour des événements du jeu
  }
};

// Créer l'objet Phaser.Game avec la configuration en entrée.
const game = new Phaser.Game(config);

// Définit les variables qui vont être utilisés dans les fonction preload, create, update.
let player;
let cursors;

/**
 * Chargement des éléments graphiques avant la création du jeu.
 */
function preload() {
  // Chargement du fichier map.png
  this.load.image("tiles", "assets/map.png");

  // Chargement du fichier map.json (créé à l'aide de l'application "Tiled")
  this.load.tilemapTiledJSON("map", "assets/map.json");

  // Chargement des images du joueur (immobile: bas, gauche, droite, haut)
  this.load.spritesheet('stand', 'assets/stand.png', { frameWidth: 32, frameHeight: 32 } );

  // Chargement des images du joueur pour l'anumation à gauche.
  this.load.spritesheet('walk_left', 'assets/walk_left.png', { frameWidth: 32, frameHeight: 32 } );

  // Chargement des images du joueur pour l'anumation à droite.
  this.load.spritesheet('walk_right', 'assets/walk_right.png', { frameWidth: 32, frameHeight: 32 } );

  // Chargement des images du joueur pour l'anumation en haut.
  this.load.spritesheet('walk_up', 'assets/walk_up.png', { frameWidth: 32, frameHeight: 32 } );

  // Chargement des images du joueur pour l'anumation en bas.
  this.load.spritesheet('walk_down', 'assets/walk_down.png', { frameWidth: 32, frameHeight: 32 } );
}

/**
 * Création avant la création du jeu.
 */
function create() {
  // Récupère le tilemap.
  const map = this.make.tilemap({ key: "map" });

  // Récupère le tileset (nom du tilset défini dans le fichier JSON)
  const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

  // Récupère les différentes calques (layers) présentent dans le tileset
  const belowLayer = map.createLayer("Below Player", tileset, 0, 0);
  const worldLayer = map.createLayer("World", tileset, 0, 0);
  const aboveLayer = map.createLayer("Above Player", tileset, 0, 0);

  // Permet de mettre ce calque plus en avant (ex. toits des maisons).
  aboveLayer.setDepth(10);

  // Récupère la position du joueur qui a été défini sur map.json de "Tiled"
  const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");

  // Crée le joueur.
  player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'stand');

  // Ajoute les collision définie dans map.json sur le joueur.
  worldLayer.setCollisionByProperty({ collides: true });
  this.physics.add.collider(player, worldLayer);

  // Ajoute la gestion du clavier.
  cursors = this.input.keyboard.createCursorKeys();

  // Création de l'animation marche à gauche
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('walk_left', { start: 0, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  // Création de l'animation marche à droite
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('walk_right', { start: 0, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  // Création de l'animation marche en haut
  this.anims.create({
    key: 'up',
    frames: this.anims.generateFrameNumbers('walk_up', { start: 0, end: 7 }),
    frameRate: 10,
    repeat: -1
  });

  // Création de l'animation marche en bas
  this.anims.create({
    key: 'down',
    frames: this.anims.generateFrameNumbers('walk_down', { start: 0, end: 7 }),
    frameRate: 10,
    repeat: -1
  });

  // Création de la camera
  const camera = this.cameras.main;
  camera.startFollow(player); // La caméra suit le joueur.
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
}

/**
 * Mis à jour à chaque raffraichissement du jeu.
 */
function update(time, delta) {

  // Détermine la vitesse de mouvement.
  const speed = 175;

  // Récupère la vélocité précédente du joueur.
  const prevVelocity = player.body.velocity.clone();

  // Arrête tous les mouvements.
  player.body.setVelocity(0);

  // Change les animation lors des mouvements du personnage au clavier.
  if (cursors.left.isDown) {
    player.anims.play("left", true);   // Affiche l'animation "left"
    player.body.setVelocityX(-speed);  // Bouge le joueur à gauche.
  } else if (cursors.right.isDown) {
    player.anims.play("right", true);  // Affiche l'animation "right"
    player.body.setVelocityX(speed);   // Bouge le joueur à droite.
  } else if (cursors.up.isDown) {
    player.anims.play("up", true);     // Affiche l'animation "up"
    player.body.setVelocityY(-speed);  // Bouge le joueur en haut.
  } else if (cursors.down.isDown) {
    player.anims.play("down", true);   // Affiche l'animation "down"
    player.body.setVelocityY(speed);   // Bouge le joueur en bas.
  } else {
    
    // Affiche la position d'arrêt (gauche, droite, haut, bas) lorsqu'aucune touche n'est appuyée.
    if (prevVelocity.x < 0) player.setTexture("stand", 1);
    else if (prevVelocity.x > 0) player.setTexture("stand", 2);
    else if (prevVelocity.y < 0) player.setTexture("stand", 3);
    else if (prevVelocity.y > 0) player.setTexture("stand", 0);

    // Arrête l'animation.
    player.anims.stop();
  }

  // Normalize and scale the velocity so that player can't move faster along a diagonal
  player.body.velocity.normalize().scale(speed);

}