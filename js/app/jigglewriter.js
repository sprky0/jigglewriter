/**
 * Jigglewriter
 *
 * Makes beautiful or junky scribbles, depending on the settings.
 *
 * @version 1.2
 * @author sprky0
 * @link http://www.ajbnet.com
 */
function jigglewriter(options) {

	// cache random numbers!
	this.populate_randbank();
	// var _jigglewriter = this;

	if (typeof options == 'object')
		for (var i in options)
			this[i] = options[i];

	return this;
}

jigglewriter.prototype.container = false;

jigglewriter.prototype.debug = false;

jigglewriter.prototype.cur_x = 0;
jigglewriter.prototype.cur_y = 0;
jigglewriter.prototype.tool_x = 0;
jigglewriter.prototype.tool_y = 0;
jigglewriter.prototype.is_disabled = false;
jigglewriter.prototype.is_drawing = false;
jigglewriter.prototype.interval = 1;

jigglewriter.prototype.range = 10;
jigglewriter.prototype.janglyness = 10;

jigglewriter.prototype.rand_offset = 0;
jigglewriter.prototype.rand_bank = false; // [];

jigglewriter.prototype.MAX_R = 255;
jigglewriter.prototype.MIN_R = 100;

jigglewriter.prototype.MAX_G = 10;
jigglewriter.prototype.MIN_G = 0;

jigglewriter.prototype.MAX_B = 255;
jigglewriter.prototype.MIN_B = 0;

jigglewriter.prototype.MAX_A = 1000;
jigglewriter.prototype.MIN_A = 0;

jigglewriter.prototype.timer = null;
// jigglewriter.prototype.count = 0;

jigglewriter.prototype.canvas = null;
jigglewriter.prototype.context = null;

jigglewriter.prototype.run = function() {

	if (!this.container && !this.width && !this.height)
		throw new Exception("Missing required configuration parameters.");

	var c = document.createElement('canvas');
		c.style.margin = 0;
		c.style.padding = 0;
		c.setAttribute('width', this.width + 'px');
		c.setAttribute('height', this.height + 'px');

	this.canvas = c;
	this.context = c.getContext('2d');

	this.container.appendChild(c);

	return this.start();
}

jigglewriter.prototype.start_drawing = function() {
	this.is_drawing = true;
	return this;
}

jigglewriter.prototype.stop_drawing = function() {
	this.is_drawing = false;
	return this;
}

jigglewriter.prototype.move_to = function(x,y) {
	this.tool_x = x;
	this.tool_y = y;
	return this;
}

jigglewriter.prototype.populate_randbank = function() {

	this.rand_bank = [];
	for (var i = 0; i < 3000000; i++)
		this.rand_bank.push( Math.random() );

}

jigglewriter.prototype.random = function() {

	if (!this.rand_bank)
		this.populate_randbank();

	this.rand_offset++;

	if (this.rand_offset >= this.rand_bank.length) {
		this.rand_offset = 0;
		// this.rand_offset = parseInt(Math.random() * this.rand_bank.length);
	}

	return this.rand_bank[this.rand_offset];
}

jigglewriter.prototype.get_color = function() {

	return {
		R: parseInt( (this.MAX_R - this.MIN_R) * this.random() + this.MIN_R ),
		G: parseInt( (this.MAX_G - this.MIN_G) * this.random() + this.MIN_G ),
		B: parseInt( (this.MAX_B - this.MIN_B) * this.random() + this.MIN_B ),
		A: parseInt( (this.MAX_A - this.MIN_A) * this.random() + this.MIN_A ) / 1000
	};

}

jigglewriter.prototype.start = function() {
	var _jigglewriter = this;
	this.timer = setInterval(function(){_jigglewriter.update();}, this.interval);
	return this;
}

jigglewriter.prototype.stop = function() {
	try {
		clearInterval( this.timer );
	} catch(e) {
		this.log(e);	
	}
	return this;
}

jigglewriter.prototype.disable = function() {
	
	this.is_disabled = true;
	this.stop();
	
}

jigglewriter.prototype.enable = function() {
	
	this.is_disabled = false;
	this.start();
	
}

jigglewriter.prototype.update = function() {

	if (this.is_drawing) {

		this.context.beginPath();

		var c = this.get_color();

		this.context.strokeStyle = "rgba("+c.R+","+c.G+","+c.B+","+c.A+")"

		var randx = this.cur_x + this.random() * this.range - this.random() * this.range
		var randy = this.cur_y + this.random() * this.range - this.random() * this.range;
		var randx2 = this.cur_x + this.random() * this.range - this.random() * this.range
		var randy2 = this.cur_y + this.random() * this.range - this.random() * this.range;

		this.context.bezierCurveTo( randx, randy, randx2, randy2, this.cur_x, this.cur_y );
		// this.context.lineTo( this.cur_x, this.cur_y );

		this.cur_x = this.tool_x;
		this.cur_y = this.tool_y;

		for (var i = 0; i < this.janglyness; i++) {

			this.cur_x += this.random() * this.range - this.random() * this.range;
			this.cur_y += this.random() * this.range - this.random() * this.range;

			try {

				var randx = this.cur_x + this.random() * this.range - this.random() * this.range
				var randy = this.cur_y + this.random() * this.range - this.random() * this.range;
				var randx2 = this.cur_x + this.random() * this.range - this.random() * this.range
				var randy2 = this.cur_y + this.random() * this.range - this.random() * this.range;

				this.context.bezierCurveTo( randx, randy, randx2, randy2, this.cur_x, this.cur_y );

			} catch(e) {

				this.log( randx, randy, randx2, randy2, this.cur_x, this.cur_y );

			}
		}

		this.context.stroke();
		this.context.closePath();

	} else {
		this.cur_x = this.tool_x;
		this.cur_y = this.tool_y;	
	}

	return this;
}

jigglewriter.prototype.get_data = function() {

	return this.canvas.toDataURL("image/png");

}

jigglewriter.prototype.log = function(e) {
	
	if (console && typeof console.log == "function" && this.debug == true)
		console.log ( e );	
	
	
}
