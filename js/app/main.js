/**
 * Program runs
 *
 * This is the body of the application, responsible for binding interface interaction etc
 */
function main() {

	var h = document.getElementsByTagName('html')[0];
		h.style.padding = 0;
		h.style.margin = 0;
		h.style.width = "100%";
		h.style.height = "100%";

	var b = document.getElementsByTagName('body')[0];
		b.style.padding = 0;
		b.style.margin = 0;
		b.style.width = "100%";
		b.style.height =  "100%";
		b.style.overflow = "hidden";

	var scale = system.get_scale();
	var container = document.getElementById('draw');

	var a = new jigglewriter({
		"range" : 10,
		"width" : scale.x,
		"height" : scale.y,
		"container" : container
	});

	document.onmousemove = function(e) {
		a.move_to( e.clientX, e.clientY );
		// a2.move_to( e.clientX, e.clientY );
	}

	document.onmousedown = function(e) {
		a.start_drawing();
		// a2.start_drawing();
	}

	document.onmouseup = function(e) {
		a.stop_drawing();
		// a2.stop_drawing();
	}

	$("#controls")
		.bind("mouseover",function(e){
			a.disable();
		})
		.bind("mouseout",function(e){
			a.enable();
		})
		.draggable({
			snap : "#buttons",
			containment : "body"
		});

	$("#buttons")
		.bind("mouseover",function(e){
			a.disable();
		})
		.bind("mouseout",function(e){
			a.enable();
		})
		.draggable({
			snap : "#controls",
			containment : "body"
		});


	// Init sliders

	$( ".slider" ).each(function(){

		var vals = $(this).text().split(",");

		switch(vals[0]) {

			case "range":
			
				$(this)
					.empty()
					.slider({
						values: [ parseInt(vals[1]), parseInt(vals[2]) ],
						range: true,
						max : parseInt(vals[4]),
						min : parseInt(vals[3]),
						animate: true,
						orientation: "vertical",
						change : function(e,ui){
							a[ $(this).data("map_min") ] = $(ui).slider("value")[0].values[0];
							a[ $(this).data("map_max") ] = $(ui).slider("value")[0].values[1];
						}
					})
					.data("map_min",vals[5])
					.data("map_max",vals[6]);

			break;

			default:
			case "single":

				$(this)
					.empty()
					.data("map",vals[4])
					.slider({
						value: parseInt(vals[1]),
						range: false,
						max : parseInt(vals[3]),
						min : parseInt(vals[2]),
						animate: true,
						orientation: "vertical",
						change : function(e,ui){
							a[ $(this).data("map") ] = $(ui).slider("value")[0].value;
						}
					});

			break;
			
		}

	});

	$("#download")
		.button({"icons" : { primary : "ui-icon-disk" }})
		.bind("click",function(e){

			try {

				$(this).button("disable");
	
				a.disable();
	
	
				$("#buttons").fadeOut();
				$("#controls").fadeOut();
	
				var _b = this;
				var _a = a;
	
				$("<div/>")
					.attr("id","process")
					.insertBefore("#draw");
	
				var c = document.createElement("canvas");
					c.setAttribute("width",$("#process").width());
					c.setAttribute("height",$("#process").height());
				
				var p = document.getElementById("process");
					p.appendChild( c );
	
				var h = new harvester({
					canvas : a.canvas,
					indicator_canvas : c,
					session_rpc : "images/session.php",
					chunk_rpc : "images/chunk.php",
					complete_rpc : "images/image.php",
					open_on_complete : false,
					complete_callback : function(image) {
	
						$("#process").fadeOut(500,function(){
							$(this)
								.empty()
								.remove();
						});
	
						$("#buttons").fadeIn();
						$("#controls").fadeIn();
						$(_b).button("enable");
						_a.enable();
	
						$("<div/>")
							.attr("id","download_pane")
							.appendTo("body");
	
						delete(this);
	
					}
				});

			} catch (e) {
				
				
				alert(e);	

			}


		});

	$("#hide")
		.button({"icons" : { primary : "ui-icon-circle-close" }})
		.bind("click",function(e){

			$("#controls").toggle();

		});

	a.run();

}

$(main);


/**
 * Wait until the document is ready then fire off this crap
 */
/*

// moving this to jQuery doc ready since we have that anyway
function boot(f) {
	if (!document.getElementsByTagName('body')[0]) {
		setTimeout(function(){boot(f);},1);
	} else {
		f();
	}
}
boot(main);

*/