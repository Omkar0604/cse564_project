function pcp(country_name, year){
var margin = {top: 160, right: 50, bottom: 50, left: 100},
			width = 1100 - margin.left - margin.right,
			height = 630 - margin.top - margin.bottom;
	fetch('/pcp/' + country_name + '/' + year)
        .then(function(response){
        return response.json()
        }).then(function(data)  {
				var dimensions = [
				{
					name: "Group Name",
					scale: d3.scaleBand().range([height, 0]),
					type: "string"
				},
				{
					name: "City",
					scale: d3.scaleBand().range([height, 0]),
    				type: "string"
				},
				{
					name: "Attack Type",
					scale: d3.scaleBand().range([height, 0]),
    				type: "string"
				},
				{
					name: "Weapon Type",
					scale: d3.scaleBand().range([height, 0]),
    				type: "string"
				},
				{
					name: "Target Type",
					scale: d3.scaleBand().range([height, 0]),
    				type: "string"
				},
				{
					name: "Target Subtype",
					scale: d3.scaleBand().range([height, 0]),
					type: "string"
				},
			];
var color = d3.scaleOrdinal()
  .range(["#FF0000", "#FFC0CB", "#DC143C", "#FFA07A", "#FF6347", "#FF4500", "#FF8C00", "#FFD700", "#FF69B4", "#FF1493", "#B22222", "#A52A2A", "#8B0000", "#800000", "#FF5733", "#E60073", "#FF00FF", "#800080", "#9400D3", "#8A2BE2"])
//.range(["#5298af","#D58323","#bd1a9a","#54AF52","#8C92E8","#E15E5A","#725D82","#776327","#50AB84","#954D56","#AB9C27","#517C3F","#9D5130","#357468","#5E9ACF","#C47DCB","#7D9E33","#DB7F85","#BA89AD","#4C6C86","#B59248","#D8597D","#944F7E","#D67D4B","#8F86C2"]);


			var x = d3.scaleBand().domain(dimensions.map(function(d) { return d.name; })).range([0, width]),
	    		y = {},
	    		dragging = {};

            for(i in dimensions){
          var name=dimensions[i].name
          y[name]=d3.scaleLinear()
          .domain(d3.extent(data,function(d){ return +d[name]; }))
          .range([height,0])
        }

			var line = d3.line(),
				axis = d3.axisBottom(x).tickFormat(function(d){ return d.x;}),
				background,
				foreground;

            d3.selectAll("#pcp svg").remove()
			var svg = d3.select("#pcp").append("svg")
			.style("margin-left", "100px")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
				.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


				dimensions.forEach(function(dim) {
					dim.scale.domain(data.map(function(d, index) { 
						if (dim.name == 'City' || dim.name == 'Group Name' || dim.name == 'Target Subtype') {
							if (index % 2 == 1) {
								return d[dim.name]; 
							}
							return '';
						}
						return d[dim.name]; 
					}).sort().reverse());
				});

				// Add grey background lines for context.
				background = svg.append("g")
						.attr("class", "background")
					.selectAll("path")
						.data(data)
					.enter().append("path")
						.attr("d", path)
						.style("opacity", 0.2);

				// Add blue foreground lines for focus.
				foreground = svg.append("g")
						.attr("class", "foreground")
					.selectAll("path")
						.data(data)
					.enter().append("path")
					.attr("class", function (d) { return "line " + d['Group Name']} )
					.attr("d", path)
					.style("stroke", function(d){ return( color(d['Group Name']))} )
					.style("stroke-width",1.5)
                    .style("opacity", 0.8);

				// Add a group element for each dimension.
				var g = svg.selectAll(".dimensions")
							.data(dimensions)
						.enter().append("g")
							.attr("class", "dimensions")
							.attr("transform", function(d) { return "translate(" + x(d.name) + ")"; })
						.call(d3.drag()
								.subject(function(d) { return {x: x(d.name)}; })
							.on("start", function(d) {
								dragging[d.name] = x(d.name);
								// background.attr("visibility", "hidden");
							})
							.on("drag", function(d) {
								dragging[d.name] = Math.min(width, Math.max(0, d3.event.x));
								foreground.attr("d", path);
								dimensions.sort(function(a, b) { return position(a) - position(b); });
								x.domain(dimensions.map(function(d) { return d.name; }));
								g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
							})
							.on("end", function(d) {
								delete dragging[d.name];
								transition(d3.select(this)).attr("transform", "translate(" + x(d.name) + ")");
								transition(foreground).attr("d", path);
								background
									.attr("d", path)
									.transition()
										.delay(500)
										.duration(0)
										.attr("visibility", null);
							})
						);

				// Add an axis and title.
				g.append("g")
						.attr("class", "axis")
						.each( function(d) { d3.select(this).call(d3.axisLeft(d.scale)); })
						.append("text")
							.style("text-anchor", "middle")
							.style('text-shadow', 'none')
							.attr("class", "axis-label")
							.attr("y", -16)
							.text(function(d) { return d.name; })
							.style("fill", "white");



						// Add and store a brush for each axis.
                    // Add and store a brush for each axis.
				g.append("g")
				.attr("class", "brush")
				.each(function(d) {
					d3.select(this).call(
					y[d.name].brush= d3.brushY()
					.extent([[-10,0], [10,height]])
					// .on("start", brushstart)
					.on("brush", brush)
					// .on("end", brush)
					)
				})
				.selectAll("rect")
				// .style('stroke', 'white')
				.attr("x", -8)
				.attr("width", 16);



			function position(d) {
				var v = dragging[d.name];
				return v == null ? x(d.name) : v;
			}

			function transition(g) {
				return g.transition().duration(500);
			}

			// Returns the path for a given data point.
			function path(d) {
				//return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
				return line(dimensions.map(function(dim) {
					var v = dragging[dim.name];
					var tx = v == null ? x(dim.name) : v;
					return [tx, dim.scale(d[dim.name]) + dim.scale.bandwidth() / 2];
				}));
			}

			function brush() {
				// console.log('here')
				var actives = dimensions.filter(function(d) { return typeof y[d.name].brush != 'undefined'; });
				// console.log(actives)
				var extents = actives.map(function(d) { /*console.log(d);*/ return y[d.name].brush.extent(); });
				foreground.style("display", function(d) {
				  return actives.every(function(p, i) {
					return extents[i][0] <= d[p.name] && d[p.name] <= extents[i][1];
				  }) ? null : "none";
				});
			}

			function brushstart() {
      d3.event.sourceEvent.stopPropagation();
    }

			// Handles a brush event, toggling the display of foreground lines.
			function brush2() {
				var actives=[];
        svg.selectAll(".brush")
        .filter(function(d){
            return d3.brushSelection(this);
        })
        .each(function(key){
          //console.log(key);
            actives.push({
              dimension: key.name,
              extent: d3.brushSelection(this)
            });
          });
          if(actives.length===0){
            foreground.style("display",null);
          }
          else{
            foreground.style("display",function(d){
              return actives.every(function(brushObj){
                return brushObj.extent[0]<=y[brushObj.dimension](d[brushObj.dimension]) && y[brushObj.dimension](d[brushObj.dimension]) <= brushObj.extent[1];
              }) ? null : "none";
            });
          }

			}


});

  }
