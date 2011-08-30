/**
 * harvester - javascript object for sending canvas data to a backend service in smaller chunks
 * 
 * the object operates on one canvas provided to the constructor in the options hash.
 * a second optional canvas can be specified to offer a progress indicator.
 *
 * @todo provide a way to handle failed writes (currently it will just halt)
 * @todo modify the backend joiner (image.php) to optionally return the thumb + full image rather
 *       than redirecting w/ 302 -- this would allow the user interface to show a complete screen w/ thumb, etc
 *
 * @version 1.0
 * @author sprky0
 * @todo 
 */
var harvester = function(options) {

	if (!options.canvas)
		throw exception("Missing canvas reference.");

	if (!options.session_rpc || !options.chunk_rpc || !options.complete_rpc)
		throw exception("Missing RPC.");

	if (!$)
		throw exception("Couldn't locate jQuery.");

	this.canvas = options.canvas;
	this.context = options.context || this.canvas.getContext("2d");

	this.indicator_canvas = options.indicator_canvas;
	this.indicator_context = options.indicator_context || this.indicator_canvas.getContext("2d");

	this.open_on_complete = options.open_on_complete || true;

	this.session_rpc = options.session_rpc;
	this.chunk_rpc = options.chunk_rpc;
	this.complete_rpc = options.complete_rpc;

	this.complete_callback = options.complete_callback || function(i) {};

	var w = this.canvas.width;
	var h = this.canvas.height;

	var scale_x = parseInt( w / 3 );
	var scale_y = parseInt( h / 3 );

	var a = 0, b = 0;

	// top to bottom
	for ( var y = 0; y < h; y += scale_y ) {

		// left to right
		for ( var x = 0; x < w; x += scale_x ) {

			var grid_w = scale_x;
			var grid_h = scale_y;

			if (x + grid_w > w)
				grid_w = w - x;

			if (y + grid_h > h)
				grid_h = h - y;

			this.chunks.push({
				a : a,
				b : b,
				x : x,
				y : y,
				w : grid_w,
				h : grid_h
			});

			// this is silly, we have a 2nd counter , but i didn't want to have to refactor the whole thing just for the id
			// i'll fix that later
			a ++;

		}

		a = 0;
		b++;

	}

	var _harvester = this;

	this.get_session(function(){
		_harvester.send_chunks();
	});

	return this;

}

harvester.prototype.completed = [];
harvester.prototype.failed = [];

harvester.prototype.session_rpc = "";
harvester.prototype.chunk_rpc = "";
harvester.prototype.complete_rpc = "";

harvester.prototype.canvas = null;
harvester.prototype.context = null;

harvester.prototype.indicator_canvas = null;
harvester.prototype.indicator_context = null;

harvester.prototype.chunks = [];
harvester.prototype.current = 0;

harvester.prototype.open_on_complete = true;
harvester.prototype.complete_callback = function(){};

harvester.prototype.check_completion = function(continuous) {

	if (this.completed.length == this.chunks.length) {

		if (true === this.open_on_complete)
			window.open( this.complete_rpc + "?s=" + this.session );

		this.complete_callback( this.complete_rpc + "?s=" + this.session );

	} else if (true === continuous) {

		this.current++;
		this.send_chunk(this.current,true);

	}	

}

harvester.prototype.get_session = function( callback ) {

	var _c = callback || function(){};
	var _harvester = this;


	$.ajax({
		type : "GET",
		url : this.session_rpc,
		data : {},
		success : function(data) {

			// this is our session token
			_harvester.session = data;

			// callback
			_c();

		},
		error : function (xhr, options, error) {

			throw exception("Couldn't establish a session!");

		},
		dataType : "json"
	});

};

harvester.prototype.get_range = function(x,y,w,h) {
	
	var dat = this.context.getImageData( x, y, w, h );

	var canvas = document.createElement("canvas");
	canvas.setAttribute("width",w);
	canvas.setAttribute("height",h);
	var context = canvas.getContext("2d");
	context.putImageData( dat, 0, 0 );

	var dat2 = canvas.toDataURL();
	
	delete( context );
	delete( canvas );
	
	return dat2;
}

harvester.prototype.mark_range = function(x,y,w,h) {

	// mark things ????

	this.indicator_context.beginPath();
	this.indicator_context.strokeStyle = "rgba(0,0,0,1)"

	// draw an X and border in the box

	this.indicator_context.moveTo( x, y );

	// border

	this.indicator_context.lineTo( x + w, y );
	this.indicator_context.lineTo( x + w, y + h );
	this.indicator_context.lineTo( x + w, y );
	this.indicator_context.lineTo( x , y );

	// X

	this.indicator_context.lineTo( x + w, y + h );
	this.indicator_context.lineTo( x + w, y );
	this.indicator_context.moveTo( x , y + h );
	this.indicator_context.lineTo( x + w, y );

	this.indicator_context.stroke();
	this.indicator_context.closePath();

	return;	
};

harvester.prototype.send_chunks = function() {
	
	// for(this.current = 0; this.current < this.chunks.length; this.current++) {
	//	this.send_chunk( this.current );
	// }

	// above is async, this just sends out the requests

	// this will happen sequentially now:
	this.send_chunk(this.current,true);
	
	return;
}

harvester.prototype.send_chunk = function(c, continuous) {

	var chunk = this.chunks[c];
	var data = this.get_range(
		chunk.x, chunk.y,
		chunk.w, chunk.h
	);
	
	var _harvester = this;
	var _continue = (continuous === true);

	if (this.indicator_context !== null)
		this.mark_range(chunk.x,chunk.y,chunk.w,chunk.h);

	$.ajax({
		type : "POST",
		url : this.chunk_rpc,
		data : {
			a : chunk.a,
			b : chunk.b,
			x : chunk.x,
			y : chunk.y,
			w : chunk.w,
			h : chunk.h,
			i : data,
			s : this.session
		},
		success : function(d) {

			_harvester.completed.push( c );
			_harvester.check_completion( _continue );

		},
		error : function(xhr, options, error) {

			_harvester.failed.push( c );

		},
		dataType: "json"
	});

	return;

}
