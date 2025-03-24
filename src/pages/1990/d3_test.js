// import * as d3 from "d3";

// // import "./styles.css";

// const svg = d3.select("svg");
// svg.attr("pointer-events", "none");

// const margin = { top: 20, right: 20, bottom: 30, left: 60 };

// var canvas = d3.select("canvas");

// const width = +canvas.attr("width") - margin.left - margin.right;
// const height = +canvas.attr("height") - margin.top - margin.bottom;

// canvas = d3
//   .select("canvas")
//   .style(
//     "transform",
//     "translate(" +
//       (margin.left + 1) +
//       "px" +
//       "," +
//       (margin.top + 1) +
//       "px" +
//       ")"
//   )
//   .style("width", width - 1 + "px")
//   .style("height", height - 1 + "px");

// var dpr = window.devicePixelRatio || 1;
// // Get the size of the canvas in CSS pixels.
// var rect = canvas.node().getBoundingClientRect();
// // Give the canvas pixel dimensions of their CSS
// // size * the device pixel ratio.
// canvas.node().width = rect.width * dpr;
// canvas.node().height = rect.height * dpr;

// var context = canvas.node().getContext("2d");
// context.scale(dpr, dpr);

// const g = svg
//   .append("g")
//   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// var x = d3
//   .scaleTime()
//   .domain([d3.timeDay.offset(new Date(), -60), new Date()])
//   .range([0, width]);

// var y = d3.scaleLinear().range([height, 0]);

// var xAxis = d3.axisBottom(x);
// var yAxis = d3.axisLeft(y);

// let data = d3.csvParse(require("./test-values.csv"));

// data = data.map(function(d) {
//   d.date = d3.isoParse(d.date);
//   d.value = +d.value;
//   return d;
// });

// var xExtent = d3.extent(data, function(d) {
//   return d.date;
// });

// var zoom = d3
//   .zoom()
//   .scaleExtent([1 / 4, 200])
//   .translateExtent([[-width, -Infinity], [2 * width, Infinity]])
//   .on("zoom", zoomed);

// zoom.translateExtent([[x(xExtent[0]), -Infinity], [x(xExtent[1]), Infinity]]);
// y.domain([
//   d3.min(data, function(d) {
//     return d.value * 0.98;
//   }),
//   d3.max(data, function(d) {
//     return d.value * 1.02;
//   })
// ]);

// var detachedContainer = document.createElement("custom");

// // Create a d3 selection for the detached container. We won't
// // actually be attaching it to the DOM.
// var dataContainer = d3.select(detachedContainer);

// var leaf = dataContainer.selectAll("custom.rect").data(data);

// const asd = leaf
//   .enter()
//   .append("custom")
//   .classed("circle", true)
//   .attr("r", 2)
//   .attr("fillStyle", "#B3D137")
//   .attr("x", d => {
//     return x(d.date);
//   })
//   .attr("y", d => {
//     return y(d.value) + 1;
//   });

// leaf.exit().remove();

// function drawCanvas() {
//   // clear canvas
//   context.clearRect(0, 0, canvas.attr("width"), canvas.attr("height"));

//   var elements = dataContainer.selectAll("custom.circle");
//   elements.each(function(d) {
//     var node = d3.select(this);

//     context.beginPath();
//     context.fillStyle = node.attr("fillStyle");
//     context.arc(node.attr("x"), node.attr("y"), node.attr("r"), 0, Math.PI * 2);
//     context.fill();
//     context.closePath();
//   });
// }

// var yGroup = g.append("g");
// var xGroup = g
//   .append("g")
//   .attr("transform", "translate(0," + height + ")")
//   .call(g => g.select(".domain").remove());

// var zoomRect = svg
//   .append("rect")
//   .attr("width", width)
//   .attr("height", height)
//   .attr("fill", "none");

// g.append("clipPath")
//   .attr("id", "clip")
//   .append("rect")
//   .attr("width", width)
//   .attr("height", height);

// yGroup
//   .call(yAxis)
//   .call(g => g.select(".domain").remove())
//   .call(g =>
//     g
//       .selectAll(".tick line")
//       //.clone()
//       .attr("x2", width)
//       .attr("stroke", "#333e42")
//   );

// zoomRect.call(zoom.transform, d3.zoomIdentity);

// d3.select(context.canvas)
//   .attr("pointer-events", "all")
//   .call(zoom);

// d3.select(context.canvas).call(zoom.transform, d3.zoomIdentity);

// function zoomed() {
//   var xz = d3.event.transform.rescaleX(x);
//   xGroup.call(xAxis.scale(xz)).call(g =>
//     g
//       .selectAll(".tick line")
//       .attr("y2", margin.bottom - height - 2)
//       .attr("stroke", "#333e42")
//   );

//   asd
//     .attr("x", d => {
//       return xz(d.date);
//     })
//     .attr("y", d => {
//       return y(d.value) + 1;
//     });

//   drawCanvas();
// }
