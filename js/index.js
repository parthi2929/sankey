var margin = { top: 30, right: 30, bottom: 30, left: 30 };
var width = 500;
var height = 400;

var sankey = d3.sankeyCircular()
  .nodeWidth(10)
  .nodePadding(50)
  //.nodePaddingRatio(0.1)
  .size([width, height])
  .nodeId(function (d) {
    return d.name;
  })
  .nodeAlign(d3.sankeyCenter)
  .iterations(32)
  .circularLinkGap(2);

var svg = d3.select("#chart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

var g = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

//g.attr("transform", "rotate(90,"+ width/2  + "," + height/2 + ")")

var linkG = g.append("g")
  .attr("class", "links")
  .attr("fill", "none")
  .attr("stroke-opacity", 0.2)
  .selectAll("path");

  var linkLabels = g.append("g") //https://bl.ocks.org/tomshanley/2fa3ab297168fa21e95ec8260fb13e81

var nodeG = g.append("g")
  .attr("class", "nodes")
  .attr("font-family", "sans-serif")
  .attr("font-size", 12)  // parthi: want a bigger text
  .selectAll("g");

//run the Sankey + circular over the data
let sankeyData = sankey(data);
let sankeyNodes = sankeyData.nodes;
let sankeyLinks = sankeyData.links;

console.log(sankeyLinks);

let depthExtent = d3.extent(sankeyNodes, function (d) { return d.depth; });

var nodeColour = d3.scaleSequential(d3.interpolateCool)
  .domain([0, width]);

var node = nodeG.data(sankeyNodes)
  .enter()
  .append("g");

node.append("rect")
  .attr("x", function (d) { return d.x0; })
  .attr("y", function (d) { return d.y0; })
  .attr("height", function (d) { return d.y1 - d.y0; })
  .attr("width", function (d) { return d.x1 - d.x0; })
  .style("fill", function (d) { return nodeColour(d.x0); })
  .style("opacity", 0.5)
  .on("mouseover", function (d) {

    let thisName = d.name;

    node.selectAll("rect")
      .style("opacity", function (d) {
        return highlightNodes(d, thisName)
      })

    d3.selectAll(".sankey-link")
      .style("opacity", function (l) {
        return l.source.name == thisName || l.target.name == thisName ? 1 : 0.3;
      })

    node.selectAll("text")
      .style("opacity", function (d) {
        return highlightNodes(d, thisName)
      })
  })
  .on("mouseout", function (d) {
    d3.selectAll("rect").style("opacity", 0.5);
    d3.selectAll(".sankey-link").style("opacity", 0.7);
    d3.selectAll("text").style("opacity", 1);
  })

node.append("text")
  .attr("x", function (d) { return (d.x0 + d.x1) / 2; })
  .attr("y", function (d) { return d.y0 - 12; })
  .attr("dy", "0.35em")
  .attr("text-anchor", "middle")
  .text(function (d) { return d.name; });
  // .text(function (d) { return d.name + " " + (d.value); });

node.append("title")
  .text(function (d) { return d.name + "\n" + (d.value); });

var link = linkG.data(sankeyLinks)
  .enter()
  .append("g")

link.append("path")
  .attr("class", "sankey-link")
  .attr("d", function (link) {
    return link.path;
  })
  .style("stroke-width", function (d) { return Math.max(1, d.width); })
  .style("opacity", 0.7)
  .style("stroke", function (link, i) {
    return link.circular ? "red" : "black"
  })
  .each(addMinardLabels); //https://bl.ocks.org/tomshanley/2fa3ab297168fa21e95ec8260fb13e81

link.append("title")
  .text(function (d) {
    return d.source.name + " → " + d.target.name + "\n Index: " + (d.index);
  });


var arrowsG = linkG.data(sankeyLinks)
  .enter()
  .append("g")
  .attr("class", "g-arrow")
  .call(appendArrows, 20, 300, 4)

function highlightNodes(node, name) {

  let opacity = 0.3

  if (node.name == name) {
    opacity = 1;
  }
  node.sourceLinks.forEach(function (link) {
    if (link.target.name == name) {
      opacity = 1;
    };
  })
  node.targetLinks.forEach(function (link) {
    if (link.source.name == name) {
      opacity = 1;
    };
  })

  return opacity;

}

function addMinardLabels(link) {

  const gap = 50;
  let label = link.value

  var linkLength = this.getTotalLength();

  let n = Math.floor(linkLength / gap)

  for (var i = 1; i < 2; i++) {  //parthi: I want text only near source, so..

    let thisLength = (i * gap) - 10

    let position = this.getPointAtLength(thisLength)
    let positionPlueOne = this.getPointAtLength(thisLength + 5)

    let adj = positionPlueOne.x - position.x;
    let opp = position.y - positionPlueOne.y;
    let angle = Math.atan(opp / adj) * (180 / Math.PI);
    let rotation = 270 - angle;

    linkLabels.append("text")
      .attr("class", "link-label")
      .text(label)
      .attr("x", position.x)
      .attr("y", position.y)
      .attr("dy", "0.35em")
      .style("fill", "black")
      .style("text-anchor", "start") //parthi: it overlaps arrow head, so replacing middle with start
      .style("font-size",  "12px") //parthi: https://stackoverflow.com/a/15296649
      // .attr("transform", "rotate(" + rotation + "," + position.x + "," + position.y + ")")

  }
}