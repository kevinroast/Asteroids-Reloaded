/**
 * Math class library, utility functions and constants.
 * 
 * Copyright (C) Kevin Roast 2010
 * http://www.kevs3d.co.uk/dev
 * email: kevtoast at yahoo.com
 * twitter: @kevinroast
 * 
 * 30/04/09 First version
 * 
 * I place this code in the public domain - because it's not rocket science
 * and it won't make me any money, so do whatever you want with it, go crazy.
 * I would appreciate an email or tweet if you do anything fun with it!
 */

var RAD = Math.PI/180.0;
var PI = Math.PI;
var TWOPI = Math.PI*2;
var ONEOPI = 1.0 / Math.PI;
var PIO2 = Math.PI/2;
var PIO4 = Math.PI/4;
var PIO8 = Math.PI/8;
var PIO16 = Math.PI/16;
var PIO32 = Math.PI/32;
var Rnd = Math.random;
var Sin = Math.sin;
var Cos = Math.cos;
var Sqrt = Math.sqrt;
var Floor = Math.floor;
var Atan2 = Math.atan2;
var Ceil = Math.ceil;
var Abs = Math.abs;


/**
 * Return a random integer value between low and high values
 */
function randomInt(low, high)
{
   return ~~(Rnd() * (high - low + 1) + low);
}


function weightedRandom(weight)
{
   var input = Rnd();
   if (input < 0.5) return 1 - Math.pow(1 - input, weight !== undefined ? weight : 2) / 2; 
   return 0.5 + Math.pow((input - 0.5) * 2, weight !== undefined ? weight : 2) / 2; 
}


/**
 * Calculate normal vector.
 * 
 * First calculate vectors from 3 points on the poly:
 * Vector 1 = Vertex B - Vertex A
 * Vector 2 = Vertex C - Vertex A
 */
function calcNormalVector(x1, y1, z1, x2, y2, z2)
{
   return new Vector3D(
      (y1 * z2) - (z1 * y2),
      -((z2 * x1) - (x2 * z1)),
      (x1 * y2) - (y1 * x2) ).norm();
}


/**
 * Utility to set up the prototype, constructor and superclass properties to
 * support an inheritance strategy that can chain constructors and methods.
 * Static members will not be inherited.
 * 
 * @method extend
 * @static
 * @param {Function} subc   the object to modify
 * @param {Function} superc the object to inherit
 * @param {Object} overrides  additional properties/methods to add to the
 *                            subclass prototype.  These will override the
 *                            matching items obtained from the superclass.
 */
function extend(subc, superc, overrides)
{
   var F = function() {}, i;
   F.prototype = superc.prototype;
   subc.prototype = new F();
   subc.prototype.constructor = subc;
   subc.superclass = superc.prototype;
   if (superc.prototype.constructor == Object.prototype.constructor)
   {
      superc.prototype.constructor = superc;
   }
   
   if (overrides)
   {
      for (i in overrides)
      {
         if (overrides.hasOwnProperty(i))
         {
            subc.prototype[i] = overrides[i];
         }
      }
   }
}


function isArray(obj)
{
   return (obj.constructor.toString().indexOf("Array") !== -1);
}


/**
 * Vector (or Point) structure class - all fields are public.
 * 
 * @class Vector
 */
(function()
{
   Vector = function(x, y)
   {
      this.x = x;
      this.y = y;
      
      return this;
   };
   
   Vector.prototype =
   {
      /**
       * X coordinate
       *
       * @property x
       * @type number
       */
      x: 0,

      /**
       * Y coordinate
       *
       * @property y
       * @type number
       */
      y: 0,
      
      clone: function()
      {
         return new Vector(this.x, this.y);
      },
      
      set: function(v)
      {
         this.x = v.x;
         this.y = v.y;
         return this;
      },
      
      add: function(v)
      {
         this.x += v.x;
         this.y += v.y;
         return this;
      },

      nadd: function(v)
      {
         return new Vector(this.x + v.x, this.y + v.y);
      },
      
      sub: function(v)
      {
         this.x -= v.x;
         this.y -= v.y;
         return this;
      },
      
      nsub: function(v)
      {
         return new Vector(this.x - v.x, this.y - v.y);
      },
      
      dot: function(v)
      {
         return this.x * v.x + this.y * v.y;
      },
      
      length: function()
      {
         return Sqrt(this.x * this.x + this.y * this.y);
      },
      
      distance: function(v)
      {
         var xx = this.x - v.x,
             yy = this.y - v.y;
         return Sqrt(xx * xx + yy * yy); 
      },
      
      theta: function()
      {
         return Atan2(this.y, this.x);
      },
      
      thetaTo: function(vec)
      {
         // calc angle between the two vectors
         var v = this.clone().norm(),
             w = vec.clone().norm();
         return Math.acos(v.dot(w));
      },
      
      thetaTo2: function(vec)
      {
         return Atan2(vec.y, vec.x) - Atan2(this.y, this.x);
      },
      
      norm: function()
      {
         var len = this.length();
         this.x /= len;
         this.y /= len;
         return this;
      },
      
      nnorm: function()
      {
         var len = this.length();
         return new Vector(this.x / len, this.y / len);
      },
      
      rotate: function(a)
      {
      	var ca = Cos(a),
      	    sa = Sin(a);
      	with (this)
      	{
      		var rx = x*ca - y*sa,
      		    ry = x*sa + y*ca;
      		x = rx;
      		y = ry;
      	}
      	return this;
      },
      
      nrotate: function(a)
      {
      	var ca = Cos(a),
      	    sa = Sin(a);
         return new Vector(this.x*ca - this.y*sa, this.x*sa + this.y*ca);
      },
      
      invert: function()
      {
         this.x = -this.x;
         this.y = -this.y;
         return this;
      },
      
      ninvert: function()
      {
         return new Vector(-this.x, -this.y);
      },
      
      scale: function(s)
      {
         this.x *= s; 
         this.y *= s;
         return this;
      },
      
      nscale: function(s)
      {
         return new Vector(this.x * s, this.y * s);
      },
      
      scaleTo: function(s)
      {
         var len = s / this.length();
         this.x *= len;
         this.y *= len;
         return this;
      },
      
      nscaleTo: function(s)
      {
         var len = s / this.length();
         return new Vector(this.x * len, this.y * len)
      }
   };
})();


/**
 * Vector3D structure class - all fields are public.
 * 
 * @class Vector3D
 */
(function()
{
   Vector3D = function(x, y, z)
   {
      this.x = x;
      this.y = y;
      this.z = z;
      
      return this;
   };
   
   Vector3D.prototype =
   {
      /**
       * X coordinate
       *
       * @property x
       * @type number
       */
      x: 0,

      /**
       * Y coordinate
       *
       * @property y
       * @type number
       */
      y: 0,
      
      /**
       * Z coordinate
       *
       * @property z
       * @type number
       */
      z: 0,
      
      clone: function()
      {
         return new Vector3D(this.x, this.y, this.z);
      },
      
      set: function(v)
      {
         this.x = v.x;
         this.y = v.y;
         this.z = v.z;
         return this;
      },
      
      add: function(v)
      {
         this.x += v.x;
         this.y += v.y;
         this.z += v.z;
         return this;
      },
      
      sub: function(v)
      {
         this.x -= v.x;
         this.y -= v.y;
         this.z -= v.z;
         return this;
      },
      
      dot: function(v)
      {
         return this.x * v.x + this.y * v.y + this.z * v.z;
      },
      
      cross: function(v)
      {
         return new Vector3D(this.y*v.z - this.z*v.y, this.z*v.x - this.x*v.z, this.x*v.y - this.y*v.x);
      },
      
      length: function()
      {
         return Sqrt(this.x * this.x + this.y * this.y + this.z * this.z); 
      },
      
      distance: function(v)
      {
         var xx = this.x - v.x,
             yy = this.y - v.y,
             zz = this.z - v.z;
         return Sqrt(xx * xx + yy * yy + zz * zz); 
      },
      
      thetaTo: function(v)
      {
         // Expanded version of: Atan2(this.cross(v).length(), this.dot(v));
         // to avoid intermediate object creation (about 30% faster..!)
         
         // calculate cross product
         var x = this.y*v.z - this.z*v.y, 
             y = this.z*v.x - this.x*v.z,
             z = this.x*v.y - this.y*v.x;
         // atan2 of length of cross product with dot product of supplied vector
         return Atan2(Sqrt(x * x + y * y + z * z), this.dot(v));
      },
      
      thetaTo2: function(v)
      {
         return Math.acos(this.dot(v) / (Sqrt(this.x * this.x + this.y * this.y + this.z * this.z) * Sqrt(v.x * v.x + v.y * v.y + v.z * v.z)));
      },
      
      norm: function()
      {
         var len = this.length();
         this.x /= len;
         this.y /= len;
         this.z /= len;
         return this;
      },
      
      scale: function(s)
      {
         this.x *= s; 
         this.y *= s;
         this.z *= s;
         return this;
      }
   };
})();


/**
 * Image Preloader class. Executes the supplied callback function once all
 * registered images are loaded by the browser.
 * 
 * @class Preloader
 */
(function()
{
   Preloader = function()
   {
      this.images = new Array();
      return this;
   };
   
   Preloader.prototype =
   {
      /**
       * Image list
       *
       * @property images
       * @type Array
       */
      images: null,
      
      /**
       * Callback function
       *
       * @property callback
       * @type Function
       */
      callback: null,
      
      /**
       * Images loaded so far counter
       */
      counter: 0,
      
      /**
       * Add an image to the list of images to wait for
       */
      addImage: function addImage(img, url)
      {
         var me = this;
         img.url = url;
         // attach closure to the image onload handler
         img.onload = function()
         {
            me.counter++;
            if (me.counter === me.images.length)
            {
               // all images are loaded - execute callback function
               me.callback.call(me);
            }
         };
         this.images.push(img);
      },
      
      /**
       * Load the images and call the supplied function when ready
       */
      onLoadCallback: function onLoadCallback(fn)
      {
         this.counter = 0;
         this.callback = fn;
         // load the images
         for (var i=0, j=this.images.length; i<j; i++)
         {
            this.images[i].src = this.images[i].url;
         }
      }
   };
})();
