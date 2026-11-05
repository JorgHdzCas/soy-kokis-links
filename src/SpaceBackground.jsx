
import { useEffect, useRef } from "react";

export default function SpaceBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;
    let animationId;
    let lastTime = 0;
    let asteroidTimer = 0;
    let shotTimer = 0;
    let directionTimer = 0;

    const stars = [];
    const asteroids = [];
    const bullets = [];
    const particles = [];

    const ship = {
      x: 0,
      y: 0,
      targetX: 0,
      speed: 65,
      direction: 1,
      minX: 30,
      maxX: 100,
    };

    // Configurar pantalla
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ship.minX = Math.min(30, width / 2);
      ship.maxX = Math.max(ship.minX, width - 30);

      ship.x = Math.max(
        ship.minX,
        Math.min(ship.x || width / 2, ship.maxX)
      );

      ship.y = height * 0.82;
      ship.targetX = ship.x;

      stars.length = 0;

      const starCount = Math.min(
        180,
        Math.floor((width * height) / 6500)
      );

      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() > 0.8 ? 2 : 1,
          speed: 8 + Math.random() * 18,
          alpha: 0.25 + Math.random() * 0.65,
        });
      }
    };

    // Elegir un nuevo destino para la nave
    const chooseShipDirection = () => {
      const margin = Math.min(45, width * 0.08);
      const min = margin;
      const max = Math.max(min, width - margin);

      ship.targetX = min + Math.random() * (max - min);

      ship.direction = ship.targetX > ship.x ? 1 : -1;

      // Velocidad ligeramente variable
      ship.speed = 45 + Math.random() * 45;
    };

    // Crear asteroides
    const createAsteroid = () => {
      const size = 12 + Math.random() * 17;

      asteroids.push({
        x: Math.random() * width,
        y: -30,
        size,
        speed: 25 + Math.random() * 35,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 1.2,
      });
    };

    // Crear explosiones
    const explode = (x, y) => {
      for (let i = 0; i < 9; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 65;

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.45 + Math.random() * 0.35,
          maxLife: 0.8,
          size: 2 + Math.random() * 3,
        });
      }
    };

    // Dibujar nave pixelada
    const drawShip = () => {
      const x = ship.x;
      const y = ship.y;

      // Cuerpo
      ctx.fillStyle = "#8b5cf6";
      ctx.fillRect(x - 4, y - 17, 8, 6);
      ctx.fillRect(x - 9, y - 10, 18, 7);
      ctx.fillRect(x - 14, y - 3, 28, 7);
      ctx.fillRect(x - 7, y + 4, 14, 5);

      // Cabina
      ctx.fillStyle = "#67e8f9";
      ctx.fillRect(x - 3, y - 11, 6, 5);

      // Motor
      ctx.fillStyle = "#f0abfc";
      ctx.fillRect(x - 3, y + 9, 6, 7);
    };

    // Dibujar asteroides
    const drawAsteroid = (asteroid) => {
      ctx.save();
      ctx.translate(asteroid.x, asteroid.y);
      ctx.rotate(asteroid.rotation);

      ctx.fillStyle = "#77718e";
      ctx.fillRect(
        -asteroid.size * 0.5,
        -asteroid.size * 0.5,
        asteroid.size,
        asteroid.size
      );

      ctx.fillStyle = "#a39bb8";
      ctx.fillRect(
        -asteroid.size * 0.3,
        -asteroid.size * 0.3,
        asteroid.size * 0.35,
        asteroid.size * 0.25
      );

      ctx.fillStyle = "#4c4563";
      ctx.fillRect(
        asteroid.size * 0.15,
        asteroid.size * 0.15,
        asteroid.size * 0.25,
        asteroid.size * 0.25
      );

      ctx.restore();
    };

    // Animación principal
    const draw = (time) => {
      const dt = Math.min((time - lastTime) / 1000 || 0, 0.04);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Movimiento de estrellas
      stars.forEach((star) => {
        star.y += star.speed * dt;

        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
        }

        ctx.globalAlpha = star.alpha;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      ctx.globalAlpha = 1;

      // Movimiento suave y aleatorio de la nave
      directionTimer += dt;

      if (
        directionTimer > 2.5 + Math.random() * 2 ||
        Math.abs(ship.targetX - ship.x) < 8
      ) {
        chooseShipDirection();
        directionTimer = 0;
      }

      // Interpolación para movimiento fluido
      const distance = ship.targetX - ship.x;
      const movement = ship.speed * dt;

      if (Math.abs(distance) <= movement) {
        ship.x = ship.targetX;
      } else {
        ship.x += Math.sign(distance) * movement;
      }

      // Limitar movimiento dentro de la pantalla
      ship.x = Math.max(
        ship.minX,
        Math.min(ship.x, ship.maxX)
      );

      // Mantener la nave en la parte inferior
      ship.y = height * 0.82;

      // Crear asteroides
      asteroidTimer += dt;

      if (asteroidTimer > 1.15) {
        createAsteroid();
        asteroidTimer = 0;
      }

      // Disparos automáticos desde la posición actual de la nave
      shotTimer += dt;

      if (shotTimer > 0.32) {
        bullets.push({
          x: ship.x,
          y: ship.y - 18,
          speed: 330,
        });

        shotTimer = 0;
      }

      // Actualizar disparos
      bullets.forEach((bullet) => {
        bullet.y -= bullet.speed * dt;

        ctx.fillStyle = "#67e8f9";
        ctx.fillRect(bullet.x - 2, bullet.y, 4, 10);
      });

      // Actualizar asteroides
      asteroids.forEach((asteroid) => {
        asteroid.y += asteroid.speed * dt;
        asteroid.rotation += asteroid.spin * dt;

        drawAsteroid(asteroid);
      });

      // Detectar colisiones
      for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        let destroyed = false;

        for (let j = bullets.length - 1; j >= 0; j--) {
          const bullet = bullets[j];

          const distance = Math.hypot(
            asteroid.x - bullet.x,
            asteroid.y - bullet.y
          );

          if (distance < asteroid.size * 0.65) {
            explode(asteroid.x, asteroid.y);

            asteroids.splice(i, 1);
            bullets.splice(j, 1);

            destroyed = true;
            break;
          }
        }

        if (!destroyed && asteroid.y > height + 40) {
          asteroids.splice(i, 1);
        }
      }

      // Partículas de explosiones
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];

        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.life -= dt;

        ctx.globalAlpha = Math.max(
          0,
          particle.life / particle.maxLife
        );

        ctx.fillStyle = "#c4b5fd";
        ctx.fillRect(
          particle.x,
          particle.y,
          particle.size,
          particle.size
        );

        if (particle.life <= 0) {
          particles.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1;

      // Limpiar disparos fuera de pantalla
      for (let i = bullets.length - 1; i >= 0; i--) {
        if (bullets[i].y < -20) {
          bullets.splice(i, 1);
        }
      }

      // Dibujar nave
      drawShip();

      animationId = requestAnimationFrame(draw);
    };

    resize();

    // Elegir primer destino
    chooseShipDirection();

    window.addEventListener("resize", resize);

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="space-background"
      aria-hidden="true"
    />
  );
}
