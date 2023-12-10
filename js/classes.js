class Sprite {
  #pos;
  #img;
  #frames;
  #width;
  #height;
  #animate;
  #sprites;
  #opacity;
  #rotation;
  constructor({
    pos,
    img,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
  }) {
    this.#pos = pos;
    this.#img = new Image();
    this.#frames = { ...frames, val: 0, elapsed: 0 };
    this.#img.onload = () => {
      this.#width = this.#img.width / this.#frames.max;
      this.#height = this.#img.height;
    };
    this.#img.src = img.src;
    this.#animate = animate;
    this.#sprites = sprites;
    this.#opacity = 1;
    this.#rotation = rotation;
  }
  draw() {
    ctx.save();
    ctx.translate(
      this.#pos.x + this.#width / 2,
      this.#pos.y + this.#height / 2
    );
    ctx.rotate(this.#rotation);
    ctx.translate(
      -this.#pos.x - this.#width / 2,
      -this.#pos.y - this.#height / 2
    );
    ctx.globalAlpha = this.#opacity;
    ctx.drawImage(
      this.#img,
      this.#frames.val * this.#width,
      0,
      this.#img.width / this.#frames.max,
      this.#img.height,
      this.#pos.x,
      this.#pos.y,
      this.#img.width / this.#frames.max,
      this.#img.height
    );
    ctx.restore();
    if (this.#animate) {
      if (this.#frames.max > 1) {
        this.#frames.elapsed++;
      }
      if (this.#frames.elapsed === this.#frames.hold) {
        this.#frames.val++;
        if (this.#frames.val === this.#frames.max) {
          this.#frames.val = 0;
        }
        this.#frames.elapsed = 0;
      }
    }
  }
  get pos() {
    return this.#pos;
  }
  get posX() {
    return this.#pos.x;
  }
  get posY() {
    return this.#pos.y;
  }
  get width() {
    return this.#width;
  }
  get height() {
    return this.#height;
  }
  get sprites() {
    return this.#sprites;
  }
  set animate(v) {
    this.#animate = !!v;
  }
  set img(v) {
    this.#img = v;
  }
  get opacity() {
    return this.#opacity;
  }
  set opacity(v) {
    this.#opacity = v;
  }
  getWidth = () => this.#width;
  getHeight = () => this.#height;
  decPosX = (v) => (this.#pos.x -= v);
  incPosX = (v) => (this.#pos.x += v);
  decPosY = (v) => (this.#pos.y -= v);
  incPosY = (v) => (this.#pos.y += v);
}

class Monster extends Sprite {
  #health;
  #isEnemy;
  #name;
  #attacks;
  constructor({
    pos,
    img,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
    isEnemy = false,
    name,
    attacks = [],
  }) {
    super({
      pos,
      img,
      frames,
      sprites,
      animate,
      rotation,
    });
    this.#health = 100;
    this.#isEnemy = isEnemy;
    this.#name = name;
    this.#attacks = attacks;
  }
  get attacks() {
    return this.#attacks;
  }
  get health() {
    return this.#health;
  }
  set health(v) {
    this.#health = v;
  }
  faint = () => {
    document.querySelector("#dialog-box").innerHTML = `${this.#name} fainted!`;
    gsap.to(this.pos, {
      y: this.pos.y + 20,
    });
    gsap.to(this, {
      opacity: 0,
    });
    audio.battle.stop();
    audio.victory.play();
  };
  attack = ({ attack, recipient, renderedSprites }) => {
    document.querySelector("#dialog-box").style.display = "block";
    document.querySelector("#dialog-box").innerHTML = `${this.#name} used ${
      attack.name
    }`;
    const healthBar = this.#isEnemy ? "player-health-bar" : "enemy-health-bar";
    const rotation = this.#isEnemy ? 2.2 : 1;
    recipient.health -= attack.dmg;
    switch (attack.name) {
      case "Tackle": {
        const tl = gsap.timeline();
        const movDist = this.#isEnemy ? -20 : 20;
        tl.to(this.pos, {
          x: this.pos.x - movDist,
        })
          .to(this.pos, {
            x: this.pos.x + movDist * 2,
            duration: 0.1,
            onComplete: () => {
              /* Enemy actually gets hit. */
              audio.tackleHit.play();
              gsap.to(`#${healthBar}`, {
                width: `${recipient.health}%`,
              });
              gsap.to(recipient.pos, {
                x: recipient.posX + 10,
                yoyo: true,
                repeat: 5,
                duration: 0.08,
              });
              gsap.to(recipient, {
                opacity: 0,
                yoyo: true,
                repeat: 5,
                duration: 0.08,
              });
            },
          })
          .to(this.pos, {
            x: this.pos.x,
          });
        break;
      }
      case "Fireball": {
        audio.initFireball.play();
        const fireballImg = new Image();
        fireballImg.src = "../img/fireball.png";
        const fireball = new Sprite({
          pos: {
            x: this.posX,
            y: this.posY,
          },
          img: fireballImg,
          frames: {
            max: 4,
            hold: 10,
          },
          animate: true,
          rotation,
        });
        renderedSprites.splice(1, 0, fireball);
        gsap.to(fireball.pos, {
          x: recipient.posX,
          y: recipient.posY,
          onComplete: () => {
            audio.fireballHit.play();
            gsap.to(`#${healthBar}`, {
              width: `${recipient.health}%`,
            });
            gsap.to(recipient.pos, {
              x: recipient.posX + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08,
            });
            gsap.to(recipient, {
              opacity: 0,
              yoyo: true,
              repeat: 5,
              duration: 0.08,
            });
            renderedSprites.splice(1, 1);
          },
        });
        break;
      }
    }
  };
}

/**
  const map_zoom_level = 4;
  const tile_width = 12;
  const tile_height = 12;
  const boundary_width = tile_width * map_zoom_level;
  const boundary_height = tile_height * map_zoom_level;
 */
class Boundary {
  #pos;
  #width;
  #height;
  constructor({ pos, width, height }) {
    this.#pos = pos;
    this.#width = width;
    this.#height = height;
  }
  draw() {
    ctx.fillStyle = "rgba(255, 0, 0, 0)";
    ctx.fillRect(this.#pos.x, this.#pos.y, this.#width, this.#height);
  }
  get posX() {
    return this.#pos.x;
  }
  get posY() {
    return this.#pos.y;
  }
  get width() {
    return this.#width;
  }
  get height() {
    return this.#height;
  }
  decPosX = (v) => (this.#pos.x -= v);
  incPosX = (v) => (this.#pos.x += v);
  decPosY = (v) => (this.#pos.y -= v);
  incPosY = (v) => (this.#pos.y += v);
}
