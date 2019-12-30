
// pass the value for when input the color
function setTextColor(picker) {
  setColor(picker.toString());
}

//function to change text color according to the background color
var textColor = document.getElementsByClassName("text");


var m = [20, 120, 20, 120],
//w = 1280 - m[1] - m[3],
w = 900 - m[1] - m[3],
h = 500 - m[0] - m[2],
i = 0,
root;


// default sizes for shapes
var CIRCSIZE = 45;
var RECTSIZE = 75;
var PADDING = 40;
var MAX_TEXT_WIDTH = 60;
var SMALLSIZE = 1e-06;

// default color for shapes

var DEFUALT_COLOR = "#FFDD0";

var getDirection = function(data){
  if(!data){
    return 'root';
  }
  if(data.position){
    return data.position;
  }
  return getDirection(data.parent);
};

var selectNode = function(target){
  if(target){
    var sel = d3.selectAll('#body svg .node').filter(function(d){return d.id==target.id})[0][0];
    if(sel){
      select(sel);
    }
  }
};

// bind arrow key left to move selection to left when clicked
Mousetrap.bind('left', function(){
  // left key pressed
  var selection = d3.select(".node.selected")[0][0];
  if(selection){
    var data = selection.__data__;
    var dir = getDirection(data);
    switch(dir){
      case('right'):
      case('root'):
      selectNode(data.parent || data.left[0]);
      break;
      case('left'):
      selectNode((data.children||[])[0]);
      break;
      default:
      break;
    }
  }
});

// bind arrow key right to move selection to right when clicked
Mousetrap.bind('right', function(){
  // right key pressed
  var selection = d3.select(".node.selected")[0][0];
  if(selection){
    var data = selection.__data__;
    var dir = getDirection(data);
    switch(dir){
      case('left'):
      case('root'):
      selectNode(data.parent || data.right[0]);
      break;
      case('right'):
      selectNode((data.children||[])[0]);
      break;
      default:
      break;
    }
  }
});

// bind arrow key up to move selection to up when clicked
Mousetrap.bind('up', function(){
  // up key pressed
  var selection = d3.select(".node.selected")[0][0];
  if(selection){
    var data = selection.__data__;
    var dir = getDirection(data);
    switch(dir){
      case('root'):
      break;
      case('left'):
      case('right'):
      var p = data.parent, nl = p.children || [], i=1;
      if(p[dir]){
        nl = p[dir];
      }
      l = nl.length;
      for(; i<l; i++){
        if(nl[i].id === data.id){
          selectNode(nl[i-1]);
          break;
        }
      }
      break;
    }
  }
  return false;
});

// bind arrow key down to move selection to down when clicked
Mousetrap.bind('down', function(){
  // down key pressed
  // up key pressed
  var selection = d3.select(".node.selected")[0][0];
  if(selection){
    var data = selection.__data__;
    var dir = getDirection(data);
    switch(dir){
      case('root'):
      break;
      case('left'):
      case('right'):
      var p = data.parent, nl = p.children || [], i=0;
      if(p[dir]){
        nl = p[dir];
      }
      l = nl.length;
      for(; i<l-1; i++){
        if(nl[i].id === data.id){
          selectNode(nl[i+1]);
          break;
        }
      }
      break;
    }
  }
  return false;
});

// bind ket insert to fucntion addnode
Mousetrap.bind('ins', function(){
  addChild();
});

//bind key delete to function delnode
Mousetrap.bind('del', function(){
  var selection = d3.select(".node.selected")[0][0];
  if(selection){
    var data = selection.__data__;
    var dir = getDirection(data);
    if(dir==='root'){
      alert('Can\'t delete root');
      return;
    }
    var cl = data.parent[dir] || data.parent.children;
    if(!cl){
      alert('Could not locate children');
      return;
    }
    var i = 0, l = cl.length;
    for(; i<l; i++){
      if(cl[i].id === data.id){
        if(confirm('Sure you want to delete '+data.name+'?') === true){
          cl.splice(i, 1);
        }
        break;
      }
    }
    selectNode(root);
    update(root);
  }
});

// function delNode
// to delete the current select node

var delNode = function(){
  var selection = d3.select(".node.selected")[0][0];
  if(selection){
    var data = selection.__data__;
    var dir = getDirection(data);
    if(dir==='root'){
      alert('Can\'t delete root');
      return;
    }
    var cl = data.parent[dir] || data.parent.children;
    if(!cl){
      alert('Could not locate children');
      return;
    }
    var i = 0, l = cl.length;
    for(; i<l; i++){
      if(cl[i].id === data.id){
        if(confirm('Sure you want to delete '+data.name+'?') === true){
          cl.splice(i, 1);
        }
        break;
      }
    }
    selectNode(root);
    update(root);
  }
}

//bind key enter to function add name of node
Mousetrap.bind('enter', function(){
  var selection = d3.select(".node.selected")[0][0];
  if(selection){
    var data = selection.__data__;
    data.name = prompt('New text:', data.name) || data.name;
    update(root);
  }
});

//bind key space to function add description of node
Mousetrap.bind('space', function(){
  var selection = d3.select(".node.selected")[0][0];
  if(selection){
    var data = selection.__data__;
    data.description = prompt('Description:', data.description) || data.description;
    update(root);;
  }
});

// function addNodes
// take direction : left / right as arguments
// new node will be add depends on the direction argument
var addNodes = function(dir){
  /*  root[dir].push({name: 'bar', position: dir, shape: 'circle'}, {name: 'none', position: dir, shape: 'circle'}, {name: 'some', position: dir, shape: 'circle'}, {name: 'value', position: dir, shape: 'circle'});*/
  root[dir].push( {name: 'none', position: dir, shape: 'ellipse', description: ''});
  update(root);
};

//as new node added under a specific node, that node has new children.
var addChild = function() {
  var selection = d3.select(".node.selected")[0][0];
  if(selection){
    var data = selection.__data__;
    var dir = getDirection(data);
    var shape = 'circle';
    var name = prompt('New name');
    if(name){
      if(dir==='root'){
        dir = data.right.length>data.left.length?'left':'right';
      }
      var cl = data[dir] || data.children || data._children;
      if(!cl){
        cl = data.children = [];
      }
      cl.push({name: name, position: dir, shape: shape});
      update(root);
    }
  }
};

// fucntion to set node name
// input take in window prompt when button or key is ciclked.
var addNodeName = function(){
  var selection = d3.select(".node.selected")[0][0];
  if(selection){
    var data = selection.__data__;
    data.name = prompt('New text:', data.name) || data.name;
    data.description = "";

    update(root);
  }
}

// fucntion to move the node
//take 2 argument as one time: left, Right
// will move the existed node according to the arguments given
var moveNodes = function(from, to){
  var tmp = root[from].shift();
  tmp.position = to;
  root[to].push(tmp);
  update(root);
};

//function to change the connector style of the egdes
// 2 arguments are: diagonal or elbow
// egde style will change accordingly
var setConnector = function(type){
  connector = window[type];
  update(root);
};

//fuction to select a specific node
var select = function(node){
  // Find previously selected, unselect
  d3.select(".selected").classed("selected", false);
  // Select current item
  d3.select(node).classed("selected", true);
  //  $("div.description_box").hide();
  getDescription();
};

// fucntiont hat wipe out current data and create a new map
// which starts with only 1 main topic node
var createNew = function(){
  root = {name: 'Root', children: [], left: [], right: [], shape: 'circle'};
  update(root, true);
  selectNode(root);
};

var handleClick = function(d, index){
  select(this);
  update(d);
};

// sets color of selected node's shape to the color given as a string
var setColor = function(color) {
  var node = d3.select(".node.selected");
  node[0][0].__data__.color = color;
  node.select(node[0][0].__data__.shape).style("fill", color);
};


//link with button and window prompt
var addDescription = function(){
  var selection = d3.select(".node.selected")[0][0];
  if(selection){
    var data = selection.__data__;
    data.description = prompt('Description:', data.description) || data.description;
    update(root);
  }
}

// fucntion for updating the description box (id = note).
// allow user to type directly inside the box to modify the existed description
$('#note').on('keypress',function(event){
  if(event.keyCode === 13){
    //console.log(event.target.value);
    var selection = d3.select(".node.selected")[0][0];
    //  if(selection){
    var data = selection.__data__;
    data.description = event.target.value;
    update(root);
    //console.log(event.target.value);
    //event.target.value = '';
    console.log(data.description);
    //  }
  }
  //console.log(event);
});

function clearContents(element) {
  element.value = '';
}

// retreives the description saved to the currently selected node
var getDescription = function() {
  var selection = d3.select(".node.selected")[0][0];
  if(selection){
    var data = selection.__data__;
    $("div.description_box").show();
    $("#topic").html(data.name);
    //$("#detail").html(data.description);
    //$("#note").value = $("#note").defaultValue;
    $("#note").val(data.description);
    //  $("#note").html(data.description);
  }
  //return data.description;
}

// changes the shape of the currently selected node to the provided svg shape
var changeShape = function(newShape) {
  var svg = d3.select(".node.selected");
  var node = svg[0][0];
  console.log(node);
  svg.select(node.__data__.shape).remove();
  node.__data__.shape = newShape;
  console.log(node.__data__.shape);
  appendShape(svg, false);
}

// adds a shape to a node, isSmall will make it the smallest and therefore invisible size
var appendShape = function(node, isSmall) {
  node.append(function(d) {
    console.log("hi");
    var s = document.createElementNS("http://www.w3.org/2000/svg", d.shape);
    var w = getTextWidth(node) + PADDING;
    var h = getTextHeight(node) + PADDING;
    switch (d.shape) {
      case "circle":
      //s.setAttribute("r", isSmall ? SMALLSIZE : CIRCSIZE);
      s.setAttribute("r", isSmall ? SMALLSIZE : w / 2);
      break;
      case "rect":
      s.setAttribute("width", isSmall ? SMALLSIZE : w);
      s.setAttribute("height", isSmall ? SMALLSIZE: h);
      s.setAttribute("x", - w / 2);
      s.setAttribute("y", - h / 2);
      break;
      case "ellipse":
      s.setAttribute("rx", isSmall ? SMALLSIZE : w / 2);
      s.setAttribute("ry", isSmall ? SMALLSIZE : h / 2);
    }
    return s;
  }).style("fill", function(d) { return d.color ? d.color : DEFUALT_COLOR });
  node.append(function() {
    return node.select("text").remove().node();
  });
}

//fucntion to resize shape of node coording to panning and zooming
var resizeShape = function(node, shape, s, isSmall) {
  var w = getTextWidth(node) + PADDING;
  var h = getTextHeight(node) + PADDING;
  switch (shape) {
    case "circle":
    s.attr("r", isSmall ? SMALLSIZE : w / 2);
    break;
    case "rect":
    s.attr("width", isSmall ? SMALLSIZE : w);
    s.attr("height", isSmall ? SMALLSIZE: h);
    s.attr("x", - w / 2);
    s.attr("y", - h / 2);
    break;
    case "ellipse":
    s.attr("rx", isSmall ? SMALLSIZE : w / 2);
    s.attr("ry", isSmall ? SMALLSIZE : h / 2);
  }
}

// adds a shape to a node
var appendText = function(node) {
  console.log(node);
  node.append("svg:text")
  .attr("dy", 3)
  .attr("text-anchor", "middle")
  .attr("color", document.getElementById("aa").style.color)
  .text(function(d) { return (d.name || d.text); })
  .style("fill-opacity", 1)
  .style("color", document.getElementById("aa").style.color);

}

var count = 0;
//get text width function
var getTextWidth = function(node) {
  console.log(node);
  console.log(node.select("text"));
  console.log(node.select("text").node());
  console.log(node.select("text").node().getBBox().width);
  count++;
  console.log(count);
  return node.select("text").node().getBBox().width;
}
//gett text width function
var getTextHeight = function(node) {
  return node.select("text").node().getBBox().height;
}

var tree = d3.layout.tree()
.size([h, w]);

var calcLeft = function(d){
  var l = d.y;
  if(d.position==='left'){
    l = (d.y)-w/2;
    l = (w/2) + l;
  }
  return {x : d.x, y : l};
};

//for diagonal egdes style
var diagonal = d3.svg.diagonal()
.projection(function(d) { return [d.y, d.x]; });
var elbow = function (d, i){
  var source = calcLeft(d.source);
  var target = calcLeft(d.target);
  var hy = (target.y-source.y)/2;
  return "M" + source.y + "," + source.x
  + "H" + (source.y+hy)
  + "V" + target.x + "H" + target.y;
};

var connector = elbow;

var vis = d3.select("#body")
.append("svg:svg")
.attr("width", "900").attr("height", "500")
.call(d3.behavior.zoom().on("zoom", function () {
  vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
}))
.append("svg:g")
.attr("transform", "translate(" + (w/2+m[3]) + "," + m[0] + ")");

//fucntion allow to load map data as JSON file
var loadJSON = function(fileName){
  //d3.json("/data/data.json", function(json) {
  d3.json(fileName, function(json) {
    var i=0, l=json.children.length;
    window.data = root = json;
    root.x0 = h / 2;
    root.y0 = 0;

    json.left = [];
    json.right = [];
    for(; i<l; i++){
      if(i%2){
        json.left.push(json.children[i]);
        json.children[i].position = 'left';
      }else{
        json.right.push(json.children[i]);
        json.children[i].position = 'right';
      }
    }

    update(root, true);
    selectNode(root);
  });
};

var loadFreeMind = function(fileName){
  d3.xml(fileName, 'application/xml', function(err, xml){
    // Changes XML to JSON
    function xmlToJson(xml) {

      // Create the return object
      var obj = {};

      if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
          obj["@attributes"] = {};
          for (var j = 0; j < xml.attributes.length; j++) {
            var attribute = xml.attributes.item(j);
            obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
          }
        }
      } else if (xml.nodeType == 3) { // text
        obj = xml.nodeValue;
      }

      // do children
      if (xml.hasChildNodes()) {
        for(var i = 0; i < xml.childNodes.length; i++) {
          var item = xml.childNodes.item(i);
          var nodeName = item.nodeName;
          if (typeof(obj[nodeName]) == "undefined") {
            obj[nodeName] = xmlToJson(item);
          } else {
            if (typeof(obj[nodeName].push) == "undefined") {
              var old = obj[nodeName];
              obj[nodeName] = [];
              obj[nodeName].push(old);
            }
            obj[nodeName].push(xmlToJson(item));
          }
        }
      }
      return obj;
    };
    var js = xmlToJson(xml);
    var data = js.map.node;
    var parseData = function(data, direction){
      var key, i, l, dir = direction, node = {}, child;
      for(key in data['@attributes']){
        node[key.toLowerCase()] = data['@attributes'][key];
      }
      node.direction = node.direction || dir;
      l = (data.node || []).length;
      if(l){
        node.children = [];
        for(i=0; i<l; i++){
          dir = data.node[i]['@attributes'].POSITION || dir;
          child = parseData(data.node[i], {}, dir);
          (node[dir] = node[dir] || []).push(child);
          node.children.push(child);
        }
      }
      return node;
    };
    root = parseData(data, 'right');
    root.x0 = h / 2;
    root.y0 = w / 2;
    update(root, true);
    selectNode(root);
  });
};
//*/

var toArray = function(item, arr, d){
  arr = arr || [];
  var dr = d || 1;
  var i = 0, l = item.children?item.children.length:0;
  arr.push(item);
  if(item.position && item.position==='left'){
    dr = -1;
  }
  item.y = dr * item.y;
  for(; i < l; i++){
    toArray(item.children[i], arr, dr);
  }
  return arr;
};

function update(source, slow) {
  var duration = (d3.event && d3.event.altKey) || slow ? 1000 : 100;

  // Compute the new tree layout.
  var nodesLeft = tree
  .size([h, (w/2)-20])
  .children(function(d){
    return (d.depth===0)?d.left:d.children;
  })
  .nodes(root)
  .reverse();
  var nodesRight = tree
  .size([h, w/2])
  .children(function(d){
    return (d.depth===0)?d.right:d.children;
  })
  .nodes(root)
  .reverse();
  root.children = root.left.concat(root.right);
  root._children = null;
  var nodes = toArray(root);

  // Normalize for fixed-depth.
  //nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes…
  var node = vis.selectAll("g.node")
  .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("svg:g")
  .attr("class", function(d){ return d.selected?"node selected":"node"; })
  .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
  .on("click", handleClick);

  appendText(nodeEnter, true);

  nodeEnter.each(function(d) {
    appendShape(d3.select(this), true);
  });

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
  //.attr("class", function(d){ return d.selected?"node selected":"node"; })
  .duration(duration)
  .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("text")
  .text(function(d) { return (d.name || d.text); });

  nodeUpdate.each(function(d, i) {
    var node = d3.select(this);
    resizeShape(node, d.shape, node.select(d.shape), false);
  });
  //nodeUpdate.select("rect").attr("width", RECTSIZE).attr("height", RECTSIZE);
  //.style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
  .duration(duration)
  .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
  .remove();

  nodeExit.select("circle").attr("r", SMALLSIZE);
  nodeExit.select("rect").attr("width", SMALLSIZE).attr("height", SMALLSIZE);
  nodeExit.select("ellipse").attr("rx", SMALLSIZE).attr("ry", SMALLSIZE);


  nodeExit.select("text")
  .style("fill-opacity", SMALLSIZE);

  // Update the links…
  var link = vis.selectAll("path.link")
  .data(tree.links(nodes), function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("svg:path", "g")
  .attr("class", "link")
  .attr("d", function(d) {
    var o = {x: source.x0, y: source.y0};
    return connector({source: o, target: o});
  })
  .transition()
  .duration(duration)
  .attr("d", connector);

  // Transition links to their new position.
  link.transition()
  .duration(duration)
  .attr("d", connector);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
  .duration(duration)
  .attr("d", function(d) {
    var o = {x: source.x, y: source.y};
    return connector({source: o, target: o});
  })
  .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children.
function toggle(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
}
connector = diagonal;
loadJSON('data.json');
