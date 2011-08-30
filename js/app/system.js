/**
 * system - browser specific functionality
 * 
 * we have jQuery elsewhere so this could be ditched in favor of their nicer methods :)
 */
var system = {

	get_scale : function() {

		var x = 0, y = 0;

		if( typeof( window.innerWidth ) == 'number' ) {
			// not IE
			x = window.innerWidth;
			y = window.innerHeight;
		} else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
			// IE 6+ in 'standards compliant mode'
			x = document.documentElement.clientWidth;
			y = document.documentElement.clientHeight;
		} else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
			// IE 4 compatible
			x = document.body.clientWidth;
			y = document.body.clientHeight;
		}

		return {
			"x" : x,
			"y" : y
		};
	}

}
