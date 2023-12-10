"use strict";

/* Global Variables */
const mapOffset = {
  x: -735,
  y: -620,
};

/* Create Collision Map */
/**
 *  Map width = 70
 *  Map height = 40
 */
const collisionsMap = [];
for (let i = 0; i < collisionsData.length; i += 70) {
  collisionsMap.push(collisionsData.slice(i, i + 70));
}
/* Create BattleZone Map */
/**
 *  Map width = 70
 *  Map height = 40
 */
const battleZonesMap = [];
for (let i = 0; i < battleZonesData.length; i += 70) {
  battleZonesMap.push(battleZonesData.slice(i, i + 70));
}

/* Create Canvas. */
const canvas = document.querySelector("canvas");
canvas.width = 1024;
canvas.height = 576;

/* Create Context. */
const ctx = canvas.getContext("2d");
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

/* Play Audio */
let clicked = false;
addEventListener("click", () => {
  if (!clicked) {
    audio.map.play();
    clicked = true;
  }
});

/* Load Images */
const map = new Image();
map.src = "../img/Pellet Town.png";
const bg = new Sprite({
  pos: {
    x: mapOffset.x,
    y: mapOffset.y,
  },
  img: map,
});
const mapFg = new Image();
mapFg.src = "../img/Foreground Objects.png";
const fg = new Sprite({
  pos: {
    x: mapOffset.x,
    y: mapOffset.y,
  },
  img: mapFg,
});
const playerUpImg = new Image();
playerUpImg.src = "../img/playerUp.png";
const playerDownImg = new Image();
playerDownImg.src = "../img/playerDown.png";
const playerLeftImg = new Image();
playerLeftImg.src = "../img/playerLeft.png";
const playerRightImg = new Image();
playerRightImg.src = "../img/playerRight.png";
const playerWidth = 192;
const playerHeight = 68;
const maxPlayerFrames = 4;
const player = new Sprite({
  pos: {
    x: canvas.width / 2 - playerWidth / maxPlayerFrames / 2,
    y: canvas.height / 2 - playerHeight / 2,
  },
  img: playerDownImg,
  frames: {
    max: maxPlayerFrames,
    hold: 10,
  },
  sprites: {
    up: playerUpImg,
    down: playerDownImg,
    left: playerLeftImg,
    right: playerRightImg,
  },
});

/* Create Boundaries */
const boundaries = [];
collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025) {
      boundaries.push(
        new Boundary({
          pos: {
            x: j * 48 + mapOffset.x,
            y: i * 48 + mapOffset.y,
          },
          width: 48,
          height: 48,
        })
      );
    }
  });
});
/* Create Battle Zones */
const battleZones = [];
battleZonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025) {
      battleZones.push(
        new Boundary({
          pos: {
            x: j * 48 + mapOffset.x,
            y: i * 48 + mapOffset.y,
          },
          width: 48,
          height: 48,
        })
      );
    }
  });
});

/* Player Movement */
const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};
let lastKey = "";
window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "w": {
      keys.w.pressed = true;
      lastKey = "w";
      break;
    }
    case "a": {
      keys.a.pressed = true;
      lastKey = "a";
      break;
    }
    case "s": {
      keys.s.pressed = true;
      lastKey = "s";
      break;
    }
    case "d": {
      keys.d.pressed = true;
      lastKey = "d";
      break;
    }
  }
});
window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "w": {
      keys.w.pressed = false;
      break;
    }
    case "a": {
      keys.a.pressed = false;
      break;
    }
    case "s": {
      keys.s.pressed = false;
      break;
    }
    case "d": {
      keys.d.pressed = false;
      break;
    }
  }
});

/* Animate */
const movables = [bg, fg, ...boundaries, ...battleZones];
const rectangularCollision = ({ r1, r2 }) =>
  r1.posX + r1.width >= r2.posX &&
  r1.posX <= r2.posX + r2.width &&
  r1.posY + r1.height >= r2.posY &&
  r1.posY <= r2.posY + r2.height;
const battle = {
  initiated: false,
};
const animate = () => {
  const newBoundary = (x, y) =>
    new Boundary({
      pos: {
        x,
        y,
      },
      width: 48,
      height: 48,
    });
  const animationId = window.requestAnimationFrame(animate);
  bg.draw();
  boundaries.forEach((boundary) => {
    boundary.draw();
  });
  battleZones.forEach((battleZone) => {
    battleZone.draw();
  });
  player.draw();
  fg.draw();
  let moving = true;
  player.animate = false;
  if (!battle.initiated) {
    if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
      for (const battleZone of battleZones) {
        const px1 = player.posX;
        const px2 = px1 + player.width;
        const bzx1 = battleZone.posX;
        const bzx2 = bzx1 + battleZone.width;
        const py1 = player.posY;
        const py2 = py1 + player.height;
        const bzy1 = battleZone.posY;
        const bzy2 = bzy1 + battleZone.height;
        const overlappingWidth = Math.min(px2, bzx2) - Math.max(px1, bzx1);
        const overlappingHeight = Math.min(py2, bzy2) - Math.max(py1, bzy1);
        const overlappingArea = overlappingHeight * overlappingWidth;
        if (
          rectangularCollision({
            r1: player,
            r2: battleZone,
          }) &&
          overlappingArea > (player.width * player.height) / 2 &&
          Math.random() < 0.03
        ) {
          audio.map.stop();
          audio.initBattle.play();
          audio.battle.play();
          battle.initiated = true;
          window.cancelAnimationFrame(animationId);
          gsap.to("#overlapping-div", {
            opacity: 1,
            repeat: 4,
            yoyo: true,
            duration: 0.3,
            onComplete: () => {
              gsap.to("#overlapping-div", {
                opacity: 1,
                duration: 0.2,
                onComplete: () => {
                  initBattle();
                  animateBattle();
                  gsap.to("#overlapping-div", {
                    opacity: 0,
                    duration: 0.2,
                  });
                },
              });
            },
          });
          break;
        }
      }
    }
    if (keys.w.pressed && lastKey === "w") {
      player.img = player.sprites.up;
      player.animate = true;
      for (const boundary of boundaries) {
        const { posX, posY } = boundary;
        if (
          rectangularCollision({
            r1: player,
            r2: newBoundary(posX, posY + 3),
          })
        ) {
          moving = false;
          break;
        }
      }
      if (moving) {
        movables.forEach((movable) => movable.incPosY(3));
      }
    } else if (keys.a.pressed && lastKey === "a") {
      player.img = player.sprites.left;
      player.animate = true;
      for (const boundary of boundaries) {
        const { posX, posY } = boundary;
        if (
          rectangularCollision({
            r1: player,
            r2: newBoundary(posX + 3, posY),
          })
        ) {
          moving = false;
          break;
        }
      }
      if (moving) {
        movables.forEach((movable) => movable.incPosX(3));
      }
    } else if (keys.s.pressed && lastKey === "s") {
      player.img = player.sprites.down;
      player.animate = true;
      for (const boundary of boundaries) {
        const { posX, posY } = boundary;
        if (
          rectangularCollision({
            r1: player,
            r2: newBoundary(posX, posY - 3),
          })
        ) {
          moving = false;
          break;
        }
      }
      if (moving) {
        movables.forEach((movable) => movable.decPosY(3));
      }
    } else if (keys.d.pressed && lastKey === "d") {
      player.img = player.sprites.right;
      player.animate = true;
      for (const boundary of boundaries) {
        const { posX, posY } = boundary;
        if (
          rectangularCollision({
            r1: player,
            r2: newBoundary(posX - 3, posY),
          })
        ) {
          moving = false;
          break;
        }
      }
      if (moving) {
        movables.forEach((movable) => movable.decPosX(3));
      }
    }
  }
};
