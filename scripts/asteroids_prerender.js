/**
 * Asteroids prerenderer class.
 * 
 * Encapsulates the early rendering of various effects used in the game. Each effect is
 * rendered once to a hidden canvas object, the image data is extracted and stored in an
 * Image object - which can then be reused later. This is much faster than rendering each
 * effect again and again at runtime.
 * 
 * The downside to this is that some constants are duplicated here and in the original
 * classes - so updates to the original classes such as the weapon effects must be
 * duplicated here.
 * 
 * @namespace Asteroids
 * @class Asteroids.Prerenderer
 */
(function()
{
   Asteroids.Prerenderer = function()
   {
      Asteroids.Prerenderer.superclass.constructor.call(this);
      
      // function to generate a set of point particle images
      var fnPointRenderer = function(buffer, colour)
         {
            var imgs = [];
            for (var size=3; size<=6; size++)
            {
               var width = size << 1;
               buffer.width = buffer.height = width;
               var ctx = buffer.getContext('2d');
               var radgrad = ctx.createRadialGradient(size, size, size >> 1, size, size, size);  
               radgrad.addColorStop(0, colour);
               radgrad.addColorStop(1, "#000");
               ctx.fillStyle = radgrad;
               ctx.fillRect(0, 0, width, width);
               var img = new Image();
               img.src = buffer.toDataURL("image/png");
               imgs.push(img);
            }
            return imgs;
         };
      // add the various point particle image prerenderers based on above function
      // default explosion colour
      this.addRenderer(function(buffer) {
            return fnPointRenderer.call(this, buffer, Asteroids.Colours.PARTICLE);
         }, "points_" + Asteroids.Colours.PARTICLE);
      // player bullet impact particles
      this.addRenderer(function(buffer) {
            return fnPointRenderer.call(this, buffer, Asteroids.Colours.GREEN_LASER);
         }, "points_" + Asteroids.Colours.GREEN_LASER);
      // enemy bullet impact particles
      this.addRenderer(function(buffer) {
            return fnPointRenderer.call(this, buffer, Asteroids.Colours.ENEMY_SHIP);
         }, "points_" + Asteroids.Colours.ENEMY_SHIP);
      
      // add the smudge explosion particle image prerenderer
      var fnSmudgeRenderer = function(buffer, colour)
         {
            var imgs = [];
            for (var size=4; size<=32; size+=4)
            {
               var width = size << 1;
               buffer.width = buffer.height = width;
               var ctx = buffer.getContext('2d');
               var radgrad = ctx.createRadialGradient(size, size, size >> 3, size, size, size);  
               radgrad.addColorStop(0, colour);
               radgrad.addColorStop(1, "#000");
               ctx.fillStyle = radgrad;
               ctx.fillRect(0, 0, width, width);
               var img = new Image();
               img.src = buffer.toDataURL("image/png");
               imgs.push(img);
            }
            return imgs;
         };
      this.addRenderer(function(buffer) {
            return fnSmudgeRenderer.call(this, buffer, Asteroids.Colours.PARTICLE);
         }, "smudges_" + Asteroids.Colours.PARTICLE);
      this.addRenderer(function(buffer) {
            return fnSmudgeRenderer.call(this, buffer, Asteroids.Colours.ENEMY_SHIP);
         }, "smudges_" + Asteroids.Colours.ENEMY_SHIP);
      
      // standard player bullet
      this.addRenderer(function(buffer) {
            // NOTE: keep in sync with Asteroids.Bullet
            var BULLET_WIDTH = 2, BULLET_HEIGHT = 6;
            var imgs = [];
            buffer.width = BULLET_WIDTH + GLOWSHADOWBLUR*2;
            buffer.height = BULLET_HEIGHT + GLOWSHADOWBLUR*2;
            var ctx = buffer.getContext('2d');
            
            var rf = function(width, height)
            {
               ctx.beginPath();
               ctx.moveTo(0, height);
               ctx.lineTo(width, 0);
               ctx.lineTo(0, -height);
               ctx.lineTo(-width, 0);
               ctx.closePath();
            };
            
            ctx.shadowBlur = GLOWSHADOWBLUR;
            ctx.translate(buffer.width * 0.5, buffer.height * 0.5);
            ctx.shadowColor = ctx.fillStyle = Asteroids.Colours.GREEN_LASER_DARK;
            rf.call(this, BULLET_WIDTH-1, BULLET_HEIGHT-1);
            ctx.fill();
            ctx.shadowColor = ctx.fillStyle = Asteroids.Colours.GREEN_LASER;
            rf.call(this, BULLET_WIDTH, BULLET_HEIGHT);
            ctx.fill();
            var img = new Image();
            img.src = buffer.toDataURL("image/png");
            imgs.push(img);
            
            buffer.width = buffer.width;
            ctx.shadowBlur = GLOWSHADOWBLUR;
            ctx.translate(buffer.width * 0.5, buffer.height * 0.5);
            ctx.shadowColor = ctx.strokeStyle = Asteroids.Colours.GREEN_LASER_DARK;
            rf.call(this, BULLET_WIDTH-1, BULLET_HEIGHT-1);
            ctx.stroke();
            ctx.shadowColor = ctx.strokeStyle = Asteroids.Colours.GREEN_LASER;
            rf.call(this, BULLET_WIDTH, BULLET_HEIGHT);
            ctx.stroke();
            img = new Image();
            img.src = buffer.toDataURL("image/png");
            imgs.push(img);
            
            return imgs;
         }, "bullet");
      
      // player bullet X2
      this.addRenderer(function(buffer) {
            // NOTE: keep in sync with Asteroids.BulletX2
            var BULLET_WIDTH = 2, BULLET_HEIGHT = 6;
            var imgs = [];
            buffer.width = BULLET_WIDTH + GLOWSHADOWBLUR*4;
            buffer.height = BULLET_HEIGHT + GLOWSHADOWBLUR*2;
            var ctx = buffer.getContext('2d');
            
            var rf = function(width, height)
            {
               ctx.beginPath();
               ctx.moveTo(0, height);
               ctx.lineTo(width, 0);
               ctx.lineTo(0, -height);
               ctx.lineTo(-width, 0);
               ctx.closePath();
            };
            
            ctx.shadowBlur = GLOWSHADOWBLUR;
            ctx.translate(buffer.width * 0.5, buffer.height * 0.5);
            ctx.save();
            ctx.translate(-4, 0);
            ctx.shadowColor = ctx.fillStyle = Asteroids.Colours.GREEN_LASERX2_DARK;
            rf.call(this, BULLET_WIDTH-1, BULLET_HEIGHT-1);
            ctx.fill();
            ctx.shadowColor = ctx.fillStyle = Asteroids.Colours.GREEN_LASERX2;
            rf.call(this, BULLET_WIDTH, BULLET_HEIGHT);
            ctx.fill();
            ctx.translate(8, 0);
            ctx.shadowColor = ctx.fillStyle = Asteroids.Colours.GREEN_LASERX2_DARK;
            rf.call(this, BULLET_WIDTH-1, BULLET_HEIGHT-1);
            ctx.fill();
            ctx.shadowColor = ctx.fillStyle = Asteroids.Colours.GREEN_LASERX2;
            rf.call(this, BULLET_WIDTH, BULLET_HEIGHT);
            ctx.fill();
            ctx.restore();
            var img = new Image();
            img.src = buffer.toDataURL("image/png");
            imgs.push(img);
            
            buffer.width = buffer.width;
            ctx.shadowBlur = GLOWSHADOWBLUR;
            ctx.translate(buffer.width * 0.5, buffer.height * 0.5);
            ctx.save();
            ctx.translate(-4, 0);
            ctx.shadowColor = ctx.strokeStyle = Asteroids.Colours.GREEN_LASERX2_DARK;
            rf.call(this, BULLET_WIDTH-1, BULLET_HEIGHT-1);
            ctx.stroke();
            ctx.shadowColor = ctx.strokeStyle = Asteroids.Colours.GREEN_LASERX2;
            rf.call(this, BULLET_WIDTH, BULLET_HEIGHT);
            ctx.stroke();
            ctx.translate(8, 0);
            ctx.shadowColor = ctx.strokeStyle = Asteroids.Colours.GREEN_LASERX2_DARK;
            rf.call(this, BULLET_WIDTH-1, BULLET_HEIGHT-1);
            ctx.stroke();
            ctx.shadowColor = ctx.strokeStyle = Asteroids.Colours.GREEN_LASERX2;
            rf.call(this, BULLET_WIDTH, BULLET_HEIGHT);
            ctx.stroke();
            ctx.restore();
            img = new Image();
            img.src = buffer.toDataURL("image/png");
            imgs.push(img);
            
            return imgs;
         }, "bulletx2");
      
      // player bomb weapon
      this.addRenderer(function(buffer) {
            // NOTE: keep in sync with Asteroids.Bomb
            var BOMB_RADIUS = 4;
            var imgs = [];
            buffer.width = buffer.height = BOMB_RADIUS*2 + GLOWSHADOWBLUR*2;
            var ctx = buffer.getContext('2d');
            
            var rf = function()
            {
               ctx.beginPath();
               ctx.moveTo(BOMB_RADIUS * 2, 0);
               for (var i=0; i<15; i++)
               {
                  ctx.rotate(PIO8);
                  if (i % 2 === 0)
                  {
                     ctx.lineTo((BOMB_RADIUS * 2 / 0.525731) * 0.200811, 0);
                  }
                  else
                  {
                     ctx.lineTo(BOMB_RADIUS * 2, 0);
                  }
               }
               ctx.closePath();
            };
            
            ctx.shadowBlur = GLOWSHADOWBLUR;
            ctx.shadowColor = ctx.fillStyle = Asteroids.Colours.PLAYER_BOMB;
            ctx.translate(buffer.width * 0.5, buffer.height * 0.5);
            rf.call(this);
            ctx.fill();
            
            var img = new Image();
            img.src = buffer.toDataURL("image/png");
            imgs.push(img);
            
            buffer.width = buffer.width;
            ctx.shadowBlur = GLOWSHADOWBLUR;
            ctx.shadowColor = ctx.strokeStyle = Asteroids.Colours.PLAYER_BOMB;
            ctx.lineWidth = 1.5;
            ctx.translate(buffer.width * 0.5, buffer.height * 0.5);
            ctx.scale(0.9, 0.9);
            rf.call(this);
            ctx.stroke();
            
            img = new Image();
            img.src = buffer.toDataURL("image/png");
            imgs.push(img);
            
            return imgs;
         }, "bomb");
      
      // asteroid vectors
      this.addRenderer(function(buffer) {
            var img, imgs = [];
            for (var type=1; type<=4; type++)
            {
               var sizeImgs = [];
               for (var size=1; size<=4; size++)
               {
                  buffer.width = buffer.height = size*16 + GLOWSHADOWBLUR*2;
                  var ctx = buffer.getContext('2d');
                  ctx.shadowBlur = GLOWSHADOWBLUR;
                  ctx.shadowColor = ctx.strokeStyle = "white";
                  ctx.translate(buffer.width * 0.5, buffer.height * 0.5);
                  ctx.scale(size * 0.8, size * 0.8);
                  ctx.lineWidth = (0.8 / size) * 2.5;
                  ctx.beginPath();
                  switch (type)
                  {
                     case 1:
                        ctx.moveTo(0,10);
                        ctx.lineTo(8,6);
                        ctx.lineTo(10,-4);
                        ctx.lineTo(4,-2);
                        ctx.lineTo(6,-6);
                        ctx.lineTo(0,-10);
                        ctx.lineTo(-10,-3);
                        ctx.lineTo(-10,5);
                        break;
                     case 2:
                        ctx.moveTo(0,10);
                        ctx.lineTo(8,6);
                        ctx.lineTo(10,-4);
                        ctx.lineTo(4,-2);
                        ctx.lineTo(6,-6);
                        ctx.lineTo(0,-10);
                        ctx.lineTo(-8,-8);
                        ctx.lineTo(-6,-3);
                        ctx.lineTo(-8,-4);
                        ctx.lineTo(-10,5);
                        break;
                     case 3:
                        ctx.moveTo(-4,10);
                        ctx.lineTo(1,8);
                        ctx.lineTo(7,10);
                        ctx.lineTo(10,-4);
                        ctx.lineTo(4,-2);
                        ctx.lineTo(6,-6);
                        ctx.lineTo(0,-10);
                        ctx.lineTo(-10,-3);
                        ctx.lineTo(-10,5);
                        break;
                     case 4:
                        ctx.moveTo(-8,10);
                        ctx.lineTo(7,8);
                        ctx.lineTo(10,-2);
                        ctx.lineTo(6,-10);
                        ctx.lineTo(-2,-8);
                        ctx.lineTo(-6,-10);
                        ctx.lineTo(-10,-6);
                        ctx.lineTo(-7,0);
                        break;
                  }
                  ctx.closePath();
                  ctx.stroke();
                  img = new Image();
                  img.src = buffer.toDataURL("image/png");
                  sizeImgs.push(img);
               }
               imgs.push(sizeImgs);
            }
            
            return imgs;
         }, "asteroid");
      
      // enemy weapon
      this.addRenderer(function(buffer) {
            // NOTE: keep in sync with Asteroids.EnemyBullet
            var BULLET_RADIUS = 4;
            var imgs = [];
            buffer.width = buffer.height = BULLET_RADIUS*2 + GLOWSHADOWBLUR*2;
            var ctx = buffer.getContext('2d');
            
            var rf = function()
            {
               ctx.beginPath();
               ctx.moveTo(BULLET_RADIUS * 2, 0);
               for (var i=0; i<7; i++)
               {
                  ctx.rotate(PIO4);
                  if (i % 2 === 0)
                  {
                     ctx.lineTo((BULLET_RADIUS * 2/0.525731) * 0.200811, 0);
                  }
                  else
                  {
                     ctx.lineTo(BULLET_RADIUS * 2, 0);
                  }
               }
               ctx.closePath();
            };
            
            ctx.shadowBlur = GLOWSHADOWBLUR;
            ctx.shadowColor = ctx.fillStyle = Asteroids.Colours.ENEMY_SHIP;
            ctx.translate(buffer.width * 0.5, buffer.height * 0.5);
            ctx.beginPath();
            ctx.arc(0, 0, BULLET_RADIUS-1, 0, TWOPI, true);
            ctx.closePath();
            ctx.fill();
            rf.call(this);
            ctx.fill();
            
            var img = new Image();
            img.src = buffer.toDataURL("image/png");
            imgs.push(img);
            
            buffer.width = buffer.width;
            ctx.shadowBlur = GLOWSHADOWBLUR;
            ctx.shadowColor = ctx.strokeStyle = Asteroids.Colours.ENEMY_SHIP;
            ctx.lineWidth = 1.5;
            ctx.translate(buffer.width * 0.5, buffer.height * 0.5);
            ctx.scale(0.9, 0.9);
            ctx.beginPath();
            ctx.arc(0, 0, BULLET_RADIUS-1, 0, TWOPI, true);
            ctx.closePath();
            ctx.stroke();
            rf.call(this);
            ctx.stroke();
            
            img = new Image();
            img.src = buffer.toDataURL("image/png");
            imgs.push(img);
            
            return imgs;
         }, "enemybullet");
      
      return this;
   };
   
   extend(Asteroids.Prerenderer, Game.Prerenderer);
})();