/**
 * Asteroid actor class.
 *
 * @namespace Asteroids
 * @class Asteroids.Asteroid
 */
(function()
{
   Asteroids.Asteroid = function(p, v, s, t)
   {
      Asteroids.Asteroid.superclass.constructor.call(this, p, v);
      this.size = s;
      this.health = s;
      
      // randomly select an asteroid image bitmap
      if (t === undefined)
      {
         t = randomInt(1, 4);
      }
      this.animImage = g_asteroidImgs[t-1];
      this.type = t;
      
      // randomly setup animation speed and direction
      this.animForward = (Rnd() < 0.5);
      this.animSpeed = 0.3 + Rnd() * 0.5;
      this.animLength = this.ANIMATION_LENGTH;
      this.rotation = randomInt(0, 180);
      this.rotationSpeed = (Rnd() - 0.5) / 30;
      
      return this;
   };
   
   extend(Asteroids.Asteroid, Game.EnemyActor,
   {
      ANIMATION_LENGTH: 180,
      
      /**
       * Asteroid size - values from 1-4 are valid.
       */
      size: 0,
      
      /**
       * Asteroid graphic type i.e. which randomly selected bitmap it is drawn from
       */
      type: 1,
      
      /**
       * Asteroid health before it's destroyed
       */
      health: 0,
      
      /**
       * Retro graphics mode rotation orientation and speed
       */
      rotation: 0,
      rotationSpeed: 0,
      
      /**
       * Asteroid rendering method
       */
      onRender: function onRender(ctx)
      {
         var rad = this.size * 8;
         ctx.save();
         if (BITMAPS)
         {
            // render asteroid graphic bitmap
            // bitmap is rendered slightly large than the radius as the raytraced asteroid graphics do not
            // quite touch the edges of the 64x64 sprite - this improves perceived collision detection
            this.renderSprite(ctx, this.position.x - rad - 2, this.position.y - rad - 2, (rad * 2)+4);
         }
         else
         {
            // draw asteroid vector graphic
            var imgsize = rad*2 + GLOWSHADOWBLUR*2;
            Game.Util.renderImageRotated(ctx, GameHandler.bitmaps.images["asteroid"][this.type-1][this.size-1],
               this.position.x, this.position.y,
               imgsize, imgsize,
               this.rotation += this.rotationSpeed);
         }
         ctx.restore();
      },
      
      radius: function radius()
      {
         return this.size * 8;
      },
      
      /**
       * Asteroid hit by player bullet
       * 
       * @param force of the impacting bullet, -1 for instant kill
       * @return true if destroyed, false otherwise
       */
      hit: function hit(force)
      {
         if (force !== -1)
         {
            this.health -= force;
         }
         else
         {
            // instant kill
            this.health = 0;
         }
         return !(this.alive = (this.health > 0));
      }
   });
})();


/**
 * Enemy Ship actor class.
 * 
 * @namespace Asteroids
 * @class Asteroids.EnemyShip
 */
(function()
{
   Asteroids.EnemyShip = function(scene, size)
   {
      this.size = size;
      
      // small ship, alter settings slightly
      if (this.size === 1)
      {
         this.BULLET_RECHARGE_MS = 1300;
         this.RADIUS = 8;
      }
      
      // randomly setup enemy initial position and vector
      // ensure the enemy starts in the opposite quadrant to the player
      var p, v;
      if (scene.player.position.x < GameHandler.width / 2)
      {
         // player on left of the screen
         if (scene.player.position.y < GameHandler.height / 2)
         {
            // player in top left of the screen
            p = new Vector(GameHandler.width-48, GameHandler.height-48);
         }
         else
         {
            // player in bottom left of the screen
            p = new Vector(GameHandler.width-48, 48);
         }
         v = new Vector(-(Rnd() + 0.25 + size*0.75), Rnd() + 0.25 + size*0.75);
      }
      else
      {
         // player on right of the screen
         if (scene.player.position.y < GameHandler.height / 2)
         {
            // player in top right of the screen
            p = new Vector(0, GameHandler.height-48);
         }
         else
         {
            // player in bottom right of the screen
            p = new Vector(0, 48);
         }
         v = new Vector(Rnd() + 0.25 + size*0.75, Rnd() + 0.25 + size*0.75);
      }
      
      // setup SpriteActor values
      this.animImage = g_enemyshipImg;
      this.animLength = this.SHIP_ANIM_LENGTH;
      
      Asteroids.EnemyShip.superclass.constructor.call(this, p, v);
      
      return this;
   };
   
   extend(Asteroids.EnemyShip, Game.EnemyActor,
   {
      SHIP_ANIM_LENGTH: 90,
      RADIUS: 16,
      BULLET_RECHARGE_MS: 1800,
      
      /**
       * True if ship alive, false if ready for expiration
       */
      alive: true,
      
      /**
       * Enemy ship size - 0 = large (slow), 1 = small (fast)
       */
      size: 0,
      
      /**
       * Bullet fire recharging counter
       */
      bulletRecharge: 0,
      
      onUpdate: function onUpdate(scene)
      {
         // change enemy direction randomly
         if (this.size === 0)
         {
            if (Rnd() < 0.01)
            {
               this.vector.y = -(this.vector.y + (0.25 - (Rnd()/2)));
            }
         }
         else
         {
            if (Rnd() < 0.02)
            {
               this.vector.y = -(this.vector.y + (0.5 - Rnd()));
            }
         }
         
         // regular fire a bullet at the player
         if (GameHandler.frameStart - this.bulletRecharge > this.BULLET_RECHARGE_MS && scene.player.alive)
         {
            // ok, update last fired time and we can now generate a bullet
            this.bulletRecharge = GameHandler.frameStart;
            
            // generate a vector pointed at the player
            // by calculating a vector between the player and enemy positions
            var v = scene.player.position.clone().sub(this.position);
            // scale resulting vector down to bullet vector size
            var scale = (this.size === 0 ? 3.0 : 3.5) / v.length();
            v.x *= scale;
            v.y *= scale;
            // slightly randomize the direction (big ship is less accurate also)
            v.x += (this.size === 0 ? (Rnd() * 2 - 1) : (Rnd() - 0.5));
            v.y += (this.size === 0 ? (Rnd() * 2 - 1) : (Rnd() - 0.5));
            // - could add the enemy motion vector for correct momentum
            // - but problem is this leads to slow bullets firing back from dir of travel
            // - so pretend that enemies are clever enough to account for this...
            //v.add(this.vector);
            
            var bullet = new Asteroids.EnemyBullet(this.position.clone(), v);
            scene.enemyBullets.push(bullet);
            
            GameHandler.playSound("enemy_bomb");
         }
      },
      
      /**
       * Enemy rendering method
       */
      onRender: function onRender(ctx)
      {
         if (BITMAPS)
         {
            // render enemy graphic bitmap
            var rad = this.RADIUS + 2;
            this.renderSprite(ctx, this.position.x - rad, this.position.y - rad, rad * 2, true);
         }
         else
         {
            ctx.save();
            ctx.translate(this.position.x, this.position.y);
            if (this.size === 0)
            {
               // scale up the enemy - but also scale down the vector line scale
               // otherwise it looks too thick compared to the default
               ctx.scale(2, 2);
               ctx.lineWidth = 0.75;
            }
            
            ctx.beginPath();
            ctx.moveTo(0, -4);
            ctx.lineTo(8, 3);
            ctx.lineTo(0, 8);
            ctx.lineTo(-8, 3);
            ctx.lineTo(0, -4);
            ctx.closePath();
            ctx.shadowColor = ctx.strokeStyle = Asteroids.Colours.ENEMY_SHIP_DARK;
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, -8);
            ctx.lineTo(4, -4);
            ctx.lineTo(0, 0);
            ctx.lineTo(-4, -4);
            ctx.lineTo(0, -8);
            ctx.closePath();
            ctx.shadowColor = ctx.strokeStyle = Asteroids.Colours.ENEMY_SHIP;
            ctx.stroke();
            
            ctx.restore();
         }
      },
      
      radius: function radius()
      {
         return this.RADIUS;
      },
      
      /**
       * Enemy hit by a bullet
       * 
       * @return true if destroyed, false otherwise
       */
      hit: function hit()
      {
         this.alive = false;
         return true;
      },
      
      expired: function expired()
      {
         return !this.alive;
      }
   });
})();
