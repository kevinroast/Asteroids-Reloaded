/**
 * Weapon system base class for the player actor.
 * 
 * @namespace Asteroids
 * @class Asteroids.Weapon
 */
(function()
{
   Asteroids.Weapon = function(player)
   {
      this.player = player;
      return this;
   };
   
   Asteroids.Weapon.prototype =
   {
      WEAPON_RECHARGE: 125,
      weaponRecharge: 0,
      player: null,
      
      fire: function()
      {
         // now test we did not fire too recently
         if (GameHandler.frameStart - this.weaponRecharge > this.WEAPON_RECHARGE)
         {
            // ok, update last fired time and we can now generate a bullet
            this.weaponRecharge = GameHandler.frameStart;
            
            return this.doFire();
         }
      },
      
      doFire: function()
      {
      }
   };
})();


/**
 * Basic primary weapon for the player actor.
 * 
 * @namespace Asteroids
 * @class Asteroids.PrimaryWeapon
 */
(function()
{
   Asteroids.PrimaryWeapon = function(player)
   {
      Asteroids.PrimaryWeapon.superclass.constructor.call(this, player);
      return this;
   };
   
   extend(Asteroids.PrimaryWeapon, Asteroids.Weapon,
   {
      doFire: function()
      {
         // generate a vector rotated to the player heading and then add the current player
         // vector to give the bullet the correct directional momentum
         var t = new Vector(0.0, -4.5);
         t.rotate(this.player.heading * RAD);
         t.add(this.player.vector);
         
         return new Asteroids.Bullet(this.player.position.clone(), t, this.player.heading);
      }
   });
})();


/**
 * Twin Cannons primary weapon for the player actor.
 * 
 * @namespace Asteroids
 * @class Asteroids.TwinCannonsWeapon
 */
(function()
{
   Asteroids.TwinCannonsWeapon = function(player)
   {
      this.WEAPON_RECHARGE = 150;
      Asteroids.TwinCannonsWeapon.superclass.constructor.call(this, player);
      return this;
   };
   
   extend(Asteroids.TwinCannonsWeapon, Asteroids.Weapon,
   {
      doFire: function()
      {
         var t = new Vector(0.0, -4.5);
         t.rotate(this.player.heading * RAD);
         t.add(this.player.vector);
         
         return new Asteroids.BulletX2(this.player.position.clone(), t, this.player.heading);
      }
   });
})();


/**
 * V Spray Cannons primary weapon for the player actor.
 * 
 * @namespace Asteroids
 * @class Asteroids.VSprayCannonsWeapon
 */
(function()
{
   Asteroids.VSprayCannonsWeapon = function(player)
   {
      this.WEAPON_RECHARGE = 250;
      Asteroids.VSprayCannonsWeapon.superclass.constructor.call(this, player);
      return this;
   };
   
   extend(Asteroids.VSprayCannonsWeapon, Asteroids.Weapon,
   {
      doFire: function()
      {
         var t, h;
         
         var bullets = [];
         
         h = this.player.heading - 15;
         t = new Vector(0.0, -3.75).rotate(h * RAD).add(this.player.vector);
         bullets.push(new Asteroids.Bullet(this.player.position.clone(), t, h));
         
         h = this.player.heading;
         t = new Vector(0.0, -3.75).rotate(h * RAD).add(this.player.vector);
         bullets.push(new Asteroids.Bullet(this.player.position.clone(), t, h));
         
         h = this.player.heading + 15;
         t = new Vector(0.0, -3.75).rotate(h * RAD).add(this.player.vector);
         bullets.push(new Asteroids.Bullet(this.player.position.clone(), t, h));
         
         return bullets;
      }
   });
})();


/**
 * Side Guns additional primary weapon for the player actor.
 * 
 * @namespace Asteroids
 * @class Asteroids.SideGunWeapon
 */
(function()
{
   Asteroids.SideGunWeapon = function(player)
   {
      this.WEAPON_RECHARGE = 250;
      Asteroids.SideGunWeapon.superclass.constructor.call(this, player);
      return this;
   };
   
   extend(Asteroids.SideGunWeapon, Asteroids.Weapon,
   {
      doFire: function()
      {
         var t, h;
         
         var bullets = [];
         
         h = this.player.heading - 90;
         t = new Vector(0.0, -4.5).rotate(h * RAD).add(this.player.vector);
         bullets.push(new Asteroids.Bullet(this.player.position.clone(), t, h, 750));
         
         h = this.player.heading + 90;
         t = new Vector(0.0, -4.5).rotate(h * RAD).add(this.player.vector);
         bullets.push(new Asteroids.Bullet(this.player.position.clone(), t, h, 750));
         
         return bullets;
      }
   });
})();


/**
 * Rear Gun additional primary weapon for the player actor.
 * 
 * @namespace Asteroids
 * @class Asteroids.RearGunWeapon
 */
(function()
{
   Asteroids.RearGunWeapon = function(player)
   {
      this.WEAPON_RECHARGE = 250;
      Asteroids.RearGunWeapon.superclass.constructor.call(this, player);
      return this;
   };
   
   extend(Asteroids.RearGunWeapon, Asteroids.Weapon,
   {
      doFire: function()
      {
         var t = new Vector(0.0, -4.5);
         var h = this.player.heading + 180;
         t.rotate(h * RAD);
         t.add(this.player.vector);
         
         return new Asteroids.Bullet(this.player.position.clone(), t, h, 750);
      }
   });
})();


/**
 * Bullet actor class.
 *
 * @namespace Asteroids
 * @class Asteroids.Bullet
 */
(function()
{
   Asteroids.Bullet = function(p, v, h, lifespan)
   {
      Asteroids.Bullet.superclass.constructor.call(this, p, v);
      this.heading = h;
      if (lifespan)
      {
         this.lifespan = lifespan;
      }
      this.bulletStart = GameHandler.frameStart;
      return this;
   };
   
   extend(Asteroids.Bullet, Game.Actor,
   {
      BULLET_WIDTH: 2,
      BULLET_HEIGHT: 6,
      FADE_LENGTH: 200,
      
      /**
       * Bullet heading
       */
      heading: 0,
      
      /**
       * Bullet lifespan
       */
      lifespan: 1300,
      
      /**
       * Bullet firing start time
       */
      bulletStart: 0,
      
      /**
       * Bullet power energy
       */
      powerLevel: 1,
      
      /**
       * Bullet rendering method
       * 
       * @param ctx {object} Canvas rendering context
       */
      onRender: function onRender(ctx)
      {
         // hack to stop draw under player graphic
         if (GameHandler.frameStart - this.bulletStart > 40)
         {
            ctx.save();
            if (BITMAPS) ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = this.fadeValue(1.0, this.FADE_LENGTH);
            // rotate the bullet bitmap into the correct heading
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(this.heading * RAD);
            ctx.drawImage(GameHandler.bitmaps.images["bullet"][BITMAPS?0:1],
               -(this.BULLET_WIDTH + GLOWSHADOWBLUR*2)*0.5, -(this.BULLET_HEIGHT + GLOWSHADOWBLUR*2)*0.5);
            ctx.restore();
         }
      },
      
      /**
       * Actor expiration test
       * 
       * @return true if expired and to be removed from the actor list, false if still in play
       */
      expired: function expired()
      {
         return (GameHandler.frameStart - this.bulletStart > this.lifespan);
      },
      
      /**
       * Area effect weapon radius - zero for primary bullets
       */
      effectRadius: function effectRadius()
      {
         return 0;
      },
      
      radius: function radius()
      {
         // approximate based on average between width and height
         return (this.BULLET_HEIGHT + this.BULLET_WIDTH) * 0.5;
      },
      
      power: function power()
      {
         return this.powerLevel;
      },
      
      /**
       * Helper to return a value multiplied by the ratio of the remaining lifespan
       * 
       * @param val     value to apply to the ratio of remaining lifespan
       * @param offset  offset at which to begin applying the ratio
       */
      fadeValue: function fadeValue(val, offset)
      {
         var rem = this.lifespan - (GameHandler.frameStart - this.bulletStart),
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
      }
   });
})();


/**
 * Player BulletX2 actor class. Used by the TwinCannons primary weapon.
 *
 * @namespace Asteroids
 * @class Asteroids.BulletX2
 */
(function()
{
   Asteroids.BulletX2 = function(p, v, h)
   {
      Asteroids.BulletX2.superclass.constructor.call(this, p, v, h);
      this.lifespan = 1750;
      this.powerLevel = 2;
      return this;
   };
   
   extend(Asteroids.BulletX2, Asteroids.Bullet,
   {
      /**
       * Bullet rendering method
       * 
       * @param ctx {object} Canvas rendering context
       */
      onRender: function onRender(ctx)
      {
         // hack to stop draw under player graphic
         if (GameHandler.frameStart - this.bulletStart > 40)
         {
            ctx.save();
            if (BITMAPS) ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = this.fadeValue(1.0, this.FADE_LENGTH);
            // rotate the bullet bitmap into the correct heading
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(this.heading * RAD);
            ctx.drawImage(GameHandler.bitmaps.images["bulletx2"][BITMAPS?0:1],
               -(this.BULLET_WIDTH + GLOWSHADOWBLUR*4)*0.5, -(this.BULLET_HEIGHT + GLOWSHADOWBLUR*2)*0.5);
            ctx.restore();
         }
      },
      
      radius: function radius()
      {
         // double width bullets - so bigger hit area than basic ones
         return (this.BULLET_HEIGHT);
      }
   });
})();


/**
 * Bomb actor class.
 *
 * @namespace Asteroids
 * @class Asteroids.Bomb
 */
(function()
{
   Asteroids.Bomb = function(p, v)
   {
      Asteroids.Bomb.superclass.constructor.call(this, p, v);
      this.lifespan = 3000;
      return this;
   };
   
   extend(Asteroids.Bomb, Asteroids.Bullet,
   {
      BOMB_RADIUS: 4,
      FADE_LENGTH: 200,
      EFFECT_RADIUS: 45,
      
      /**
       * Bomb rendering method
       * 
       * @param ctx {object} Canvas rendering context
       */
      onRender: function onRender(ctx)
      {
         ctx.save();
         if (BITMAPS) ctx.globalCompositeOperation = "lighter";
         ctx.globalAlpha = this.fadeValue(1.0, this.FADE_LENGTH);
         ctx.translate(this.position.x, this.position.y);
         ctx.rotate((GameHandler.frameStart % (360*32)) / 32);
         var scale = this.fadeValue(1.0, this.FADE_LENGTH);
         if (scale <= 0) scale = 0.01;
         ctx.scale(scale, scale);
         ctx.drawImage(GameHandler.bitmaps.images["bomb"][BITMAPS?0:1],
               -(this.BOMB_RADIUS*2 + GLOWSHADOWBLUR*2)*0.5, -(this.BOMB_RADIUS*2 + GLOWSHADOWBLUR*2)*0.5);
         ctx.restore();
      },
      
      /**
       * Area effect weapon radius
       */
      effectRadius: function effectRadius()
      {
         return this.EFFECT_RADIUS;
      },
      
      radius: function radius()
      {
         return this.fadeValue(this.BOMB_RADIUS, this.FADE_LENGTH);
      }
   });
})();


/**
 * Enemy Bullet actor class.
 *
 * @namespace Asteroids
 * @class Asteroids.EnemyBullet
 */
(function()
{
   Asteroids.EnemyBullet = function(p, v)
   {
      Asteroids.EnemyBullet.superclass.constructor.call(this, p, v, 0);
      this.lifespan = 2800;
      return this;
   };
   
   extend(Asteroids.EnemyBullet, Asteroids.Bullet,
   {
      BULLET_RADIUS: 4,
      FADE_LENGTH: 200,
      
      /**
       * Bullet rendering method
       * 
       * @param ctx {object} Canvas rendering context
       */
      onRender: function onRender(ctx)
      {
         ctx.save();
         ctx.globalAlpha = this.fadeValue(1.0, this.FADE_LENGTH);
         if (BITMAPS) ctx.globalCompositeOperation = "lighter";
         ctx.translate(this.position.x, this.position.y);
         ctx.rotate((GameHandler.frameStart % (360*64)) / 64);
         var scale = this.fadeValue(1.0, this.FADE_LENGTH);
         if (scale <= 0) scale = 0.01;
         ctx.scale(scale, scale);
         ctx.drawImage(GameHandler.bitmaps.images["enemybullet"][BITMAPS?0:1],
               -(this.BULLET_RADIUS*2 + GLOWSHADOWBLUR*2)*0.5, -(this.BULLET_RADIUS*2 + GLOWSHADOWBLUR*2)*0.5);
         ctx.restore();
      },
      
      radius: function radius()
      {
         return this.fadeValue(this.BULLET_RADIUS, this.FADE_LENGTH) + 1;
      }
   });
})();
