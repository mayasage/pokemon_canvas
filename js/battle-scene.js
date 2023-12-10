/* Load Battle Background */
const battleBgImg = new Image();
battleBgImg.src = "../img/battleBackground.png";
const battleBg = new Sprite({
  pos: {
    x: 0,
    y: 0,
  },
  img: battleBgImg,
});

/* Global Vars */
let draggle;
let emby;
let renderedSprites;
let queue;

/* Animate */
const initBattle = () => {
  document.querySelector("#user-interface").style.display = "block";
  document.querySelector("#dialog-box").style.display = "none";
  document.querySelector("#enemy-health-bar").style.width = "100%";
  document.querySelector("#player-health-bar").style.width = "100%";
  document.querySelector("#attacks-box").innerHTML = "";
  draggle = new Monster(monsters.Draggle);
  emby = new Monster(monsters.Emby);
  renderedSprites = [draggle, emby];
  queue = [];
  /* Populate Attacks */
  emby.attacks.forEach((attack) => {
    const button = document.createElement("button");
    button.innerHTML = attack.name;
    document.querySelector("#attacks-box").append(button);
  });
  /* Attack Buttons */
  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const selectedAttacks = attacks[e.currentTarget.innerHTML];
      emby.attack({
        attack: selectedAttacks,
        recipient: draggle,
        renderedSprites,
      });
      if (draggle.health <= 0) {
        queue.push(() => {
          draggle.faint();
        });
        queue.push(() => {
          gsap.to("#overlapping-div", {
            opacity: 1,
            onComplete: () => {
              cancelAnimationFrame(battleAnimationFrameId);
              animate();
              document.querySelector("#user-interface").style.display = "none";
              gsap.to("#overlapping-div", {
                opacity: 0,
              });
            },
          });
          battle.initiated = false;
          audio.map.play();
        });
      } else {
        const randomAttack =
          draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)];
        queue.push(() => {
          draggle.attack({
            attack: randomAttack,
            recipient: emby,
            renderedSprites,
          });
          if (emby.health <= 0) {
            queue.push(() => {
              emby.faint();
            });
            queue.push(() => {
              gsap.to("#overlapping-div", {
                opacity: 1,
                onComplete: () => {
                  cancelAnimationFrame(battleAnimationFrameId);
                  animate();
                  document.querySelector("#user-interface").style.display =
                    "none";
                  gsap.to("#overlapping-div", {
                    opacity: 0,
                  });
                },
              });
              battle.initiated = false;
              audio.map.play();
            });
          }
        });
      }
    });
    button.addEventListener("mouseenter", (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML];
      document.querySelector("#attack-type").innerHTML = selectedAttack.type;
      document.querySelector("#attack-type").style.color = selectedAttack.color;
    });
  });
};
let battleAnimationFrameId;
const animateBattle = () => {
  battleAnimationFrameId = window.requestAnimationFrame(animateBattle);
  battleBg.draw();
  renderedSprites.forEach((sprite) => sprite.draw());
};

/* Event Listeners */
document.querySelector("#dialog-box").addEventListener("click", (e) => {
  if (queue.length > 0) {
    queue[0]();
    queue.shift();
  } else {
    e.currentTarget.style.display = "none";
  }
});

animate();
// initBattle();
// animateBattle();
