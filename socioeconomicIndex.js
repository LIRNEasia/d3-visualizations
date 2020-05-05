// Create title, introduction and empty SVG ------------------------------------
const width = 480;
const height = 480;
const margin = 20;

d3.select("#socioeconomic-index")
  .append("h1")
  .text("Socioeconomic Index (SEI)")

d3.select("#socioeconomic-index")
  .append("p")
  .text("Controls:")
  .append("ul")
  .append("li")
  .text("Double click on a GND to zoom in to it.")
  .append("li")
  .text("Click anywhere to reset the view.")
  .append("li")
  .text("Click and drag to pan.")
  .append("li")
  .text("Mouse wheel scroll to free zoom.")

d3.select("#socioeconomic-index")
  .append("p")
  .text("Corresponding touch controls should also work.")

d3.select("#socioeconomic-index")
  .append("svg")
  .attr("viewBox", [0, 0, width, height])
  .append("g")
const svg = d3.select("#socioeconomic-index")
  .select("svg")

const gndGroup = d3.select("#socioeconomic-index")
  .select("svg")
  .select("g")

// Read in the data ------------------------------------------------------------
Promise.all([
    d3.json("./resources/gnd_topo_simp.json"),
    d3.csv("./resources/gnd_combined_pc1.csv", d3.autoType)
  ])
  .then(function([jsonData, csvData]) {

    // Parse the data ----------------------------------------------------------
    const gndData = topojson.feature(jsonData, jsonData.objects.sri_lanka_gnd);

    gndData.features.forEach(gnd => {
      gndCode = parseInt(gnd.properties.code_7);
      if (csvData.find(d => d.code_7 === gndCode)) {
        gnd.properties.pc_1 = csvData.find(d => d.code_7 === gndCode).pc_1;
      } else {
        gnd.properties.pc_1 = null;
      }
      return gnd;
    });

    // Render the base map -----------------------------------------------------
    const geoProjection = d3.geoMercator()
      .fitExtent([
        [margin, margin],
        [width - margin, height - margin]
      ], gndData);

    const geoGenerator = d3.geoPath()
      .projection(geoProjection);

    gndGroup.selectAll("path")
      .data(gndData.features)
      .enter()
      .append("path");

    // Render the map colors ---------------------------------------------------
    const colorScale = d3.scaleSequential(
      d3.extent(csvData, d => d.pc_1), d3.interpolateYlGn
    );

    gndGroup.selectAll("path")
      .attr("d", geoGenerator)
      .attr("fill", d => colorScale(d.properties.pc_1))
      .attr("stroke", "none");

    // Render the legend -------------------------------------------------------
    svg.append("defs")
      .append("linearGradient")
      .attr("id", "socioeconomic-index-gradient")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", 0)
      .attr("y2", 1);

    for (var i = 0; i <= 100; i++) {
      svg.select("defs")
        .select("linearGradient")
        .append("stop")
        .attr("offset", i + "%")
        .attr("stop-color", d3.interpolateYlGn((100 - i) / 100))
    };

    svg.append("rect")
      .attr("x", 20)
      .attr("y", 20)
      .attr("width", 5)
      .attr("height", 100)
      .style("fill", "url(#socioeconomic-index-gradient)");

    svg.append("g")
      .attr("transform", "translate(25, 20) scale(0.5)")
      .call(
        d3.axisRight(
          d3.scaleLinear()
          .domain([d3.max(csvData, d => d.pc_1), d3.min(csvData, d => d.pc_1)])
          .range([0, 200])
        )
        .tickValues([
          d3.max(csvData, d => d.pc_1),
          0,
          d3.min(csvData, d => d.pc_1)
        ])
        .tickFormat(d3.format(".2f"))
      );

    // Define the zoom behaviour -----------------------------------------------
    const zoom = d3.zoom()
      .scaleExtent([0.5, 4])
      .on("zoom", function() {
        gndGroup
          .attr("transform", d3.event.transform)
          .select("#selected-gnd")
          .attr("stroke-width", 0.5 / d3.event.transform.k);
      });

    svg.on("click", function() {
      d3.event.stopPropagation();
      svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    });

    gndGroup.selectAll("path")
      .on("dblclick", function(d) {
        d3.event.stopPropagation();
        svg.transition().duration(750).call(
          zoom.transform,
          d3.zoomIdentity
          .translate(
            width / 2 - geoGenerator.centroid(d)[0] * 4,
            height / 2 - geoGenerator.centroid(d)[1] * 4
          )
          .scale(4)
        );
      })

    svg.call(zoom).on("dblclick.zoom", null);

    // Add mouse hover behaviour for each GND ----------------------------------
    gndGroup.selectAll("path")
      .on("mouseover", function() {
        d3.select(this)
          .raise()
          .attr("id", "selected-gnd")
          .attr("stroke", "black")
          .attr("stroke-width", function() {
            return 0.5 / d3.zoomTransform(this).k;
          });
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("id", null)
          .attr("stroke", "none");
      });

    // Add tooltips for each GND -----------------------------------------------
    $(function() {
      $('[data-toggle="tooltip"]').tooltip({
        html: true
      })
    });

    gndGroup.selectAll("path")
      .attr("data-toggle", "tooltip")
      .attr("title", function(d) {
        return "<div class='text-left'>" +
          "<b>Province: </b>" + d.properties.prov_name + "<br>" +
          "<b>District: </b>" + d.properties.dist_name + "<br>" +
          "<b>DSD: </b>" + d.properties.dsd_name + "<br>" +
          "<b>GND: </b>" + d.properties.gnd_name + "<br>" +
          "<b>SEI: </b>" + parseFloat(d.properties.pc_1).toFixed(2) + "</div>"
      });

    console.log("Done!")
  });
