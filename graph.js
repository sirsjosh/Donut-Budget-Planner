import { onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db, expensesRef } from "./main";
const dims = { height: 300, width: 300, radius: 150 };
const center = { x: dims.width * 0.5 + 5, y: dims.height * 0.5 + 5 };

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", dims.width + 150)
  .attr("height", dims.height + 150);

const graph = svg
  .append("g")
  .attr("transform", `translate(${center.x},${center.y})`)
  .attr("fill", "red");

const pie = d3
  .pie()
  .sort(null)
  .value((d) => d.cost);

const arcPath = d3
  .arc()
  .outerRadius(dims.radius)
  .innerRadius(dims.radius * 0.5);

// set ordinal
const color = d3.scaleOrdinal(d3["schemeSet3"]);

//legend setup
const legendGroup = svg
  .append("g")
  .attr("transform", `translate(${dims.width + 40},20)`);

const legend = d3.legendColor().shape("circle").shapePadding(10).scale(color);

//setting the tip
const tip = d3
  .tip()
  .attr("class", "d3-tip card")
  .html((e, d) => {
    let content = `<div class="name">${d.data.name}</div>`;
    content += `<div class="cost">£${d.data.cost}</div>`;
    content += `<div class="delete">Click slice to delete</div>`;
    return content;
  });

graph.call(tip);

//update function
const update = (data) => {
  //update color scale domain
  color.domain(data.map((d) => d.name));

  //update and call legend
  legendGroup.call(legend);
  legendGroup.selectAll("text").attr("fill", "white");

  //join enhance(pie) data to path elements
  const paths = graph.selectAll("path").data(pie(data));

  //handle exit selection
  paths.exit().transition().duration(750).attrTween("d", arcTweenExit).remove();

  //handle the current dom paths
  paths
    .attr("d", arcPath)
    .transition()
    .duration(750)
    .attrTween("d", arcTweenUpdate);

  paths
    .enter()
    .append("path")
    .attr("class", "arc")
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .attr("fill", (d) => color(d.data.name))
    .transition()
    .duration(750)
    .attrTween("d", arcTweenEnter);

  //add events
  graph
    .selectAll("path")
    .on("mouseover", (e, d) => {
      tip.show(e, d);
      handleMouseOver(e, d);
    })
    .on("mouseout", (e, d) => {
      tip.hide();
      handleMouseOut(e, d);
    })
    .on("click", handleClick);
};

let data = [];

onSnapshot(expensesRef, (res) => {
  res.docChanges().forEach((change) => {
    const doc = { ...change.doc.data(), id: change.doc.id };

    switch (change.type) {
      case "added":
        data.push(doc);
        break;
      case "modified":
        const index = data.findIndex((item) => item.id === doc.id);
        data[index] = doc;
        break;
      case "removed":
        data = data.filter((item) => item.id !== doc.id);
        break;
      default:
        break;
    }
  });
  update(data);
});

//tweening
const arcTweenEnter = (d) => {
  let i = d3.interpolate(d.endAngle, d.startAngle);

  return function (t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

const arcTweenExit = (d) => {
  let i = d3.interpolate(d.startAngle, d.endAngle);

  return function (t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

//use function to allow us to use this keyword
function arcTweenUpdate(d) {
  //interpolate
  let i = d3.interpolate(this._current, d);
  this._current = i(1);
  return function (t) {
    return arcPath(i(t));
  };
}

//event handlers
const handleMouseOver = (e, d) => {
  d3.select(e.currentTarget)
    .transition("changeSliceFill")
    .duration(300)
    .attr("fill", "white");
};

const handleMouseOut = (e, d) => {
  d3.select(e.currentTarget)
    .transition("changeSliceFill")
    .duration(300)
    .attr("fill", color(d.data.name));
};

const handleClick = (e, d) => {
  const id = d.data.id;
  const docRef = doc(db, "expenses", id);
  deleteDoc(docRef);
};
