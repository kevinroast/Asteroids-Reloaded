/**
 * Player actor class.
 *
 * @namespace Asteroids
 * @class Asteroids.Player
 */
(function()
{
   Asteroids.Player = function(p, v, h)
   {
      Asteroids.Player.superclass.constructor.call(this, p, v);
      this.heading = h;
      this.energy = this.ENERGY_INIT;
      
      // setup SpriteActor values - used for shield sprite
      this.animImage = g_shieldImg;
      this.animLength = this.SHIELD_ANIM_LENGTH;
      
      // setup weapons
      this.primaryWeapons = [];
      
      return this;
   };
   
   extend(Asteroids.Player, Game.SpriteActor,
   {
      MAX_PLAYER_VELOCITY: 8.0,
      PLAYER_RADIUS: 9,
      SHIELD_RADIUS: 14,
      SHIELD_ANIM_LENGTH: 100,
      SHIELD_MIN_PULSE: 20,
      ENERGY_INIT: 400,
      THRUST_DELAY_MS: 100,
      BOMB_RECHARGE_MS: 800,
      BOMB_ENERGY: 80,
      
      /**
       * Player heading
       */
      heading: 0.0,
      
      /**
       * Player energy (shield and bombs)
       */
      energy: 0,
      
      /**
       * Player shield active counter
       */
      shieldCounter: 0,
      
      /**
       * Player 'alive' flag
       */
      alive: true,
      
      /**
       * Primary weapon list
       */
      primaryWeapons: null,
      
      /**
       * Bomb fire recharging counter
       */
      bombRecharge: 0,
      
      /**
       * Engine thrust recharge counter
       */
      thrustRecharge: 0,
      
      /**
       * True if the engine thrust graphics should be rendered next frame
       */
      engineThrust: false,
      
      /**
       * Time that the player was killed - to cause a delay before respawning the player
       */
      killedOn: 0,
      
      /**
       * Power up setting - can fire when shielded
       */
      fireWhenShield: false,
      
      /**
       * Player rendering method
       * 
       * @param ctx {object} Canvas rendering context
       */
      onRender: function onRender(ctx)
      {
         var headingRad = this.heading * RAD;
         
         // render engine thrust?
         if (this.engineThrust)
         {
            ctx.save();
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(headingRad);
            ctx.globalAlpha = 0.5 + Rnd() * 0.5;
            if (BITMAPS)
            {
               ctx.globalCompositeOperation = "lighter";
               ctx.fillStyle = Asteroids.Colours.PLAYER_THRUST;
            }
            else
            {
               ctx.shadowColor = ctx.strokeStyle = Asteroids.Colours.PLAYER_THRUST;
            }
            ctx.beginPath();
            ctx.moveTo(-5, 8);
            ctx.lineTo(5, 8);
            ctx.lineTo(0, 18 + Rnd() * 6);
            ctx.closePath();
            if (BITMAPS) ctx.fill();
            else ctx.stroke();
            ctx.restore();
            this.engineThrust = false;
         }
         
         // render player graphic
         if (BITMAPS)
         {
            var size = (this.PLAYER_RADIUS * 2) + 6;
            // normalise the player heading to 0-359 degrees
            // then locate the correct frame in the sprite strip - an image for each 4 degrees of rotation
            var normAngle = Floor(this.heading) % 360;
            if (normAngle < 0)
            {
               normAngle = 360 + normAngle;
            }
            ctx.save();
            ctx.drawImage(g_playerImg, 0, Floor(normAngle / 4) * 64, 64, 64, this.position.x - (size / 2), this.position.y - (size / 2), size, size);
            ctx.restore();
         }
         else
         {
            ctx.save();
            ctx.shadowColor = ctx.strokeStyle = "#fff";
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(headingRad);
            ctx.beginPath();
            ctx.moveTo(-6, 8);
            ctx.lineTo(6, 8);
            ctx.lineTo(0, -8);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
         }
         
         // shield up? if so render a shield graphic around the ship
         if (this.shieldCounter > 0 && this.energy > 0)
         {
            if (BITMAPS)
            {
               // render shield graphic bitmap
               ctx.save();
               ctx.translate(this.position.x, this.position.y);
               ctx.rotate(headingRad);
               this.renderSprite(ctx, -this.SHIELD_RADIUS-1, -this.SHIELD_RADIUS-1, (this.SHIELD_RADIUS * 2) + 2);
               ctx.restore();
            }
            else
            {
               // render shield as a simple circle around the ship
               ctx.save();
               ctx.translate(this.position.x, this.position.y);
               ctx.rotate(headingRad);
               ctx.shadowColor = ctx.strokeStyle = Asteroids.Colours.PLAYER_SHIELD;
               ctx.beginPath();
               ctx.arc(0, 2, this.SHIELD_RADIUS, 0, TWOPI, true);
               ctx.closePath();
               ctx.stroke();
               ctx.restore();
            }
            
            this.shieldCounter--;
            this.energy -= 1.5;
         }
      },
      
      /**
       * Execute player forward thrust request
       */
      thrust: function thrust()
      {
         // now test we did not thrust too recently, based on time since last thrust
         // request - ensures same thrust at any framerate
         if (GameHandler.frameStart - this.thrustRecharge > this.THRUST_DELAY_MS)
         {
            // update last thrust time
            this.thrustRecharge = GameHandler.frameStart;
            
            // generate a small thrust vector
            var t = new Vector(0.0, !iOS ? -0.5 : -1.25);
            
            // rotate thrust vector by player current heading
            t.rotate(this.heading * RAD);
            
            // add player thrust vector to position
            this.vector.add(t);
            
            // player can't exceed maximum velocity - scale vector down if
            // this occurs - do this rather than not adding the thrust at all
            // otherwise the player cannot turn and thrust at max velocity
            if (this.vector.length() > this.MAX_PLAYER_VELOCITY)
            {
               this.vector.scale(this.MAX_PLAYER_VELOCITY / this.vector.length());
            }
         }
         // mark so that we know to render engine thrust graphics
         this.engineThrust = true;
      },
      
      /**
       * Execute player active shield request
       * If energy remaining the shield will be briefly applied - or until key is release
       */
      activateShield: function activateShield()
      {
         // ensure shield stays up for a brief pulse between key presses!
         if (this.energy >= this.SHIELD_MIN_PULSE)
         {
            this.shieldCounter = this.SHIELD_MIN_PULSE;
         }
      },
      
      isShieldActive: function isShieldActive()
      {
         return (this.shieldCounter > 0 && this.energy > 0);
      },
      
      radius: function radius()
      {
         return (this.isShieldActive() ? this.SHIELD_RADIUS : this.PLAYER_RADIUS);
      },
      
      expired: function expired()
      {
         return !(this.alive);
      },
      
      kill: function kill()
      {
         this.alive = false;
         this.killedOn = GameHandler.frameStart;
      },
      
      /**
       * Fire primary weapon(s)
       * @param bulletList {Array} to add bullet(s) to on success
       */
      firePrimary: function firePrimary(bulletList)
      {
         var playedSound = false;
         // attempt to fire the primary weapon(s)
         // first ensure player is alive and the shield is not up
         if (this.alive && (!this.isShieldActive() || this.fireWhenShield))
         {
            for (var w in this.primaryWeapons)
            {
               var b = this.primaryWeapons[w].fire();
               if (b)
               {
                  if (isArray(b))
                  {
                     for (var i=0; i<b.length; i++)
                     {
                        bulletList.push(b[i]);
                     }
                  }
                  else
                  {
                     bulletList.push(b);
                  }
                  if (!playedSound)
                  {
                     GameHandler.playSound("laser");
                     playedSound = true;
                  }
               }
            }
         }
      },
      
      /**
       * Fire secondary weapon.
       * @param bulletList {Array} to add bullet to on success
       */
      fireSecondary: function fireSecondary(bulletList)
      {
         // attempt to fire the secondary weapon and generate bomb object if successful
         // first ensure player is alive and the shield is not up
         if (this.alive && (!this.isShieldActive() || this.fireWhenShield) && this.energy > this.BOMB_ENERGY)
         {
            // now test we did not fire too recently
            if (GameHandler.frameStart - this.bombRecharge > this.BOMB_RECHARGE_MS)
            {
               // ok, update last fired time and we can now generate a bomb
               this.bombRecharge = GameHandler.frameStart;
               
               // decrement energy supply
               this.energy -= this.BOMB_ENERGY;
               
               // generate a vector rotated to the player heading and then add the current player
               // vector to give the bomb the correct directional momentum
               var t = new Vector(0.0, -3.0);
               t.rotate(this.heading * RAD);
               t.add(this.vector);
               
               bulletList.push(new Asteroids.Bomb(this.position.clone(), t));
            }
         }
      },
      
      onUpdate: function onUpdate()
      {
         // slowly recharge the shield - if not active
         if (!this.isShieldActive() && this.energy < this.ENERGY_INIT)
         {
            this.energy += 0.1;
         }
      },
      
      reset: function reset(persistPowerUps)
      {
         // reset energy, alive status, weapons and power up flags
         this.alive = true;
         if (!persistPowerUps)
         {
            this.primaryWeapons = [];
            this.primaryWeapons["main"] = new Asteroids.PrimaryWeapon(this);
            this.fireWhenShield = false;
         }
         this.energy = this.ENERGY_INIT + this.SHIELD_MIN_PULSE;  // for shield as below
         
         // active shield briefly
         this.activateShield();
      }
   });
})();
