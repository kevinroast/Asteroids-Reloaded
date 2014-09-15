/**
 * Particle emitter effect actor class.
 * 
 * A simple particle emitter, that does not recycle particles, but sets itself as expired() once
 * all child particles have expired.
 * 
 * Requires a function known as the emitter that is called per particle generated.
 * 
 * @namespace Asteroids
 * @class Asteroids.Particles
 */
(function()
{
   /**
    * Constructor
    * 
    * @param p {Vector} Emitter position
    * @param v {Vector} Emitter velocity
    * @param count {Integer} Number of particles
    * @param fnEmitter {Function} Emitter function to call per particle generated
    */
   Asteroids.Particles = function(p, v, count, fnEmitter)
   {
      Asteroids.Particles.superclass.constructor.call(this, p, v);
      
      // generate particles based on the supplied emitter function
      this.particles = new Array(count);
      for (var i=0; i<count; i++)
      {
         this.particles[i] = fnEmitter.call(this, i);
      }
      
      return this;
   };
   
   extend(Asteroids.Particles, Game.Actor,
   {
      particles: null,
      
      /**
       * Particle effect rendering method
       * 
       * @param ctx {object} Canvas rendering context
       */
      onRender: function onRender(ctx)
      {
         ctx.save();
         ctx.shadowBlur = 0;
         ctx.globalCompositeOperation = "lighter";
         for (var i=0, particle; i<this.particles.length; i++)
         {
            particle = this.particles[i];
            
            // update particle and test for lifespan
            if (particle.update())
            {
               ctx.save();
               particle.render(ctx);
               ctx.restore();
            }
            else
            {
               // particle no longer alive, remove from list
               this.particles.splice(i, 1);
            }
         }
         ctx.restore();
      },
      
      expired: function expired()
      {
         return (this.particles.length === 0);
      }
   });
})();


/**
 * Default Asteroids Particle structure.
 * Currently supports three particle types; point, vector line and smudge.
 */
function AsteroidsParticle(position, vector, size, type, lifespan, fadelength, colour)
{
   this.particleStart = GameHandler.frameStart;
   this.position = position;
   this.vector = vector;
   this.size = size;
   this.type = type;
   this.lifespan = lifespan;
   this.fadelength = fadelength;
   this.colour = colour ? colour : Asteroids.Colours.PARTICLE; // default colour if none set
   // randomize rotation speed and angle for line particle
   if (type === 1)
   {
      this.rotate = Rnd() * TWOPI;
      this.rotationv = (Rnd() - 0.5) * 0.5;
   }
   
   /**
    * Helper to return a value multiplied by the ratio of the remaining lifespan
    * 
    * @param val     value to apply to the ratio of remaining lifespan
    * @param offset  offset at which to begin applying the ratio
    */
   this.fadeValue = function(val, offset)
   {
      var rem = this.lifespan - (GameHandler.frameStart - this.particleStart),
          result = val;
      if (rem < offset)
      {
         result = (val / offset) * rem;
         // this is not a simple counter - so we need to crop the value
         // as the time between frames is not determinate
         if (result < 0) result = 0;
         else if (result > val) result = val;
      }
      return result;
   };
   
   this.update = function()
   {
      this.position.add(this.vector);
      return !(GameHandler.frameStart - this.particleStart > this.lifespan);
   };
   
   this.render = function(ctx)
   {
      ctx.globalAlpha = this.fadeValue(1.0, this.fadelength);
      switch (this.type)
      {
         case 0:  // point (prerendered image)
            ctx.translate(this.position.x, this.position.y);
            ctx.drawImage(
               GameHandler.bitmaps.images["points_" + this.colour][this.size], 0, 0);
            break;
         // TODO: prerender a glowing line to use as the particle!
         case 1:  // line
            ctx.translate(this.position.x, this.position.y);
            var s = this.size;
            ctx.rotate(this.rotate);
            this.rotate += this.rotationv;
            ctx.strokeStyle = this.colour;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-s, -s);
            ctx.lineTo(s, s);
            ctx.closePath();
            ctx.stroke();
            break;
         case 2:  // smudge (prerendered image)
            var offset = (this.size + 1) << 2;
            Game.Util.renderImage(ctx, GameHandler.bitmaps.images["smudges_" + this.colour][this.size],
               0, 0, (this.size + 1) << 3, this.position.x - offset, this.position.y - offset, (this.size + 1) << 3);
   		  	break;
      }
   };
}


/**
 * Asteroid particle based explosion - Particle effect actor class.
 * 
 * @namespace Asteroids
 * @class Asteroids.AsteroidExplosion
 */
(function()
{
   /**
    * Constructor
    */
   Asteroids.AsteroidExplosion = function(p, v, asteroid)
   {
      // for bitmap asteroids, we want a mixed number of smudge/particles
      // for vector asteroids, we want a number of vector lines
      var count = (BITMAPS ? asteroid.size * 2 : asteroid.size + 2);
      Asteroids.AsteroidExplosion.superclass.constructor.call(this, p, v, count, function()
         {
            // randomise radial direction vector - speed and angle, then add parent vector
            var pos = p.clone();
            if (BITMAPS)
            {
               if (Rnd() < 0.5)
               {
                  var t = new Vector(0, randomInt(5, 10));
                  t.rotate(Rnd() * TWOPI).add(v);
                  return new AsteroidsParticle(
                     pos, t, ~~(Rnd() * 4), 0, 400, 300);
               }
               else
               {
                  var t = new Vector(0, randomInt(1, 3));
                  t.rotate(Rnd() * TWOPI).add(v);
                  return new AsteroidsParticle(
                     pos, t, ~~(Rnd() * 4) + asteroid.size, 2, 500, 250);
               }
            }
            else
            {
               var t = new Vector(0, randomInt(2, 5));
               t.rotate(Rnd() * TWOPI).add(v);
               return new AsteroidsParticle(
                  pos, t, Rnd() * asteroid.size + 4, 1, 400, 300, "white");
            }
         });
      
      return this;
   };
   
   extend(Asteroids.AsteroidExplosion, Asteroids.Particles);
})();


/**
 * Player particle based explosion - Particle effect actor class.
 * 
 * @namespace Asteroids
 * @class Asteroids.PlayerExplosion
 */
(function()
{
   /**
    * Constructor
    */
   Asteroids.PlayerExplosion = function(p, v)
   {
      // for bitmap mode, we want a mixed number of smudge/particles
      // for vector mode, we want a number of vector lines
      var count = (BITMAPS ? 12 : 3);
      Asteroids.PlayerExplosion.superclass.constructor.call(this, p, v, count, function()
         {
            // randomise radial direction vector - speed and angle, then add parent vector
            var pos = p.clone();
            if (BITMAPS)
            {
               if (Rnd() < 0.5)
               {
                  var t = new Vector(0, randomInt(5, 10));
                  t.rotate(Rnd() * TWOPI).add(v);
                  return new AsteroidsParticle(
                     pos, t, ~~(Rnd() * 4), 0, 400, 300);
               }
               else
               {
                  var t = new Vector(0, randomInt(1, 3));
                  t.rotate(Rnd() * TWOPI).add(v);
                  return new AsteroidsParticle(
                     pos, t, ~~(Rnd() * 4) + 2, 2, 500, 250);
               }
            }
            else
            {
               var t = new Vector(0, randomInt(2, 5));
               t.rotate(Rnd() * TWOPI).add(v);
               return new AsteroidsParticle(
                  pos, t, 6, 1, 400, 300, "white");
            }
         });
      
      return this;
   };
   
   extend(Asteroids.PlayerExplosion, Asteroids.Particles);
})();


/**
 * Enemy particle based explosion - Particle effect actor class.
 * 
 * @namespace Asteroids
 * @class Asteroids.EnemyExplosion
 */
(function()
{
   /**
    * Constructor
    */
   Asteroids.EnemyExplosion = function(p, v, enemy)
   {
      // for bitmap mode, we want a mixed number of smudge/particles
      // for vector mode, we want a number of vector lines
      var count = (BITMAPS ? 8 : 6);
      Asteroids.EnemyExplosion.superclass.constructor.call(this, p, v, count, function()
         {
            // randomise radial direction vector - speed and angle, then add parent vector
            var pos = p.clone();
            if (BITMAPS)
            {
               if (Rnd() < 0.5)
               {
                  var t = new Vector(0, randomInt(5, 10));
                  t.rotate(Rnd() * TWOPI).add(v);
                  return new AsteroidsParticle(
                     pos, t, ~~(Rnd() * 4), 0, 400, 300, Asteroids.Colours.ENEMY_SHIP);
               }
               else
               {
                  var t = new Vector(0, randomInt(1, 3));
                  t.rotate(Rnd() * TWOPI).add(v);
                  return new AsteroidsParticle(
                     pos, t, ~~(Rnd() * 4) + (enemy.size === 0 ? 2 : 0), 2, 500, 250, Asteroids.Colours.ENEMY_SHIP);
               }
            }
            else
            {
               var t = new Vector(0, randomInt(2, 4));
               t.rotate(Rnd() * TWOPI).add(v);
               return new AsteroidsParticle(
                  pos, t, (enemy.size === 0 ? 8 : 4), 1, 400, 300, Asteroids.Colours.ENEMY_SHIP);
            }
         });
      
      return this;
   };
   
   extend(Asteroids.EnemyExplosion, Asteroids.Particles);
})();


/**
 * Basic explosion effect actor class.
 * 
 * TODO: replace all instances of this with particle effects for BITMAP mode - this is still used
 *       by the smartbomb - what about vector mode? replace with expanding vector circle effect?
 * 
 * @namespace Asteroids
 * @class Asteroids.Explosion
 */
(function()
{
   Asteroids.Explosion = function(p, v, s)
   {
      Asteroids.Explosion.superclass.constructor.call(this, p, v, this.FADE_LENGTH);
      this.size = s;
      return this;
   };
   
   extend(Asteroids.Explosion, Game.EffectActor,
   {
      FADE_LENGTH: 300,
      
      /**
       * Explosion size
       */
      size: 0,
      
      /**
       * Explosion rendering method
       * 
       * @param ctx {object} Canvas rendering context
       */
      onRender: function onRender(ctx)
      {
         // fade out
         var brightness = Floor(this.effectValue(255)),
             rad = this.effectValue(this.size * 8),
             rgb = brightness.toString();
         ctx.save();
         ctx.globalAlpha = 0.75;
         ctx.fillStyle = "rgb(" + rgb + ",0,0)";
         ctx.beginPath();
         ctx.arc(this.position.x, this.position.y, rad, 0, TWOPI, true);
         ctx.closePath();
         ctx.fill();
         ctx.restore();
      }
   });
})();


/**
 * Player bullet impact effect - Particle effect actor class.
 * Used when an enemy is hit by player bullet but not destroyed.
 * 
 * @namespace Asteroids
 * @class Asteroids.PlayerBulletImpact
 */
(function()
{
   Asteroids.PlayerBulletImpact = function(p, v)
   {
      Asteroids.PlayerBulletImpact.superclass.constructor.call(this, p, v, 5, function()
         {
            // slightly randomise vector angle - then add parent vector
            var t = v.nscale(0.75 + Rnd() * 0.5);
            t.rotate(Rnd() * PIO4 - PIO8);
            return new AsteroidsParticle(
               p.clone(), t, ~~(Rnd() * 4), 0, 250, 150, Asteroids.Colours.GREEN_LASER);
         });
      
      return this;
   };
   
   extend(Asteroids.PlayerBulletImpact, Asteroids.Particles);
})();


/**
 * Enemy bullet impact effect - Particle effect actor class.
 * Used when an enemy is hit by player bullet but not destroyed.
 * 
 * @namespace Asteroids
 * @class Asteroids.EnemyBulletImpact
 */
(function()
{
   Asteroids.EnemyBulletImpact = function(p, v)
   {
      Asteroids.EnemyBulletImpact.superclass.constructor.call(this, p, v, 5, function()
         {
            // slightly randomise vector angle - then add parent vector
            var t = v.nscale(0.75 + Rnd() * 0.5);
            t.rotate(Rnd() * PIO4 - PIO8);
            return new AsteroidsParticle(
               p.clone(), t, ~~(Rnd() * 4), 0, 250, 150, Asteroids.Colours.ENEMY_SHIP);
         });
      
      return this;
   };
   
   extend(Asteroids.EnemyBulletImpact, Asteroids.Particles);
})();



/**
 * Text indicator effect actor class.
 * 
 * @namespace Asteroids
 * @class Asteroids.TextIndicator
 */
(function()
{
   Asteroids.TextIndicator = function(p, v, msg, textSize, colour, fadeLength)
   {
      this.fadeLength = (fadeLength ? fadeLength : this.DEFAULT_FADE_LENGTH);
      Asteroids.TextIndicator.superclass.constructor.call(this, p, v, this.fadeLength);
      this.msg = msg;
      if (textSize) this.textSize = textSize;
      if (colour) this.colour = colour;
      return this;
   };
   
   extend(Asteroids.TextIndicator, Game.EffectActor,
   {
      DEFAULT_FADE_LENGTH: 500,
      fadeLength: 0,
      textSize: 12,
      msg: null,
      colour: "white",
      
      /**
       * Text indicator effect rendering method
       * 
       * @param ctx {object} Canvas rendering context
       */
      onRender: function onRender(ctx)
      {
         // fade out alpha
         var alpha = this.effectValue(1.0);
         ctx.save();
         ctx.globalAlpha = alpha;
         Game.fillText(ctx, this.msg, this.textSize + "pt Courier New", this.position.x, this.position.y, this.colour);
         ctx.restore();
      }
   });
})();


/**
 * Score indicator effect actor class.
 * 
 * @namespace Asteroids
 * @class Asteroids.ScoreIndicator
 */
(function()
{
   Asteroids.ScoreIndicator = function(p, v, score, textSize, prefix, colour, fadeLength)
   {
      var msg = score.toString();
      if (prefix)
      {
         msg = prefix + ' ' + msg;
      }
      Asteroids.ScoreIndicator.superclass.constructor.call(this, p, v, msg, textSize, colour, fadeLength);
      return this;
   };
   
   extend(Asteroids.ScoreIndicator, Asteroids.TextIndicator);
})();


/**
 * Power up collectable.
 * 
 * @namespace Asteroids
 * @class Asteroids.PowerUp
 */
(function()
{
   Asteroids.PowerUp = function(p, v)
   {
      Asteroids.PowerUp.superclass.constructor.call(this, p, v);
      return this;
   };
   
   extend(Asteroids.PowerUp, Game.EffectActor,
   {
      RADIUS: 8,
      pulse: 128,
      pulseinc: 5,
      
      /**
       * Power up rendering method
       * 
       * @param ctx {object} Canvas rendering context
       */
      onRender: function onRender(ctx)
      {
         ctx.save();
         ctx.globalAlpha = 0.75;
         var col = "rgb(255," + this.pulse.toString() + ",0)";
         if (BITMAPS)
         {
            ctx.fillStyle = col;
            ctx.strokeStyle = "rgb(255,255,128)";
         }
         else
         {
            ctx.lineWidth = 2.0;
            ctx.shadowColor = ctx.strokeStyle = col;
         }
         ctx.beginPath();
         ctx.arc(this.position.x, this.position.y, this.RADIUS, 0, TWOPI, true);
         ctx.closePath();
         if (BITMAPS)
         {
            ctx.fill();
         }
         ctx.stroke();
         ctx.restore();
         this.pulse += this.pulseinc;
         if (this.pulse > 255)
         {
            this.pulse = 256 - this.pulseinc;
            this.pulseinc =- this.pulseinc;
         }
         else if (this.pulse < 0)
         {
            this.pulse = 0 - this.pulseinc;
            this.pulseinc =- this.pulseinc;
         }
      },
      
      radius: function radius()
      {
         return this.RADIUS;
      },
      
      collected: function collected(game, player, scene)
      {
         // randomly select a powerup to apply
         var message = null;
         switch (randomInt(0, 9))
         {
            case 0:
            case 1:
               // boost energy
               message = Game.Util.message("powerup-energy-boost");
               player.energy += player.ENERGY_INIT/2;
               if (player.energy > player.ENERGY_INIT)
               {
                  player.energy = player.ENERGY_INIT;
               }
               break;
            
            case 2:
               // fire when shieled
               message = Game.Util.message("powerup-fire-shielded");
               player.fireWhenShield = true;
               break;
            
            case 3:
               // extra life
               message = Game.Util.message("powerup-extra-life");
               game.lives++;
               break;
            
            case 4:
               // slow down asteroids
               message = Game.Util.message("powerup-slow-asteroids");
               for (var n = 0, m = scene.enemies.length, enemy; n < m; n++)
               {
                  enemy = scene.enemies[n];
                  if (enemy instanceof Asteroids.Asteroid)
                  {
                     enemy.vector.scale(0.66);
                  }
               }
               break;
            
            case 5:
               // smart bomb
               message = Game.Util.message("powerup-smart-bomb");
               
               var effectRad = 96;
               
               // add a BIG explosion actor at the smart bomb weapon position and vector
               var boom = new Asteroids.Explosion(
                     this.position.clone(), this.vector.clone().scale(0.5), effectRad / 8);
               scene.effects.push(boom);
               
               // test circle intersection with each enemy actor
               // we check the enemy list length each iteration to catch baby asteroids
               // this is a fully fledged smart bomb after all!
               for (var n = 0, enemy, pos = this.position; n < scene.enemies.length; n++)
               {
                  enemy = scene.enemies[n];
                  
                  // test the distance against the two radius combined
                  if (pos.distance(enemy.position) <= effectRad + enemy.radius())
                  {
                     // intersection detected! 
                     enemy.hit(-1);
                     scene.generatePowerUp(enemy);
                     scene.destroyEnemy(enemy, this.vector, true);
                  }
               }
               break;
            
            case 6:
               // twin cannon primary weapon upgrade
               message = Game.Util.message("powerup-twin-cannons");
               player.primaryWeapons["main"] = new Asteroids.TwinCannonsWeapon(player);
               break;
            
            case 7:
               // v spray cannons
               message = Game.Util.message("powerup-spray-cannons");
               player.primaryWeapons["main"] = new Asteroids.VSprayCannonsWeapon(player);
               break;
            
            case 8:
               // rear guns
               message = Game.Util.message("powerup-rear-gun");
               player.primaryWeapons["rear"] = new Asteroids.RearGunWeapon(player);
               break;
            
            case 9:
               // side guns
               message = Game.Util.message("powerup-side-guns");
               player.primaryWeapons["side"] = new Asteroids.SideGunWeapon(player);
               break;
         }
         
         if (message)
         {
            // generate a effect indicator at the destroyed enemy position
            var vec = new Vector(0, -1.5);
            var effect = new Asteroids.TextIndicator(
                  new Vector(this.position.x, this.position.y - this.RADIUS), vec, message, null, null, 700);
            scene.effects.push(effect);
         }
      }
   });
})();
