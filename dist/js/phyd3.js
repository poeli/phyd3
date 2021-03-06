var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.defineProperty =
  $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties
    ? Object.defineProperty
    : function (d, b, a) {
      d != Array.prototype && d != Object.prototype && (d[b] = a.value);
    };
$jscomp.getGlobal = function (d) {
  return "undefined" != typeof window && window === d
    ? d
    : "undefined" != typeof global && null != global
      ? global
      : d;
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.polyfill = function (d, b, a, f) {
  if (b) {
    a = $jscomp.global;
    d = d.split(".");
    for (f = 0; f < d.length - 1; f++) {
      var h = d[f];
      h in a || (a[h] = {});
      a = a[h];
    }
    d = d[d.length - 1];
    f = a[d];
    b = b(f);
    b != f &&
      null != b &&
      $jscomp.defineProperty(a, d, {
        configurable: !0,
        writable: !0,
        value: b
      });
  }
};
$jscomp.polyfill(
  "Number.MAX_SAFE_INTEGER",
  function () {
    return 9007199254740991;
  },
  "es6",
  "es3"
);
$jscomp.SYMBOL_PREFIX = "jscomp_symbol_";
$jscomp.initSymbol = function () {
  $jscomp.initSymbol = function () { };
  $jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol);
};
$jscomp.Symbol = (function () {
  var d = 0;
  return function (b) {
    return $jscomp.SYMBOL_PREFIX + (b || "") + d++;
  };
})();
$jscomp.initSymbolIterator = function () {
  $jscomp.initSymbol();
  var d = $jscomp.global.Symbol.iterator;
  d || (d = $jscomp.global.Symbol.iterator = $jscomp.global.Symbol("iterator"));
  "function" != typeof Array.prototype[d] &&
    $jscomp.defineProperty(Array.prototype, d, {
      configurable: !0,
      writable: !0,
      value: function () {
        return $jscomp.arrayIterator(this);
      }
    });
  $jscomp.initSymbolIterator = function () { };
};
$jscomp.arrayIterator = function (d) {
  var b = 0;
  return $jscomp.iteratorPrototype(function () {
    return b < d.length ? { done: !1, value: d[b++] } : { done: !0 };
  });
};
$jscomp.iteratorPrototype = function (d) {
  $jscomp.initSymbolIterator();
  d = { next: d };
  d[$jscomp.global.Symbol.iterator] = function () {
    return this;
  };
  return d;
};
$jscomp.iteratorFromArray = function (d, b) {
  $jscomp.initSymbolIterator();
  d instanceof String && (d += "");
  var a = 0,
    f = {
      next: function () {
        if (a < d.length) {
          var h = a++;
          return { value: b(h, d[h]), done: !1 };
        }
        f.next = function () {
          return { done: !0, value: void 0 };
        };
        return f.next();
      }
    };
  f[Symbol.iterator] = function () {
    return f;
  };
  return f;
};
$jscomp.polyfill(
  "Array.prototype.values",
  function (d) {
    return d
      ? d
      : function () {
        return $jscomp.iteratorFromArray(this, function (b, a) {
          return a;
        });
      };
  },
  "es6",
  "es3"
);
(function () {
  "undefined" == typeof phyd3 && (phyd3 = {});
  phyd3.newick = {};
  phyd3.newick.parse = function (d) {
    var b = [],
      a = {};
    d = d.split(/\s*(;|\(|\)|,|:)\s*/);
    for (var f = 0, h = 0; h < d.length; h++) {
      var v = d[h];
      switch (v) {
        case "(":
          v = {};
          a.id = f;
          f++;
          a.branchset = [v];
          b.push(a);
          a = v;
          break;
        case ",":
          v = {};
          b[b.length - 1].branchset.push(v);
          a = v;
          break;
        case ")":
          a = b.pop();
          break;
        case ":":
          break;
        default:
          var t = d[h - 1];
          ")" == t || "(" == t || "," == t
            ? (a.name = v)
            : ":" == t && (a.branchLength = parseFloat(v));
          a.id = f;
          f++;
      }
    }
    return a;
  };
})();
if (!d3) throw "d3 wasn't included!";
window.requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (d) {
      window.setTimeout(d, 1e3 / 60);
    }
  );
})();
(function () {
  "undefined" == typeof phyd3 && (phyd3 = {});
  phyd3.phylogram = {};
  phyd3.phylogram.options = {};
  phyd3.phylogram.intenals = {};
  phyd3.phylogram.domains = {};
  phyd3.phylogram.graphs = {};
  phyd3.phylogram.dx = 0;
  phyd3.phylogram.lineAreas = [];
  phyd3.phylogram.labelAreas = [];
  phyd3.phylogram.lastNodeIds = [];
  phyd3.phylogram.projection = function (d) {
    return [parseInt(d.y), parseInt(d.x)];
  };
  phyd3.phylogram.rightAngleDiagonal = function (d, b) {
    b = d.source;
    d = d.target;
    b = [b, { x: d.x, y: b.y }, d];
    b = b.map(phyd3.phylogram.projection);
    phyd3.phylogram.lineAreas.push({ start: b[1], end: b[2] });
    !d.children &&
      b[2][0] > phyd3.phylogram.dx &&
      (phyd3.phylogram.dx = b[2][0]);
    return "M" + b[0] + " " + b[1] + " " + b[2];
  };
  phyd3.phylogram.scaleBranchLengths = function (d, b) {
    function a(b, d) {
      d(b);
      if (b.children)
        for (var f = b.children.length - 1; 0 <= f; f--) a(b.children[f], d);
    }
    a(d[0], function (a) {
      0 > a.branchLength && (a.branchLength *= -1);
      a.rootDist = (a.parent ? a.parent.rootDist : 0) + (a.branchLength || 0);
    });
    var f = d.map(function (a) {
      return a.rootDist;
    }),
      h = d3.scale
        .linear()
        .domain([0, d3.max(f)])
        .range([0, b]);
    a(d[0], function (a) {
      a.y = parseInt(h(a.rootDist));
    });
    return h;
  };
  phyd3.phylogram.randomColor = function () {
    function d(a, b, d) {
      0 > d && (d += 1);
      1 < d && --d;
      return d < 1 / 6
        ? a + 6 * (b - a) * d
        : 0.5 > d
          ? b
          : d < 2 / 3
            ? a + (b - a) * (2 / 3 - d) * 6
            : a;
    }
    var b = Math.random();
    return (function (a, b, h) {
      if (0 == b) h = b = a = h;
      else {
        var f = 0.5 > h ? h * (1 + b) : h + b - h * b,
          t = 2 * h - f;
        h = d(t, f, a + 1 / 3);
        b = d(t, f, a);
        a = d(t, f, a - 1 / 3);
      }
      return (
        "#" +
        Math.round(255 * h).toString(16) +
        Math.round(255 * b).toString(16) +
        Math.round(255 * a).toString(16)
      );
    })((b + 0.618033988749895) % 1, 0.5, 0.6);
  };
  phyd3.phylogram.scaledomainWidths = function (d, b) {
    d = d.map(function (a) {
      return a.sequences &&
        a.sequences[0] &&
        a.sequences[0].domainArchitecture &&
        a.sequences[0].domainArchitecture.sequenceLength
        ? a.sequences[0].domainArchitecture.sequenceLength
        : 0;
    });
    return d3.scale
      .linear()
      .domain([0, d3.max(d)])
      .range([0, b]);
  };
  phyd3.phylogram.build = function (d, b, a) {
    function f() {
      n.selectAll("text.groupLabel").remove();
      n.selectAll("rect.groupLabel").remove();
      var e = 0;
      for (gid in b.groups) {
        var m = b.groups[gid];
        m.x1 = Number.MAX_SAFE_INTEGER;
        m.x2 = 0;
        m.y1 = Number.MAX_SAFE_INTEGER;
        m.y2 = 0;
        e < m.depth && (e = m.depth);
        v(b, m);
      }
      for (; 0 <= e; e--)
        for (gid in b.groups)
          (m = b.groups[gid]),
            m.depth == e &&
            (n
              .insert("text", ":first-child")
              .attr("class", "groupLabel")
              .attr("y", m.x1)
              .attr("x", 0)
              .attr("dy", 2 * a.nodeHeight)
              .attr("text-anchor", "start")
              .attr("stroke", m.foregroundColor)
              .attr("stroke-width", a.outline + "px")
              .attr("font-size", 1.5 * a.nodeHeight + "px")
              .text(m.label),
              n
                .insert("rect", ":first-child")
                .attr("class", "groupLabel")
                .attr("stroke", m.backgroundColor)
                .attr("fill", m.backgroundColor)
                .attr("y", m.x1)
                .attr("height", m.x2 - m.x1)
                .attr("x", 0)
                .attr("width", phyd3.phylogram.dx)
                .append("title")
                .text(m.label));
    }
    function h(a, m, g) {
      if (g || a.id == m) {
        g = !0;
        a.groupIDs || (a.groupIDs = []);
        a.groupIDs.push(m);
        var e = b.groups[m];
        a.x < e.x1 && (e.x1 = a.x);
        a.x > e.x2 && (e.x2 = a.x);
        a.y < e.y1 && (e.y1 = a.y);
        a.y > e.y2 && (e.y2 = a.y);
      }
      if (a.children)
        for (e = 0; e < a.children.length; e++) h(a.children[e], m, g);
    }
    function v(a, b) {
      if (a.groupIDs)
        for (var e = 0; e < a.groupIDs.length; e++)
          a.groupIDs[e] == b.id &&
            (a.id == b.id && (b.depth = a.depth),
              a.x < b.x1 && (b.x1 = a.x),
              a.x > b.x2 && (b.x2 = a.x),
              a.y < b.y1 && (b.y1 = a.y),
              a.y > b.y2 && (b.y2 = a.y));
      if (a.children)
        for (e = 0; e < a.children.length; e++) v(a.children[e], b);
    }
    function t(a, b) {
      if (a.groupIDs) {
        var e = a.groupIDs.indexOf(b);
        -1 != e && a.groupIDs.splice(e, 1);
      }
      if (a.children)
        for (e = 0; e < a.children.length; e++) t(a.children[e], b);
    }
    function z() {
      a.domainWidth = a.domainWidthStep;
      a.graphWidth = a.initialGraphWidth;
      a.scaleX = 1;
      a.scaleY = 1;
      a.translateX = 0;
      a.translateY = 0;
      if(zooming){
        ea.translate([0, 0]);
      }
    }
    function calculate_W(){
      W = a.height - (2 * a.margin + (a.showGraphs ? X : 0));
    }
    function B(size) {
      // $('#loading_spinner').toggleClass("d-none")
      // d3.select('#hm_loading_spinner').classed("invisible", false);

      // resizing
      if(size){
        a.height = size*(a.nodeHeight)+300
      }

      calculate_W()

      d3.select(d).text(null);
      d3.select(d)
        .select("svg")
        .remove();
      svg = d3.select(d).insert("svg");
      svg
        .attr("width", aa + "px")
        .attr("height", a.height + "px")
        .attr("overflow", "hidden")
        .attr("version", "1.1")
        .attr("font-family", "Arial")
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .call(ea)
        .on('wheel.zoom', null);
      svg
        .append("svg:rect")
        .attr("class", "canvas")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", a.invertColors ? a.foregroundColor : a.backgroundColor);
      svg
        .append("defs")
        .append("marker")
        .attr("id", "markerBoxplot")
        .attr("markerWidth", "1")
        .attr("markerHeight", "10")
        .attr("refX", "1")
        .attr("refY", "5")
        .append("line")
        .attr("x1", "0")
        .attr("x2", "0")
        .attr("y1", "0")
        .attr("y2", "10")
        .attr("stroke", A())
        .attr("stroke-width", "2px");
      n = svg
        .append("svg:g", ":first-child")
        .attr("id", "main")
        .attr("transform", "translate(" + a.marginX + ", " + a.marginY + ")");
      svg
        .append("svg:text")
        .attr("dy", "20px")
        .attr("class", "title")
        .attr("stroke", A())
        .attr("stroke-width", "1px")
        .attr("font-size", "15px")
        .text(b.name ? b.name : "");
      svg
        .append("svg:text")
        .attr("class", "title")
        .attr("dy", "40px")
        .attr("stroke", A())
        .attr("stroke-width", "0.5px")
        .attr("font-size", "10px")
        .text(b.description ? b.description : "");
      T = n.selectAll("g.node");
      O();
      0 == phyd3.phylogram.dx &&
        (d3
          .select("#phylogram")
          .attr("checked", "")
          .attr("disabled", "disabled"),
          (a.showPhylogram = !0),
          O());
      C = n.selectAll("g.leaf.node");
      I = C.selectAll("g.domain");
      pa();
      fa();
      qa();
      ha();
      ia();
      ra();
      sa();
      T.append("svg:text")
        .attr("class", "name")
        .attr("dx", a.nodeHeight + 1)
        .attr("dy", 3)
        .attr("text-anchor", "start");
      Y();
      U();
      L();
      ba();
      F();

      pyHeatmapAddPopper()
      $('svg text.legend').click(function(){
        assay_mm_charts(this.innerHTML)
      })
      // d3.select('#hm_loading_spinner').classed("invisible", true);
      // console.log($('#loading_spinner'))
    }
    function ta() {
      n.selectAll("rect.searchResults").remove();
      var a = jQuery("#searchQuery").val(),
        d = new RegExp(a, "i");
      a && a.length && ua(b, d);
      if( a && a.length ){
        $("#searchQueryControl").removeClass('invisible');
        cnt = $(".searchResults").length
        $("#serachCnt").html(cnt)
        $("#serachPos").html(0)
        goRes('next')
      }
      else{        
        $("#searchQueryControl").addClass('invisible');
      }
    }
    function goRes(action) {
      var res_cnt = parseInt($("#serachCnt").html())
      var cur_pos = parseInt($("#serachPos").html())
      var target_obj;
      var target_idx;
      
      if( cnt > 0 ){
        var target_obj;

        if(action=="next"){
          if( cur_pos+1 <= res_cnt ){
            target_obj = $(".searchResults")[cur_pos];
            cur_pos++;
            $("#serachPos").html(cur_pos);
            target_obj.scrollIntoView();
          }
        }
        else{
          if( cur_pos-1 >= 0 ){
            target_obj = $(".searchResults")[cur_pos-1];
            cur_pos--;
            $("#serachPos").html(cur_pos);
            target_obj.scrollIntoView();
          }
        }
      }
      else{
        $("#serachPos").html(0)
        $("#serachCnt").html(0)
      }
    }
    function A() {
      return a.invertColors ? a.backgroundColor : a.foregroundColor;
    }
    function ja() {
      d3.selectAll(".canvas").attr(
        "fill",
        a.invertColors ? a.foregroundColor : a.backgroundColor
      );
      var e = A();
      n.selectAll("path.link").attr("stroke", e);
      d3.selectAll("text").attr("fill", e);
      d3.selectAll("marker")
        .selectAll("line")
        .attr("stroke", e);
      d3.selectAll("text.title").attr("stroke", e);
      n.selectAll("text.nodelabel")
        .attr("stroke", e)
        .attr("fill", e);
      C.selectAll("path").attr("stroke", e);
      C.selectAll("line").attr("stroke", e);
      C.selectAll("rect").attr("stroke", e);
      Y();
      ka();
    }
    function va() {
      var e = d.replace("#", "");
      e = document.getElementById(e).querySelector("svg");
      var b = e.getElementById("main"),
        g = b.getBBox();
      b = b.getAttributeNode("transform");
      var f = e.getAttributeNode("width"),
        p = e.getAttributeNode("height"),
        l = b.value,
        k = f.value,
        x = p.value;
      b.value = "translate(" + a.marginX + ", " + a.marginY + ")";
      f.value = (
        Math.max(+f.value.replace("px", ""), g.width) + a.marginX
      ).toString();
      p.value = (
        Math.max(+p.value.replace("px", ""), g.height) + a.marginY
      ).toString();
      if ("undefined" != typeof window.XMLSerializer)
        var q = new XMLSerializer().serializeToString(e);
      else "undefined" != typeof e.xml && (q = e.xml);
      b.value = l;
      f.value = k;
      p.value = x;
      return q;
    }
    function pa() {
      a.showDomains
        ? ((P = phyd3.phylogram.scaledomainWidths(K, a.domainWidth)),
          C.append("svg:path")
            .attr("class", "domain")
            .attr("stroke", A())
            .attr("visibility", function (a, b) {
              return a.show ? "visibile" : "hidden";
            }),
          (I = I.data(function (a, b, g) {
            a =
              a.sequences && a.sequences[0] && a.sequences[0].domainArchitecture
                ? a.sequences[0].domainArchitecture.domains
                : [];
            for (g = 0; g < a.length; g++) a[g].i = b;
            a.sort(function (a, e) {
              return Math.abs(e.to - e.from) - Math.abs(a.to - a.from);
            });
            return a;
          })
            .enter()
            .append("svg:g")
            .attr("class", "domain")),
          I.append("svg:rect")
            .attr("class", "domain hover-visible")
            .attr("stroke", A())
            .attr("stroke-width", a.outline + "px")
            .append("title")
            .text(function (a) {
              return a.name;
            }),
          ca(),
          M(),
          ka())
        : (I.remove(),
          C.selectAll("path.domain").remove(),
          (I = C.selectAll("g.domain")));
    }
    function fa() {
      a.showDomainNames
        ? (I.append("svg:text")
          .attr("class", "domain")
          .attr("dy", -3)
          .attr("fill", A())
          .attr("font-size", 1.5 * a.nodeHeight + "px")
          .text(function (a) {
            return a.name;
          }),
          M())
        : I.selectAll("text.domain").remove();
    }
    function ca() {
      var e = C.data();
      C.selectAll("g.domain").attr("visibility", function (b, g, d) {
        return e[d].show && b.confidence <= a.domainLevel
          ? "visible"
          : "hidden";
      });
      C.selectAll("path.domain").attr("visibility", function (a) {
        return a.show ? "visible" : "hidden";
      });
      d3.select("#domainLevel").attr("value", a.domainLevel.toPrecision(1));
    }
    function ka() {
      I.selectAll("rect.domain").attr("fill", function (e) {
        return a.showDomainColors && b.domcolors[e.name]
          ? b.domcolors[e.name].color.replace(/0x/, "#")
          : A();
      });
    }
    function M() {
      var e = C.data(),
        b = Q + (a.showLabels ? R : 0) + (a.showGraphs ? w : 0);
      P = phyd3.phylogram.scaledomainWidths(K, a.domainWidth);
      C.selectAll("path.domain").attr("d", function (a, d, m) {
        d = phyd3.phylogram.dx - e[m].y;
        a =
          a.sequences && a.sequences[0] && a.sequences[0].domainArchitecture
            ? a.sequences[0].domainArchitecture.sequenceLength
            : 0;
        return "M" + parseInt(b + d) + ",0L" + parseInt(b + d + P(a)) + ",0";
      });
      I.selectAll("rect.domain")
        .attr("width", function (a) {
          return parseInt(P(a.to - a.from));
        })
        .attr("transform", function (g, d, m) {
          return (
            "translate(" +
            parseInt(b + (phyd3.phylogram.dx - e[g.i].y) + P(g.from)) +
            "," +
            parseInt(-1 * a.nodeHeight) +
            ")"
          );
        })
        .attr("height", 2 * a.nodeHeight - 2);
      I.selectAll("text.domain").attr("transform", function (g) {
        return (
          "translate(" +
          parseInt(b + (phyd3.phylogram.dx - e[g.i].y) + P(g.from)) +
          "," +
          parseInt(-1 * a.nodeHeight) +
          ")"
        );
      });
      d3.select("#domainWidth").attr("value", a.domainWidth);
    }
    function ha() {
      n.selectAll("text.supportValue").remove();
      a.showSupportValues &&
        (n
          .selectAll("g.inner.node")
          .append("svg:text")
          .attr("class", "supportValue")
          .attr("dx", -2)
          .attr("text-anchor", "end")
          .attr("fill", a.supportValuesColor)
          .text(function (e) {
            var b = "";
            if (e.confidences)
              for (var g = 0; g < e.confidences.length; g++)
                b +=
                  parseFloat(e.confidences[g].value).toFixed(
                    a.maxDecimalsSupportValues
                  ) + " ";
            return b;
          }),
          d3
            .select("#maxDecimalsSupportValues")
            .attr("value", a.maxDecimalsSupportValues),
          F(),
          L());
    }
    function ia() {
      n.selectAll("text.branchLength").remove();
      a.showLengthValues &&
        (n
          .selectAll("g.node")
          .append("svg:text")
          .attr("class", "branchLength")
          .attr("dx", -2)
          .attr("text-anchor", "end")
          .attr("fill", a.branchLengthColor)
          .text(function (e) {
            return e.branchLength
              ? parseFloat(e.branchLength).toFixed(a.maxDecimalsLengthValues)
              : "";
          }),
          d3
            .select("#maxDecimalsLengthValues")
            .attr("value", a.maxDecimalsLengthValues),
          F(),
          L());
    }
    function la(a, b, g) {
      var e = a.attr("id") + "_" + a.selectAll("div.panel-default").size(),
        d = a.append("div").attr("class", "panel panel-default");
      d.append("div")
        .attr("class", "panel-heading")
        .attr("role", "tab")
        .attr("id", "heading" + e)
        .append("h4")
        .attr("class", "panel-title")
        .append("a")
        .attr("class", "collapsed btn btn-secondary dropdown-toggle")
        .attr("aria-expanded", g ? "true" : "false")
        .attr("role", "button")
        .attr("data-toggle", "collapse")
        .attr("data-parent", "#" + a.attr("id"))
        .attr("href", "#collapse" + e)
        .attr("aria-controls", "collapse" + e)
        .html(b);
      return d
        .append("div")
        .attr("id", "collapse" + e)
        .attr("class", "panel-collapse collapse " + (g ? "in" : ""))
        .attr("role", "tabpanel")
        .attr("aria-labelledby", "heading" + e)
        .append("div")
        .attr("class", "panel-body table-responsive");
    }
    function Ba(e) {
      // only on NOT leaf
      if(!e.children){
        return
      }

      var m = d3.event,
        g = m.layerX;
      y = m.layerY;
      d3.select("div.popup").remove();
      n.selectAll("g.node")
        .selectAll("rect.pointer")
        .style("opacity", "0");

      var f = "popup" + parseInt(Date.now() * Math.random() * 1e3),
        p = function () {
          d3.select("#" + f).remove();
          n.selectAll("g.node.cid_" + e.id)
            .selectAll("rect.pointer")
            .style("opacity", "0");
        };
      g = d3
        .select(d)
        .append("div")
        .attr("class", "popup border rounded")
        .attr("id", f)
        .style("position", "absolute")
        .style("top", parseInt(y) + "px")
        .style("left", parseInt(g) + "px")
        // .style("width", parseInt(a.popupWidth) + "px")
        .style("color", "black")
        .style("background-color", "white");
      var l = g
        .append("button")
        .attr("class", "btn btn-primary btn-sm")
        .text("X")
      l.on("click", p);
      g.append("button")
        .attr("class", "btn btn-primary btn-sm ml-1")
        .text(function () {
          return -1 == a.pinnedNodes.indexOf(e.id)
            ? "Pin"
            : "Unpin";
        })
        .on("click", function () {
          var b = a.pinnedNodes.indexOf(e.id);
          -1 == b ? a.pinnedNodes.push(e.id) : a.pinnedNodes.splice(b, 1);
          p();
          Y();
        });

      g.append("button")
        .attr("class", "btn btn-primary btn-sm ml-1")
        .text("Subtree")
        .on("click", function () {
          za(b, e.id)
          size = num_leaves(b)
          z(), B(size)
          phyd3.phylogram.lastNodeIds.push(e.id)
          d3.select("div.popup").remove();
        });

      if (phyd3.phylogram.lastNodeIds.length > 0) {
        g.append("button")
          .attr("class", "btn btn-primary btn-sm ml-1")
          .text("Reset")
          .on("click", function () {
            b = jQuery.extend(!0, {}, Da)
            z()
            size = num_leaves(b)
            B(size)
            d3.select("div.popup").remove();
          });
      }

      // g.append("span")
      //   .style("cursor", "pointer")
      //   .style("margin-left", "10px")
      //   .append("a")
      //   .text("[Swap]")
      //   .on("click", function () {
      //     //za(b, e.id), z(), B()
      //     Aa(b, e.id), f(), B()
      //   });

      g = g
        .append("div")
        .attr("class", "panel-group mt-3")
        .attr("id", "accordion_" + parseInt(Date.now() * Math.random() * 1e3))
        .attr("role", "tablist")
        .attr("aria-multiselectable", "true");
      l =
        "text" == m.target.nodeName ||
          (m.target.classList && m.target.classList.contains("pointer"))
          ? !0
          : !1;
      l = la(g, "Node Information", l)
        .append("table")
        .attr("class", "table table-condensed table-bordered")
        .append("tbody");
      if (e.name) {
        var k = l.append("tr");
        k.append("td").text("Name");
        k.append("td").text(e.name);
      }
      if (e.taxonomies)
        for (var x = 0; x < e.taxonomies.length; x++) {
          var q = e.taxonomies[x];
          k = l.append("tr");
          k.append("td").text("Taxononomy");
          k = k.append("td");
          b.taxcolors[q.code] &&
            b.taxcolors[q.code].url &&
            (k = k
              .append("a")
              .attr("href", b.taxcolors[q.code].url)
              .attr("target", "_blank"));
          var h = "";
          h +=
            b.taxcolors[q.code] && b.taxcolors[q.code].name
              ? b.taxcolors[q.code].name + " "
              : "";
          h += " ";
          h += q.scientificName
            ? "\x3ci\x3e" + q.scientificName + "\x3c/i\x3e"
            : "";
          h += " ";
          h += q.commonName ? q.commonName : "";
          h += " ";
          h += q.code ? q.code : "";
          k.html(h);
        }
      if (e.confidences)
        for (x = 0; x < e.confidences.length; x++)
          (k = l.append("tr")),
            k.append("td").text("Confidence"),
            k.append("td").html(e.confidences[x].value);
      k = l.append("tr");
      k.append("td").text("Branch depth");
      k.append("td").text(e.depth);
      k = l.append("tr");
      k.append("td").text("Branch length");
      k.append("td").text(e.branchLength ? e.branchLength : 0);
      k = l.append("tr");
      k.append("td").text("Distance from root");
      k.append("td").text(e.rootDist);
      for (x = 0; x < e.properties.length; x++)
        (k = e.properties[x]),
          (u = k.ref),
          (q = k.value),
          (q = q.trim()),
          /^http:\/\//.test(q) &&
          (q =
            "\x3ca href\x3d'" +
            q +
            "' target\x3d'_blank'\x3e" +
            q +
            "\x3c/a\x3e\x3cbr /\x3e"),
          (k = l.append("tr")),
          k.append("td").text(u),
          k.append("td").html(q);
      for (var u in e.events)
        (q = e.events[u]),
          (k = l.append("tr")),
          k.append("td").text(u),
          k.append("td").html(q);
      if (e.sequences)
        for (x = 0; x < e.sequences.length; x++) {
          u = e.sequences[x];
          q = "";
          q += u.symbol ? u.symbol + " " : "";
          q += u.name ? u.name + " " : "";
          q += u.location ? u.location + " " : "";
          q += u.geneName ? u.geneName : "";
          q.length &&
            ((k = l.append("tr")),
              k.append("td").text("Sequence"),
              k.append("td").html(q));
          u.accession &&
            ((q = ""),
              (q += u.accession.value ? u.accession.value + " " : ""),
              (q += u.accession.source ? "[" + u.accession.source + "] " : ""),
              (q += u.accession.comment ? "(" + u.accession.comment + ")" : ""),
              q.length &&
              ((k = l.append("tr")),
                k.append("td").text("Accession"),
                k.append("td").html(q)));
          u.molSeq &&
            u.molSeq.value &&
            ((k = l.append("tr")),
              k.append("td").text("Molecular Sequence"),
              k.append("td").html(u.molSeq.value));
          if (u.uris) {
            q = "";
            for (k = 0; k < u.uris.length; k++)
              (q = u.uris[k]),
                (q =
                  "\x3ca href\x3d'" +
                  q.value +
                  "'\x3e" +
                  (q.desc ? q.desc : q.value) +
                  "\x3c/a\x3e");
            q.length &&
              ((k = l.append("tr")),
                k.append("td").text("See also"),
                k.append("td").html(q));
          }
          if (
            e.sequences[x].domainArchitecture &&
            e.sequences[x].domainArchitecture.domains
          ) {
            l =
              m.target.parentNode.classList &&
                m.target.parentNode.classList.contains("domain")
                ? !0
                : !1;
            l = la(g, "Domains", l)
              .append("table")
              .attr("id", "dt" + f)
              .attr("class", "table table-condensed table-bordered");
            u = l.append("thead").append("tr");
            u.append("th").text("#");
            u.append("th").text("Name");
            u.append("th").text("Description");
            u.append("th").text("From");
            u.append("th").text("To");
            u.append("th").text("P value");
            h = l.append("tbody");
            for (
              q = 0;
              q < e.sequences[x].domainArchitecture.domains.length;
              q++
            ) {
              var G = e.sequences[x].domainArchitecture.domains[q];
              k = h.append("tr");
              k.append("td")
                .style(
                  "background",
                  b.domcolors[G.name] && b.domcolors[G.name].color
                    ? b.domcolors[G.name].color.replace("0x", "#")
                    : ""
                )
                .text(" ");
              u = k.append("td");
              b.domcolors[G.name] &&
                b.domcolors[G.name].url &&
                (u = u
                  .append("a")
                  .attr("href", b.domcolors[G.name].url)
                  .attr("target", "_blank"));
              u.text(G.name);
              k.append("td").text(
                b.domcolors[G.name] ? b.domcolors[G.name].description : ""
              );
              k.append("td").text(G.from);
              k.append("td").text(G.to);
              k.append("td").text(G.confidence);
            }
            jQuery("#dt" + f).dataTable({
              searching: !1,
              paging: !1,
              language: { info: "" },
              order: [[3, "asc"]],
              columns: [{ orderable: !1 }, null, null, null, null, null]
            });
          }
        }
      if (b.graphs)
        for (x = 0; x < b.graphs.length; x++)
          if (
            ((h = b.graphs[x]), h.data && h.data[e.id] && h.data[e.id].length)
          )
            for (
              l =
              m.target.parentNode.classList &&
                m.target.parentNode.classList.contains(h.type)
                ? !0
                : !1,
              l = la(g, h.name, l)
                .append("table")
                .attr("class", "table table-condensed table-bordered")
                .append("tbody"),
              q = 0;
              q < h.legend.fields.length;
              q++
            )
              (k = l.append("tr")),
                (u = k.append("td")),
                h.legend.fields[q].url &&
                (u = u
                  .append("a")
                  .attr("href", h.legend.fields[q].url)
                  .attr("target", "_blank")),
                u.text(h.legend.fields[q].name),
                k.append("td").text(h.data[e.id][q]);
      n.selectAll("g.node.cid_" + e.id)
        .selectAll("rect.pointer")
        .style("opacity", "1");
      m.stopPropagation();
    }
    function ra() {
      a.lineupNodes
        ? n
          .selectAll("g.leaf")
          .append("path")
          .attr("class", "support")
          .attr("stroke", A())
          .attr("stroke-dasharray", "2,3")
          .attr("stroke-width", "0.5px")
        : n.selectAll("path.support").remove();
    }
    function Z(e, d) {
      var g = "";
      if (a.showTaxonomy && e.taxonomies)
        for (var m = 0; m < e.taxonomies.length; m++) {
          var f = e.taxonomies[m];
          a.showFullTaxonomy &&
            ((g +=
              b.taxcolors[f.code] && b.taxcolors[f.code].name
                ? b.taxcolors[f.code].name
                : ""),
              (g += " "),
              (g += f.scientificName ? f.scientificName : ""),
              (g += " "),
              (g += f.commonName ? f.commonName : ""),
              (g += " "));
          g += f.code ? f.code : "";
          g += " ";
        }
      m = "";
      if (a.showSequences && e.sequences)
        for (f = 0; f < e.sequences.length; f++) {
          var l = e.sequences[f];
          m += l.symbol ? l.symbol : "";
          m += " ";
          m += l.accession ? l.accession.value : "";
          m += " ";
          m += l.name ? l.name : "";
          m += " ";
          m += l.geneName ? l.geneName : "";
          m += " ";
          if (l.annotations)
            for (var k = 0; k < l.annotations.length; k++)
              (text += l.annotations[k].desc ? l.annotations[k].desc : ""),
                (text += " ");
        }
      f = a.showNodeNames && e.name ? e.name + " " : " ";
      d ||
        (e.children && "only leaf" == a.showNodesType && (f = " "),
          e.children || "only inner" != a.showNodesType || (f = " "));
      return g + f + m;
    }
    function U() {
      var e = 0;
      ma = 0;
      C.selectAll("text.name").text(function (a) {
        var b = Z(a);
        b.length > e && ((e = b.length), (ma = a.id));
        return b;
      });
      n.selectAll("g.node.inner")
        .selectAll("text.name")
        .text(Z);
      a.showGraphs && V();
      a.showDomains && M();
    }
    function L() {
      n.selectAll("text.branchLength").attr("visibility", function (a) {
        return a.show ? "visible" : "hidden";
      });
      n.selectAll("text.supportValues").attr("visibility", function (a) {
        return a.show ? "visible" : "hidden";
      });
      n.selectAll("text.name").attr("visibility", function (a) {
        return a.show ? "visible" : "hidden";
      });
      a.lineupNodes &&
        C.selectAll("path.support").attr("visibility", function (a) {
          return a.show ? "visible" : "hidden";
        });
      a.showLabels && wa();
      a.showGraphs && xa();
      a.showDomains && ca();
    }
    function Y() {
      n.selectAll("text.name")
        .attr("stroke", function (e) {
          var d = null;
          if (a.showTaxonomyColors && b.taxcolors && e.taxonomies)
            for (var g = 0; g < e.taxonomies.length; g++) {
              var f = e.taxonomies[g];
              b.taxcolors[f.code] &&
                b.taxcolors[f.code].color &&
                (d = b.taxcolors[f.code].color.replace(/0x/, "#"));
            }
          return d ? d : A();
        })
        .attr("stroke-width", function (b) {
          return -1 != a.pinnedNodes.indexOf(b.id)
            ? 2 * a.outline + "px"
            : a.outline + "px";
        })
        .attr("fill", function (e) {
          var d = null;
          if (a.showTaxonomyColors && b.taxcolors && e.taxonomies)
            for (var g = 0; g < e.taxonomies.length; g++) {
              var f = e.taxonomies[g];
              b.taxcolors[f.code] &&
                b.taxcolors[f.code].color &&
                (d = b.taxcolors[f.code].color.replace(/0x/, "#"));
            }
          return d ? d : A();
        });
    }
    function ya() {
      C.selectAll("text.name").attr("dx", function (b) {
        return parseInt(a.lineupNodes ? phyd3.phylogram.dx - b.y + 5 : 5);
      });
      C.selectAll("path.support").attr("d", function (a) {
        return "M0,0 L" + parseInt(phyd3.phylogram.dx - a.y) + ",0";
      });
      a.showLabels && na();
      a.showGraphs && V();
      a.showDomains && M();
    }
    function F() {
      var b = 0;
      n.selectAll("text.name")
        .attr("dy", a.nodeHeight / 2)
        .attr("font-size", 1.5 * a.nodeHeight + "px");
      n.selectAll("text.branchLength")
        .attr("dy", -a.nodeHeight / 2)
        .attr("font-size", 1.5 * a.nodeHeight + "px");
      n.selectAll("text.supportValue")
        .attr("dy", a.nodeHeight / 2 + 5)
        .attr("font-size", 1.5 * a.nodeHeight + "px");
      n.selectAll("g.leaf.cid_" + ma)
        .selectAll("text.name")
        .each(function () {
          var a = this.getBBox();
          a.width > b && (b = a.width);
        });
      b += 10;
      b < a.textLength && (b = a.textLength);
      Q = b;
      d3.select("#nodeHeight").attr("value", 2 * a.nodeHeight + "px");
      ya();
      a.showLabels && na();
      a.showGraphs && V();
      a.showDomains && M();
    }
    function sa() {
      if (a.showLabels && b.labels) {
        for (var e = 0; e < b.labels.length; e++) {
          var d = b.labels[e];
          d.id || (d.id = parseInt(Date.now() * Math.random() * 1e3));
          d.data.tag &&
            n.selectAll("g.node").each(function (a) {
              var b = a[d.data.tag],
                e = d.data.ref;
              e = e ? e : "value";
              b = "object" == typeof b ? b[e] : b;
              if ("property" == d.data.tag)
                for (pid = 0; pid < a.properties.length; pid++) {
                  var g = a.properties[pid];
                  if (g.ref == e) {
                    b = g.value;
                    break;
                  }
                }
              b && (d.data[a.id] = b);
            });
          switch (d.type) {
            case "text":
              for (cid in d.data)
                d.data[cid] &&
                  n
                    .selectAll(".cid_" + cid)
                    .append("text")
                    .attr("class", "nodelabel text lid" + d.id)
                    .attr("dy", 3)
                    .attr("text-anchor", "start")
                    .attr("stroke-width", a.outline + "px")
                    .attr("stroke", A())
                    .attr("fill", A())
                    .attr("font-size", 1.5 * a.nodeHeight + "px")
                    .text(d.data[cid])
                    .append("title")
                    .text(d.name + ": " + d.data[cid]);
              break;
            case "color":
              for (cid in d.data)
                if (d.data[cid]) {
                  var g = a.nodeHeight,
                    f = d.data[cid].replace(/0x/, "#");
                  n.selectAll(".cid_" + cid)
                    .append("rect")
                    .attr("height", 2 * g)
                    .attr("width", 2 * g)
                    .attr("class", "nodelabel color lid" + d.id)
                    .attr("style", "fill: " + f + "; stroke: " + f)
                    .append("title")
                    .text(d.name);
                }
          }
          n.append("text")
            .attr("class", "labellegend lid" + d.id)
            .attr("fill", A())
            .text(0 != d.showLegend ? d.name : "");
        }
        wa();
        na();
      } else
        n.selectAll(".nodelabel").remove(),
          n.selectAll(".labellegend").remove(),
          (R = 0);
      V();
      M();
    }
    function na() {
      var e = parseInt(a.nodeHeight);
      R = 0;
      if (b.labels) {
        for (var d = 0; d < b.labels.length; d++) {
          var g = b.labels[d],
            f = 0;
          n.selectAll(".nodelabel.lid" + g.id).attr("transform", function (a) {
            var b = 0,
              d = 0;
            "color" == g.type && (b = d = -e);
            var m = 0;
            "text" == this.nodeName && this.firstChild
              ? (m = (this.firstChild.length * e) / 1.5)
              : "rect" == this.nodeName && (m = 2 * e);
            m > f && (f = m);
            a.branchset.length
              ? ((b += a.y), (b -= e))
              : (b += phyd3.phylogram.dx + Q);
            return "translate(" + parseInt(b + e + R - a.y) + "," + d + ")";
          });
          n.selectAll("text.labellegend.lid" + g.id)
            .attr(
              "transform",
              "translate(" +
              parseInt(phyd3.phylogram.dx + R + Q + 2 * e) +
              ",-10) rotate(-90)"
            )
            .attr("font-size", 2 * e + "px");
          R += f + 2 * e;
        }
        C.selectAll("text.nodelabel")
          .attr("dy", e / 2)
          .attr("font-size", 1.5 * e + "px");
        C.selectAll("rect.nodelabel")
          .attr("width", 2 * e + "px")
          .attr("height", 2 * e + "px");
      }
    }
    function wa() {
      n.selectAll(".nodelabel").attr("visibility", function (a) {
        return a.show ? "visible" : "hidden";
      });
    }
    function qa() {
      if (a.showGraphs && b.graphs && b.graphs.length) {
        d3.svg
          .arc()
          .innerRadius(0)
          .outerRadius(a.nodeHeight);
        for (
          var e = d3.layout
            .pie()
            .value(function (a) {
              return a.value;
            })
            .sort(null),
          d = (w = 0);
          d < b.graphs.length;
          d++
        ) {
          var g = b.graphs[d];
          g.id || (g.id = parseInt(Date.now() * Math.random() * 1e3));
          if (g.data.tag)
            var f = n.selectAll("g.node").each(function (a) {
              var b = a[g.data.tag],
                e = g.data.ref;
              e = e ? e : "value";
              b = "object" == typeof b ? b[e] : b;
              if ("property" == g.data.tag)
                for (var d = 0; d < a.properties.length; d++) {
                  var f = a.properties[d];
                  if (f.ref == e) {
                    b = f.value;
                    break;
                  }
                }
              b &&
                ((g.data[a.id] = []),
                  (g.data[a.id][0] = b),
                  "pie" == g.type &&
                  g.data.max &&
                  ((g.data[a.id][1] = g.data.max - b),
                    (g.legend.fields[1] = {
                      name: g.legend.fields[0].name,
                      color: g.legend.fields[0].background
                        ? g.legend.fields[0].background
                        : phyd3.phylogram.randomColor(),
                      invert: !0
                    })));
            });
          switch (g.type) {
            case "pie":
              for (cid in g.data)
                if (
                  ((f = cid.replace(/\./g, "\\.")),
                    g.data[cid] && Array.isArray(g.data[cid]))
                ) {
                  var p = !1;
                  n.select(".cid_" + f).each(function (a) {
                    0 == a.branchset.length && (p = !0);
                  });
                  f = n
                    .selectAll(".cid_" + f)
                    .append("svg:g")
                    .attr("class", "graph pie gid" + g.id);
                  for (var l = [], k = 0; k < g.data[cid].length; k++)
                    void 0 != g.data[cid][k] &&
                      l.push({ i: k, value: g.data[cid][k], leaf: p });
                  l = f
                    .selectAll("path.pie.gid" + g.id)
                    .data(e(l))
                    .enter()
                    .append("path")
                    .attr("class", "pie hover-visible gid" + g.id)
                    .attr("stroke", A())
                    .attr("stroke-width", a.outline + "px")
                    .attr("fill", function (a, b) {
                      return g.legend.fields
                        ? (g.legend.fields[b] ||
                          ((g.legend.fields[b] = {}),
                            (g.legend.fields[b].name = "Series " + (b + 1)),
                            (g.legend.fields[
                              b
                            ].color = phyd3.phylogram.randomColor())),
                          g.legend.fields[b].color.replace(/0x/, "#"))
                        : "";
                    })
                    .append("title")
                    .text(function (a, b) {
                      return g.legend.fields
                        ? (g.legend.fields[b] && g.legend.fields[b].name
                          ? g.legend.fields[b].name + ": "
                          : "") +
                        (g.legend.fields[b].invert
                          ? g.data.max - a.data.value
                          : a.data.value)
                        : "";
                    });
                }
              break;
            case "binary":
              for (cid in g.data)
                if (g.data[cid] && Array.isArray(g.data[cid])) {
                  f = cid.replace(/\./g, "\\.");
                  l = [];
                  p = !1;
                  n.select(".cid_" + f).each(function (a) {
                    0 == a.branchset.length && (p = !0);
                  });
                  f = n
                    .selectAll(".cid_" + cid)
                    .append("svg:g")
                    .attr("class", "graph binary gid" + g.id);
                  for (k = 0; k < g.data[cid].length; k++)
                    void 0 != g.data[cid][k] &&
                      l.push({
                        i: k,
                        value: g.data[cid][k],
                        shape: g.legend.fields[k]
                          ? g.legend.fields[k].shape
                          : "",
                        leaf: p
                      });
                  l = f
                    .selectAll("path.binary.gid" + g.id)
                    .data(l)
                    .enter()
                    .append("path")
                    .attr("class", "binary hover-visible gid" + g.id)
                    .attr("style", function (a, b) {
                      b = (g.legend.fields[b]
                        ? g.legend.fields[b].color
                        : ""
                      ).replace(/0x/, "#");
                      return (
                        "fill:" +
                        (1 <= a.value ? b : "none") +
                        ";stroke:" +
                        (0 <= a.value ? b : "none")
                      );
                    })
                    .append("title")
                    .text(function (a, b) {
                      return (
                        (g.legend.fields[b]
                          ? g.legend.fields[b].name + ": "
                          : "") + a.value
                      );
                    });
                }
              break;
            case "multibar":
              D[g.id] = [];
              for (k = 0; k < g.legend.fields.length; k++)
                (l = d3.max(d3.values(g.data), function (a) {
                  if (a) return a[k];
                })),
                  (f = d3.min(d3.values(g.data), function (a) {
                    if (a) return a[k];
                  })),
                  0 < f && (f = 0),
                  (D[g.id][k] = d3.scale.linear().domain([f, l]));
              for (cid in g.data)
                if (g.data[cid]) {
                  f = cid.replace(/\./g, "\\.");
                  f = n
                    .select(".cid_" + f)
                    .append("svg:g")
                    .attr("class", "graph multibar gid" + g.id);
                  l = [];
                  for (k = 0; k < g.data[cid].length; k++)
                    void 0 != g.data[cid][k] &&
                      l.push({ i: k, value: g.data[cid][k] });
                  l = f
                    .selectAll("rect.multibar.gid" + g.id)
                    .data(l)
                    .enter()
                    .append("rect")
                    .attr("class", "multibar hover-visible gid" + g.id)
                    .attr("fill", function (a, b) {
                      return (g.legend.fields[b]
                        ? g.legend.fields[b].color
                        : ""
                      ).replace(/0x/, "#");
                    })
                    .attr("stroke", A())
                    .attr("stroke-width", a.outline)
                    .append("title")
                    .text(function (a, b) {
                      return (
                        (g.legend.fields[b]
                          ? g.legend.fields[b].name + ": "
                          : "") + a.value
                      );
                    });
                }
              break;
            case "boxplot":
              E[g.id] = null;
              var h = 0,
                q = Number.MAX_SAFE_INTEGER;
              for (k = 0; 5 > k; k++)
                (l = d3.max(d3.values(g.data), function (a) {
                  if (a) return a[k];
                })),
                  (f = d3.min(d3.values(g.data), function (a) {
                    if (a) return a[k];
                  })),
                  l > h && (h = l),
                  f < q && (q = f);
              console.log(q, h);
              E[g.id] = d3.scale.linear().domain([q, h]);
              for (cid in g.data)
                g.data[cid] &&
                  ((f = cid.replace(/\./g, "\\.")),
                    (f = n
                      .select(".cid_" + f)
                      .append("svg:g")
                      .attr("class", "graph boxplot gid" + g.id)),
                    (l = []),
                    l.push({
                      min: g.data[cid][0],
                      q1: g.data[cid][1],
                      median: g.data[cid][2],
                      q3: g.data[cid][3],
                      max: g.data[cid][4]
                    }),
                    (l = f
                      .selectAll("rect.boxplot.gid" + g.id)
                      .data(l)
                      .enter()),
                    l
                      .append("line")
                      .attr("class", "boxplot baseline hover-visible gid" + g.id)
                      .attr(
                        "style",
                        "marker-start: url(#markerBoxplot); marker-end: url(#markerBoxplot);"
                      )
                      .attr("stroke", A()),
                    l
                      .append("rect")
                      .attr("class", "boxplot q1 hover-visible gid" + g.id)
                      .attr(
                        "fill",
                        (g.legend.fields[0]
                          ? g.legend.fields[0].color
                          : ""
                        ).replace(/0x/, "#")
                      )
                      .attr("stroke", A())
                      .attr("stroke-width", a.outline)
                      .append("title")
                      .text(function (a) {
                        return (
                          "Min: " +
                          a.min +
                          ", Q1: " +
                          a.q1 +
                          ", Median: " +
                          a.median
                        );
                      }),
                    l
                      .append("rect")
                      .attr("class", "boxplot q3 hover-visible gid" + g.id)
                      .attr(
                        "fill",
                        (g.legend.fields[1]
                          ? g.legend.fields[1].color
                          : ""
                        ).replace(/0x/, "#")
                      )
                      .attr("stroke", A())
                      .attr("stroke-width", a.outline)
                      .append("title")
                      .text(function (a) {
                        return (
                          "Median: " +
                          a.median +
                          ", Q3: " +
                          a.q3 +
                          ", Max: " +
                          a.max
                        );
                      }),
                    l
                      .append("line")
                      .attr("class", "boxplot median hover-visible gid" + g.id)
                      .attr("stroke", A())
                      .attr("stroke-width", "2px"));
              break;
            case "heatmap":
              l = d3.max(d3.values(g.data), function (a) {
                if (a) return d3.max(a);
              });
              f = d3.min(d3.values(g.data), function (a) {
                if (a) return d3.min(a);
              });
              var t = d3.scale
                .quantize()
                .domain([f, l])
                .range(
                  colorbrewer[g.legend.gradient.name][g.legend.gradient.classes]
                );
              for (cid in g.data)
                if (g.data[cid]) {
                  f = cid.replace(/\./g, "\\.");
                  f = n
                    .select(".cid_" + f)
                    .append("svg:g")
                    .attr("class", "graph heatmap gid" + g.id);
                  l = [];
                  if (g.data[cid])
                    for (k = 0; k < g.data[cid].length; k++)
                      void 0 != g.data[cid][k] &&
                        l.push({ i: k, value: g.data[cid][k] });
                  l = f
                    .selectAll("rect.heatmap.gid" + g.id)
                    .data(l)
                    .enter()
                    .append("rect")
                    .attr("class", "heatmap hover-visible gid" + g.id)
                    .attr("tabindex", "1")
                    .attr("fill", function (b, e) {
                      return isNaN(b.value) ? a.nanColor : t(b.value);
                    })
                    .attr("stroke", function (b, e) {
                      // return isNaN(b.value) ? a.nanColor : A();
                      return isNaN(b.value) ? a.nanColor : "#DDDDDD";
                    })
                    .attr("stroke-width", a.outline + "px")
                    // .append("title")
                    // .text(function (a, b) {
                    //   return (
                    //     (g.legend.fields[b]
                    //       ? g.legend.fields[b].name + ": "
                    //       : "") + a.value
                    //   );
                    // });
                }
              break;
            default:
              console.log("Graph not supported " + g.type);
          }
        }
        xa();
        V();
      } else
        (w = 0),
          n.selectAll("g.graph").remove(),
          n.selectAll("text.legend").remove();
      M();
    }
    function V() {
      var e = a.nodeHeight,
        d = Q + R;
      C.selectAll("g.graph").attr("transform", function (a) {
        return "translate(" + (phyd3.phylogram.dx - a.y + d) + ",0)";
      });
      var g = n.selectAll("g.graph");
      d3.select("#graphWidth").attr("value", a.graphWidth);
      n.selectAll("text.legend").remove();
      w = 0;
      if (b.graphs) {
        for (var f = 0; f < b.graphs.length; f++) {
          var p = b.graphs[f];
          switch (p.type) {
            case "pie":
              g.selectAll("path.pie.gid" + p.id)
                .attr("d", function (a) {
                  if (0 < a.value)
                    return d3.svg
                      .arc()
                      .innerRadius(0)
                      .outerRadius(e)(a);
                })
                .attr("transform", function (a) {
                  return (
                    " translate(" + parseInt(a.data.leaf ? e + w : 0) + ",0)"
                  );
                });
              a.showGraphs &&
                a.showGraphLegend &&
                n
                  .append("text")
                  .attr("class", "legend")
                  .text(0 != p.legend.show ? p.name : "")
                  .attr(
                    "transform",
                    "translate(" +
                    parseInt(phyd3.phylogram.dx + d + w + 2 * e) +
                    ",-10) rotate(-90)"
                  );
              w += 2 * e + 5;
              break;
            case "binary":
              g.selectAll("path.binary.gid" + p.id)
                .attr("d", function (a) {
                  var b = d3.svg.symbol().size(4 * (e - 2) * (e - 2));
                  b.type(p.legend.fields[a.i].shape);
                  return b(a);
                })
                .attr("transform", function (a) {
                  return (
                    " translate(" +
                    (a.leaf ? w + 10 + a.i * (2 * e + 5) : 0) +
                    " ,0)"
                  );
                });
              if (a.showGraphs && a.showGraphLegend)
                for (var l = 0; l < p.legend.fields.length; l++)
                  n.append("text")
                    .attr("class", "legend")
                    .text(0 != p.legend.show ? p.legend.fields[l].name : "")
                    .attr(
                      "transform",
                      "translate(" +
                      (phyd3.phylogram.dx + d + w + l * (2 * e + 5) + 2 * e) +
                      ", -10) rotate(-90)"
                    )
              w += 10 + p.legend.fields.length * (2 * e + 5);
              break;
            case "multibar":
              for (l = 0; l < p.legend.fields.length; l++)
                D[p.id][l] = D[p.id][l].range([0, a.graphWidth]);
              g.selectAll("rect.multibar.gid" + p.id)
                .attr(
                  "height",
                  p.legend.stacked
                    ? parseInt((2 * e) / p.legend.fields.length)
                    : parseInt(2 * e)
                )
                .attr("width", function (a, b) {
                  b = parseInt(
                    D[p.id] && D[p.id][a.i] ? D[p.id][a.i](a.value) : 0
                  );
                  a = parseInt(D[p.id] && D[p.id][a.i] ? D[p.id][a.i](0) : 0);
                  return b > a ? b - a : a - b;
                })
                .attr("transform", function (b, d) {
                  d = w;
                  var g = -1 * e;
                  p.legend.stacked
                    ? (g += ((2 * e) / p.legend.fields.length) * b.i)
                    : (d += b.i * (a.graphWidth + 5));
                  var f = parseInt(
                    D[p.id] && D[p.id][b.i] ? D[p.id][b.i](b.value) : 0
                  );
                  b = parseInt(D[p.id] && D[p.id][b.i] ? D[p.id][b.i](0) : 0);
                  return (
                    " translate(" +
                    parseInt(d + (b < f ? b : f)) +
                    ", " +
                    parseInt(g) +
                    ")"
                  );
                });
              if (a.showGraphs && a.showGraphLegend)
                if (p.legend.stacked)
                  n.append("text")
                    .attr("class", "legend")
                    .text(0 != p.legend.show ? p.name : "")
                    .attr(
                      "transform",
                      "translate(" +
                      (phyd3.phylogram.dx + d + w + a.graphWidth / 2) +
                      ",-10) rotate(-90)"
                    );
                else
                  for (l = 0; l < p.legend.fields.length; l++)
                    n.append("text")
                      .attr("class", "legend")
                      .text(0 != p.legend.show ? p.legend.fields[l].name : "")
                      .attr(
                        "transform",
                        "translate(" +
                        (phyd3.phylogram.dx +
                          d +
                          w +
                          l * (a.graphWidth + 5) +
                          a.graphWidth / 2) +
                        ",-10) rotate(-90)"
                      );
              w +=
                (p.legend.stacked ? 1 : p.legend.fields.length) *
                (a.graphWidth + 5);
              break;
            case "boxplot":
              E[p.id] = E[p.id].range([0, a.graphWidth]);
              g.selectAll("rect.q1.boxplot.gid" + p.id)
                .attr("height", parseInt(2 * e))
                .attr("width", function (a) {
                  return parseInt(E[p.id](a.median) - E[p.id](a.q1));
                })
                .attr("transform", function (a, b) {
                  a = w + E[p.id](a.q1);
                  return " translate(" + parseInt(a) + ",-" + parseInt(e) + ")";
                });
              g.selectAll("rect.q3.boxplot.gid" + p.id)
                .attr("height", parseInt(2 * e))
                .attr("width", function (a) {
                  return parseInt(E[p.id](a.q3) - E[p.id](a.median));
                })
                .attr("transform", function (a, b) {
                  a = w + E[p.id](a.median);
                  return " translate(" + parseInt(a) + ",-" + parseInt(e) + ")";
                });
              g.selectAll("line.baseline.boxplot.gid" + p.id)
                .attr("y1", parseInt(e))
                .attr("y2", parseInt(e))
                .attr("x1", function (a) {
                  var b = E[p.id](a.min);
                  0 > b && console.log(a.min, b);
                  return E[p.id](a.min);
                })
                .attr("x2", function (a) {
                  return E[p.id](a.max);
                })
                .attr("transform", function (a, b) {
                  return " translate(" + parseInt(w) + ",-" + parseInt(e) + ")";
                });
              g.selectAll("line.median.boxplot.gid" + p.id)
                .attr("y1", 0)
                .attr("y2", parseInt(2 * e))
                .attr("x1", function (a) {
                  return E[p.id](a.median);
                })
                .attr("x2", function (a) {
                  return E[p.id](a.median);
                })
                .attr("transform", function (a, b) {
                  return " translate(" + parseInt(w) + ",-" + parseInt(e) + ")";
                });
              a.showGraphs &&
                a.showGraphLegend &&
                n
                  .append("text")
                  .attr("class", "legend")
                  .text(0 != p.legend.show ? p.name : "")
                  .attr(
                    "transform",
                    "translate(" +
                    (phyd3.phylogram.dx + d + w + 2 * e) +
                    ", -10) rotate(-90)"
                  );
              w += a.graphWidth + 5;
              break;
            case "heatmap":
              g.selectAll("rect.heatmap.gid" + p.id)
                .attr("width", 2 * e)
                .attr("height", 2 * e)
                .attr("transform", function (a, b) {
                  return " translate(" + (w + 2 * a.i * e) + ",-" + e + ")";
                });
              if (a.showGraphs && a.showGraphLegend)
                for (l = 0; l < p.legend.fields.length; l++)
                  n.append("text")
                    .attr("class", "legend")
                    .text(0 != p.legend.show ? p.legend.fields[l].name : "")
                    .attr(
                      "transform",
                      "translate(" +
                      parseInt(phyd3.phylogram.dx + d + w + (l + 1) * e * 2) +
                      ",-10) rotate(-90)"
                    );
              w += 2 * p.legend.fields.length * e + 5;
          }
        }
        n.selectAll("text.legend")
          .attr("fill", A())
          .attr("font-size", 1.6 * a.nodeHeight + "px");
      }
    }
    function Ca() {
      var e = a.nodeHeight;
      w = 0;
      if (b.graphs)
        for (var d = 0; d < b.graphs.length; d++) {
          var g = b.graphs[d];
          switch (g.type) {
            case "pie":
              w += 2 * e + 5;
              break;
            case "binary":
              w += (g.legend.fields.length + 1) * (2 * e + 5) + 5;
              break;
            case "multibar":
              w += g.legend.fields.length * (a.graphWidth + 5);
              break;
            case "heatmap":
              w += 2 * g.legend.fields.length * e + 5;
          }
        }
      return (
        2 * a.margin +
        (a.showNodeNames ? Q : 0) +
        (a.showGraphs ? w : 0) +
        (a.showDomains ? a.domainWidth : 0)
      );
    }
    function xa() {
      var b = [],
        d = function (d) {
          if (!a.dynamicHide) return "visible";
          for (
            var e = !0, g = a.nodeHeight, f = d.x, m = d.y, h = 0;
            h < b.length;
            h++
          ) {
            var q = b[h].x,
              n = b[h].y;
            if ((q - f) * (q - f) + (n - m) * (n - m) <= 4 * g * g) {
              e = !1;
              break;
            }
          }
          return e ? (b.push(d), "visible") : "hidden";
        };
      C.selectAll("g.graph").attr("visibility", function (a) {
        return a.show ? "visible" : "hidden";
      });
      n.selectAll("g.inner")
        .selectAll(".graph.pie")
        .attr("visibility", d);
      n.selectAll("g.inner")
        .selectAll(".graph.binary")
        .attr("visibility", d);
    }
    function O(d, m) {
      phyd3.phylogram.lineAreas = [];
      phyd3.phylogram.dx = 0;
      m = d3.layout
        .cluster()
        .separation(function (a, b) {
          return 1;
        })
        .children(
          a.children ||
          function (a) {
            return a.branchset;
          }
        )
        .size([W * a.scaleY, N * a.scaleX]);
      K = m(b);
      a.showPhylogram || phyd3.phylogram.scaleBranchLengths(K, N * a.scaleX);
      var e = n.selectAll("path.link");
      d ||
        ((e = e.data(m.links(K))),
          e
            .enter()
            .append("svg:path")
            .attr("class", "link")
            .attr("fill", "none")
            .attr("stroke", function (a) {
              if (a.source.groupIDs && a.source.groupIDs.length) {
                for (
                  var d = { depth: 0 }, e = 0;
                  e < a.source.groupIDs.length;
                  e++
                ) {
                  var f = b.groups[a.source.groupIDs[e]];
                  f && f.depth >= d.depth && (d = f);
                }
                return d.foregroundColor;
              }
              return A();
            }));
      e.attr("d", phyd3.phylogram.rightAngleDiagonal);
      H = void 0;
      c = 0;
      var h = K.filter(function (a) {
        return !a.children;
      });
      for (m = 0; m < h.length; m++)
        (e = -1 != a.pinnedNodes.indexOf(h[m].id))
          ? ((h[m].show = !0),
            (h[m].pinned = !0),
            da(h[m], !a.lineupNodes) || (H.show = H.pinned ? !0 : !1),
            (H = h[m]))
          : (h[m].show = a.dynamicHide ? da(h[m], !a.lineupNodes) : !0);
      H = void 0;
      h = K.filter(function (a) {
        return a.children;
      });
      for (m = 0; m < h.length; m++)
        (e = -1 != a.pinnedNodes.indexOf(h[m].id))
          ? ((h[m].show = !0),
            (h[m].pinned = !0),
            da(h[m], !0) || (H.show = H.pinned ? !0 : !1),
            (H = h[m]))
          : (h[m].show = a.dynamicHide ? da(h[m], !0) : !0);
      d ||
        ((T = T.data(K)),
          T.enter()
            .append("svg:g")
            .attr("class", function (a) {
              return a.children
                ? 0 == a.depth
                  ? "root node cid_" + a.id
                  : "inner node cid_" + a.id
                : "leaf node cid_" + a.id;
            })
            .style("cursor", "pointer")
            .on("click", function (d, a) {
              var e = d3.event;
              !e.ctrlKey || e.altKey || e.shiftKey
                ? !e.altKey || e.ctrlKey || e.shiftKey
                  ? !e.shiftKey || e.altKey || e.ctrlKey
                    ? e.shiftKey ||
                    e.altKey ||
                    e.ctrlKey ||
                    (void 0 !== a.popupAction ? a.popupAction(d) : Ba(d))
                    : (jQuery("#groupID").val(d.id),
                      jQuery("#groupDepth").val(d.depth),
                      b.groups[d.id]
                        ? (jQuery("#groupLabel").val(b.groups[d.id].label),
                          jQuery("#groupLabelForegroundCP").colorpicker(
                            "setValue",
                            b.groups[d.id].foregroundColor
                          ),
                          jQuery("#groupLabelBackgroundCP").colorpicker(
                            "setValue",
                            b.groups[d.id].backgroundColor
                          ))
                        : (jQuery("#groupLabel").val(""),
                          jQuery("#groupLabelForegroundCP").colorpicker(
                            "setValue",
                            A()
                          ),
                          jQuery("#groupLabelBackgroundCP").colorpicker(
                            "setValue",
                            a.invertColors ? a.foregroundColor : a.backgroundColor
                          )),
                      jQuery("#groupLabelModal").modal("show"))
                  : (za(b, d.id), z(), B())
                : (Aa(b, d.id), f(), B());
            })
            .style("z-index", 100)
            .append("rect")
            .attr("class", "pointer")
            .attr("fill", "#22b680")
            .attr("stroke", "white")
            .attr("stroke-width", "1")
            .attr("width", 2 * a.nodeHeight + 2 + "px")
            .attr("height", 2 * a.nodeHeight + 2 + "px")
            .style("opacity", "0")
            .attr("x", "-" + (a.nodeHeight + 1) + "px")
            .attr("y", "-" + (a.nodeHeight + 1) + "px"));
      T.attr("transform", function (a) {
        return "translate(" + parseInt(a.y) + "," + parseInt(a.x) + ")";
      });
      phyd3.phylogram.lineAreas = [];
    }
    function ua(b, d) {
      var s = ""
      if( b.name && b.name.indexOf("+") >= 0 ){
        acc = b.name.replace("+", "")
        s = assay_stats.responseJSON.tree.collapsed_id[acc].join(' ')
      }

      if (Z(b, !0).match(d) || s.match(d)) {
        var e = !b.children && a.lineupNodes ? phyd3.phylogram.dx - b.y : 0;
        n.selectAll("g.node.cid_" + b.id)
          .insert("rect", ":first-child")
          .attr("class", "searchResults")
          .attr("width", Q + "px")
          .attr("height", 2 * a.nodeHeight + 2 + "px")
          .attr("rx", Math.round(a.nodeHeight) + "px")
          .attr("fill", "#F8D24C")
          .style("opacity", "0.6")
          .attr("x", e + "px")
          .attr("y", "-" + (a.nodeHeight + 1) + "px");
      }
      if (b.children)
        for (e = 0; e < b.children.length; e++) r = ua(b.children[e], d);
      return !1;
    }
    function Aa(a, b, d) {
      if (d || a.id == b) (d = !0), (a.branchset = a.branchset.reverse());
      if (a.children)
        for (var e = 0; e < a.children.length; e++) Aa(a.children[e], b, d);
    }
    function num_leaves(a, size=0) {
      if(a.branchset.length){
        for (var e=0; e < a.branchset.length; e++)
          size = num_leaves(a.branchset[e], size);
        size++
      }
      return size
    }
    function za(a, d) {
      if (a.id == d) b.branchset = [a];
      else if (a.children)
        for (var e = 0; e < a.children.length; e++) za(a.children[e], d);
    }
    function S() {
      O(!0);
      ba();
    }
    function da(b, d) {
      var e = !0,
        f = b.y + 1,
        h = b.y + 5.5 * Z(b, !0).length,
        m = b.x - a.nodeHeight,
        k = b.x + a.nodeHeight;
      if (!H) return (H = b), !0;
      a.lineupNodes &&
        !b.children &&
        ((f += phyd3.phylogram.dx - b.y), (h += phyd3.phylogram.dx - b.y));
      var n = H,
        q = n.y + 1,
        t = n.y + 5.5 * Z(n, !0).length,
        u = n.x - a.nodeHeight,
        v = n.x + a.nodeHeight;
      a.lineupNodes &&
        !n.children &&
        ((q += phyd3.phylogram.dx - n.y), (t += phyd3.phylogram.dx - n.y));
      if (
        (q <= f && f <= t && u <= m && m <= v) ||
        (q <= h && h <= t && u <= m && m <= v) ||
        (q <= f && f <= t && u <= k && k <= v) ||
        (q <= h && h <= t && u <= k && k <= v)
      )
        e = !1;
      if (e && d)
        for (d = 0; d < phyd3.phylogram.lineAreas.length; d++)
          if (
            ((u = phyd3.phylogram.lineAreas[d]),
              (n = u.start[0]),
              (q = u.end[0]),
              (t = u.start[1]),
              (u = u.end[1]),
              t == u)
          ) {
            if (m <= t && u <= k && !(n > h || q < f)) {
              e = !1;
              break;
            }
          } else if (n == q && f <= n && q <= h && !(t > k || u < m)) {
            e = !1;
            break;
          }
      e && (H = b);
      return e;
    }
    function ba() {
      var b = ea.translate(),
        d = b[0] + a.marginX - a.translateX,
        g = b[1] + a.marginY - a.translateY;
      n.attr("transform", function (a) {
        return "translate(" + parseInt(d) + "," + parseInt(g) + ") scale(1)";
      });
      0 != a.lastScale && (ya(), a.dynamicHide && L());
      ta();
      f();
    }
    a = a || {};
    a.scaleY = a.scaleY || 1;
    a.scaleX = a.scaleX || 1;
    a.translateX = a.translateX || 0;
    a.translateY = a.translateY || 0;
    a.margin = a.margin || 20;
    a.scaleStep = a.scaleStep || 0.3;
    a.nodeHeight = a.nodeHeight || 6;
    a.nodeHeightStep = a.nodeHeightStep || 1;
    a.textLength = a.textLength || 100;
    a.domainWidth = a.domainWidth || 100;
    a.domainWidthStep = a.domainWidthStep || 100;
    a.graphWidth = a.graphWidth || 20;
    a.graphWidthStep = a.graphWidthStep || 10;
    a.domainLevel = a.domainLevel || 1;
    a.domainLevelStep = a.domainLevelStep || 10;
    a.outline = a.outline || 0.3;
    a.popupWidth = a.popupWidth || 300;
    a.maxDecimalsSupportValues = a.maxDecimalsSupportValues || 0;
    a.maxDecimalsLengthValues = a.maxDecimalsLengthValues || 2;
    a.nanColor = a.nanColor || "#fff";
    a.foregroundColor = a.foregroundColor || "#000";
    a.backgroundColor = a.backgroundColor || "#fff";
    a.branchLengthColor = a.branchLengthColor || "#777";
    a.supportValuesColor = a.supportValuesColor || "blue";
    a.showNodesType = a.showNodesType || "only leaf";
    a.treeWidth = a.treeWidth || "auto";
    a.showFullTaxonomy = "showFullTaxonomy" in a ? a.showFullTaxonomy : !1;
    a.showLabels = "showLabels" in a ? a.showLabels : !0;
    a.showDomains = "showDomains" in a ? a.showDomains : !0;
    a.dynamicHide = "dynamicHide" in a ? a.dynamicHide : !1;
    a.invertColors = "invertColors" in a ? a.invertColors : !1;
    a.lineupNodes = "lineupNodes" in a ? a.lineupNodes : !0;
    a.showSupportValues = "showSupportValues" in a ? a.showSupportValues : !1;
    a.showLengthValues = "showLengthValues" in a ? a.showLengthValues : !1;
    a.showTaxonomy = "showTaxonomy" in a ? a.showTaxonomy : !0;
    a.showTaxonomyColors =
      "showTaxonomyColors" in a ? a.showTaxonomyColors : !0;
    a.showDomainNames = "showDomainNames" in a ? a.showDomainNames : !1;
    a.showDomainColors = "showDomainColors" in a ? a.showDomainColors : !0;
    a.showGraphs = "showGraps" in a ? a.showGraphs : !0;
    a.showGraphLegend = "showGraphLegend" in a ? a.showGraphLegend : !0;
    a.showNodeNames = "showNodeNames" in a ? a.showNodeNames : !0;
    a.showPhylogram = "showPhylogram" in a ? a.showPhylogram : !1;
    a.pinnedNodes = a.pinnedNodes || [];
    b.groups = b.groups ? b.groups : {};
    a.height = a.height || b.taxonomy_count*a.nodeHeight*2+200;
    var n,
      T,
      C,
      I,
      K,
      P,
      H,
      E = [],
      D = [],
      R = 100,
      Q = 100,
      w = 0,
      X = 100,
      ma = 0,
      Da = jQuery.extend(!0, {}, b),
      J = !1;
    if (b.graphs)
      for (var oa = 0; oa < b.graphs.length; oa++)
        if (0 != b.graphs[oa].legend.show) {
          J = !0;
          break;
        }
    X = J ? X : 0;
    a.marginX = a.margin;
    a.marginY = a.margin + (a.showGraphs ? X : 0);
    a.initialGraphWidth = a.graphWidth;
    var aa = jQuery(d).width(),
      N = "auto" == a.treeWidth ? aa-Ca()-50 : a.treeWidth,
      W = a.height - (2 * a.margin + (a.showGraphs ? X : 0));
    N = parseInt(N);
    W = parseInt(W);
    0 > N && (N = aa - 2 * Q - (a.showGraphs ? 2 * X : 0));

    var ea = d3.behavior
      .zoom()
      .scaleExtent([1, 1])
      .on("zoom", function (b) {
        b = 0;
        var d = d3.event.sourceEvent;
        if (d) {
          if ((d.altKey || d.ctrlKey) && (0 < d.deltaY || 0 > d.wheelDelta)) b = -1 * a.scaleStep;
          if ((d.altKey || d.ctrlKey) && (0 > d.deltaY || 0 < d.wheelDelta)) b = a.scaleStep;
          // if (!d.altKey && !d.ctrlKey && !d.deltaY){
          //   d3.select(d).on("wheel.zoom", null).on("mousewheel.zoom", null)
          // }
          var e = 0.5,
            f = 0.5;
          d.altKey ||
            d.ctrlKey ||
            ((e = d.layerX / aa), (f = d.layerY / a.height));
          if (d.ctrlKey || !d.altKey)
            (a.scaleY += b),
              a.scaleY < a.scaleStep
                ? (a.scaleY = a.scaleStep)
                : (a.translateY += W * b * f);
          if (d.altKey || !d.ctrlKey)
            (a.graphWidth += 0 == b ? 0 : 0 > b ? -10 : 10),
              10 > a.graphWidth && (a.graphWidth = 10),
              (a.domainWidth +=
                0 == b
                  ? 0
                  : 0 > b
                    ? -1 * a.domainWidthStep
                    : a.domainWidthStep),
              a.domainWidth < a.domainWidthStep &&
              (a.domainWidth = a.domainWidthStep),
              (a.scaleX += b),
              a.scaleX < a.scaleStep
                ? (a.scaleX = a.scaleStep)
                : (a.translateX += N * b * e);
          a.lastScale = b;
          0 != a.lastScale ? requestAnimFrame(S) : requestAnimFrame(ba);
        }
      })

    var zooming = false;
    d3.select("body").on("keydown", function () {
      zooming = true;
    });
  
    d3.select("body").on("keyup", function () {
      zooming = false;
    });

    d3.select("#dynamicHide").on("click", function () {
      a.dynamicHide = !a.dynamicHide;
      O(!0);
      L();
    });
    d3.select("#invertColors").on("click", function () {
      a.invertColors = !a.invertColors;
      ja();
    });
    jQuery("#foregroundColorButton")
      .colorpicker()
      .on("changeColor", function () {
        a.foregroundColor = jQuery("#foregroundColor").val();
        ja();
      });
    jQuery("#backgroundColorButton")
      .colorpicker()
      .on("changeColor", function () {
        a.backgroundColor = jQuery("#backgroundColor").val();
        ja();
      });
    d3.select("#nodesType").on("change", function () {
      a.showNodesType = jQuery(this).val();
      S();
      U();
    });
    d3.select("#phylogram").on("click", function () {
      a.showPhylogram = !a.showPhylogram;
      O(!0);
      F();
      L();
    });
    d3.select("#lineupNodes").on("click", function () {
      a.lineupNodes = !a.lineupNodes;
      O(!0);
      ra();
      F();
      L();
    });
    d3.select("#lengthValues").on("click", function () {
      a.showLengthValues = !a.showLengthValues;
      a.showLengthValues
        ? d3.select("#maxDecimalsLengthValues").attr("disabled", null)
        : d3.select("#maxDecimalsLengthValues").attr("disabled", "disabled");
      ia();
    });
    d3.select("#maxDecimalsLengthValues").on("change", function () {
      a.maxDecimalsLengthValues = jQuery(this).val();
      ia();
    });
    d3.select("#supportValues").on("click", function () {
      a.showSupportValues = !a.showSupportValues;
      a.showSupportValues
        ? d3.select("#maxDecimalsSupportValues").attr("disabled", null)
        : d3.select("#maxDecimalsSupportValues").attr("disabled", "disabled");
      ha();
    });
    d3.select("#maxDecimalsSupportValues").on("change", function () {
      a.maxDecimalsSupportValues = jQuery(this).val();
      ha();
    });
    d3.select("#nodeNames").on("click", function () {
      a.showNodeNames = !a.showNodeNames;
      U();
      F();
    });
    d3.select("#nodeLabels").on("click", function () {
      a.showLabels = !a.showLabels;
      sa();
    });
    d3.select("#taxonomy").on("click", function () {
      a.showTaxonomy = !a.showTaxonomy;
      U();
      F();
    });
    d3.select("#sequences").on("click", function () {
      a.showSequences = !a.showSequences;
      U();
      F();
    });
    d3.select("#nodesType").on("change", function () {
      a.showNodesType = jQuery(this).val();
      S();
      U();
      F();
    });
    d3.select("#taxonomyColors").on("click", function () {
      a.showTaxonomyColors = !a.showTaxonomyColors;
      Y();
    });
    d3.select("#nodeHeightLower").on("click", function () {
      a.nodeHeight -= a.nodeHeightStep;
      a.nodeHeight < a.nodeHeightStep && (a.nodeHeight = a.nodeHeightStep);
      O(!0);
      F();
      L();
      f();
    });
    d3.select("#nodeHeightHigher").on("click", function () {
      a.nodeHeight += a.nodeHeightStep;
      O(!0);
      F();
      L();
      f();
    });
    d3.selectAll(".resetZoom").on("click", function () {
      b = jQuery.extend(!0, {}, Da);
      z();
      size = num_leaves(b)
      B(size);
    });
    d3.select("#zoominY").on("click", function () {
      a.scaleY += a.scaleStep;
      a.translateY += (W * a.scaleStep) / 2;
      a.lastScale = a.scaleStep;
      requestAnimFrame(S);
    });
    d3.select("#zoomoutY").on("click", function () {
      a.scaleY -= a.scaleStep;
      a.scaleY < a.scaleStep
        ? (a.scaleY = a.scaleStep)
        : (a.translateY -= (W * a.scaleStep) / 2);
      a.lastScale = -1 * a.scaleStep;
      requestAnimFrame(S);
    });
    d3.select("#zoominX").on("click", function () {
      a.scaleX += a.scaleStep;
      a.translateX += (N * a.scaleStep) / 2;
      a.lastScale = a.scaleStep;
      requestAnimFrame(S);
    });
    d3.select("#zoomoutX").on("click", function () {
      a.scaleX -= a.scaleStep;
      a.scaleX < a.scaleStep
        ? (a.scaleX = a.scaleStep)
        : (a.translateX -= (N * a.scaleStep) / 2);
      a.lastScale = -1 * a.scaleStep;
      requestAnimFrame(S);
    });
    d3.select("#domains").on("click", function () {
      a.showDomains = !a.showDomains;
      a.showDomains
        ? (d3.select("#domainNames").attr("disabled", null),
          d3.select("#domainColors").attr("disabled", null),
          d3.select("#domainWidthLower").attr("disabled", null),
          d3.select("#domainWidthHigher").attr("disabled", null),
          d3.select("#domainLevelLower").attr("disabled", null),
          d3.select("#domainLevelHigher").attr("disabled", null))
        : (d3.select("#domainNames").attr("disabled", "disabled"),
          d3.select("#domainColors").attr("disabled", "disabled"),
          d3.select("#domainWidthLower").attr("disabled", "disabled"),
          d3.select("#domainWidthHigher").attr("disabled", "disabled"),
          d3.select("#domainLevelLower").attr("disabled", "disabled"),
          d3.select("#domainLevelHigher").attr("disabled", "disabled"));
      pa();
      fa();
    });
    d3.select("#domainColors").on("click", function () {
      a.showDomainColors = !a.showDomainColors;
      ka();
    });
    d3.select("#domainNames").on("click", function () {
      a.showDomainNames = !a.showDomainNames;
      fa();
    });
    d3.select("#domainWidthLower").on("click", function () {
      a.domainWidth -= a.domainWidthStep;
      a.domainWidth < a.domainWidthStep && (a.domainWidth = a.domainWidthStep);
      P = phyd3.phylogram.scaledomainWidths(K, a.domainWidth);
      M();
    });
    d3.select("#domainWidthHigher").on("click", function () {
      a.domainWidth += a.domainWidthStep;
      P = phyd3.phylogram.scaledomainWidths(K, a.domainWidth);
      M();
    });
    d3.select("#domainLevelLower").on("click", function () {
      a.domainLevel /= a.domainLevelStep;
      ca();
    });
    d3.select("#domainLevelHigher").on("click", function () {
      a.domainLevel *= a.domainLevelStep;
      ca();
    });
    d3.select("#graphLegend").on("click", function () {
      a.showGraphLegend = !a.showGraphLegend;
      a.marginY = a.margin + (a.showGraphs ? X : 0);
      V();
      ba();
    });
    d3.select("#graphs").on("click", function () {
      a.showGraphs = !a.showGraphs;
      a.showGraphs
        ? (d3.select("#graphLegend").attr("disabled", null),
          d3.select("#graphWidthLower").attr("disabled", null),
          d3.select("#graphWidthHigher").attr("disabled", null))
        : (d3.select("#graphLegend").attr("disabled", "disabled"),
          d3.select("#graphWidthLower").attr("disabled", "disabled"),
          d3.select("#graphWidthHigher").attr("disabled", "disabled"));
      qa();
    });
    d3.select("#graphWidthLower").on("click", function () {
      a.graphWidth -= a.graphWidthStep;
      a.graphWidth < a.graphWidthStep && (a.graphWidth = a.graphWidthStep);
      F();
    });
    d3.select("#graphWidthHigher").on("click", function () {
      a.graphWidth += a.graphWidthStep;
      F();
    });
    d3.select("#linkSVG").on("click", function () {
      var a = va();
      saveAs(
        new Blob([unescape(encodeURIComponent(a))], {
          type: "application/svg+xml"
        }),
        "phylogram.svg"
      );
    });
    d3.select("#linkPNG").on("click", function () {
      var a = va(),
        b = document.createElement("canvas");
      d3.select("g#main")
        .node()
        .getBBox();
      canvg(b, a);
      b.toBlob(function (a) {
        saveAs(a, "phylogram.png");
      });
    });
    d3.select("#searchQuery").on("change", function () {
      ta();
    });
    d3.select("#res-prevBtn").on("click", function () {
      goRes("prev");
    });
    d3.select("#res-nextBtn").on("click", function () {
      goRes("next");
    });
    d3.select("#applyTaxonomyColors").on("click", function () {
      d3.selectAll("input.taxColor").each(function (a) {
        b.taxcolors[a.taxonomy].color = jQuery(this).val();
      });
      jQuery("#taxonomyColorsModal").modal("hide");
      Y();
    });
    d3.select("#applyGroupLabel").on("click", function () {
      var a = jQuery("#groupID").val(),
        d = jQuery("#groupDepth").val(),
        g = jQuery("#groupLabel").val(),
        n = jQuery("#groupLabelBackground").val(),
        p = jQuery("#groupLabelForeground").val();
      jQuery("#groupLabelModal").modal("hide");
      b.groups[a] = {
        id: a,
        depth: d,
        label: g,
        foregroundColor: p,
        backgroundColor: n
      };
      h(b, a);
      B();
      f();
    });
    d3.select("#clearGroupLabel").on("click", function () {
      var a = jQuery("#groupID").val();
      jQuery("#groupLabelModal").modal("hide");
      delete b.groups[a];
      t(b, a);
      B();
    });
    J = (function () {
      var a = [],
        d;
      for (d in b.taxcolors) {
        var f = b.taxcolors[d];
        f.taxonomy = d;
        a.push(f);
      }
      return a;
    })();
    J.length
      ? ((J = d3
        .select("#taxonomyColorsList")
        .selectAll("div.taxColor")
        .data(J)
        .enter()
        .append("div")
        .attr("class", "form-group col-xs-4 taxColor")),
        J.append("label")
          .attr("class", "col-xs-4 control-label")
          .text(function (a) {
            return a.taxonomy;
          }),
        (J = J.append("div")
          .attr("class", "col-xs-8")
          .append("div")
          .attr("class", "input-group colorpicker-component")),
        J.append("input")
          .attr("class", "form-control taxColor")
          .attr("type", "text")
          .attr("value", function (a) {
            return a.color.replace("0x", "#");
          }),
        J.append("span")
          .attr("class", "input-group-btn")
          .append("span")
          .attr("class", "input-group-addon btn btn-fab btn-fab-mini")
          .append("i"),
        jQuery(".colorpicker-component").colorpicker(),
        jQuery("#taxonomyColorsModal").on("hide.bs.modal", function () {
          jQuery(".colorpicker-component").colorpicker("hide");
        }),
        jQuery("#groupLabelModal").on("hide.bs.modal", function () {
          jQuery(".colorpicker-component").colorpicker("hide");
        }))
      : d3
        .select("#taxonomyColorsList")
        .append("div")
        .attr("class", "col-sm-12 text-center")
        .text("No taxonomy information available");
    B();
  };
})();
(function () {
  "undefined" == typeof phyd3 && (phyd3 = {});
  phyd3.phyloxml = {};
  phyd3.phyloxml.cid = 0;
  phyd3.phyloxml.parseConfidence = function (d) {
    return {
      type: d.getAttribute("type"),
      stddev: parseFloat(d.getAttribute("stddev")),
      value: parseFloat(d.textContent)
    };
  };
  phyd3.phyloxml.parseProperty = function (d) {
    return {
      ref: d.getAttribute("ref"),
      unit: d.getAttribute("unit"),
      datatype: d.getAttribute("datatype"),
      appliesTo: d.getAttribute("applies_to"),
      idRef: d.getAttribute("id_ref"),
      value: d.textContent
    };
  };
  phyd3.phyloxml.parseUri = function (d) {
    return {
      desc: d.getAttribute("desc"),
      type: d.getAttribute("type"),
      value: d.textContent
    };
  };
  phyd3.phyloxml.parseReference = function (d) {
    return {
      doi: d.getAttribute("doi"),
      desc: d.getElementsByTagName("desc")[0]
        ? d.getElementsByTagName("desc")[0].textContent
        : ""
    };
  };
  phyd3.phyloxml.parseAccession = function (d) {
    return {
      source: d.getAttribute("source"),
      comment: d.getAttribute("comment"),
      value: d.textContent
    };
  };
  phyd3.phyloxml.parseMolSeq = function (d) {
    return { isAligned: d.getAttribute("is_aligned"), value: d.textContent };
  };
  phyd3.phyloxml.parseColor = function (d) {
    var b = d.getElementsByTagName("red")[0];
    b = b ? parseInt(b.textContent) : 0;
    var a = d.getElementsByTagName("greeen")[0];
    a = a ? parseInt(a.textContent) : 0;
    var f = d.getElementsByTagName("blue")[0];
    f = f ? parseInt(f.textContent) : 0;
    d = (d = d.getElementsByTagName("alpha")[0])
      ? parseInt(d.textContent)
      : 255;
    return "rgba(" + b + "," + a + "," + f + ", " + parseFloat(d / 255) + ")";
  };
  phyd3.phyloxml.parseDomainArchitecture = function (d) {
    var b = { sequenceLength: parseInt(d.getAttribute("length")), domains: [] };
    d = d.getElementsByTagName("domain");
    for (var a = 0; a < d.length; a++) {
      var f = d[a];
      b.domains.push({
        confidence: parseFloat(f.getAttribute("confidence")),
        from: parseInt(f.getAttribute("from")),
        to: parseInt(f.getAttribute("to")),
        id: f.getAttribute("id"),
        name: f.textContent
      });
    }
    return b;
  };
  phyd3.phyloxml.parseCrossReferences = function (d) {
    var b = [];
    d = d.getElementsByTagName("accession");
    for (var a = 0; a < d.length; a++)
      b.push(phyd3.phyloxml.parseAccession(d[a]));
    return b;
  };
  phyd3.phyloxml.parseEvents = function (d) {
    for (var b = {}, a = 0; a < d.childNodes.length; a++) {
      var f = d.childNodes[a];
      switch (f.nodeName) {
        case "type":
          b.type = f.textContent;
          break;
        case "duplications":
        case "speciations":
        case "losses":
          b[f.nodeName] = parseInt(f.textContent);
          break;
        case "confidence":
          b.confidence = phyd3.phyloxml.parseConfidence(f);
          break;
        case "#text":
        case "#comment":
          break;
        default:
          console.log(
            "Undefined tag: " +
            f.nodeName +
            " " +
            f.textContent +
            " - skipping..."
          );
      }
    }
    return b;
  };
  phyd3.phyloxml.parseTaxonomy = function (d) {
    for (
      var b = { uris: [], synonyms: [] }, a = 0;
      a < d.childNodes.length;
      a++
    ) {
      var f = d.childNodes[a];
      switch (f.nodeName) {
        case "id":
        case "code":
        case "authority":
        case "rank":
          b[f.nodeName] = f.textContent;
          break;
        case "scientific_name":
          b.scientificName = f.textContent;
          break;
        case "common_name":
          b.commonName = f.textContent;
          break;
        case "synonym":
          b.synonyms.push(f.textContent);
        case "uri":
          b.uris.push(phyd3.phyloxml.parseUri(f));
          break;
        case "#text":
        case "#comment":
          break;
        default:
          console.log(
            "Undefined tag: " +
            f.nodeName +
            " " +
            f.textContent +
            " - skipping..."
          );
      }
    }
    return b;
  };
  phyd3.phyloxml.parseAnnotation = function (d) {
    for (
      var b = {
        ref: d.getAttribute("ref"),
        source: d.getAttribute("source"),
        evidence: d.getAttribute("evidence"),
        type: d.getAttribute("type"),
        properties: [],
        uris: []
      },
      a = 0;
      a < d.childNodes.length;
      a++
    ) {
      var f = d.childNodes[a];
      switch (f.nodeName) {
        case "desc":
          b.desc = f.textContent;
          break;
        case "confidence":
          b.confidence = phyd3.phyloxml.parseConfidence(f);
          break;
        case "property":
          b.properties.push(phyd3.phyloxml.parseProperty(f));
          break;
        case "uri":
          b.uris.push(phyd3.phyloxml.parseUri(f));
          break;
        case "#text":
        case "#comment":
          break;
        default:
          console.log(
            "Undefined tag: " +
            f.nodeName +
            " " +
            f.textContent +
            " - skipping..."
          );
      }
    }
    return b;
  };
  phyd3.phyloxml.parseSequence = function (d) {
    for (
      var b = {
        type: d.getAttribute("type"),
        idSource: d.getAttribute("id_source"),
        idRef: d.getAttribute("id_ref"),
        uris: [],
        annotations: []
      },
      a = 0;
      a < d.childNodes.length;
      a++
    ) {
      var f = d.childNodes[a];
      switch (f.nodeName) {
        case "symbol":
        case "name":
        case "location":
          b[f.nodeName] = f.textContent;
          break;
        case "gene_name":
          b.geneName = f.textContent;
          break;
        case "accession":
          b.accession = phyd3.phyloxml.parseAccession(f);
          break;
        case "cross_reference":
          b.crossReferences = phyd3.phyloxml.parseCrossReferences(f);
          break;
        case "mol_seq":
          b.molSeq = phyd3.phyloxml.parseMolSeq(f);
          break;
        case "annotation":
          b.annotations.push(phyd3.phyloxml.parseAnnotation(f));
          break;
        case "uri":
          b.uris.push(phyd3.phyloxml.parseUri(f));
          break;
        case "domain_architecture":
          b.domainArchitecture = phyd3.phyloxml.parseDomainArchitecture(f);
          break;
        case "#text":
        case "#comment":
          break;
        default:
          console.log(
            "Undefined tag: " +
            f.nodeName +
            " " +
            f.textContent +
            " - skipping..."
          );
      }
    }
    return b;
  };
  phyd3.phyloxml.parseClade = function (d) {
    for (
      var b = {
        branchset: [],
        properties: [],
        taxonomies: [],
        sequences: [],
        confidences: [],
        references: [],
        branchLength: parseFloat(d.getAttribute("branch_length"))
      },
      a = 0;
      a < d.childNodes.length;
      a++
    ) {
      var f = d.childNodes[a];
      switch (f.nodeName) {
        case "branch_length":
          b.branchLength = parseFloat(f.textContent);
          break;
        case "width":
          b.width = parseFloat(f.textContent);
          break;
        case "clade":
          b.branchset.push(phyd3.phyloxml.parseClade(f));
          break;
        case "property":
          b.properties.push(phyd3.phyloxml.parseProperty(f));
          break;
        case "taxonomy":
          b.taxonomies.push(phyd3.phyloxml.parseTaxonomy(f));
          break;
        case "reference":
          b.references.push(phyd3.phyloxml.parseReference(f));
          break;
        case "confidence":
          b.confidences.push(phyd3.phyloxml.parseConfidence(f));
          break;
        case "sequence":
          b.sequences.push(phyd3.phyloxml.parseSequence(f));
          break;
        case "color":
          b.color = phyd3.phyloxml.parseColor(f);
          break;
        case "events":
          b.events = phyd3.phyloxml.parseEvents(f);
          break;
        case "id":
        case "name":
          b[f.nodeName] = f.textContent;
          break;
        case "#text":
        case "#comment":
          break;
        default:
          b[f.nodeName] = f.textContent;
      }
    }
    b.id || (phyd3.phyloxml.cid++, (b.id = "_" + phyd3.phyloxml.cid));
    return b;
  };
  phyd3.phyloxml.parseLegend = function (d) {
    for (
      var b = {
        show: parseInt(d.getAttribute("show")),
        stacked: parseInt(d.getAttribute("stacked")),
        fields: [],
        gradient: {}
      },
      a = d.getElementsByTagName("field"),
      f = 0;
      f < a.length;
      f++
    ) {
      var h = a[f],
        v = h.getElementsByTagName("name")[0];
      v = v ? v.textContent : "";
      var t = h.getElementsByTagName("color")[0];
      t = t ? t.textContent : "";
      var z = h.getElementsByTagName("background")[0];
      z = z ? z.textContent : "";
      var B = h.getElementsByTagName("shape")[0];
      B = B ? B.textContent : "";
      h = (h = h.getElementsByTagName("url")[0]) ? h.textContent : "";
      b.fields.push({ name: v, color: t, background: z, shape: B, url: h });
    }
    if ((d = d.getElementsByTagName("gradient")[0]))
      (v = (v = d.getElementsByTagName("name")[0]) ? v.textContent : ""),
        (d = (d = d.getElementsByTagName("classes")[0])
          ? parseInt(d.textContent)
          : 0),
        (b.gradient = { name: v, classes: d });
    return b;
  };
  phyd3.phyloxml.parseData = function (d) {
    var b = { tag: d.getAttribute("tag"), ref: d.getAttribute("ref") },
      a = d.getElementsByTagName("min")[0];
    b.min = a ? a.textContent : void 0;
    a = d.getElementsByTagName("max")[0];
    b.max = a ? a.textContent : void 0;
    d = d.getElementsByTagName("values");
    for (a = 0; a < d.length; a++) {
      var f = d[a].getAttribute("for"),
        h = d[a].getElementsByTagName("value");
      b[f] = [];
      for (var v = 0; v < h.length; v++)
        b[f].push(parseFloat(h[v].textContent));
    }
    return b;
  };
  phyd3.phyloxml.parseGraph = function (d) {
    for (
      var b = { name: "", legend: {}, data: {}, type: d.getAttribute("type") },
      a = 0;
      a < d.childNodes.length;
      a++
    ) {
      var f = d.childNodes[a];
      switch (f.nodeName) {
        case "name":
          b.name = f.textContent;
          break;
        case "legend":
          b.legend = phyd3.phyloxml.parseLegend(f);
          break;
        case "data":
          b.data = phyd3.phyloxml.parseData(f);
          break;
        case "#text":
        case "#comment":
          break;
        default:
          console.log(
            "Undefined tag: " +
            f.nodeName +
            " " +
            f.textContent +
            " - skipping..."
          );
      }
    }
    return b;
  };
  phyd3.phyloxml.parseLabel = function (d) {
    for (
      var b = {
        showLegend: !1,
        name: "",
        data: {},
        type: d.getAttribute("type")
      },
      a = 0;
      a < d.childNodes.length;
      a++
    ) {
      var f = d.childNodes[a];
      switch (f.nodeName) {
        case "name":
          b.name = f.textContent;
          b.showLegend = f.getAttribute("show");
          break;
        case "data":
          b.data = phyd3.phyloxml.parseData(f);
          break;
        case "#text":
        case "#comment":
          break;
        default:
          console.log(
            "Undefined tag: " +
            f.nodeName +
            " " +
            f.textContent +
            " - skipping..."
          );
      }
    }
    return b;
  };
  phyd3.phyloxml.parse = function (d) {
    var b = { branchset: [], properties: [], confidence: [] },
      a = d.getElementsByTagName("phylogeny");
    a = a[0];
    b.rooted = a.getAttribute("rooted");
    b.rerootable = a.getAttribute("rerootable");
    b.branch_length_unit = a.getAttribute("branch_length_unit");
    b.type = a.getAttribute("type");
    b.taxonomy_count = 0;
    if (a && a.childNodes)
      for (var f = 0; f < a.childNodes.length; f++) {
        var h = a.childNodes[f];
        switch (h.nodeName) {
          case "clade":
            b.branchset.push(phyd3.phyloxml.parseClade(h));
            break;
          case "confidence":
            b.confidence.push(phyd3.phyloxml.parseConfidence(h));
            break;
          case "date":
            b.date = h.textContent;
            break;
          case "description":
            b.description = h.textContent;
            break;
          case "id":
            b.id = h.textContent;
            break;
          case "name":
            b.name = h.textContent;
            break;
          case "property":
            b.properties.push(phyd3.phyloxml.parseProperty(h));
            break;
          case "#text":
          case "#comment":
            break;
          default:
            console.log(
              "Undefined tag: " +
              h.nodeName +
              " " +
              h.textContent +
              " - skipping..."
            );
        }
      }
    a = d.getElementsByTagName("taxonomies");
    a = a[0];
    var v = {};
    if (a && a.childNodes)
      for (f = 0; f < a.childNodes.length; f++) {
        var t = a.childNodes[f];
        if ("color" == t.nodeName) {
          h = t.getElementsByTagName("code")[0].textContent;
          var z = t.getElementsByTagName("value")[0].textContent;
          v[h] = { color: z };
        }
        if ("taxonomy" == t.nodeName) {
          h = t.getAttribute("code");
          z = (z = t.getElementsByTagName("color")[0]) ? z.textContent : z;
          var B = t.getElementsByTagName("name")[0];
          B = B ? B.textContent : B;
          t = (t = t.getElementsByTagName("url")[0]) ? t.textContent : t;
          v[h] = { color: z, name: B, url: t };
          b.taxonomy_count++;
        }
      }
    b.taxcolors = v;
    a = d.getElementsByTagName("domains");
    a = a[0];
    v = {};
    if (a && a.childNodes)
      for (f = 0; f < a.childNodes.length; f++)
        (t = a.childNodes[f]),
          "color" == t.nodeName &&
          ((h = t.getElementsByTagName("code")[0].textContent),
            (z = t.getElementsByTagName("value")[0].textContent),
            (v[h] = { color: z })),
          "domain" == t.nodeName &&
          ((h = t.getAttribute("name")),
            (z = (z = t.getElementsByTagName("color")[0]) ? z.textContent : z),
            (B = (B = t.getElementsByTagName("description")[0])
              ? B.textContent
              : B),
            (t = (t = t.getElementsByTagName("url")[0]) ? t.textContent : t),
            (v[h] = { color: z, description: B, url: t }));
    b.domcolors = v;
    a = d.getElementsByTagName("graphs");
    a = a[0];
    h = [];
    if (a && a.childNodes)
      for (f = 0; f < a.childNodes.length; f++)
        (z = a.childNodes[f]),
          "graph" == z.nodeName && h.push(phyd3.phyloxml.parseGraph(z));
    b.graphs = h;
    a = d.getElementsByTagName("labels");
    a = a[0];
    d = [];
    if (a && a.childNodes)
      for (f = 0; f < a.childNodes.length; f++)
        (h = a.childNodes[f]),
          "label" == h.nodeName && d.push(phyd3.phyloxml.parseLabel(h));
    b.labels = d;
    return b;
  };
})();
/* Blob.js
 * A Blob implementation.
 * 2014-07-24
 *
 * By Eli Grey, http://eligrey.com
 * By Devin Samarin, https://github.com/dsamarin
 * License: MIT
 *   See https://github.com/eligrey/Blob.js/blob/master/LICENSE.md
 */
!(function (t) {
  "use strict";
  if (((t.URL = t.URL || t.webkitURL), t.Blob && t.URL))
    try {
      return void new Blob();
    } catch (t) { }
  var e =
    t.BlobBuilder ||
    t.WebKitBlobBuilder ||
    t.MozBlobBuilder ||
    (function (t) {
      var e = function (t) {
        return Object.prototype.toString
          .call(t)
          .match(/^\[object\s(.*)\]$/)[1];
      },
        n = function () {
          this.data = [];
        },
        o = function (t, e, n) {
          (this.data = t),
            (this.size = t.length),
            (this.type = e),
            (this.encoding = n);
        },
        i = n.prototype,
        a = o.prototype,
        r = t.FileReaderSync,
        c = function (t) {
          this.code = this[(this.name = t)];
        },
        l = "NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR".split(
          " "
        ),
        s = l.length,
        d = t.URL || t.webkitURL || t,
        u = d.createObjectURL,
        f = d.revokeObjectURL,
        R = d,
        p = t.btoa,
        h = t.atob,
        b = t.ArrayBuffer,
        g = t.Uint8Array,
        w = /^[\w-]+:\/*\[?[\w\.:-]+\]?(?::[0-9]+)?/;
      for (o.fake = a.fake = !0; s--;) c.prototype[l[s]] = s + 1;
      return (
        d.createObjectURL ||
        (R = t.URL = function (t) {
          var e,
            n = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
          return (
            (n.href = t),
            "origin" in n ||
            ("data:" === n.protocol.toLowerCase()
              ? (n.origin = null)
              : ((e = t.match(w)), (n.origin = e && e[1]))),
            n
          );
        }),
        (R.createObjectURL = function (t) {
          var e,
            n = t.type;
          return (
            null === n && (n = "application/octet-stream"),
            t instanceof o
              ? ((e = "data:" + n),
                "base64" === t.encoding
                  ? e + ";base64," + t.data
                  : "URI" === t.encoding
                    ? e + "," + decodeURIComponent(t.data)
                    : p
                      ? e + ";base64," + p(t.data)
                      : e + "," + encodeURIComponent(t.data))
              : u
                ? u.call(d, t)
                : void 0
          );
        }),
        (R.revokeObjectURL = function (t) {
          "data:" !== t.substring(0, 5) && f && f.call(d, t);
        }),
        (i.append = function (t) {
          var n = this.data;
          if (g && (t instanceof b || t instanceof g)) {
            for (var i = "", a = new g(t), l = 0, s = a.length; l < s; l++)
              i += String.fromCharCode(a[l]);
            n.push(i);
          } else if ("Blob" === e(t) || "File" === e(t)) {
            if (!r) throw new c("NOT_READABLE_ERR");
            var d = new r();
            n.push(d.readAsBinaryString(t));
          } else
            t instanceof o
              ? "base64" === t.encoding && h
                ? n.push(h(t.data))
                : "URI" === t.encoding
                  ? n.push(decodeURIComponent(t.data))
                  : "raw" === t.encoding && n.push(t.data)
              : ("string" != typeof t && (t += ""),
                n.push(unescape(encodeURIComponent(t))));
        }),
        (i.getBlob = function (t) {
          return (
            arguments.length || (t = null), new o(this.data.join(""), t, "raw")
          );
        }),
        (i.toString = function () {
          return "[object BlobBuilder]";
        }),
        (a.slice = function (t, e, n) {
          var i = arguments.length;
          return (
            i < 3 && (n = null),
            new o(
              this.data.slice(t, i > 1 ? e : this.data.length),
              n,
              this.encoding
            )
          );
        }),
        (a.toString = function () {
          return "[object Blob]";
        }),
        (a.close = function () {
          (this.size = 0), delete this.data;
        }),
        n
      );
    })(t);
  t.Blob = function (t, n) {
    var o = n ? n.type || "" : "",
      i = new e();
    if (t)
      for (var a = 0, r = t.length; a < r; a++)
        Uint8Array && t[a] instanceof Uint8Array
          ? i.append(t[a].buffer)
          : i.append(t[a]);
    var c = i.getBlob(o);
    return !c.slice && c.webkitSlice && (c.slice = c.webkitSlice), c;
  };
  var n =
    Object.getPrototypeOf ||
    function (t) {
      return t.__proto__;
    };
  t.Blob.prototype = n(new t.Blob());
})(
  ("undefined" != typeof self && self) ||
  ("undefined" != typeof window && window) ||
  this.content ||
  this
);

/*!
 * Bootstrap Colorpicker v2.3.6
 * https://itsjavi.com/bootstrap-colorpicker/
 */
!(function (a) {
  "use strict";
  "object" == typeof exports
    ? (module.exports = a(window.jQuery))
    : "function" == typeof define && define.amd
      ? define(["jquery"], a)
      : window.jQuery && !window.jQuery.fn.colorpicker && a(window.jQuery);
})(function (a) {
  "use strict";
  var b = function (b, c) {
    (this.value = { h: 0, s: 0, b: 0, a: 1 }),
      (this.origFormat = null),
      c && a.extend(this.colors, c),
      b &&
      (void 0 !== b.toLowerCase
        ? ((b += ""), this.setColor(b))
        : void 0 !== b.h && (this.value = b));
  };
  b.prototype = {
    constructor: b,
    colors: {
      aliceblue: "#f0f8ff",
      antiquewhite: "#faebd7",
      aqua: "#00ffff",
      aquamarine: "#7fffd4",
      azure: "#f0ffff",
      beige: "#f5f5dc",
      bisque: "#ffe4c4",
      black: "#000000",
      blanchedalmond: "#ffebcd",
      blue: "#0000ff",
      blueviolet: "#8a2be2",
      brown: "#a52a2a",
      burlywood: "#deb887",
      cadetblue: "#5f9ea0",
      chartreuse: "#7fff00",
      chocolate: "#d2691e",
      coral: "#ff7f50",
      cornflowerblue: "#6495ed",
      cornsilk: "#fff8dc",
      crimson: "#dc143c",
      cyan: "#00ffff",
      darkblue: "#00008b",
      darkcyan: "#008b8b",
      darkgoldenrod: "#b8860b",
      darkgray: "#a9a9a9",
      darkgreen: "#006400",
      darkkhaki: "#bdb76b",
      darkmagenta: "#8b008b",
      darkolivegreen: "#556b2f",
      darkorange: "#ff8c00",
      darkorchid: "#9932cc",
      darkred: "#8b0000",
      darksalmon: "#e9967a",
      darkseagreen: "#8fbc8f",
      darkslateblue: "#483d8b",
      darkslategray: "#2f4f4f",
      darkturquoise: "#00ced1",
      darkviolet: "#9400d3",
      deeppink: "#ff1493",
      deepskyblue: "#00bfff",
      dimgray: "#696969",
      dodgerblue: "#1e90ff",
      firebrick: "#b22222",
      floralwhite: "#fffaf0",
      forestgreen: "#228b22",
      fuchsia: "#ff00ff",
      gainsboro: "#dcdcdc",
      ghostwhite: "#f8f8ff",
      gold: "#ffd700",
      goldenrod: "#daa520",
      gray: "#808080",
      green: "#008000",
      greenyellow: "#adff2f",
      honeydew: "#f0fff0",
      hotpink: "#ff69b4",
      indianred: "#cd5c5c",
      indigo: "#4b0082",
      ivory: "#fffff0",
      khaki: "#f0e68c",
      lavender: "#e6e6fa",
      lavenderblush: "#fff0f5",
      lawngreen: "#7cfc00",
      lemonchiffon: "#fffacd",
      lightblue: "#add8e6",
      lightcoral: "#f08080",
      lightcyan: "#e0ffff",
      lightgoldenrodyellow: "#fafad2",
      lightgrey: "#d3d3d3",
      lightgreen: "#90ee90",
      lightpink: "#ffb6c1",
      lightsalmon: "#ffa07a",
      lightseagreen: "#20b2aa",
      lightskyblue: "#87cefa",
      lightslategray: "#778899",
      lightsteelblue: "#b0c4de",
      lightyellow: "#ffffe0",
      lime: "#00ff00",
      limegreen: "#32cd32",
      linen: "#faf0e6",
      magenta: "#ff00ff",
      maroon: "#800000",
      mediumaquamarine: "#66cdaa",
      mediumblue: "#0000cd",
      mediumorchid: "#ba55d3",
      mediumpurple: "#9370d8",
      mediumseagreen: "#3cb371",
      mediumslateblue: "#7b68ee",
      mediumspringgreen: "#00fa9a",
      mediumturquoise: "#48d1cc",
      mediumvioletred: "#c71585",
      midnightblue: "#191970",
      mintcream: "#f5fffa",
      mistyrose: "#ffe4e1",
      moccasin: "#ffe4b5",
      navajowhite: "#ffdead",
      navy: "#000080",
      oldlace: "#fdf5e6",
      olive: "#808000",
      olivedrab: "#6b8e23",
      orange: "#ffa500",
      orangered: "#ff4500",
      orchid: "#da70d6",
      palegoldenrod: "#eee8aa",
      palegreen: "#98fb98",
      paleturquoise: "#afeeee",
      palevioletred: "#d87093",
      papayawhip: "#ffefd5",
      peachpuff: "#ffdab9",
      peru: "#cd853f",
      pink: "#ffc0cb",
      plum: "#dda0dd",
      powderblue: "#b0e0e6",
      purple: "#800080",
      red: "#ff0000",
      rosybrown: "#bc8f8f",
      royalblue: "#4169e1",
      saddlebrown: "#8b4513",
      salmon: "#fa8072",
      sandybrown: "#f4a460",
      seagreen: "#2e8b57",
      seashell: "#fff5ee",
      sienna: "#a0522d",
      silver: "#c0c0c0",
      skyblue: "#87ceeb",
      slateblue: "#6a5acd",
      slategray: "#708090",
      snow: "#fffafa",
      springgreen: "#00ff7f",
      steelblue: "#4682b4",
      tan: "#d2b48c",
      teal: "#008080",
      thistle: "#d8bfd8",
      tomato: "#ff6347",
      turquoise: "#40e0d0",
      violet: "#ee82ee",
      wheat: "#f5deb3",
      white: "#ffffff",
      whitesmoke: "#f5f5f5",
      yellow: "#ffff00",
      yellowgreen: "#9acd32",
      transparent: "transparent"
    },
    _sanitizeNumber: function (a) {
      return "number" == typeof a
        ? a
        : isNaN(a) || null === a || "" === a || void 0 === a
          ? 1
          : "" === a
            ? 0
            : void 0 !== a.toLowerCase
              ? (a.match(/^\./) && (a = "0" + a),
                Math.ceil(100 * parseFloat(a)) / 100)
              : 1;
    },
    isTransparent: function (a) {
      return (
        !!a &&
        ((a = a.toLowerCase().trim()),
          "transparent" === a ||
          a.match(/#?00000000/) ||
          a.match(/(rgba|hsla)\(0,0,0,0?\.?0\)/))
      );
    },
    rgbaIsTransparent: function (a) {
      return 0 === a.r && 0 === a.g && 0 === a.b && 0 === a.a;
    },
    setColor: function (a) {
      (a = a.toLowerCase().trim()),
        a &&
        (this.isTransparent(a)
          ? (this.value = { h: 0, s: 0, b: 0, a: 0 })
          : (this.value = this.stringToHSB(a) || { h: 0, s: 0, b: 0, a: 1 }));
    },
    stringToHSB: function (b) {
      b = b.toLowerCase();
      var c;
      "undefined" != typeof this.colors[b] &&
        ((b = this.colors[b]), (c = "alias"));
      var d = this,
        e = !1;
      return (
        a.each(this.stringParsers, function (a, f) {
          var g = f.re.exec(b),
            h = g && f.parse.apply(d, [g]),
            i = c || f.format || "rgba";
          return (
            !h ||
            ((e = i.match(/hsla?/)
              ? d.RGBtoHSB.apply(d, d.HSLtoRGB.apply(d, h))
              : d.RGBtoHSB.apply(d, h)),
              (d.origFormat = i),
              !1)
          );
        }),
        e
      );
    },
    setHue: function (a) {
      this.value.h = 1 - a;
    },
    setSaturation: function (a) {
      this.value.s = a;
    },
    setBrightness: function (a) {
      this.value.b = 1 - a;
    },
    setAlpha: function (a) {
      this.value.a =
        Math.round((parseInt(100 * (1 - a), 10) / 100) * 100) / 100;
    },
    toRGB: function (a, b, c, d) {
      a || ((a = this.value.h), (b = this.value.s), (c = this.value.b)),
        (a *= 360);
      var e, f, g, h, i;
      return (
        (a = (a % 360) / 60),
        (i = c * b),
        (h = i * (1 - Math.abs((a % 2) - 1))),
        (e = f = g = c - i),
        (a = ~~a),
        (e += [i, h, 0, 0, h, i][a]),
        (f += [h, i, i, h, 0, 0][a]),
        (g += [0, 0, h, i, i, h][a]),
        {
          r: Math.round(255 * e),
          g: Math.round(255 * f),
          b: Math.round(255 * g),
          a: d || this.value.a
        }
      );
    },
    toHex: function (a, b, c, d) {
      var e = this.toRGB(a, b, c, d);
      return this.rgbaIsTransparent(e)
        ? "transparent"
        : "#" +
        (
          (1 << 24) |
          (parseInt(e.r) << 16) |
          (parseInt(e.g) << 8) |
          parseInt(e.b)
        )
          .toString(16)
          .substr(1);
    },
    toHSL: function (a, b, c, d) {
      (a = a || this.value.h),
        (b = b || this.value.s),
        (c = c || this.value.b),
        (d = d || this.value.a);
      var e = a,
        f = (2 - b) * c,
        g = b * c;
      return (
        (g /= f > 0 && f <= 1 ? f : 2 - f),
        (f /= 2),
        g > 1 && (g = 1),
        {
          h: isNaN(e) ? 0 : e,
          s: isNaN(g) ? 0 : g,
          l: isNaN(f) ? 0 : f,
          a: isNaN(d) ? 0 : d
        }
      );
    },
    toAlias: function (a, b, c, d) {
      var e = this.toHex(a, b, c, d);
      for (var f in this.colors) if (this.colors[f] === e) return f;
      return !1;
    },
    RGBtoHSB: function (a, b, c, d) {
      (a /= 255), (b /= 255), (c /= 255);
      var e, f, g, h;
      return (
        (g = Math.max(a, b, c)),
        (h = g - Math.min(a, b, c)),
        (e =
          0 === h
            ? null
            : g === a
              ? (b - c) / h
              : g === b
                ? (c - a) / h + 2
                : (a - b) / h + 4),
        (e = (((e + 360) % 6) * 60) / 360),
        (f = 0 === h ? 0 : h / g),
        { h: this._sanitizeNumber(e), s: f, b: g, a: this._sanitizeNumber(d) }
      );
    },
    HueToRGB: function (a, b, c) {
      return (
        c < 0 ? (c += 1) : c > 1 && (c -= 1),
        6 * c < 1
          ? a + (b - a) * c * 6
          : 2 * c < 1
            ? b
            : 3 * c < 2
              ? a + (b - a) * (2 / 3 - c) * 6
              : a
      );
    },
    HSLtoRGB: function (a, b, c, d) {
      b < 0 && (b = 0);
      var e;
      e = c <= 0.5 ? c * (1 + b) : c + b - c * b;
      var f = 2 * c - e,
        g = a + 1 / 3,
        h = a,
        i = a - 1 / 3,
        j = Math.round(255 * this.HueToRGB(f, e, g)),
        k = Math.round(255 * this.HueToRGB(f, e, h)),
        l = Math.round(255 * this.HueToRGB(f, e, i));
      return [j, k, l, this._sanitizeNumber(d)];
    },
    toString: function (a) {
      a = a || "rgba";
      var b = !1;
      switch (a) {
        case "rgb":
          return (
            (b = this.toRGB()),
            this.rgbaIsTransparent(b)
              ? "transparent"
              : "rgb(" + b.r + "," + b.g + "," + b.b + ")"
          );
        case "rgba":
          return (
            (b = this.toRGB()),
            "rgba(" + b.r + "," + b.g + "," + b.b + "," + b.a + ")"
          );
        case "hsl":
          return (
            (b = this.toHSL()),
            "hsl(" +
            Math.round(360 * b.h) +
            "," +
            Math.round(100 * b.s) +
            "%," +
            Math.round(100 * b.l) +
            "%)"
          );
        case "hsla":
          return (
            (b = this.toHSL()),
            "hsla(" +
            Math.round(360 * b.h) +
            "," +
            Math.round(100 * b.s) +
            "%," +
            Math.round(100 * b.l) +
            "%," +
            b.a +
            ")"
          );
        case "hex":
          return this.toHex();
        case "alias":
          return this.toAlias() || this.toHex();
        default:
          return b;
      }
    },
    stringParsers: [
      {
        re: /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*?\)/,
        format: "rgb",
        parse: function (a) {
          return [a[1], a[2], a[3], 1];
        }
      },
      {
        re: /rgb\(\s*(\d*(?:\.\d+)?)\%\s*,\s*(\d*(?:\.\d+)?)\%\s*,\s*(\d*(?:\.\d+)?)\%\s*?\)/,
        format: "rgb",
        parse: function (a) {
          return [2.55 * a[1], 2.55 * a[2], 2.55 * a[3], 1];
        }
      },
      {
        re: /rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d*(?:\.\d+)?)\s*)?\)/,
        format: "rgba",
        parse: function (a) {
          return [a[1], a[2], a[3], a[4]];
        }
      },
      {
        re: /rgba\(\s*(\d*(?:\.\d+)?)\%\s*,\s*(\d*(?:\.\d+)?)\%\s*,\s*(\d*(?:\.\d+)?)\%\s*(?:,\s*(\d*(?:\.\d+)?)\s*)?\)/,
        format: "rgba",
        parse: function (a) {
          return [2.55 * a[1], 2.55 * a[2], 2.55 * a[3], a[4]];
        }
      },
      {
        re: /hsl\(\s*(\d*(?:\.\d+)?)\s*,\s*(\d*(?:\.\d+)?)\%\s*,\s*(\d*(?:\.\d+)?)\%\s*?\)/,
        format: "hsl",
        parse: function (a) {
          return [a[1] / 360, a[2] / 100, a[3] / 100, a[4]];
        }
      },
      {
        re: /hsla\(\s*(\d*(?:\.\d+)?)\s*,\s*(\d*(?:\.\d+)?)\%\s*,\s*(\d*(?:\.\d+)?)\%\s*(?:,\s*(\d*(?:\.\d+)?)\s*)?\)/,
        format: "hsla",
        parse: function (a) {
          return [a[1] / 360, a[2] / 100, a[3] / 100, a[4]];
        }
      },
      {
        re: /#?([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,
        format: "hex",
        parse: function (a) {
          return [
            parseInt(a[1], 16),
            parseInt(a[2], 16),
            parseInt(a[3], 16),
            1
          ];
        }
      },
      {
        re: /#?([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/,
        format: "hex",
        parse: function (a) {
          return [
            parseInt(a[1] + a[1], 16),
            parseInt(a[2] + a[2], 16),
            parseInt(a[3] + a[3], 16),
            1
          ];
        }
      }
    ],
    colorNameToHex: function (a) {
      return (
        "undefined" != typeof this.colors[a.toLowerCase()] &&
        this.colors[a.toLowerCase()]
      );
    }
  };
  var c = {
    horizontal: !1,
    inline: !1,
    color: !1,
    format: !1,
    input: "input",
    container: !1,
    component: ".add-on, .input-group-addon",
    sliders: {
      saturation: {
        maxLeft: 100,
        maxTop: 100,
        callLeft: "setSaturation",
        callTop: "setBrightness"
      },
      hue: { maxLeft: 0, maxTop: 100, callLeft: !1, callTop: "setHue" },
      alpha: { maxLeft: 0, maxTop: 100, callLeft: !1, callTop: "setAlpha" }
    },
    slidersHorz: {
      saturation: {
        maxLeft: 100,
        maxTop: 100,
        callLeft: "setSaturation",
        callTop: "setBrightness"
      },
      hue: { maxLeft: 100, maxTop: 0, callLeft: "setHue", callTop: !1 },
      alpha: { maxLeft: 100, maxTop: 0, callLeft: "setAlpha", callTop: !1 }
    },
    template:
      '<div class="colorpicker dropdown-menu"><div class="colorpicker-saturation"><i><b></b></i></div><div class="colorpicker-hue"><i></i></div><div class="colorpicker-alpha"><i></i></div><div class="colorpicker-color"><div /></div><div class="colorpicker-selectors"></div></div>',
    align: "right",
    customClass: null,
    colorSelectors: null
  },
    d = function (d, e) {
      if (
        ((this.element = a(d).addClass("colorpicker-element")),
          (this.options = a.extend(!0, {}, c, this.element.data(), e)),
          (this.component = this.options.component),
          (this.component =
            this.component !== !1 && this.element.find(this.component)),
          this.component && 0 === this.component.length && (this.component = !1),
          (this.container =
            this.options.container === !0
              ? this.element
              : this.options.container),
          (this.container = this.container !== !1 && a(this.container)),
          (this.input = this.element.is("input")
            ? this.element
            : !!this.options.input && this.element.find(this.options.input)),
          this.input && 0 === this.input.length && (this.input = !1),
          (this.color = new b(
            this.options.color !== !1 ? this.options.color : this.getValue(),
            this.options.colorSelectors
          )),
          (this.format =
            this.options.format !== !1
              ? this.options.format
              : this.color.origFormat),
          this.options.color !== !1 &&
          (this.updateInput(this.color), this.updateData(this.color)),
          (this.picker = a(this.options.template)),
          this.options.customClass &&
          this.picker.addClass(this.options.customClass),
          this.options.inline
            ? this.picker.addClass("colorpicker-inline colorpicker-visible")
            : this.picker.addClass("colorpicker-hidden"),
          this.options.horizontal &&
          this.picker.addClass("colorpicker-horizontal"),
          ("rgba" !== this.format &&
            "hsla" !== this.format &&
            this.options.format !== !1) ||
          this.picker.addClass("colorpicker-with-alpha"),
          "right" === this.options.align &&
          this.picker.addClass("colorpicker-right"),
          this.options.inline === !0 &&
          this.picker.addClass("colorpicker-no-arrow"),
          this.options.colorSelectors)
      ) {
        var f = this;
        a.each(this.options.colorSelectors, function (b, c) {
          var d = a("<i />")
            .css("background-color", c)
            .data("class", b);
          d.click(function () {
            f.setValue(a(this).css("background-color"));
          }),
            f.picker.find(".colorpicker-selectors").append(d);
        }),
          this.picker.find(".colorpicker-selectors").show();
      }
      this.picker.on(
        "mousedown.colorpicker touchstart.colorpicker",
        a.proxy(this.mousedown, this)
      ),
        this.picker.appendTo(this.container ? this.container : a("body")),
        this.input !== !1 &&
        (this.input.on({ "keyup.colorpicker": a.proxy(this.keyup, this) }),
          this.input.on({ "change.colorpicker": a.proxy(this.change, this) }),
          this.component === !1 &&
          this.element.on({ "focus.colorpicker": a.proxy(this.show, this) }),
          this.options.inline === !1 &&
          this.element.on({
            "focusout.colorpicker": a.proxy(this.hide, this)
          })),
        this.component !== !1 &&
        this.component.on({ "click.colorpicker": a.proxy(this.show, this) }),
        this.input === !1 &&
        this.component === !1 &&
        this.element.on({ "click.colorpicker": a.proxy(this.show, this) }),
        this.input !== !1 &&
        this.component !== !1 &&
        "color" === this.input.attr("type") &&
        this.input.on({
          "click.colorpicker": a.proxy(this.show, this),
          "focus.colorpicker": a.proxy(this.show, this)
        }),
        this.update(),
        a(
          a.proxy(function () {
            this.element.trigger("create");
          }, this)
        );
    };
  (d.Color = b),
    (d.prototype = {
      constructor: d,
      destroy: function () {
        this.picker.remove(),
          this.element.removeData("colorpicker", "color").off(".colorpicker"),
          this.input !== !1 && this.input.off(".colorpicker"),
          this.component !== !1 && this.component.off(".colorpicker"),
          this.element.removeClass("colorpicker-element"),
          this.element.trigger({ type: "destroy" });
      },
      reposition: function () {
        if (this.options.inline !== !1 || this.options.container) return !1;
        var a =
          this.container && this.container[0] !== document.body
            ? "position"
            : "offset",
          b = this.component || this.element,
          c = b[a]();
        "right" === this.options.align &&
          (c.left -= this.picker.outerWidth() - b.outerWidth()),
          this.picker.css({ top: c.top + b.outerHeight(), left: c.left });
      },
      show: function (b) {
        return (
          !this.isDisabled() &&
          (this.picker
            .addClass("colorpicker-visible")
            .removeClass("colorpicker-hidden"),
            this.reposition(),
            a(window).on("resize.colorpicker", a.proxy(this.reposition, this)),
            !b ||
            (this.hasInput() && "color" !== this.input.attr("type")) ||
            (b.stopPropagation &&
              b.preventDefault &&
              (b.stopPropagation(), b.preventDefault())),
            (!this.component && this.input) ||
            this.options.inline !== !1 ||
            a(window.document).on({
              "mousedown.colorpicker": a.proxy(this.hide, this)
            }),
            void this.element.trigger({ type: "showPicker", color: this.color }))
        );
      },
      hide: function () {
        this.picker
          .addClass("colorpicker-hidden")
          .removeClass("colorpicker-visible"),
          a(window).off("resize.colorpicker", this.reposition),
          a(document).off({ "mousedown.colorpicker": this.hide }),
          this.update(),
          this.element.trigger({ type: "hidePicker", color: this.color });
      },
      updateData: function (a) {
        return (
          (a = a || this.color.toString(this.format)),
          this.element.data("color", a),
          a
        );
      },
      updateInput: function (a) {
        if (((a = a || this.color.toString(this.format)), this.input !== !1)) {
          if (this.options.colorSelectors) {
            var c = new b(a, this.options.colorSelectors),
              d = c.toAlias();
            "undefined" != typeof this.options.colorSelectors[d] && (a = d);
          }
          this.input.prop("value", a);
        }
        return a;
      },
      updatePicker: function (a) {
        void 0 !== a && (this.color = new b(a, this.options.colorSelectors));
        var c =
          this.options.horizontal === !1
            ? this.options.sliders
            : this.options.slidersHorz,
          d = this.picker.find("i");
        if (0 !== d.length)
          return (
            this.options.horizontal === !1
              ? ((c = this.options.sliders),
                d
                  .eq(1)
                  .css("top", c.hue.maxTop * (1 - this.color.value.h))
                  .end()
                  .eq(2)
                  .css("top", c.alpha.maxTop * (1 - this.color.value.a)))
              : ((c = this.options.slidersHorz),
                d
                  .eq(1)
                  .css("left", c.hue.maxLeft * (1 - this.color.value.h))
                  .end()
                  .eq(2)
                  .css("left", c.alpha.maxLeft * (1 - this.color.value.a))),
            d.eq(0).css({
              top:
                c.saturation.maxTop - this.color.value.b * c.saturation.maxTop,
              left: this.color.value.s * c.saturation.maxLeft
            }),
            this.picker
              .find(".colorpicker-saturation")
              .css(
                "backgroundColor",
                this.color.toHex(this.color.value.h, 1, 1, 1)
              ),
            this.picker
              .find(".colorpicker-alpha")
              .css("backgroundColor", this.color.toHex()),
            this.picker
              .find(".colorpicker-color, .colorpicker-color div")
              .css("backgroundColor", this.color.toString(this.format)),
            a
          );
      },
      updateComponent: function (a) {
        if (
          ((a = a || this.color.toString(this.format)), this.component !== !1)
        ) {
          var b = this.component.find("i").eq(0);
          b.length > 0
            ? b.css({ backgroundColor: a })
            : this.component.css({ backgroundColor: a });
        }
        return a;
      },
      update: function (a) {
        var b;
        return (
          (this.getValue(!1) === !1 && a !== !0) ||
          ((b = this.updateComponent()),
            this.updateInput(b),
            this.updateData(b),
            this.updatePicker()),
          b
        );
      },
      setValue: function (a) {
        (this.color = new b(a, this.options.colorSelectors)),
          this.update(!0),
          this.element.trigger({
            type: "changeColor",
            color: this.color,
            value: a
          });
      },
      getValue: function (a) {
        a = void 0 === a ? "#000000" : a;
        var b;
        return (
          (b = this.hasInput() ? this.input.val() : this.element.data("color")),
          (void 0 !== b && "" !== b && null !== b) || (b = a),
          b
        );
      },
      hasInput: function () {
        return this.input !== !1;
      },
      isDisabled: function () {
        return !!this.hasInput() && this.input.prop("disabled") === !0;
      },
      disable: function () {
        return (
          !!this.hasInput() &&
          (this.input.prop("disabled", !0),
            this.element.trigger({
              type: "disable",
              color: this.color,
              value: this.getValue()
            }),
            !0)
        );
      },
      enable: function () {
        return (
          !!this.hasInput() &&
          (this.input.prop("disabled", !1),
            this.element.trigger({
              type: "enable",
              color: this.color,
              value: this.getValue()
            }),
            !0)
        );
      },
      currentSlider: null,
      mousePointer: { left: 0, top: 0 },
      mousedown: function (b) {
        !b.pageX &&
          !b.pageY &&
          b.originalEvent &&
          b.originalEvent.touches &&
          ((b.pageX = b.originalEvent.touches[0].pageX),
            (b.pageY = b.originalEvent.touches[0].pageY)),
          b.stopPropagation(),
          b.preventDefault();
        var c = a(b.target),
          d = c.closest("div"),
          e = this.options.horizontal
            ? this.options.slidersHorz
            : this.options.sliders;
        if (!d.is(".colorpicker")) {
          if (d.is(".colorpicker-saturation"))
            this.currentSlider = a.extend({}, e.saturation);
          else if (d.is(".colorpicker-hue"))
            this.currentSlider = a.extend({}, e.hue);
          else {
            if (!d.is(".colorpicker-alpha")) return !1;
            this.currentSlider = a.extend({}, e.alpha);
          }
          var f = d.offset();
          (this.currentSlider.guide = d.find("i")[0].style),
            (this.currentSlider.left = b.pageX - f.left),
            (this.currentSlider.top = b.pageY - f.top),
            (this.mousePointer = { left: b.pageX, top: b.pageY }),
            a(document)
              .on({
                "mousemove.colorpicker": a.proxy(this.mousemove, this),
                "touchmove.colorpicker": a.proxy(this.mousemove, this),
                "mouseup.colorpicker": a.proxy(this.mouseup, this),
                "touchend.colorpicker": a.proxy(this.mouseup, this)
              })
              .trigger("mousemove");
        }
        return !1;
      },
      mousemove: function (a) {
        !a.pageX &&
          !a.pageY &&
          a.originalEvent &&
          a.originalEvent.touches &&
          ((a.pageX = a.originalEvent.touches[0].pageX),
            (a.pageY = a.originalEvent.touches[0].pageY)),
          a.stopPropagation(),
          a.preventDefault();
        var b = Math.max(
          0,
          Math.min(
            this.currentSlider.maxLeft,
            this.currentSlider.left +
            ((a.pageX || this.mousePointer.left) - this.mousePointer.left)
          )
        ),
          c = Math.max(
            0,
            Math.min(
              this.currentSlider.maxTop,
              this.currentSlider.top +
              ((a.pageY || this.mousePointer.top) - this.mousePointer.top)
            )
          );
        return (
          (this.currentSlider.guide.left = b + "px"),
          (this.currentSlider.guide.top = c + "px"),
          this.currentSlider.callLeft &&
          this.color[this.currentSlider.callLeft].call(
            this.color,
            b / this.currentSlider.maxLeft
          ),
          this.currentSlider.callTop &&
          this.color[this.currentSlider.callTop].call(
            this.color,
            c / this.currentSlider.maxTop
          ),
          "setAlpha" === this.currentSlider.callTop &&
          this.options.format === !1 &&
          (1 !== this.color.value.a
            ? ((this.format = "rgba"), (this.color.origFormat = "rgba"))
            : ((this.format = "hex"), (this.color.origFormat = "hex"))),
          this.update(!0),
          this.element.trigger({ type: "changeColor", color: this.color }),
          !1
        );
      },
      mouseup: function (b) {
        return (
          b.stopPropagation(),
          b.preventDefault(),
          a(document).off({
            "mousemove.colorpicker": this.mousemove,
            "touchmove.colorpicker": this.mousemove,
            "mouseup.colorpicker": this.mouseup,
            "touchend.colorpicker": this.mouseup
          }),
          !1
        );
      },
      change: function (a) {
        this.keyup(a);
      },
      keyup: function (a) {
        38 === a.keyCode
          ? (this.color.value.a < 1 &&
            (this.color.value.a =
              Math.round(100 * (this.color.value.a + 0.01)) / 100),
            this.update(!0))
          : 40 === a.keyCode
            ? (this.color.value.a > 0 &&
              (this.color.value.a =
                Math.round(100 * (this.color.value.a - 0.01)) / 100),
              this.update(!0))
            : ((this.color = new b(
              this.input.val(),
              this.options.colorSelectors
            )),
              this.color.origFormat &&
              this.options.format === !1 &&
              (this.format = this.color.origFormat),
              this.getValue(!1) !== !1 &&
              (this.updateData(), this.updateComponent(), this.updatePicker())),
          this.element.trigger({
            type: "changeColor",
            color: this.color,
            value: this.input.val()
          });
      }
    }),
    (a.colorpicker = d),
    (a.fn.colorpicker = function (b) {
      var c = Array.prototype.slice.call(arguments, 1),
        e = 1 === this.length,
        f = null,
        g = this.each(function () {
          var e = a(this),
            g = e.data("colorpicker"),
            h = "object" == typeof b ? b : {};
          g || ((g = new d(this, h)), e.data("colorpicker", g)),
            "string" == typeof b
              ? a.isFunction(g[b])
                ? (f = g[b].apply(g, c))
                : (c.length && (g[b] = c[0]), (f = g[b]))
              : (f = e);
        });
      return e ? f : g;
    }),
    (a.fn.colorpicker.constructor = d);
});
/* canvas-toBlob.js
 * A canvas.toBlob() implementation.
 * 2016-05-26
 *
 * By Eli Grey, http://eligrey.com and Devin Samarin, https://github.com/eboyjr
 * License: MIT
 *   See https://github.com/eligrey/canvas-toBlob.js/blob/master/LICENSE.md
 */
!(function (t) {
  "use strict";
  var o,
    e = t.Uint8Array,
    n = t.HTMLCanvasElement,
    i = n && n.prototype,
    s = /\s*;\s*base64\s*(?:;|$)/i,
    a = "toDataURL",
    l = function (t) {
      for (
        var n,
        i,
        s,
        a = t.length,
        l = new e(((a / 4) * 3) | 0),
        r = 0,
        b = 0,
        d = [0, 0],
        f = 0,
        B = 0;
        a--;

      )
        (i = t.charCodeAt(r++)),
          (n = o[i - 43]),
          255 !== n &&
          n !== s &&
          ((d[1] = d[0]),
            (d[0] = i),
            (B = (B << 6) | n),
            f++,
            4 === f &&
            ((l[b++] = B >>> 16),
              61 !== d[1] && (l[b++] = B >>> 8),
              61 !== d[0] && (l[b++] = B),
              (f = 0)));
      return l;
    };
  e &&
    (o = new e([
      62,
      -1,
      -1,
      -1,
      63,
      52,
      53,
      54,
      55,
      56,
      57,
      58,
      59,
      60,
      61,
      -1,
      -1,
      -1,
      0,
      -1,
      -1,
      -1,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51
    ])),
    !n ||
    (i.toBlob && i.toBlobHD) ||
    (i.toBlob ||
      (i.toBlob = function (t, o) {
        if ((o || (o = "image/png"), this.mozGetAsFile))
          return void t(this.mozGetAsFile("canvas", o));
        if (this.msToBlob && /^\s*image\/png\s*(?:$|;)/i.test(o))
          return void t(this.msToBlob());
        var n,
          i = Array.prototype.slice.call(arguments, 1),
          r = this[a].apply(this, i),
          b = r.indexOf(","),
          d = r.substring(b + 1),
          f = s.test(r.substring(0, b));
        Blob.fake
          ? ((n = new Blob()),
            f ? (n.encoding = "base64") : (n.encoding = "URI"),
            (n.data = d),
            (n.size = d.length))
          : e &&
          (n = f
            ? new Blob([l(d)], { type: o })
            : new Blob([decodeURIComponent(d)], { type: o })),
          t(n);
      }),
      !i.toBlobHD && i.toDataURLHD
        ? (i.toBlobHD = function () {
          a = "toDataURLHD";
          var t = this.toBlob();
          return (a = "toDataURL"), t;
        })
        : (i.toBlobHD = i.toBlob));
})(
  ("undefined" != typeof self && self) ||
  ("undefined" != typeof window && window) ||
  this.content ||
  this
);

/*
 * canvg.js - Javascript SVG parser and renderer on Canvas
 * MIT Licensed
 * Gabe Lerner (gabelerner@gmail.com)
 * http://code.google.com/p/canvg/
 *
 * Requires: rgbcolor.js - http://www.phpied.com/rgb-color-parser-in-javascript/
 */
!(function (t, e) {
  "use strict";
  "undefined" != typeof define && define.amd
    ? define("canvgModule", ["rgbcolor", "stackblur"], e)
    : "undefined" != typeof module &&
    module.exports &&
    (module.exports = e(require("rgbcolor"), require("stackblur"))),
    (t.canvg = e(t.RGBColor, t.stackBlur));
})("undefined" != typeof window ? window : this, function (t, e) {
  function n(t) {
    var e = [0, 0, 0],
      i = function (i, n) {
        var s = t.match(i);
        null != s && ((e[n] += s.length), (t = t.replace(i, " ")));
      };
    return (
      (t = t.replace(/:not\(([^\)]*)\)/g, "     $1 ")),
      (t = t.replace(/{[\s\S]*/gm, " ")),
      i(o, 1),
      i(l, 0),
      i(h, 1),
      i(u, 2),
      i(c, 1),
      i(f, 1),
      (t = t.replace(/[\*\s\+>~]/g, " ")),
      (t = t.replace(/[#\.]/g, " ")),
      i(p, 2),
      e.join("")
    );
  }
  function s(s) {
    var r = { opts: s };
    (r.FRAMERATE = 30),
      (r.MAX_VIRTUAL_PIXELS = 3e4),
      (r.log = function (t) { }),
      1 == r.opts.log &&
      "undefined" != typeof console &&
      (r.log = function (t) {
        console.log(t);
      }),
      (r.init = function (t) {
        var e = 0;
        (r.UniqueId = function () {
          return e++, "canvg" + e;
        }),
          (r.Definitions = {}),
          (r.Styles = {}),
          (r.StylesSpecificity = {}),
          (r.Animations = []),
          (r.Images = []),
          (r.ctx = t),
          (r.ViewPort = new (function () {
            (this.viewPorts = []),
              (this.Clear = function () {
                this.viewPorts = [];
              }),
              (this.SetCurrent = function (t, e) {
                this.viewPorts.push({ width: t, height: e });
              }),
              (this.RemoveCurrent = function () {
                this.viewPorts.pop();
              }),
              (this.Current = function () {
                return this.viewPorts[this.viewPorts.length - 1];
              }),
              (this.width = function () {
                return this.Current().width;
              }),
              (this.height = function () {
                return this.Current().height;
              }),
              (this.ComputeSize = function (t) {
                return null != t && "number" == typeof t
                  ? t
                  : "x" == t
                    ? this.width()
                    : "y" == t
                      ? this.height()
                      : Math.sqrt(
                        Math.pow(this.width(), 2) + Math.pow(this.height(), 2)
                      ) / Math.sqrt(2);
              });
          })());
      }),
      r.init(),
      (r.ImagesLoaded = function () {
        for (var t = 0; t < r.Images.length; t++)
          if (!r.Images[t].loaded) return !1;
        return !0;
      }),
      (r.trim = function (t) {
        return t.replace(/^\s+|\s+$/g, "");
      }),
      (r.compressSpaces = function (t) {
        return t.replace(/[\s\r\t\n]+/gm, " ");
      }),
      (r.ajax = function (t) {
        var e;
        return (
          (e = window.XMLHttpRequest
            ? new XMLHttpRequest()
            : new ActiveXObject("Microsoft.XMLHTTP")),
          e ? (e.open("GET", t, !1), e.send(null), e.responseText) : null
        );
      }),
      (r.parseXml = function (t) {
        if (
          "undefined" != typeof Windows &&
          "undefined" != typeof Windows.Data &&
          "undefined" != typeof Windows.Data.Xml
        ) {
          var e = new Windows.Data.Xml.Dom.XmlDocument(),
            i = new Windows.Data.Xml.Dom.XmlLoadSettings();
          return (i.prohibitDtd = !1), e.loadXml(t, i), e;
        }
        if (window.DOMParser) {
          var n = new DOMParser();
          return n.parseFromString(t, "text/xml");
        }
        t = t.replace(/<!DOCTYPE svg[^>]*>/, "");
        var e = new ActiveXObject("Microsoft.XMLDOM");
        return (e.async = "false"), e.loadXML(t), e;
      }),
      (r.Property = function (t, e) {
        (this.name = t), (this.value = e);
      }),
      (r.Property.prototype.getValue = function () {
        return this.value;
      }),
      (r.Property.prototype.hasValue = function () {
        return null != this.value && "" !== this.value;
      }),
      (r.Property.prototype.numValue = function () {
        if (!this.hasValue()) return 0;
        var t = parseFloat(this.value);
        return (this.value + "").match(/%$/) && (t /= 100), t;
      }),
      (r.Property.prototype.valueOrDefault = function (t) {
        return this.hasValue() ? this.value : t;
      }),
      (r.Property.prototype.numValueOrDefault = function (t) {
        return this.hasValue() ? this.numValue() : t;
      }),
      (r.Property.prototype.addOpacity = function (e) {
        var i = this.value;
        if (null != e.value && "" != e.value && "string" == typeof this.value) {
          var n = new t(this.value);
          n.ok &&
            (i =
              "rgba(" +
              n.r +
              ", " +
              n.g +
              ", " +
              n.b +
              ", " +
              e.numValue() +
              ")");
        }
        return new r.Property(this.name, i);
      }),
      (r.Property.prototype.getDefinition = function () {
        var t = this.value.match(/#([^\)'"]+)/);
        return t && (t = t[1]), t || (t = this.value), r.Definitions[t];
      }),
      (r.Property.prototype.isUrlDefinition = function () {
        return 0 == this.value.indexOf("url(");
      }),
      (r.Property.prototype.getFillStyleDefinition = function (t, e) {
        var i = this.getDefinition();
        if (null != i && i.createGradient) return i.createGradient(r.ctx, t, e);
        if (null != i && i.createPattern) {
          if (i.getHrefAttribute().hasValue()) {
            var n = i.attribute("patternTransform");
            (i = i.getHrefAttribute().getDefinition()),
              n.hasValue() &&
              (i.attribute("patternTransform", !0).value = n.value);
          }
          return i.createPattern(r.ctx, t);
        }
        return null;
      }),
      (r.Property.prototype.getDPI = function (t) {
        return 96;
      }),
      (r.Property.prototype.getEM = function (t) {
        var e = 12,
          i = new r.Property("fontSize", r.Font.Parse(r.ctx.font).fontSize);
        return i.hasValue() && (e = i.toPixels(t)), e;
      }),
      (r.Property.prototype.getUnits = function () {
        var t = this.value + "";
        return t.replace(/[0-9\.\-]/g, "");
      }),
      (r.Property.prototype.toPixels = function (t, e) {
        if (!this.hasValue()) return 0;
        var i = this.value + "";
        if (i.match(/em$/)) return this.numValue() * this.getEM(t);
        if (i.match(/ex$/)) return (this.numValue() * this.getEM(t)) / 2;
        if (i.match(/px$/)) return this.numValue();
        if (i.match(/pt$/)) return this.numValue() * this.getDPI(t) * (1 / 72);
        if (i.match(/pc$/)) return 15 * this.numValue();
        if (i.match(/cm$/)) return (this.numValue() * this.getDPI(t)) / 2.54;
        if (i.match(/mm$/)) return (this.numValue() * this.getDPI(t)) / 25.4;
        if (i.match(/in$/)) return this.numValue() * this.getDPI(t);
        if (i.match(/%$/)) return this.numValue() * r.ViewPort.ComputeSize(t);
        var n = this.numValue();
        return e && n < 1 ? n * r.ViewPort.ComputeSize(t) : n;
      }),
      (r.Property.prototype.toMilliseconds = function () {
        if (!this.hasValue()) return 0;
        var t = this.value + "";
        return t.match(/s$/)
          ? 1e3 * this.numValue()
          : t.match(/ms$/)
            ? this.numValue()
            : this.numValue();
      }),
      (r.Property.prototype.toRadians = function () {
        if (!this.hasValue()) return 0;
        var t = this.value + "";
        return t.match(/deg$/)
          ? this.numValue() * (Math.PI / 180)
          : t.match(/grad$/)
            ? this.numValue() * (Math.PI / 200)
            : t.match(/rad$/)
              ? this.numValue()
              : this.numValue() * (Math.PI / 180);
      });
    var o = {
      baseline: "alphabetic",
      "before-edge": "top",
      "text-before-edge": "top",
      middle: "middle",
      central: "middle",
      "after-edge": "bottom",
      "text-after-edge": "bottom",
      ideographic: "ideographic",
      alphabetic: "alphabetic",
      hanging: "hanging",
      mathematical: "alphabetic"
    };
    return (
      (r.Property.prototype.toTextBaseline = function () {
        return this.hasValue() ? o[this.value] : null;
      }),
      (r.Font = new (function () {
        (this.Styles = "normal|italic|oblique|inherit"),
          (this.Variants = "normal|small-caps|inherit"),
          (this.Weights =
            "normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900|inherit"),
          (this.CreateFont = function (t, e, i, n, s, a) {
            var o =
              null != a
                ? this.Parse(a)
                : this.CreateFont("", "", "", "", "", r.ctx.font);
            return {
              fontFamily: s || o.fontFamily,
              fontSize: n || o.fontSize,
              fontStyle: t || o.fontStyle,
              fontWeight: i || o.fontWeight,
              fontVariant: e || o.fontVariant,
              toString: function () {
                return [
                  this.fontStyle,
                  this.fontVariant,
                  this.fontWeight,
                  this.fontSize,
                  this.fontFamily
                ].join(" ");
              }
            };
          });
        var t = this;
        this.Parse = function (e) {
          for (
            var i = {},
            n = r.trim(r.compressSpaces(e || "")).split(" "),
            s = {
              fontSize: !1,
              fontStyle: !1,
              fontWeight: !1,
              fontVariant: !1
            },
            a = "",
            o = 0;
            o < n.length;
            o++
          )
            s.fontStyle || t.Styles.indexOf(n[o]) == -1
              ? s.fontVariant || t.Variants.indexOf(n[o]) == -1
                ? s.fontWeight || t.Weights.indexOf(n[o]) == -1
                  ? s.fontSize
                    ? "inherit" != n[o] && (a += n[o])
                    : ("inherit" != n[o] && (i.fontSize = n[o].split("/")[0]),
                      (s.fontStyle = s.fontVariant = s.fontWeight = s.fontSize = !0))
                  : ("inherit" != n[o] && (i.fontWeight = n[o]),
                    (s.fontStyle = s.fontVariant = s.fontWeight = !0))
                : ("inherit" != n[o] && (i.fontVariant = n[o]),
                  (s.fontStyle = s.fontVariant = !0))
              : ("inherit" != n[o] && (i.fontStyle = n[o]), (s.fontStyle = !0));
          return "" != a && (i.fontFamily = a), i;
        };
      })()),
      (r.ToNumberArray = function (t) {
        for (
          var e = r
            .trim(r.compressSpaces((t || "").replace(/,/g, " ")))
            .split(" "),
          i = 0;
          i < e.length;
          i++
        )
          e[i] = parseFloat(e[i]);
        return e;
      }),
      (r.Point = function (t, e) {
        (this.x = t), (this.y = e);
      }),
      (r.Point.prototype.angleTo = function (t) {
        return Math.atan2(t.y - this.y, t.x - this.x);
      }),
      (r.Point.prototype.applyTransform = function (t) {
        var e = this.x * t[0] + this.y * t[2] + t[4],
          i = this.x * t[1] + this.y * t[3] + t[5];
        (this.x = e), (this.y = i);
      }),
      (r.CreatePoint = function (t) {
        var e = r.ToNumberArray(t);
        return new r.Point(e[0], e[1]);
      }),
      (r.CreatePath = function (t) {
        for (var e = r.ToNumberArray(t), i = [], n = 0; n < e.length; n += 2)
          i.push(new r.Point(e[n], e[n + 1]));
        return i;
      }),
      (r.BoundingBox = function (t, e, n, s) {
        (this.x1 = Number.NaN),
          (this.y1 = Number.NaN),
          (this.x2 = Number.NaN),
          (this.y2 = Number.NaN),
          (this.x = function () {
            return this.x1;
          }),
          (this.y = function () {
            return this.y1;
          }),
          (this.width = function () {
            return this.x2 - this.x1;
          }),
          (this.height = function () {
            return this.y2 - this.y1;
          }),
          (this.addPoint = function (t, e) {
            null != t &&
              ((isNaN(this.x1) || isNaN(this.x2)) &&
                ((this.x1 = t), (this.x2 = t)),
                t < this.x1 && (this.x1 = t),
                t > this.x2 && (this.x2 = t)),
              null != e &&
              ((isNaN(this.y1) || isNaN(this.y2)) &&
                ((this.y1 = e), (this.y2 = e)),
                e < this.y1 && (this.y1 = e),
                e > this.y2 && (this.y2 = e));
          }),
          (this.addX = function (t) {
            this.addPoint(t, null);
          }),
          (this.addY = function (t) {
            this.addPoint(null, t);
          }),
          (this.addBoundingBox = function (t) {
            this.addPoint(t.x1, t.y1), this.addPoint(t.x2, t.y2);
          }),
          (this.addQuadraticCurve = function (t, e, i, n, s, a) {
            var r = t + (2 / 3) * (i - t),
              o = e + (2 / 3) * (n - e),
              l = r + (1 / 3) * (s - t),
              h = o + (1 / 3) * (a - e);
            this.addBezierCurve(t, e, r, l, o, h, s, a);
          }),
          (this.addBezierCurve = function (t, e, n, s, a, r, o, l) {
            var h = [t, e],
              u = [n, s],
              c = [a, r],
              f = [o, l];
            for (
              this.addPoint(h[0], h[1]), this.addPoint(f[0], f[1]), i = 0;
              i <= 1;
              i++
            ) {
              var p = function (t) {
                return (
                  Math.pow(1 - t, 3) * h[i] +
                  3 * Math.pow(1 - t, 2) * t * u[i] +
                  3 * (1 - t) * Math.pow(t, 2) * c[i] +
                  Math.pow(t, 3) * f[i]
                );
              },
                m = 6 * h[i] - 12 * u[i] + 6 * c[i],
                d = -3 * h[i] + 9 * u[i] - 9 * c[i] + 3 * f[i],
                y = 3 * u[i] - 3 * h[i];
              if (0 != d) {
                var v = Math.pow(m, 2) - 4 * y * d;
                if (!(v < 0)) {
                  var g = (-m + Math.sqrt(v)) / (2 * d);
                  0 < g &&
                    g < 1 &&
                    (0 == i && this.addX(p(g)), 1 == i && this.addY(p(g)));
                  var x = (-m - Math.sqrt(v)) / (2 * d);
                  0 < x &&
                    x < 1 &&
                    (0 == i && this.addX(p(x)), 1 == i && this.addY(p(x)));
                }
              } else {
                if (0 == m) continue;
                var b = -y / m;
                0 < b &&
                  b < 1 &&
                  (0 == i && this.addX(p(b)), 1 == i && this.addY(p(b)));
              }
            }
          }),
          (this.isPointInBox = function (t, e) {
            return this.x1 <= t && t <= this.x2 && this.y1 <= e && e <= this.y2;
          }),
          this.addPoint(t, e),
          this.addPoint(n, s);
      }),
      (r.Transform = function (t) {
        var e = this;
        (this.Type = {}),
          (this.Type.translate = function (t) {
            (this.p = r.CreatePoint(t)),
              (this.apply = function (t) {
                t.translate(this.p.x || 0, this.p.y || 0);
              }),
              (this.unapply = function (t) {
                t.translate(-1 * this.p.x || 0, -1 * this.p.y || 0);
              }),
              (this.applyToPoint = function (t) {
                t.applyTransform([1, 0, 0, 1, this.p.x || 0, this.p.y || 0]);
              });
          }),
          (this.Type.rotate = function (t) {
            var e = r.ToNumberArray(t);
            (this.angle = new r.Property("angle", e[0])),
              (this.cx = e[1] || 0),
              (this.cy = e[2] || 0),
              (this.apply = function (t) {
                t.translate(this.cx, this.cy),
                  t.rotate(this.angle.toRadians()),
                  t.translate(-this.cx, -this.cy);
              }),
              (this.unapply = function (t) {
                t.translate(this.cx, this.cy),
                  t.rotate(-1 * this.angle.toRadians()),
                  t.translate(-this.cx, -this.cy);
              }),
              (this.applyToPoint = function (t) {
                var e = this.angle.toRadians();
                t.applyTransform([1, 0, 0, 1, this.p.x || 0, this.p.y || 0]),
                  t.applyTransform([
                    Math.cos(e),
                    Math.sin(e),
                    -Math.sin(e),
                    Math.cos(e),
                    0,
                    0
                  ]),
                  t.applyTransform([
                    1,
                    0,
                    0,
                    1,
                    -this.p.x || 0,
                    -this.p.y || 0
                  ]);
              });
          }),
          (this.Type.scale = function (t) {
            (this.p = r.CreatePoint(t)),
              (this.apply = function (t) {
                t.scale(this.p.x || 1, this.p.y || this.p.x || 1);
              }),
              (this.unapply = function (t) {
                t.scale(1 / this.p.x || 1, 1 / this.p.y || this.p.x || 1);
              }),
              (this.applyToPoint = function (t) {
                t.applyTransform([this.p.x || 0, 0, 0, this.p.y || 0, 0, 0]);
              });
          }),
          (this.Type.matrix = function (t) {
            (this.m = r.ToNumberArray(t)),
              (this.apply = function (t) {
                t.transform(
                  this.m[0],
                  this.m[1],
                  this.m[2],
                  this.m[3],
                  this.m[4],
                  this.m[5]
                );
              }),
              (this.unapply = function (t) {
                var e = this.m[0],
                  i = this.m[2],
                  n = this.m[4],
                  s = this.m[1],
                  a = this.m[3],
                  r = this.m[5],
                  o = 0,
                  l = 0,
                  h = 1,
                  u =
                    1 /
                    (e * (a * h - r * l) -
                      i * (s * h - r * o) +
                      n * (s * l - a * o));
                t.transform(
                  u * (a * h - r * l),
                  u * (r * o - s * h),
                  u * (n * l - i * h),
                  u * (e * h - n * o),
                  u * (i * r - n * a),
                  u * (n * s - e * r)
                );
              }),
              (this.applyToPoint = function (t) {
                t.applyTransform(this.m);
              });
          }),
          (this.Type.SkewBase = function (t) {
            (this.base = e.Type.matrix),
              this.base(t),
              (this.angle = new r.Property("angle", t));
          }),
          (this.Type.SkewBase.prototype = new this.Type.matrix()),
          (this.Type.skewX = function (t) {
            (this.base = e.Type.SkewBase),
              this.base(t),
              (this.m = [1, 0, Math.tan(this.angle.toRadians()), 1, 0, 0]);
          }),
          (this.Type.skewX.prototype = new this.Type.SkewBase()),
          (this.Type.skewY = function (t) {
            (this.base = e.Type.SkewBase),
              this.base(t),
              (this.m = [1, Math.tan(this.angle.toRadians()), 0, 1, 0, 0]);
          }),
          (this.Type.skewY.prototype = new this.Type.SkewBase()),
          (this.transforms = []),
          (this.apply = function (t) {
            for (var e = 0; e < this.transforms.length; e++)
              this.transforms[e].apply(t);
          }),
          (this.unapply = function (t) {
            for (var e = this.transforms.length - 1; e >= 0; e--)
              this.transforms[e].unapply(t);
          }),
          (this.applyToPoint = function (t) {
            for (var e = 0; e < this.transforms.length; e++)
              this.transforms[e].applyToPoint(t);
          });
        for (
          var i = r
            .trim(r.compressSpaces(t))
            .replace(/\)([a-zA-Z])/g, ") $1")
            .replace(/\)(\s?,\s?)/g, ") ")
            .split(/\s(?=[a-z])/),
          n = 0;
          n < i.length;
          n++
        ) {
          var s = r.trim(i[n].split("(")[0]),
            a = i[n].split("(")[1].replace(")", ""),
            o = this.Type[s];
          if ("undefined" != typeof o) {
            var l = new o(a);
            (l.type = s), this.transforms.push(l);
          }
        }
      }),
      (r.AspectRatio = function (t, e, i, n, s, a, o, l, h, u) {
        (e = r.compressSpaces(e)), (e = e.replace(/^defer\s/, ""));
        var c = e.split(" ")[0] || "xMidYMid",
          f = e.split(" ")[1] || "meet",
          p = i / n,
          m = s / a,
          d = Math.min(p, m),
          y = Math.max(p, m);
        "meet" == f && ((n *= d), (a *= d)),
          "slice" == f && ((n *= y), (a *= y)),
          (h = new r.Property("refX", h)),
          (u = new r.Property("refY", u)),
          h.hasValue() && u.hasValue()
            ? t.translate(-d * h.toPixels("x"), -d * u.toPixels("y"))
            : (c.match(/^xMid/) &&
              (("meet" == f && d == m) || ("slice" == f && y == m)) &&
              t.translate(i / 2 - n / 2, 0),
              c.match(/YMid$/) &&
              (("meet" == f && d == p) || ("slice" == f && y == p)) &&
              t.translate(0, s / 2 - a / 2),
              c.match(/^xMax/) &&
              (("meet" == f && d == m) || ("slice" == f && y == m)) &&
              t.translate(i - n, 0),
              c.match(/YMax$/) &&
              (("meet" == f && d == p) || ("slice" == f && y == p)) &&
              t.translate(0, s - a)),
          "none" == c
            ? t.scale(p, m)
            : "meet" == f
              ? t.scale(d, d)
              : "slice" == f && t.scale(y, y),
          t.translate(null == o ? 0 : -o, null == l ? 0 : -l);
      }),
      (r.Element = {}),
      (r.EmptyProperty = new r.Property("EMPTY", "")),
      (r.Element.ElementBase = function (t) {
        (this.attributes = {}),
          (this.styles = {}),
          (this.stylesSpecificity = {}),
          (this.children = []),
          (this.attribute = function (t, e) {
            var i = this.attributes[t];
            return null != i
              ? i
              : (1 == e &&
                ((i = new r.Property(t, "")), (this.attributes[t] = i)),
                i || r.EmptyProperty);
          }),
          (this.getHrefAttribute = function () {
            for (var t in this.attributes)
              if ("href" == t || t.match(/:href$/)) return this.attributes[t];
            return r.EmptyProperty;
          }),
          (this.style = function (t, e, i) {
            var n = this.styles[t];
            if (null != n) return n;
            var s = this.attribute(t);
            if (null != s && s.hasValue()) return (this.styles[t] = s), s;
            if (1 != i) {
              var a = this.parent;
              if (null != a) {
                var o = a.style(t);
                if (null != o && o.hasValue()) return o;
              }
            }
            return (
              1 == e && ((n = new r.Property(t, "")), (this.styles[t] = n)),
              n || r.EmptyProperty
            );
          }),
          (this.render = function (t) {
            if (
              "none" != this.style("display").value &&
              "hidden" != this.style("visibility").value
            ) {
              if ((t.save(), this.style("mask").hasValue())) {
                var e = this.style("mask").getDefinition();
                null != e && e.apply(t, this);
              } else if (this.style("filter").hasValue()) {
                var i = this.style("filter").getDefinition();
                null != i && i.apply(t, this);
              } else
                this.setContext(t),
                  this.renderChildren(t),
                  this.clearContext(t);
              t.restore();
            }
          }),
          (this.setContext = function (t) { }),
          (this.clearContext = function (t) { }),
          (this.renderChildren = function (t) {
            for (var e = 0; e < this.children.length; e++)
              this.children[e].render(t);
          }),
          (this.addChild = function (t, e) {
            var i = t;
            e && (i = r.CreateElement(t)),
              (i.parent = this),
              "title" != i.type && this.children.push(i);
          }),
          (this.addStylesFromStyleDefinition = function () {
            for (var e in r.Styles)
              if ("@" != e[0] && a(t, e)) {
                var i = r.Styles[e],
                  n = r.StylesSpecificity[e];
                if (null != i)
                  for (var s in i) {
                    var o = this.stylesSpecificity[s];
                    "undefined" == typeof o && (o = "000"),
                      n > o &&
                      ((this.styles[s] = i[s]),
                        (this.stylesSpecificity[s] = n));
                  }
              }
          });
        var e = new RegExp("^[A-Z-]+$"),
          i = function (t) {
            return e.test(t) ? t.toLowerCase() : t;
          };
        if (null != t && 1 == t.nodeType) {
          for (var n = 0; n < t.attributes.length; n++) {
            var s = t.attributes[n],
              o = i(s.nodeName);
            this.attributes[o] = new r.Property(o, s.value);
          }
          if (
            (this.addStylesFromStyleDefinition(),
              this.attribute("style").hasValue())
          )
            for (
              var l = this.attribute("style").value.split(";"), n = 0;
              n < l.length;
              n++
            )
              if ("" != r.trim(l[n])) {
                var h = l[n].split(":"),
                  u = r.trim(h[0]),
                  c = r.trim(h[1]);
                this.styles[u] = new r.Property(u, c);
              }
          this.attribute("id").hasValue() &&
            null == r.Definitions[this.attribute("id").value] &&
            (r.Definitions[this.attribute("id").value] = this);
          for (var n = 0; n < t.childNodes.length; n++) {
            var f = t.childNodes[n];
            if (
              (1 == f.nodeType && this.addChild(f, !0),
                this.captureTextNodes && (3 == f.nodeType || 4 == f.nodeType))
            ) {
              var p = f.value || f.text || f.textContent || "";
              "" != r.compressSpaces(p) &&
                this.addChild(new r.Element.tspan(f), !1);
            }
          }
        }
      }),
      (r.Element.RenderedElementBase = function (t) {
        (this.base = r.Element.ElementBase),
          this.base(t),
          (this.setContext = function (t) {
            if (this.style("fill").isUrlDefinition()) {
              var e = this.style("fill").getFillStyleDefinition(
                this,
                this.style("fill-opacity")
              );
              null != e && (t.fillStyle = e);
            } else if (this.style("fill").hasValue()) {
              var i = this.style("fill");
              "currentColor" == i.value &&
                (i.value = this.style("color").value),
                "inherit" != i.value &&
                (t.fillStyle = "none" == i.value ? "rgba(0,0,0,0)" : i.value);
            }
            if (this.style("fill-opacity").hasValue()) {
              var i = new r.Property("fill", t.fillStyle);
              (i = i.addOpacity(this.style("fill-opacity"))),
                (t.fillStyle = i.value);
            }
            if (this.style("stroke").isUrlDefinition()) {
              var e = this.style("stroke").getFillStyleDefinition(
                this,
                this.style("stroke-opacity")
              );
              null != e && (t.strokeStyle = e);
            } else if (this.style("stroke").hasValue()) {
              var n = this.style("stroke");
              "currentColor" == n.value &&
                (n.value = this.style("color").value),
                "inherit" != n.value &&
                (t.strokeStyle =
                  "none" == n.value ? "rgba(0,0,0,0)" : n.value);
            }
            if (this.style("stroke-opacity").hasValue()) {
              var n = new r.Property("stroke", t.strokeStyle);
              (n = n.addOpacity(this.style("stroke-opacity"))),
                (t.strokeStyle = n.value);
            }
            if (this.style("stroke-width").hasValue()) {
              var s = this.style("stroke-width").toPixels();
              t.lineWidth = 0 == s ? 0.001 : s;
            }
            if (
              (this.style("stroke-linecap").hasValue() &&
                (t.lineCap = this.style("stroke-linecap").value),
                this.style("stroke-linejoin").hasValue() &&
                (t.lineJoin = this.style("stroke-linejoin").value),
                this.style("stroke-miterlimit").hasValue() &&
                (t.miterLimit = this.style("stroke-miterlimit").value),
                this.style("stroke-dasharray").hasValue() &&
                "none" != this.style("stroke-dasharray").value)
            ) {
              var a = r.ToNumberArray(this.style("stroke-dasharray").value);
              "undefined" != typeof t.setLineDash
                ? t.setLineDash(a)
                : "undefined" != typeof t.webkitLineDash
                  ? (t.webkitLineDash = a)
                  : "undefined" == typeof t.mozDash ||
                  (1 == a.length && 0 == a[0]) ||
                  (t.mozDash = a);
              var o = this.style("stroke-dashoffset").numValueOrDefault(1);
              "undefined" != typeof t.lineDashOffset
                ? (t.lineDashOffset = o)
                : "undefined" != typeof t.webkitLineDashOffset
                  ? (t.webkitLineDashOffset = o)
                  : "undefined" != typeof t.mozDashOffset &&
                  (t.mozDashOffset = o);
            }
            if (
              ("undefined" != typeof t.font &&
                (t.font = r.Font.CreateFont(
                  this.style("font-style").value,
                  this.style("font-variant").value,
                  this.style("font-weight").value,
                  this.style("font-size").hasValue()
                    ? this.style("font-size").toPixels() + "px"
                    : "",
                  this.style("font-family").value
                ).toString()),
                this.style("transform", !1, !0).hasValue())
            ) {
              var l = new r.Transform(this.style("transform", !1, !0).value);
              l.apply(t);
            }
            if (this.style("clip-path", !1, !0).hasValue()) {
              var h = this.style("clip-path", !1, !0).getDefinition();
              null != h && h.apply(t);
            }
            this.style("opacity").hasValue() &&
              (t.globalAlpha = this.style("opacity").numValue());
          });
      }),
      (r.Element.RenderedElementBase.prototype = new r.Element.ElementBase()),
      (r.Element.PathElementBase = function (t) {
        (this.base = r.Element.RenderedElementBase),
          this.base(t),
          (this.path = function (t) {
            return null != t && t.beginPath(), new r.BoundingBox();
          }),
          (this.renderChildren = function (t) {
            this.path(t),
              r.Mouse.checkPath(this, t),
              "" != t.fillStyle &&
              ("inherit" != this.style("fill-rule").valueOrDefault("inherit")
                ? t.fill(this.style("fill-rule").value)
                : t.fill()),
              "" != t.strokeStyle && t.stroke();
            var e = this.getMarkers();
            if (null != e) {
              if (this.style("marker-start").isUrlDefinition()) {
                var i = this.style("marker-start").getDefinition();
                i.render(t, e[0][0], e[0][1]);
              }
              if (this.style("marker-mid").isUrlDefinition())
                for (
                  var i = this.style("marker-mid").getDefinition(), n = 1;
                  n < e.length - 1;
                  n++
                )
                  i.render(t, e[n][0], e[n][1]);
              if (this.style("marker-end").isUrlDefinition()) {
                var i = this.style("marker-end").getDefinition();
                i.render(t, e[e.length - 1][0], e[e.length - 1][1]);
              }
            }
          }),
          (this.getBoundingBox = function () {
            return this.path();
          }),
          (this.getMarkers = function () {
            return null;
          });
      }),
      (r.Element.PathElementBase.prototype = new r.Element.RenderedElementBase()),
      (r.Element.svg = function (t) {
        (this.base = r.Element.RenderedElementBase),
          this.base(t),
          (this.baseClearContext = this.clearContext),
          (this.clearContext = function (t) {
            this.baseClearContext(t), r.ViewPort.RemoveCurrent();
          }),
          (this.baseSetContext = this.setContext),
          (this.setContext = function (t) {
            (t.strokeStyle = "rgba(0,0,0,0)"),
              (t.lineCap = "butt"),
              (t.lineJoin = "miter"),
              (t.miterLimit = 4),
              "undefined" != typeof t.font &&
              "undefined" != typeof window.getComputedStyle &&
              (t.font = window
                .getComputedStyle(t.canvas)
                .getPropertyValue("font")),
              this.baseSetContext(t),
              this.attribute("x").hasValue() ||
              (this.attribute("x", !0).value = 0),
              this.attribute("y").hasValue() ||
              (this.attribute("y", !0).value = 0),
              t.translate(
                this.attribute("x").toPixels("x"),
                this.attribute("y").toPixels("y")
              );
            var e = r.ViewPort.width(),
              i = r.ViewPort.height();
            if (
              (this.attribute("width").hasValue() ||
                (this.attribute("width", !0).value = "100%"),
                this.attribute("height").hasValue() ||
                (this.attribute("height", !0).value = "100%"),
                "undefined" == typeof this.root)
            ) {
              (e = this.attribute("width").toPixels("x")),
                (i = this.attribute("height").toPixels("y"));
              var n = 0,
                s = 0;
              this.attribute("refX").hasValue() &&
                this.attribute("refY").hasValue() &&
                ((n = -this.attribute("refX").toPixels("x")),
                  (s = -this.attribute("refY").toPixels("y"))),
                "visible" !=
                this.attribute("overflow").valueOrDefault("hidden") &&
                (t.beginPath(),
                  t.moveTo(n, s),
                  t.lineTo(e, s),
                  t.lineTo(e, i),
                  t.lineTo(n, i),
                  t.closePath(),
                  t.clip());
            }
            if (
              (r.ViewPort.SetCurrent(e, i),
                this.attribute("viewBox").hasValue())
            ) {
              var a = r.ToNumberArray(this.attribute("viewBox").value),
                o = a[0],
                l = a[1];
              (e = a[2]),
                (i = a[3]),
                r.AspectRatio(
                  t,
                  this.attribute("preserveAspectRatio").value,
                  r.ViewPort.width(),
                  e,
                  r.ViewPort.height(),
                  i,
                  o,
                  l,
                  this.attribute("refX").value,
                  this.attribute("refY").value
                ),
                r.ViewPort.RemoveCurrent(),
                r.ViewPort.SetCurrent(a[2], a[3]);
            }
          });
      }),
      (r.Element.svg.prototype = new r.Element.RenderedElementBase()),
      (r.Element.rect = function (t) {
        (this.base = r.Element.PathElementBase),
          this.base(t),
          (this.path = function (t) {
            var e = this.attribute("x").toPixels("x"),
              i = this.attribute("y").toPixels("y"),
              n = this.attribute("width").toPixels("x"),
              s = this.attribute("height").toPixels("y"),
              a = this.attribute("rx").toPixels("x"),
              o = this.attribute("ry").toPixels("y");
            return (
              this.attribute("rx").hasValue() &&
              !this.attribute("ry").hasValue() &&
              (o = a),
              this.attribute("ry").hasValue() &&
              !this.attribute("rx").hasValue() &&
              (a = o),
              (a = Math.min(a, n / 2)),
              (o = Math.min(o, s / 2)),
              null != t &&
              (t.beginPath(),
                t.moveTo(e + a, i),
                t.lineTo(e + n - a, i),
                t.quadraticCurveTo(e + n, i, e + n, i + o),
                t.lineTo(e + n, i + s - o),
                t.quadraticCurveTo(e + n, i + s, e + n - a, i + s),
                t.lineTo(e + a, i + s),
                t.quadraticCurveTo(e, i + s, e, i + s - o),
                t.lineTo(e, i + o),
                t.quadraticCurveTo(e, i, e + a, i),
                t.closePath()),
              new r.BoundingBox(e, i, e + n, i + s)
            );
          });
      }),
      (r.Element.rect.prototype = new r.Element.PathElementBase()),
      (r.Element.circle = function (t) {
        (this.base = r.Element.PathElementBase),
          this.base(t),
          (this.path = function (t) {
            var e = this.attribute("cx").toPixels("x"),
              i = this.attribute("cy").toPixels("y"),
              n = this.attribute("r").toPixels();
            return (
              null != t &&
              (t.beginPath(),
                t.arc(e, i, n, 0, 2 * Math.PI, !0),
                t.closePath()),
              new r.BoundingBox(e - n, i - n, e + n, i + n)
            );
          });
      }),
      (r.Element.circle.prototype = new r.Element.PathElementBase()),
      (r.Element.ellipse = function (t) {
        (this.base = r.Element.PathElementBase),
          this.base(t),
          (this.path = function (t) {
            var e = 4 * ((Math.sqrt(2) - 1) / 3),
              i = this.attribute("rx").toPixels("x"),
              n = this.attribute("ry").toPixels("y"),
              s = this.attribute("cx").toPixels("x"),
              a = this.attribute("cy").toPixels("y");
            return (
              null != t &&
              (t.beginPath(),
                t.moveTo(s, a - n),
                t.bezierCurveTo(s + e * i, a - n, s + i, a - e * n, s + i, a),
                t.bezierCurveTo(s + i, a + e * n, s + e * i, a + n, s, a + n),
                t.bezierCurveTo(s - e * i, a + n, s - i, a + e * n, s - i, a),
                t.bezierCurveTo(s - i, a - e * n, s - e * i, a - n, s, a - n),
                t.closePath()),
              new r.BoundingBox(s - i, a - n, s + i, a + n)
            );
          });
      }),
      (r.Element.ellipse.prototype = new r.Element.PathElementBase()),
      (r.Element.line = function (t) {
        (this.base = r.Element.PathElementBase),
          this.base(t),
          (this.getPoints = function () {
            return [
              new r.Point(
                this.attribute("x1").toPixels("x"),
                this.attribute("y1").toPixels("y")
              ),
              new r.Point(
                this.attribute("x2").toPixels("x"),
                this.attribute("y2").toPixels("y")
              )
            ];
          }),
          (this.path = function (t) {
            var e = this.getPoints();
            return (
              null != t &&
              (t.beginPath(),
                t.moveTo(e[0].x, e[0].y),
                t.lineTo(e[1].x, e[1].y)),
              new r.BoundingBox(e[0].x, e[0].y, e[1].x, e[1].y)
            );
          }),
          (this.getMarkers = function () {
            var t = this.getPoints(),
              e = t[0].angleTo(t[1]);
            return [
              [t[0], e],
              [t[1], e]
            ];
          });
      }),
      (r.Element.line.prototype = new r.Element.PathElementBase()),
      (r.Element.polyline = function (t) {
        (this.base = r.Element.PathElementBase),
          this.base(t),
          (this.points = r.CreatePath(this.attribute("points").value)),
          (this.path = function (t) {
            var e = new r.BoundingBox(this.points[0].x, this.points[0].y);
            null != t &&
              (t.beginPath(), t.moveTo(this.points[0].x, this.points[0].y));
            for (var i = 1; i < this.points.length; i++)
              e.addPoint(this.points[i].x, this.points[i].y),
                null != t && t.lineTo(this.points[i].x, this.points[i].y);
            return e;
          }),
          (this.getMarkers = function () {
            for (var t = [], e = 0; e < this.points.length - 1; e++)
              t.push([
                this.points[e],
                this.points[e].angleTo(this.points[e + 1])
              ]);
            return (
              t.length > 0 &&
              t.push([
                this.points[this.points.length - 1],
                t[t.length - 1][1]
              ]),
              t
            );
          });
      }),
      (r.Element.polyline.prototype = new r.Element.PathElementBase()),
      (r.Element.polygon = function (t) {
        (this.base = r.Element.polyline),
          this.base(t),
          (this.basePath = this.path),
          (this.path = function (t) {
            var e = this.basePath(t);
            return (
              null != t &&
              (t.lineTo(this.points[0].x, this.points[0].y), t.closePath()),
              e
            );
          });
      }),
      (r.Element.polygon.prototype = new r.Element.polyline()),
      (r.Element.path = function (t) {
        (this.base = r.Element.PathElementBase), this.base(t);
        var e = this.attribute("d").value;
        e = e.replace(/,/gm, " ");
        for (var i = 0; i < 2; i++)
          e = e.replace(/([MmZzLlHhVvCcSsQqTtAa])([^\s])/gm, "$1 $2");
        (e = e.replace(/([^\s])([MmZzLlHhVvCcSsQqTtAa])/gm, "$1 $2")),
          (e = e.replace(/([0-9])([+\-])/gm, "$1 $2"));
        for (var i = 0; i < 2; i++) e = e.replace(/(\.[0-9]*)(\.)/gm, "$1 $2");
        (e = e.replace(
          /([Aa](\s+[0-9]+){3})\s+([01])\s*([01])/gm,
          "$1 $3 $4 "
        )),
          (e = r.compressSpaces(e)),
          (e = r.trim(e)),
          (this.PathParser = new (function (t) {
            (this.tokens = t.split(" ")),
              (this.reset = function () {
                (this.i = -1),
                  (this.command = ""),
                  (this.previousCommand = ""),
                  (this.start = new r.Point(0, 0)),
                  (this.control = new r.Point(0, 0)),
                  (this.current = new r.Point(0, 0)),
                  (this.points = []),
                  (this.angles = []);
              }),
              (this.isEnd = function () {
                return this.i >= this.tokens.length - 1;
              }),
              (this.isCommandOrEnd = function () {
                return (
                  !!this.isEnd() ||
                  null != this.tokens[this.i + 1].match(/^[A-Za-z]$/)
                );
              }),
              (this.isRelativeCommand = function () {
                switch (this.command) {
                  case "m":
                  case "l":
                  case "h":
                  case "v":
                  case "c":
                  case "s":
                  case "q":
                  case "t":
                  case "a":
                  case "z":
                    return !0;
                }
                return !1;
              }),
              (this.getToken = function () {
                return this.i++, this.tokens[this.i];
              }),
              (this.getScalar = function () {
                return parseFloat(this.getToken());
              }),
              (this.nextCommand = function () {
                (this.previousCommand = this.command),
                  (this.command = this.getToken());
              }),
              (this.getPoint = function () {
                var t = new r.Point(this.getScalar(), this.getScalar());
                return this.makeAbsolute(t);
              }),
              (this.getAsControlPoint = function () {
                var t = this.getPoint();
                return (this.control = t), t;
              }),
              (this.getAsCurrentPoint = function () {
                var t = this.getPoint();
                return (this.current = t), t;
              }),
              (this.getReflectedControlPoint = function () {
                if (
                  "c" != this.previousCommand.toLowerCase() &&
                  "s" != this.previousCommand.toLowerCase() &&
                  "q" != this.previousCommand.toLowerCase() &&
                  "t" != this.previousCommand.toLowerCase()
                )
                  return this.current;
                var t = new r.Point(
                  2 * this.current.x - this.control.x,
                  2 * this.current.y - this.control.y
                );
                return t;
              }),
              (this.makeAbsolute = function (t) {
                return (
                  this.isRelativeCommand() &&
                  ((t.x += this.current.x), (t.y += this.current.y)),
                  t
                );
              }),
              (this.addMarker = function (t, e, i) {
                null != i &&
                  this.angles.length > 0 &&
                  null == this.angles[this.angles.length - 1] &&
                  (this.angles[this.angles.length - 1] = this.points[
                    this.points.length - 1
                  ].angleTo(i)),
                  this.addMarkerAngle(t, null == e ? null : e.angleTo(t));
              }),
              (this.addMarkerAngle = function (t, e) {
                this.points.push(t), this.angles.push(e);
              }),
              (this.getMarkerPoints = function () {
                return this.points;
              }),
              (this.getMarkerAngles = function () {
                for (var t = 0; t < this.angles.length; t++)
                  if (null == this.angles[t])
                    for (var e = t + 1; e < this.angles.length; e++)
                      if (null != this.angles[e]) {
                        this.angles[t] = this.angles[e];
                        break;
                      }
                return this.angles;
              });
          })(e)),
          (this.path = function (t) {
            var e = this.PathParser;
            e.reset();
            var i = new r.BoundingBox();
            for (null != t && t.beginPath(); !e.isEnd();)
              switch ((e.nextCommand(), e.command)) {
                case "M":
                case "m":
                  var n = e.getAsCurrentPoint();
                  for (
                    e.addMarker(n),
                    i.addPoint(n.x, n.y),
                    null != t && t.moveTo(n.x, n.y),
                    e.start = e.current;
                    !e.isCommandOrEnd();

                  ) {
                    var n = e.getAsCurrentPoint();
                    e.addMarker(n, e.start),
                      i.addPoint(n.x, n.y),
                      null != t && t.lineTo(n.x, n.y);
                  }
                  break;
                case "L":
                case "l":
                  for (; !e.isCommandOrEnd();) {
                    var s = e.current,
                      n = e.getAsCurrentPoint();
                    e.addMarker(n, s),
                      i.addPoint(n.x, n.y),
                      null != t && t.lineTo(n.x, n.y);
                  }
                  break;
                case "H":
                case "h":
                  for (; !e.isCommandOrEnd();) {
                    var a = new r.Point(
                      (e.isRelativeCommand() ? e.current.x : 0) + e.getScalar(),
                      e.current.y
                    );
                    e.addMarker(a, e.current),
                      (e.current = a),
                      i.addPoint(e.current.x, e.current.y),
                      null != t && t.lineTo(e.current.x, e.current.y);
                  }
                  break;
                case "V":
                case "v":
                  for (; !e.isCommandOrEnd();) {
                    var a = new r.Point(
                      e.current.x,
                      (e.isRelativeCommand() ? e.current.y : 0) + e.getScalar()
                    );
                    e.addMarker(a, e.current),
                      (e.current = a),
                      i.addPoint(e.current.x, e.current.y),
                      null != t && t.lineTo(e.current.x, e.current.y);
                  }
                  break;
                case "C":
                case "c":
                  for (; !e.isCommandOrEnd();) {
                    var o = e.current,
                      l = e.getPoint(),
                      h = e.getAsControlPoint(),
                      u = e.getAsCurrentPoint();
                    e.addMarker(u, h, l),
                      i.addBezierCurve(o.x, o.y, l.x, l.y, h.x, h.y, u.x, u.y),
                      null != t &&
                      t.bezierCurveTo(l.x, l.y, h.x, h.y, u.x, u.y);
                  }
                  break;
                case "S":
                case "s":
                  for (; !e.isCommandOrEnd();) {
                    var o = e.current,
                      l = e.getReflectedControlPoint(),
                      h = e.getAsControlPoint(),
                      u = e.getAsCurrentPoint();
                    e.addMarker(u, h, l),
                      i.addBezierCurve(o.x, o.y, l.x, l.y, h.x, h.y, u.x, u.y),
                      null != t &&
                      t.bezierCurveTo(l.x, l.y, h.x, h.y, u.x, u.y);
                  }
                  break;
                case "Q":
                case "q":
                  for (; !e.isCommandOrEnd();) {
                    var o = e.current,
                      h = e.getAsControlPoint(),
                      u = e.getAsCurrentPoint();
                    e.addMarker(u, h, h),
                      i.addQuadraticCurve(o.x, o.y, h.x, h.y, u.x, u.y),
                      null != t && t.quadraticCurveTo(h.x, h.y, u.x, u.y);
                  }
                  break;
                case "T":
                case "t":
                  for (; !e.isCommandOrEnd();) {
                    var o = e.current,
                      h = e.getReflectedControlPoint();
                    e.control = h;
                    var u = e.getAsCurrentPoint();
                    e.addMarker(u, h, h),
                      i.addQuadraticCurve(o.x, o.y, h.x, h.y, u.x, u.y),
                      null != t && t.quadraticCurveTo(h.x, h.y, u.x, u.y);
                  }
                  break;
                case "A":
                case "a":
                  for (; !e.isCommandOrEnd();) {
                    var o = e.current,
                      c = e.getScalar(),
                      f = e.getScalar(),
                      p = e.getScalar() * (Math.PI / 180),
                      m = e.getScalar(),
                      d = e.getScalar(),
                      u = e.getAsCurrentPoint(),
                      y = new r.Point(
                        (Math.cos(p) * (o.x - u.x)) / 2 +
                        (Math.sin(p) * (o.y - u.y)) / 2,
                        (-Math.sin(p) * (o.x - u.x)) / 2 +
                        (Math.cos(p) * (o.y - u.y)) / 2
                      ),
                      v =
                        Math.pow(y.x, 2) / Math.pow(c, 2) +
                        Math.pow(y.y, 2) / Math.pow(f, 2);
                    v > 1 && ((c *= Math.sqrt(v)), (f *= Math.sqrt(v)));
                    var g =
                      (m == d ? -1 : 1) *
                      Math.sqrt(
                        (Math.pow(c, 2) * Math.pow(f, 2) -
                          Math.pow(c, 2) * Math.pow(y.y, 2) -
                          Math.pow(f, 2) * Math.pow(y.x, 2)) /
                        (Math.pow(c, 2) * Math.pow(y.y, 2) +
                          Math.pow(f, 2) * Math.pow(y.x, 2))
                      );
                    isNaN(g) && (g = 0);
                    var x = new r.Point((g * c * y.y) / f, (g * -f * y.x) / c),
                      b = new r.Point(
                        (o.x + u.x) / 2 + Math.cos(p) * x.x - Math.sin(p) * x.y,
                        (o.y + u.y) / 2 + Math.sin(p) * x.x + Math.cos(p) * x.y
                      ),
                      E = function (t) {
                        return Math.sqrt(Math.pow(t[0], 2) + Math.pow(t[1], 2));
                      },
                      P = function (t, e) {
                        return (t[0] * e[0] + t[1] * e[1]) / (E(t) * E(e));
                      },
                      w = function (t, e) {
                        return (
                          (t[0] * e[1] < t[1] * e[0] ? -1 : 1) *
                          Math.acos(P(t, e))
                        );
                      },
                      B = w([1, 0], [(y.x - x.x) / c, (y.y - x.y) / f]),
                      C = [(y.x - x.x) / c, (y.y - x.y) / f],
                      T = [(-y.x - x.x) / c, (-y.y - x.y) / f],
                      V = w(C, T);
                    P(C, T) <= -1 && (V = Math.PI), P(C, T) >= 1 && (V = 0);
                    var M = 1 - d ? 1 : -1,
                      S = B + M * (V / 2),
                      k = new r.Point(
                        b.x + c * Math.cos(S),
                        b.y + f * Math.sin(S)
                      );
                    if (
                      (e.addMarkerAngle(k, S - (M * Math.PI) / 2),
                        e.addMarkerAngle(u, S - M * Math.PI),
                        i.addPoint(u.x, u.y),
                        null != t)
                    ) {
                      var P = c > f ? c : f,
                        D = c > f ? 1 : c / f,
                        A = c > f ? f / c : 1;
                      t.translate(b.x, b.y),
                        t.rotate(p),
                        t.scale(D, A),
                        t.arc(0, 0, P, B, B + V, 1 - d),
                        t.scale(1 / D, 1 / A),
                        t.rotate(-p),
                        t.translate(-b.x, -b.y);
                    }
                  }
                  break;
                case "Z":
                case "z":
                  null != t && t.closePath(), (e.current = e.start);
              }
            return i;
          }),
          (this.getMarkers = function () {
            for (
              var t = this.PathParser.getMarkerPoints(),
              e = this.PathParser.getMarkerAngles(),
              i = [],
              n = 0;
              n < t.length;
              n++
            )
              i.push([t[n], e[n]]);
            return i;
          });
      }),
      (r.Element.path.prototype = new r.Element.PathElementBase()),
      (r.Element.pattern = function (t) {
        (this.base = r.Element.ElementBase),
          this.base(t),
          (this.createPattern = function (t, e) {
            var i = this.attribute("width").toPixels("x", !0),
              n = this.attribute("height").toPixels("y", !0),
              s = new r.Element.svg();
            (s.attributes.viewBox = new r.Property(
              "viewBox",
              this.attribute("viewBox").value
            )),
              (s.attributes.width = new r.Property("width", i + "px")),
              (s.attributes.height = new r.Property("height", n + "px")),
              (s.attributes.transform = new r.Property(
                "transform",
                this.attribute("patternTransform").value
              )),
              (s.children = this.children);
            var a = document.createElement("canvas");
            (a.width = i), (a.height = n);
            var o = a.getContext("2d");
            this.attribute("x").hasValue() &&
              this.attribute("y").hasValue() &&
              o.translate(
                this.attribute("x").toPixels("x", !0),
                this.attribute("y").toPixels("y", !0)
              );
            for (var l = -1; l <= 1; l++)
              for (var h = -1; h <= 1; h++)
                o.save(),
                  (s.attributes.x = new r.Property("x", l * a.width)),
                  (s.attributes.y = new r.Property("y", h * a.height)),
                  s.render(o),
                  o.restore();
            var u = t.createPattern(a, "repeat");
            return u;
          });
      }),
      (r.Element.pattern.prototype = new r.Element.ElementBase()),
      (r.Element.marker = function (t) {
        (this.base = r.Element.ElementBase),
          this.base(t),
          (this.baseRender = this.render),
          (this.render = function (t, e, i) {
            t.translate(e.x, e.y),
              "auto" == this.attribute("orient").valueOrDefault("auto") &&
              t.rotate(i),
              "strokeWidth" ==
              this.attribute("markerUnits").valueOrDefault("strokeWidth") &&
              t.scale(t.lineWidth, t.lineWidth),
              t.save();
            var n = new r.Element.svg();
            (n.attributes.viewBox = new r.Property(
              "viewBox",
              this.attribute("viewBox").value
            )),
              (n.attributes.refX = new r.Property(
                "refX",
                this.attribute("refX").value
              )),
              (n.attributes.refY = new r.Property(
                "refY",
                this.attribute("refY").value
              )),
              (n.attributes.width = new r.Property(
                "width",
                this.attribute("markerWidth").value
              )),
              (n.attributes.height = new r.Property(
                "height",
                this.attribute("markerHeight").value
              )),
              (n.attributes.fill = new r.Property(
                "fill",
                this.attribute("fill").valueOrDefault("black")
              )),
              (n.attributes.stroke = new r.Property(
                "stroke",
                this.attribute("stroke").valueOrDefault("none")
              )),
              (n.children = this.children),
              n.render(t),
              t.restore(),
              "strokeWidth" ==
              this.attribute("markerUnits").valueOrDefault("strokeWidth") &&
              t.scale(1 / t.lineWidth, 1 / t.lineWidth),
              "auto" == this.attribute("orient").valueOrDefault("auto") &&
              t.rotate(-i),
              t.translate(-e.x, -e.y);
          });
      }),
      (r.Element.marker.prototype = new r.Element.ElementBase()),
      (r.Element.defs = function (t) {
        (this.base = r.Element.ElementBase),
          this.base(t),
          (this.render = function (t) { });
      }),
      (r.Element.defs.prototype = new r.Element.ElementBase()),
      (r.Element.GradientBase = function (t) {
        (this.base = r.Element.ElementBase), this.base(t), (this.stops = []);
        for (var e = 0; e < this.children.length; e++) {
          var i = this.children[e];
          "stop" == i.type && this.stops.push(i);
        }
        (this.getGradient = function () { }),
          (this.gradientUnits = function () {
            return this.attribute("gradientUnits").valueOrDefault(
              "objectBoundingBox"
            );
          }),
          (this.attributesToInherit = ["gradientUnits"]),
          (this.inheritStopContainer = function (t) {
            for (var e = 0; e < this.attributesToInherit.length; e++) {
              var i = this.attributesToInherit[e];
              !this.attribute(i).hasValue() &&
                t.attribute(i).hasValue() &&
                (this.attribute(i, !0).value = t.attribute(i).value);
            }
          }),
          (this.createGradient = function (t, e, i) {
            var n = this;
            this.getHrefAttribute().hasValue() &&
              ((n = this.getHrefAttribute().getDefinition()),
                this.inheritStopContainer(n));
            var s = function (t) {
              if (i.hasValue()) {
                var e = new r.Property("color", t);
                return e.addOpacity(i).value;
              }
              return t;
            },
              a = this.getGradient(t, e);
            if (null == a) return s(n.stops[n.stops.length - 1].color);
            for (var o = 0; o < n.stops.length; o++)
              a.addColorStop(n.stops[o].offset, s(n.stops[o].color));
            if (this.attribute("gradientTransform").hasValue()) {
              var l = r.ViewPort.viewPorts[0],
                h = new r.Element.rect();
              (h.attributes.x = new r.Property("x", -r.MAX_VIRTUAL_PIXELS / 3)),
                (h.attributes.y = new r.Property(
                  "y",
                  -r.MAX_VIRTUAL_PIXELS / 3
                )),
                (h.attributes.width = new r.Property(
                  "width",
                  r.MAX_VIRTUAL_PIXELS
                )),
                (h.attributes.height = new r.Property(
                  "height",
                  r.MAX_VIRTUAL_PIXELS
                ));
              var u = new r.Element.g();
              (u.attributes.transform = new r.Property(
                "transform",
                this.attribute("gradientTransform").value
              )),
                (u.children = [h]);
              var c = new r.Element.svg();
              (c.attributes.x = new r.Property("x", 0)),
                (c.attributes.y = new r.Property("y", 0)),
                (c.attributes.width = new r.Property("width", l.width)),
                (c.attributes.height = new r.Property("height", l.height)),
                (c.children = [u]);
              var f = document.createElement("canvas");
              (f.width = l.width), (f.height = l.height);
              var p = f.getContext("2d");
              return (
                (p.fillStyle = a), c.render(p), p.createPattern(f, "no-repeat")
              );
            }
            return a;
          });
      }),
      (r.Element.GradientBase.prototype = new r.Element.ElementBase()),
      (r.Element.linearGradient = function (t) {
        (this.base = r.Element.GradientBase),
          this.base(t),
          this.attributesToInherit.push("x1"),
          this.attributesToInherit.push("y1"),
          this.attributesToInherit.push("x2"),
          this.attributesToInherit.push("y2"),
          (this.getGradient = function (t, e) {
            var i =
              "objectBoundingBox" == this.gradientUnits()
                ? e.getBoundingBox()
                : null;
            this.attribute("x1").hasValue() ||
              this.attribute("y1").hasValue() ||
              this.attribute("x2").hasValue() ||
              this.attribute("y2").hasValue() ||
              ((this.attribute("x1", !0).value = 0),
                (this.attribute("y1", !0).value = 0),
                (this.attribute("x2", !0).value = 1),
                (this.attribute("y2", !0).value = 0));
            var n =
              "objectBoundingBox" == this.gradientUnits()
                ? i.x() + i.width() * this.attribute("x1").numValue()
                : this.attribute("x1").toPixels("x"),
              s =
                "objectBoundingBox" == this.gradientUnits()
                  ? i.y() + i.height() * this.attribute("y1").numValue()
                  : this.attribute("y1").toPixels("y"),
              a =
                "objectBoundingBox" == this.gradientUnits()
                  ? i.x() + i.width() * this.attribute("x2").numValue()
                  : this.attribute("x2").toPixels("x"),
              r =
                "objectBoundingBox" == this.gradientUnits()
                  ? i.y() + i.height() * this.attribute("y2").numValue()
                  : this.attribute("y2").toPixels("y");
            return n == a && s == r ? null : t.createLinearGradient(n, s, a, r);
          });
      }),
      (r.Element.linearGradient.prototype = new r.Element.GradientBase()),
      (r.Element.radialGradient = function (t) {
        (this.base = r.Element.GradientBase),
          this.base(t),
          this.attributesToInherit.push("cx"),
          this.attributesToInherit.push("cy"),
          this.attributesToInherit.push("r"),
          this.attributesToInherit.push("fx"),
          this.attributesToInherit.push("fy"),
          (this.getGradient = function (t, e) {
            var i = e.getBoundingBox();
            this.attribute("cx").hasValue() ||
              (this.attribute("cx", !0).value = "50%"),
              this.attribute("cy").hasValue() ||
              (this.attribute("cy", !0).value = "50%"),
              this.attribute("r").hasValue() ||
              (this.attribute("r", !0).value = "50%");
            var n =
              "objectBoundingBox" == this.gradientUnits()
                ? i.x() + i.width() * this.attribute("cx").numValue()
                : this.attribute("cx").toPixels("x"),
              s =
                "objectBoundingBox" == this.gradientUnits()
                  ? i.y() + i.height() * this.attribute("cy").numValue()
                  : this.attribute("cy").toPixels("y"),
              a = n,
              r = s;
            this.attribute("fx").hasValue() &&
              (a =
                "objectBoundingBox" == this.gradientUnits()
                  ? i.x() + i.width() * this.attribute("fx").numValue()
                  : this.attribute("fx").toPixels("x")),
              this.attribute("fy").hasValue() &&
              (r =
                "objectBoundingBox" == this.gradientUnits()
                  ? i.y() + i.height() * this.attribute("fy").numValue()
                  : this.attribute("fy").toPixels("y"));
            var o =
              "objectBoundingBox" == this.gradientUnits()
                ? ((i.width() + i.height()) / 2) *
                this.attribute("r").numValue()
                : this.attribute("r").toPixels();
            return t.createRadialGradient(a, r, 0, n, s, o);
          });
      }),
      (r.Element.radialGradient.prototype = new r.Element.GradientBase()),
      (r.Element.stop = function (t) {
        (this.base = r.Element.ElementBase),
          this.base(t),
          (this.offset = this.attribute("offset").numValue()),
          this.offset < 0 && (this.offset = 0),
          this.offset > 1 && (this.offset = 1);
        var e = this.style("stop-color", !0);
        "" === e.value && (e.value = "#000"),
          this.style("stop-opacity").hasValue() &&
          (e = e.addOpacity(this.style("stop-opacity"))),
          (this.color = e.value);
      }),
      (r.Element.stop.prototype = new r.Element.ElementBase()),
      (r.Element.AnimateBase = function (t) {
        (this.base = r.Element.ElementBase),
          this.base(t),
          r.Animations.push(this),
          (this.duration = 0),
          (this.begin = this.attribute("begin").toMilliseconds()),
          (this.maxDuration =
            this.begin + this.attribute("dur").toMilliseconds()),
          (this.getProperty = function () {
            var t = this.attribute("attributeType").value,
              e = this.attribute("attributeName").value;
            return "CSS" == t
              ? this.parent.style(e, !0)
              : this.parent.attribute(e, !0);
          }),
          (this.initialValue = null),
          (this.initialUnits = ""),
          (this.removed = !1),
          (this.calcValue = function () {
            return "";
          }),
          (this.update = function (t) {
            if (
              (null == this.initialValue &&
                ((this.initialValue = this.getProperty().value),
                  (this.initialUnits = this.getProperty().getUnits())),
                this.duration > this.maxDuration)
            ) {
              if (
                "indefinite" == this.attribute("repeatCount").value ||
                "indefinite" == this.attribute("repeatDur").value
              )
                this.duration = 0;
              else if (
                "freeze" != this.attribute("fill").valueOrDefault("remove") ||
                this.frozen
              ) {
                if (
                  "remove" == this.attribute("fill").valueOrDefault("remove") &&
                  !this.removed
                )
                  return (
                    (this.removed = !0),
                    (this.getProperty().value = this.parent.animationFrozen
                      ? this.parent.animationFrozenValue
                      : this.initialValue),
                    !0
                  );
              } else
                (this.frozen = !0),
                  (this.parent.animationFrozen = !0),
                  (this.parent.animationFrozenValue = this.getProperty().value);
              return !1;
            }
            this.duration = this.duration + t;
            var e = !1;
            if (this.begin < this.duration) {
              var i = this.calcValue();
              if (this.attribute("type").hasValue()) {
                var n = this.attribute("type").value;
                i = n + "(" + i + ")";
              }
              (this.getProperty().value = i), (e = !0);
            }
            return e;
          }),
          (this.from = this.attribute("from")),
          (this.to = this.attribute("to")),
          (this.values = this.attribute("values")),
          this.values.hasValue() &&
          (this.values.value = this.values.value.split(";")),
          (this.progress = function () {
            var t = {
              progress:
                (this.duration - this.begin) / (this.maxDuration - this.begin)
            };
            if (this.values.hasValue()) {
              var e = t.progress * (this.values.value.length - 1),
                i = Math.floor(e),
                n = Math.ceil(e);
              (t.from = new r.Property(
                "from",
                parseFloat(this.values.value[i])
              )),
                (t.to = new r.Property("to", parseFloat(this.values.value[n]))),
                (t.progress = (e - i) / (n - i));
            } else (t.from = this.from), (t.to = this.to);
            return t;
          });
      }),
      (r.Element.AnimateBase.prototype = new r.Element.ElementBase()),
      (r.Element.animate = function (t) {
        (this.base = r.Element.AnimateBase),
          this.base(t),
          (this.calcValue = function () {
            var t = this.progress(),
              e =
                t.from.numValue() +
                (t.to.numValue() - t.from.numValue()) * t.progress;
            return e + this.initialUnits;
          });
      }),
      (r.Element.animate.prototype = new r.Element.AnimateBase()),
      (r.Element.animateColor = function (e) {
        (this.base = r.Element.AnimateBase),
          this.base(e),
          (this.calcValue = function () {
            var e = this.progress(),
              i = new t(e.from.value),
              n = new t(e.to.value);
            if (i.ok && n.ok) {
              var s = i.r + (n.r - i.r) * e.progress,
                a = i.g + (n.g - i.g) * e.progress,
                r = i.b + (n.b - i.b) * e.progress;
              return (
                "rgb(" +
                parseInt(s, 10) +
                "," +
                parseInt(a, 10) +
                "," +
                parseInt(r, 10) +
                ")"
              );
            }
            return this.attribute("from").value;
          });
      }),
      (r.Element.animateColor.prototype = new r.Element.AnimateBase()),
      (r.Element.animateTransform = function (t) {
        (this.base = r.Element.AnimateBase),
          this.base(t),
          (this.calcValue = function () {
            for (
              var t = this.progress(),
              e = r.ToNumberArray(t.from.value),
              i = r.ToNumberArray(t.to.value),
              n = "",
              s = 0;
              s < e.length;
              s++
            )
              n += e[s] + (i[s] - e[s]) * t.progress + " ";
            return n;
          });
      }),
      (r.Element.animateTransform.prototype = new r.Element.animate()),
      (r.Element.font = function (t) {
        (this.base = r.Element.ElementBase),
          this.base(t),
          (this.horizAdvX = this.attribute("horiz-adv-x").numValue()),
          (this.isRTL = !1),
          (this.isArabic = !1),
          (this.fontFace = null),
          (this.missingGlyph = null),
          (this.glyphs = []);
        for (var e = 0; e < this.children.length; e++) {
          var i = this.children[e];
          "font-face" == i.type
            ? ((this.fontFace = i),
              i.style("font-family").hasValue() &&
              (r.Definitions[i.style("font-family").value] = this))
            : "missing-glyph" == i.type
              ? (this.missingGlyph = i)
              : "glyph" == i.type &&
              ("" != i.arabicForm
                ? ((this.isRTL = !0),
                  (this.isArabic = !0),
                  "undefined" == typeof this.glyphs[i.unicode] &&
                  (this.glyphs[i.unicode] = []),
                  (this.glyphs[i.unicode][i.arabicForm] = i))
                : (this.glyphs[i.unicode] = i));
        }
      }),
      (r.Element.font.prototype = new r.Element.ElementBase()),
      (r.Element.fontface = function (t) {
        (this.base = r.Element.ElementBase),
          this.base(t),
          (this.ascent = this.attribute("ascent").value),
          (this.descent = this.attribute("descent").value),
          (this.unitsPerEm = this.attribute("units-per-em").numValue());
      }),
      (r.Element.fontface.prototype = new r.Element.ElementBase()),
      (r.Element.missingglyph = function (t) {
        (this.base = r.Element.path), this.base(t), (this.horizAdvX = 0);
      }),
      (r.Element.missingglyph.prototype = new r.Element.path()),
      (r.Element.glyph = function (t) {
        (this.base = r.Element.path),
          this.base(t),
          (this.horizAdvX = this.attribute("horiz-adv-x").numValue()),
          (this.unicode = this.attribute("unicode").value),
          (this.arabicForm = this.attribute("arabic-form").value);
      }),
      (r.Element.glyph.prototype = new r.Element.path()),
      (r.Element.text = function (t) {
        (this.captureTextNodes = !0),
          (this.base = r.Element.RenderedElementBase),
          this.base(t),
          (this.baseSetContext = this.setContext),
          (this.setContext = function (t) {
            this.baseSetContext(t);
            var e = this.style("dominant-baseline").toTextBaseline();
            null == e &&
              (e = this.style("alignment-baseline").toTextBaseline()),
              null != e && (t.textBaseline = e);
          }),
          (this.getBoundingBox = function () {
            var t = this.attribute("x").toPixels("x"),
              e = this.attribute("y").toPixels("y"),
              i = this.parent
                .style("font-size")
                .numValueOrDefault(r.Font.Parse(r.ctx.font).fontSize);
            return new r.BoundingBox(
              t,
              e - i,
              t + Math.floor((2 * i) / 3) * this.children[0].getText().length,
              e
            );
          }),
          (this.renderChildren = function (t) {
            (this.x = this.attribute("x").toPixels("x")),
              (this.y = this.attribute("y").toPixels("y")),
              this.attribute("dx").hasValue() &&
              (this.x += this.attribute("dx").toPixels("x")),
              this.attribute("dy").hasValue() &&
              (this.y += this.attribute("dy").toPixels("y")),
              (this.x += this.getAnchorDelta(t, this, 0));
            for (var e = 0; e < this.children.length; e++)
              this.renderChild(t, this, this, e);
          }),
          (this.getAnchorDelta = function (t, e, i) {
            var n = this.style("text-anchor").valueOrDefault("start");
            if ("start" != n) {
              for (var s = 0, a = i; a < e.children.length; a++) {
                var r = e.children[a];
                if (a > i && r.attribute("x").hasValue()) break;
                s += r.measureTextRecursive(t);
              }
              return -1 * ("end" == n ? s : s / 2);
            }
            return 0;
          }),
          (this.renderChild = function (t, e, i, n) {
            var s = i.children[n];
            s.attribute("x").hasValue()
              ? ((s.x =
                s.attribute("x").toPixels("x") + e.getAnchorDelta(t, i, n)),
                s.attribute("dx").hasValue() &&
                (s.x += s.attribute("dx").toPixels("x")))
              : (s.attribute("dx").hasValue() &&
                (e.x += s.attribute("dx").toPixels("x")),
                (s.x = e.x)),
              (e.x = s.x + s.measureText(t)),
              s.attribute("y").hasValue()
                ? ((s.y = s.attribute("y").toPixels("y")),
                  s.attribute("dy").hasValue() &&
                  (s.y += s.attribute("dy").toPixels("y")))
                : (s.attribute("dy").hasValue() &&
                  (e.y += s.attribute("dy").toPixels("y")),
                  (s.y = e.y)),
              (e.y = s.y),
              s.render(t);
            for (var n = 0; n < s.children.length; n++)
              e.renderChild(t, e, s, n);
          });
      }),
      (r.Element.text.prototype = new r.Element.RenderedElementBase()),
      (r.Element.TextElementBase = function (t) {
        (this.base = r.Element.RenderedElementBase),
          this.base(t),
          (this.getGlyph = function (t, e, i) {
            var n = e[i],
              s = null;
            if (t.isArabic) {
              var a = "isolated";
              (0 == i || " " == e[i - 1]) &&
                i < e.length - 2 &&
                " " != e[i + 1] &&
                (a = "terminal"),
                i > 0 &&
                " " != e[i - 1] &&
                i < e.length - 2 &&
                " " != e[i + 1] &&
                (a = "medial"),
                i > 0 &&
                " " != e[i - 1] &&
                (i == e.length - 1 || " " == e[i + 1]) &&
                (a = "initial"),
                "undefined" != typeof t.glyphs[n] &&
                ((s = t.glyphs[n][a]),
                  null == s &&
                  "glyph" == t.glyphs[n].type &&
                  (s = t.glyphs[n]));
            } else s = t.glyphs[n];
            return null == s && (s = t.missingGlyph), s;
          }),
          (this.renderChildren = function (t) {
            var e = this.parent.style("font-family").getDefinition();
            if (null == e)
              "" != t.fillStyle &&
                t.fillText(r.compressSpaces(this.getText()), this.x, this.y),
                "" != t.strokeStyle &&
                t.strokeText(
                  r.compressSpaces(this.getText()),
                  this.x,
                  this.y
                );
            else {
              var i = this.parent
                .style("font-size")
                .numValueOrDefault(r.Font.Parse(r.ctx.font).fontSize),
                n = this.parent
                  .style("font-style")
                  .valueOrDefault(r.Font.Parse(r.ctx.font).fontStyle),
                s = this.getText();
              e.isRTL &&
                (s = s
                  .split("")
                  .reverse()
                  .join(""));
              for (
                var a = r.ToNumberArray(this.parent.attribute("dx").value),
                o = 0;
                o < s.length;
                o++
              ) {
                var l = this.getGlyph(e, s, o),
                  h = i / e.fontFace.unitsPerEm;
                t.translate(this.x, this.y), t.scale(h, -h);
                var u = t.lineWidth;
                (t.lineWidth = (t.lineWidth * e.fontFace.unitsPerEm) / i),
                  "italic" == n && t.transform(1, 0, 0.4, 1, 0, 0),
                  l.render(t),
                  "italic" == n && t.transform(1, 0, -0.4, 1, 0, 0),
                  (t.lineWidth = u),
                  t.scale(1 / h, -1 / h),
                  t.translate(-this.x, -this.y),
                  (this.x +=
                    (i * (l.horizAdvX || e.horizAdvX)) / e.fontFace.unitsPerEm),
                  "undefined" == typeof a[o] || isNaN(a[o]) || (this.x += a[o]);
              }
            }
          }),
          (this.getText = function () { }),
          (this.measureTextRecursive = function (t) {
            for (
              var e = this.measureText(t), i = 0;
              i < this.children.length;
              i++
            )
              e += this.children[i].measureTextRecursive(t);
            return e;
          }),
          (this.measureText = function (t) {
            var e = this.parent.style("font-family").getDefinition();
            if (null != e) {
              var i = this.parent
                .style("font-size")
                .numValueOrDefault(r.Font.Parse(r.ctx.font).fontSize),
                n = 0,
                s = this.getText();
              e.isRTL &&
                (s = s
                  .split("")
                  .reverse()
                  .join(""));
              for (
                var a = r.ToNumberArray(this.parent.attribute("dx").value),
                o = 0;
                o < s.length;
                o++
              ) {
                var l = this.getGlyph(e, s, o);
                (n +=
                  ((l.horizAdvX || e.horizAdvX) * i) / e.fontFace.unitsPerEm),
                  "undefined" == typeof a[o] || isNaN(a[o]) || (n += a[o]);
              }
              return n;
            }
            var h = r.compressSpaces(this.getText());
            if (!t.measureText) return 10 * h.length;
            t.save(), this.setContext(t);
            var u = t.measureText(h).width;
            return t.restore(), u;
          });
      }),
      (r.Element.TextElementBase.prototype = new r.Element.RenderedElementBase()),
      (r.Element.tspan = function (t) {
        (this.captureTextNodes = !0),
          (this.base = r.Element.TextElementBase),
          this.base(t),
          (this.text = r.compressSpaces(
            t.value || t.text || t.textContent || ""
          )),
          (this.getText = function () {
            return this.children.length > 0 ? "" : this.text;
          });
      }),
      (r.Element.tspan.prototype = new r.Element.TextElementBase()),
      (r.Element.tref = function (t) {
        (this.base = r.Element.TextElementBase),
          this.base(t),
          (this.getText = function () {
            var t = this.getHrefAttribute().getDefinition();
            if (null != t) return t.children[0].getText();
          });
      }),
      (r.Element.tref.prototype = new r.Element.TextElementBase()),
      (r.Element.a = function (t) {
        (this.base = r.Element.TextElementBase),
          this.base(t),
          (this.hasText = t.childNodes.length > 0);
        for (var e = 0; e < t.childNodes.length; e++)
          3 != t.childNodes[e].nodeType && (this.hasText = !1);
        (this.text = this.hasText ? t.childNodes[0].value : ""),
          (this.getText = function () {
            return this.text;
          }),
          (this.baseRenderChildren = this.renderChildren),
          (this.renderChildren = function (t) {
            if (this.hasText) {
              this.baseRenderChildren(t);
              var e = new r.Property(
                "fontSize",
                r.Font.Parse(r.ctx.font).fontSize
              );
              r.Mouse.checkBoundingBox(
                this,
                new r.BoundingBox(
                  this.x,
                  this.y - e.toPixels("y"),
                  this.x + this.measureText(t),
                  this.y
                )
              );
            } else if (this.children.length > 0) {
              var i = new r.Element.g();
              (i.children = this.children), (i.parent = this), i.render(t);
            }
          }),
          (this.onclick = function () {
            window.open(this.getHrefAttribute().value);
          }),
          (this.onmousemove = function () {
            r.ctx.canvas.style.cursor = "pointer";
          });
      }),
      (r.Element.a.prototype = new r.Element.TextElementBase()),
      (r.Element.image = function (t) {
        (this.base = r.Element.RenderedElementBase), this.base(t);
        var e = this.getHrefAttribute().value;
        if ("" != e) {
          var i = e.match(/\.svg$/);
          if ((r.Images.push(this), (this.loaded = !1), i))
            (this.img = r.ajax(e)), (this.loaded = !0);
          else {
            (this.img = document.createElement("img")),
              1 == r.opts.useCORS && (this.img.crossOrigin = "Anonymous");
            var n = this;
            (this.img.onload = function () {
              n.loaded = !0;
            }),
              (this.img.onerror = function () {
                r.log('ERROR: image "' + e + '" not found'), (n.loaded = !0);
              }),
              (this.img.src = e);
          }
          (this.renderChildren = function (t) {
            var e = this.attribute("x").toPixels("x"),
              n = this.attribute("y").toPixels("y"),
              s = this.attribute("width").toPixels("x"),
              a = this.attribute("height").toPixels("y");
            0 != s &&
              0 != a &&
              (t.save(),
                i
                  ? t.drawSvg(this.img, e, n, s, a)
                  : (t.translate(e, n),
                    r.AspectRatio(
                      t,
                      this.attribute("preserveAspectRatio").value,
                      s,
                      this.img.width,
                      a,
                      this.img.height,
                      0,
                      0
                    ),
                    t.drawImage(this.img, 0, 0)),
                t.restore());
          }),
            (this.getBoundingBox = function () {
              var t = this.attribute("x").toPixels("x"),
                e = this.attribute("y").toPixels("y"),
                i = this.attribute("width").toPixels("x"),
                n = this.attribute("height").toPixels("y");
              return new r.BoundingBox(t, e, t + i, e + n);
            });
        }
      }),
      (r.Element.image.prototype = new r.Element.RenderedElementBase()),
      (r.Element.g = function (t) {
        (this.base = r.Element.RenderedElementBase),
          this.base(t),
          (this.getBoundingBox = function () {
            for (
              var t = new r.BoundingBox(), e = 0;
              e < this.children.length;
              e++
            )
              t.addBoundingBox(this.children[e].getBoundingBox());
            return t;
          });
      }),
      (r.Element.g.prototype = new r.Element.RenderedElementBase()),
      (r.Element.symbol = function (t) {
        (this.base = r.Element.RenderedElementBase),
          this.base(t),
          (this.render = function (t) { });
      }),
      (r.Element.symbol.prototype = new r.Element.RenderedElementBase()),
      (r.Element.style = function (t) {
        (this.base = r.Element.ElementBase), this.base(t);
        for (var e = "", i = 0; i < t.childNodes.length; i++)
          e += t.childNodes[i].data;
        (e = e.replace(
          /(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(^[\s]*\/\/.*)/gm,
          ""
        )),
          (e = r.compressSpaces(e));
        for (var s = e.split("}"), i = 0; i < s.length; i++)
          if ("" != r.trim(s[i]))
            for (
              var a = s[i].split("{"),
              o = a[0].split(","),
              l = a[1].split(";"),
              h = 0;
              h < o.length;
              h++
            ) {
              var u = r.trim(o[h]);
              if ("" != u) {
                for (var c = r.Styles[u] || {}, f = 0; f < l.length; f++) {
                  var p = l[f].indexOf(":"),
                    m = l[f].substr(0, p),
                    d = l[f].substr(p + 1, l[f].length - p);
                  null != m &&
                    null != d &&
                    (c[r.trim(m)] = new r.Property(r.trim(m), r.trim(d)));
                }
                if (
                  ((r.Styles[u] = c),
                    (r.StylesSpecificity[u] = n(u)),
                    "@font-face" == u)
                )
                  for (
                    var y = c["font-family"].value.replace(/"/g, ""),
                    v = c.src.value.split(","),
                    g = 0;
                    g < v.length;
                    g++
                  )
                    if (v[g].indexOf('format("svg")') > 0)
                      for (
                        var x = v[g].indexOf("url"),
                        b = v[g].indexOf(")", x),
                        E = v[g].substr(x + 5, b - x - 6),
                        P = r.parseXml(r.ajax(E)),
                        w = P.getElementsByTagName("font"),
                        B = 0;
                        B < w.length;
                        B++
                      ) {
                        var C = r.CreateElement(w[B]);
                        r.Definitions[y] = C;
                      }
              }
            }
      }),
      (r.Element.style.prototype = new r.Element.ElementBase()),
      (r.Element.use = function (t) {
        (this.base = r.Element.RenderedElementBase),
          this.base(t),
          (this.baseSetContext = this.setContext),
          (this.setContext = function (t) {
            this.baseSetContext(t),
              this.attribute("x").hasValue() &&
              t.translate(this.attribute("x").toPixels("x"), 0),
              this.attribute("y").hasValue() &&
              t.translate(0, this.attribute("y").toPixels("y"));
          });
        var e = this.getHrefAttribute().getDefinition();
        (this.path = function (t) {
          null != e && e.path(t);
        }),
          (this.getBoundingBox = function () {
            if (null != e) return e.getBoundingBox();
          }),
          (this.renderChildren = function (t) {
            if (null != e) {
              var i = e;
              "symbol" == e.type &&
                ((i = new r.Element.svg()),
                  (i.type = "svg"),
                  (i.attributes.viewBox = new r.Property(
                    "viewBox",
                    e.attribute("viewBox").value
                  )),
                  (i.attributes.preserveAspectRatio = new r.Property(
                    "preserveAspectRatio",
                    e.attribute("preserveAspectRatio").value
                  )),
                  (i.attributes.overflow = new r.Property(
                    "overflow",
                    e.attribute("overflow").value
                  )),
                  (i.children = e.children)),
                "svg" == i.type &&
                (this.attribute("width").hasValue() &&
                  (i.attributes.width = new r.Property(
                    "width",
                    this.attribute("width").value
                  )),
                  this.attribute("height").hasValue() &&
                  (i.attributes.height = new r.Property(
                    "height",
                    this.attribute("height").value
                  )));
              var n = i.parent;
              (i.parent = null), i.render(t), (i.parent = n);
            }
          });
      }),
      (r.Element.use.prototype = new r.Element.RenderedElementBase()),
      (r.Element.mask = function (t) {
        (this.base = r.Element.ElementBase),
          this.base(t),
          (this.apply = function (t, e) {
            var i = this.attribute("x").toPixels("x"),
              n = this.attribute("y").toPixels("y"),
              s = this.attribute("width").toPixels("x"),
              a = this.attribute("height").toPixels("y");
            if (0 == s && 0 == a) {
              for (
                var o = new r.BoundingBox(), l = 0;
                l < this.children.length;
                l++
              )
                o.addBoundingBox(this.children[l].getBoundingBox());
              var i = Math.floor(o.x1),
                n = Math.floor(o.y1),
                s = Math.floor(o.width()),
                a = Math.floor(o.height());
            }
            var h = e.attribute("mask").value;
            e.attribute("mask").value = "";
            var u = document.createElement("canvas");
            (u.width = i + s), (u.height = n + a);
            var c = u.getContext("2d");
            this.renderChildren(c);
            var f = document.createElement("canvas");
            (f.width = i + s), (f.height = n + a);
            var p = f.getContext("2d");
            e.render(p),
              (p.globalCompositeOperation = "destination-in"),
              (p.fillStyle = c.createPattern(u, "no-repeat")),
              p.fillRect(0, 0, i + s, n + a),
              (t.fillStyle = p.createPattern(f, "no-repeat")),
              t.fillRect(0, 0, i + s, n + a),
              (e.attribute("mask").value = h);
          }),
          (this.render = function (t) { });
      }),
      (r.Element.mask.prototype = new r.Element.ElementBase()),
      (r.Element.clipPath = function (t) {
        (this.base = r.Element.ElementBase),
          this.base(t),
          (this.apply = function (t) {
            var e = CanvasRenderingContext2D.prototype.beginPath;
            CanvasRenderingContext2D.prototype.beginPath = function () { };
            var i = CanvasRenderingContext2D.prototype.closePath;
            (CanvasRenderingContext2D.prototype.closePath = function () { }),
              e.call(t);
            for (var n = 0; n < this.children.length; n++) {
              var s = this.children[n];
              if ("undefined" != typeof s.path) {
                var a = null;
                s.style("transform", !1, !0).hasValue() &&
                  ((a = new r.Transform(s.style("transform", !1, !0).value)),
                    a.apply(t)),
                  s.path(t),
                  (CanvasRenderingContext2D.prototype.closePath = i),
                  a && a.unapply(t);
              }
            }
            i.call(t),
              t.clip(),
              (CanvasRenderingContext2D.prototype.beginPath = e),
              (CanvasRenderingContext2D.prototype.closePath = i);
          }),
          (this.render = function (t) { });
      }),
      (r.Element.clipPath.prototype = new r.Element.ElementBase()),
      (r.Element.filter = function (t) {
        (this.base = r.Element.ElementBase),
          this.base(t),
          (this.apply = function (t, e) {
            var i = e.getBoundingBox(),
              n = Math.floor(i.x1),
              s = Math.floor(i.y1),
              a = Math.floor(i.width()),
              r = Math.floor(i.height()),
              o = e.style("filter").value;
            e.style("filter").value = "";
            for (var l = 0, h = 0, u = 0; u < this.children.length; u++) {
              var c = this.children[u].extraFilterDistance || 0;
              (l = Math.max(l, c)), (h = Math.max(h, c));
            }
            var f = document.createElement("canvas");
            (f.width = a + 2 * l), (f.height = r + 2 * h);
            var p = f.getContext("2d");
            p.translate(-n + l, -s + h), e.render(p);
            for (var u = 0; u < this.children.length; u++)
              "function" == typeof this.children[u].apply &&
                this.children[u].apply(p, 0, 0, a + 2 * l, r + 2 * h);
            t.drawImage(
              f,
              0,
              0,
              a + 2 * l,
              r + 2 * h,
              n - l,
              s - h,
              a + 2 * l,
              r + 2 * h
            ),
              (e.style("filter", !0).value = o);
          }),
          (this.render = function (t) { });
      }),
      (r.Element.filter.prototype = new r.Element.ElementBase()),
      (r.Element.feMorphology = function (t) {
        (this.base = r.Element.ElementBase),
          this.base(t),
          (this.apply = function (t, e, i, n, s) { });
      }),
      (r.Element.feMorphology.prototype = new r.Element.ElementBase()),
      (r.Element.feComposite = function (t) {
        (this.base = r.Element.ElementBase),
          this.base(t),
          (this.apply = function (t, e, i, n, s) { });
      }),
      (r.Element.feComposite.prototype = new r.Element.ElementBase()),
      (r.Element.feColorMatrix = function (t) {
        function e(t, e, i, n, s, a) {
          return t[i * n * 4 + 4 * e + a];
        }
        function i(t, e, i, n, s, a, r) {
          t[i * n * 4 + 4 * e + a] = r;
        }
        function n(t, e) {
          var i = s[t];
          return i * (i < 0 ? e - 255 : e);
        }
        (this.base = r.Element.ElementBase), this.base(t);
        var s = r.ToNumberArray(this.attribute("values").value);
        switch (this.attribute("type").valueOrDefault("matrix")) {
          case "saturate":
            var a = s[0];
            s = [
              0.213 + 0.787 * a,
              0.715 - 0.715 * a,
              0.072 - 0.072 * a,
              0,
              0,
              0.213 - 0.213 * a,
              0.715 + 0.285 * a,
              0.072 - 0.072 * a,
              0,
              0,
              0.213 - 0.213 * a,
              0.715 - 0.715 * a,
              0.072 + 0.928 * a,
              0,
              0,
              0,
              0,
              0,
              1,
              0,
              0,
              0,
              0,
              0,
              1
            ];
            break;
          case "hueRotate":
            var o = (s[0] * Math.PI) / 180,
              l = function (t, e, i) {
                return t + Math.cos(o) * e + Math.sin(o) * i;
              };
            s = [
              l(0.213, 0.787, -0.213),
              l(0.715, -0.715, -0.715),
              l(0.072, -0.072, 0.928),
              0,
              0,
              l(0.213, -0.213, 0.143),
              l(0.715, 0.285, 0.14),
              l(0.072, -0.072, -0.283),
              0,
              0,
              l(0.213, -0.213, -0.787),
              l(0.715, -0.715, 0.715),
              l(0.072, 0.928, 0.072),
              0,
              0,
              0,
              0,
              0,
              1,
              0,
              0,
              0,
              0,
              0,
              1
            ];
            break;
          case "luminanceToAlpha":
            s = [
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0.2125,
              0.7154,
              0.0721,
              0,
              0,
              0,
              0,
              0,
              0,
              1
            ];
        }
        this.apply = function (t, s, a, r, o) {
          for (var l = t.getImageData(0, 0, r, o), a = 0; a < o; a++)
            for (var s = 0; s < r; s++) {
              var h = e(l.data, s, a, r, o, 0),
                u = e(l.data, s, a, r, o, 1),
                c = e(l.data, s, a, r, o, 2),
                f = e(l.data, s, a, r, o, 3);
              i(
                l.data,
                s,
                a,
                r,
                o,
                0,
                n(0, h) + n(1, u) + n(2, c) + n(3, f) + n(4, 1)
              ),
                i(
                  l.data,
                  s,
                  a,
                  r,
                  o,
                  1,
                  n(5, h) + n(6, u) + n(7, c) + n(8, f) + n(9, 1)
                ),
                i(
                  l.data,
                  s,
                  a,
                  r,
                  o,
                  2,
                  n(10, h) + n(11, u) + n(12, c) + n(13, f) + n(14, 1)
                ),
                i(
                  l.data,
                  s,
                  a,
                  r,
                  o,
                  3,
                  n(15, h) + n(16, u) + n(17, c) + n(18, f) + n(19, 1)
                );
            }
          t.clearRect(0, 0, r, o), t.putImageData(l, 0, 0);
        };
      }),
      (r.Element.feColorMatrix.prototype = new r.Element.ElementBase()),
      (r.Element.feGaussianBlur = function (t) {
        (this.base = r.Element.ElementBase),
          this.base(t),
          (this.blurRadius = Math.floor(
            this.attribute("stdDeviation").numValue()
          )),
          (this.extraFilterDistance = this.blurRadius),
          (this.apply = function (t, i, n, s, a) {
            return "undefined" == typeof e.canvasRGBA
              ? void r.log(
                "ERROR: StackBlur.js must be included for blur to work"
              )
              : ((t.canvas.id = r.UniqueId()),
                (t.canvas.style.display = "none"),
                document.body.appendChild(t.canvas),
                e.canvasRGBA(t.canvas.id, i, n, s, a, this.blurRadius),
                void document.body.removeChild(t.canvas));
          });
      }),
      (r.Element.feGaussianBlur.prototype = new r.Element.ElementBase()),
      (r.Element.title = function (t) { }),
      (r.Element.title.prototype = new r.Element.ElementBase()),
      (r.Element.desc = function (t) { }),
      (r.Element.desc.prototype = new r.Element.ElementBase()),
      (r.Element.MISSING = function (t) {
        r.log("ERROR: Element '" + t.nodeName + "' not yet implemented.");
      }),
      (r.Element.MISSING.prototype = new r.Element.ElementBase()),
      (r.CreateElement = function (t) {
        var e = t.nodeName.replace(/^[^:]+:/, "");
        e = e.replace(/\-/g, "");
        var i = null;
        return (
          (i =
            "undefined" != typeof r.Element[e]
              ? new r.Element[e](t)
              : new r.Element.MISSING(t)),
          (i.type = t.nodeName),
          i
        );
      }),
      (r.load = function (t, e) {
        r.loadXml(t, r.ajax(e));
      }),
      (r.loadXml = function (t, e) {
        r.loadXmlDoc(t, r.parseXml(e));
      }),
      (r.loadXmlDoc = function (t, e) {
        r.init(t);
        var i = function (e) {
          for (var i = t.canvas; i;)
            (e.x -= i.offsetLeft), (e.y -= i.offsetTop), (i = i.offsetParent);
          return (
            window.scrollX && (e.x += window.scrollX),
            window.scrollY && (e.y += window.scrollY),
            e
          );
        };
        1 != r.opts.ignoreMouse &&
          ((t.canvas.onclick = function (t) {
            var e = i(
              new r.Point(
                null != t ? t.clientX : event.clientX,
                null != t ? t.clientY : event.clientY
              )
            );
            r.Mouse.onclick(e.x, e.y);
          }),
            (t.canvas.onmousemove = function (t) {
              var e = i(
                new r.Point(
                  null != t ? t.clientX : event.clientX,
                  null != t ? t.clientY : event.clientY
                )
              );
              r.Mouse.onmousemove(e.x, e.y);
            }));
        var n = r.CreateElement(e.documentElement);
        (n.root = !0), n.addStylesFromStyleDefinition();
        var s = !0,
          a = function () {
            r.ViewPort.Clear(),
              t.canvas.parentNode &&
              r.ViewPort.SetCurrent(
                t.canvas.parentNode.clientWidth,
                t.canvas.parentNode.clientHeight
              ),
              1 != r.opts.ignoreDimensions &&
              (n.style("width").hasValue() &&
                ((t.canvas.width = n.style("width").toPixels("x")),
                  (t.canvas.style.width = t.canvas.width + "px")),
                n.style("height").hasValue() &&
                ((t.canvas.height = n.style("height").toPixels("y")),
                  (t.canvas.style.height = t.canvas.height + "px")));
            var i = t.canvas.clientWidth || t.canvas.width,
              a = t.canvas.clientHeight || t.canvas.height;
            if (
              (1 == r.opts.ignoreDimensions &&
                n.style("width").hasValue() &&
                n.style("height").hasValue() &&
                ((i = n.style("width").toPixels("x")),
                  (a = n.style("height").toPixels("y"))),
                r.ViewPort.SetCurrent(i, a),
                null != r.opts.offsetX &&
                (n.attribute("x", !0).value = r.opts.offsetX),
                null != r.opts.offsetY &&
                (n.attribute("y", !0).value = r.opts.offsetY),
                null != r.opts.scaleWidth || null != r.opts.scaleHeight)
            ) {
              var o = null,
                l = null,
                h = r.ToNumberArray(n.attribute("viewBox").value);
              null != r.opts.scaleWidth &&
                (n.attribute("width").hasValue()
                  ? (o = n.attribute("width").toPixels("x") / r.opts.scaleWidth)
                  : isNaN(h[2]) || (o = h[2] / r.opts.scaleWidth)),
                null != r.opts.scaleHeight &&
                (n.attribute("height").hasValue()
                  ? (l =
                    n.attribute("height").toPixels("y") /
                    r.opts.scaleHeight)
                  : isNaN(h[3]) || (l = h[3] / r.opts.scaleHeight)),
                null == o && (o = l),
                null == l && (l = o),
                (n.attribute("width", !0).value = r.opts.scaleWidth),
                (n.attribute("height", !0).value = r.opts.scaleHeight),
                (n.style("transform", !0, !0).value +=
                  " scale(" + 1 / o + "," + 1 / l + ")");
            }
            1 != r.opts.ignoreClear && t.clearRect(0, 0, i, a),
              n.render(t),
              s &&
              ((s = !1),
                "function" == typeof r.opts.renderCallback &&
                r.opts.renderCallback(e));
          },
          o = !0;
        r.ImagesLoaded() && ((o = !1), a()),
          (r.intervalID = setInterval(function () {
            var t = !1;
            if (
              (o && r.ImagesLoaded() && ((o = !1), (t = !0)),
                1 != r.opts.ignoreMouse && (t |= r.Mouse.hasEvents()),
                1 != r.opts.ignoreAnimation)
            )
              for (var e = 0; e < r.Animations.length; e++)
                t |= r.Animations[e].update(1e3 / r.FRAMERATE);
            "function" == typeof r.opts.forceRedraw &&
              1 == r.opts.forceRedraw() &&
              (t = !0),
              t && (a(), r.Mouse.runEvents());
          }, 1e3 / r.FRAMERATE));
      }),
      (r.stop = function () {
        r.intervalID && clearInterval(r.intervalID);
      }),
      (r.Mouse = new (function () {
        (this.events = []),
          (this.hasEvents = function () {
            return 0 != this.events.length;
          }),
          (this.onclick = function (t, e) {
            this.events.push({
              type: "onclick",
              x: t,
              y: e,
              run: function (t) {
                t.onclick && t.onclick();
              }
            });
          }),
          (this.onmousemove = function (t, e) {
            this.events.push({
              type: "onmousemove",
              x: t,
              y: e,
              run: function (t) {
                t.onmousemove && t.onmousemove();
              }
            });
          }),
          (this.eventElements = []),
          (this.checkPath = function (t, e) {
            for (var i = 0; i < this.events.length; i++) {
              var n = this.events[i];
              e.isPointInPath &&
                e.isPointInPath(n.x, n.y) &&
                (this.eventElements[i] = t);
            }
          }),
          (this.checkBoundingBox = function (t, e) {
            for (var i = 0; i < this.events.length; i++) {
              var n = this.events[i];
              e.isPointInBox(n.x, n.y) && (this.eventElements[i] = t);
            }
          }),
          (this.runEvents = function () {
            r.ctx.canvas.style.cursor = "";
            for (var t = 0; t < this.events.length; t++)
              for (var e = this.events[t], i = this.eventElements[t]; i;)
                e.run(i), (i = i.parent);
            (this.events = []), (this.eventElements = []);
          });
      })()),
      r
    );
  }
  var a,
    r = function (t, e, i) {
      if (null != t || null != e || null != i) {
        "string" == typeof t && (t = document.getElementById(t)),
          null != t.svg && t.svg.stop();
        var n = s(i || {});
        (1 == t.childNodes.length && "OBJECT" == t.childNodes[0].nodeName) ||
          (t.svg = n);
        var a = t.getContext("2d");
        "undefined" != typeof e.documentElement
          ? n.loadXmlDoc(a, e)
          : "<" == e.substr(0, 1)
            ? n.loadXml(a, e)
            : n.load(a, e);
      } else
        for (
          var o = document.querySelectorAll("svg"), l = 0;
          l < o.length;
          l++
        ) {
          var h = o[l],
            u = document.createElement("canvas");
          (u.width = h.clientWidth),
            (u.height = h.clientHeight),
            h.parentNode.insertBefore(u, h),
            h.parentNode.removeChild(h);
          var c = document.createElement("div");
          c.appendChild(h), r(u, c.innerHTML);
        }
    };
  "undefined" != typeof Element.prototype.matches
    ? (a = function (t, e) {
      return t.matches(e);
    })
    : "undefined" != typeof Element.prototype.webkitMatchesSelector
      ? (a = function (t, e) {
        return t.webkitMatchesSelector(e);
      })
      : "undefined" != typeof Element.prototype.mozMatchesSelector
        ? (a = function (t, e) {
          return t.mozMatchesSelector(e);
        })
        : "undefined" != typeof Element.prototype.msMatchesSelector
          ? (a = function (t, e) {
            return t.msMatchesSelector(e);
          })
          : "undefined" != typeof Element.prototype.oMatchesSelector
            ? (a = function (t, e) {
              return t.oMatchesSelector(e);
            })
            : (("function" != typeof jQuery && "function" != typeof Zepto) ||
              (a = function (t, e) {
                return $(t).is(e);
              }),
              "undefined" == typeof a && (a = Sizzle.matchesSelector));
  var o = /(\[[^\]]+\])/g,
    l = /(#[^\s\+>~\.\[:]+)/g,
    h = /(\.[^\s\+>~\.\[:]+)/g,
    u = /(::[^\s\+>~\.\[:]+|:first-line|:first-letter|:before|:after)/gi,
    c = /(:[\w-]+\([^\)]*\))/gi,
    f = /(:[^\s\+>~\.\[:]+)/g,
    p = /([^\s\+>~\.\[:]+)/g;
  return (
    "undefined" != typeof CanvasRenderingContext2D &&
    (CanvasRenderingContext2D.prototype.drawSvg = function (t, e, i, n, s, a) {
      var o = {
        ignoreMouse: !0,
        ignoreAnimation: !0,
        ignoreDimensions: !0,
        ignoreClear: !0,
        offsetX: e,
        offsetY: i,
        scaleWidth: n,
        scaleHeight: s
      };
      for (var l in a) a.hasOwnProperty(l) && (o[l] = a[l]);
      r(this.canvas, t, o);
    }),
    r
  );
});

// This product includes color specifications and designs developed by Cynthia Brewer (http://colorbrewer.org/).
// JavaScript specs as packaged in the D3 library (d3js.org). Please see license at http://colorbrewer.org/export/LICENSE.txt
var colorbrewer = {
  YlGn: {
    3: ["#f7fcb9", "#addd8e", "#31a354"],
    4: ["#ffffcc", "#c2e699", "#78c679", "#238443"],
    5: ["#ffffcc", "#c2e699", "#78c679", "#31a354", "#006837"],
    6: ["#ffffcc", "#d9f0a3", "#addd8e", "#78c679", "#31a354", "#006837"],
    7: [
      "#ffffcc",
      "#d9f0a3",
      "#addd8e",
      "#78c679",
      "#41ab5d",
      "#238443",
      "#005a32"
    ],
    8: [
      "#ffffe5",
      "#f7fcb9",
      "#d9f0a3",
      "#addd8e",
      "#78c679",
      "#41ab5d",
      "#238443",
      "#005a32"
    ],
    9: [
      "#ffffe5",
      "#f7fcb9",
      "#d9f0a3",
      "#addd8e",
      "#78c679",
      "#41ab5d",
      "#238443",
      "#006837",
      "#004529"
    ]
  },
  YlGnBu: {
    3: ["#edf8b1", "#7fcdbb", "#2c7fb8"],
    4: ["#ffffcc", "#a1dab4", "#41b6c4", "#225ea8"],
    5: ["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"],
    6: ["#ffffcc", "#c7e9b4", "#7fcdbb", "#41b6c4", "#2c7fb8", "#253494"],
    7: [
      "#ffffcc",
      "#c7e9b4",
      "#7fcdbb",
      "#41b6c4",
      "#1d91c0",
      "#225ea8",
      "#0c2c84"
    ],
    8: [
      "#ffffd9",
      "#edf8b1",
      "#c7e9b4",
      "#7fcdbb",
      "#41b6c4",
      "#1d91c0",
      "#225ea8",
      "#0c2c84"
    ],
    9: [
      "#ffffd9",
      "#edf8b1",
      "#c7e9b4",
      "#7fcdbb",
      "#41b6c4",
      "#1d91c0",
      "#225ea8",
      "#253494",
      "#081d58"
    ]
  },
  GnBu: {
    3: ["#e0f3db", "#a8ddb5", "#43a2ca"],
    4: ["#f0f9e8", "#bae4bc", "#7bccc4", "#2b8cbe"],
    5: ["#f0f9e8", "#bae4bc", "#7bccc4", "#43a2ca", "#0868ac"],
    6: ["#f0f9e8", "#ccebc5", "#a8ddb5", "#7bccc4", "#43a2ca", "#0868ac"],
    7: [
      "#f0f9e8",
      "#ccebc5",
      "#a8ddb5",
      "#7bccc4",
      "#4eb3d3",
      "#2b8cbe",
      "#08589e"
    ],
    8: [
      "#f7fcf0",
      "#e0f3db",
      "#ccebc5",
      "#a8ddb5",
      "#7bccc4",
      "#4eb3d3",
      "#2b8cbe",
      "#08589e"
    ],
    9: [
      "#f7fcf0",
      "#e0f3db",
      "#ccebc5",
      "#a8ddb5",
      "#7bccc4",
      "#4eb3d3",
      "#2b8cbe",
      "#0868ac",
      "#084081"
    ]
  },
  BuGn: {
    3: ["#e5f5f9", "#99d8c9", "#2ca25f"],
    4: ["#edf8fb", "#b2e2e2", "#66c2a4", "#238b45"],
    5: ["#edf8fb", "#b2e2e2", "#66c2a4", "#2ca25f", "#006d2c"],
    6: ["#edf8fb", "#ccece6", "#99d8c9", "#66c2a4", "#2ca25f", "#006d2c"],
    7: [
      "#edf8fb",
      "#ccece6",
      "#99d8c9",
      "#66c2a4",
      "#41ae76",
      "#238b45",
      "#005824"
    ],
    8: [
      "#f7fcfd",
      "#e5f5f9",
      "#ccece6",
      "#99d8c9",
      "#66c2a4",
      "#41ae76",
      "#238b45",
      "#005824"
    ],
    9: [
      "#f7fcfd",
      "#e5f5f9",
      "#ccece6",
      "#99d8c9",
      "#66c2a4",
      "#41ae76",
      "#238b45",
      "#006d2c",
      "#00441b"
    ]
  },
  PuBuGn: {
    3: ["#ece2f0", "#a6bddb", "#1c9099"],
    4: ["#f6eff7", "#bdc9e1", "#67a9cf", "#02818a"],
    5: ["#f6eff7", "#bdc9e1", "#67a9cf", "#1c9099", "#016c59"],
    6: ["#f6eff7", "#d0d1e6", "#a6bddb", "#67a9cf", "#1c9099", "#016c59"],
    7: [
      "#f6eff7",
      "#d0d1e6",
      "#a6bddb",
      "#67a9cf",
      "#3690c0",
      "#02818a",
      "#016450"
    ],
    8: [
      "#fff7fb",
      "#ece2f0",
      "#d0d1e6",
      "#a6bddb",
      "#67a9cf",
      "#3690c0",
      "#02818a",
      "#016450"
    ],
    9: [
      "#fff7fb",
      "#ece2f0",
      "#d0d1e6",
      "#a6bddb",
      "#67a9cf",
      "#3690c0",
      "#02818a",
      "#016c59",
      "#014636"
    ]
  },
  PuBu: {
    3: ["#ece7f2", "#a6bddb", "#2b8cbe"],
    4: ["#f1eef6", "#bdc9e1", "#74a9cf", "#0570b0"],
    5: ["#f1eef6", "#bdc9e1", "#74a9cf", "#2b8cbe", "#045a8d"],
    6: ["#f1eef6", "#d0d1e6", "#a6bddb", "#74a9cf", "#2b8cbe", "#045a8d"],
    7: [
      "#f1eef6",
      "#d0d1e6",
      "#a6bddb",
      "#74a9cf",
      "#3690c0",
      "#0570b0",
      "#034e7b"
    ],
    8: [
      "#fff7fb",
      "#ece7f2",
      "#d0d1e6",
      "#a6bddb",
      "#74a9cf",
      "#3690c0",
      "#0570b0",
      "#034e7b"
    ],
    9: [
      "#fff7fb",
      "#ece7f2",
      "#d0d1e6",
      "#a6bddb",
      "#74a9cf",
      "#3690c0",
      "#0570b0",
      "#045a8d",
      "#023858"
    ]
  },
  BuPu: {
    3: ["#e0ecf4", "#9ebcda", "#8856a7"],
    4: ["#edf8fb", "#b3cde3", "#8c96c6", "#88419d"],
    5: ["#edf8fb", "#b3cde3", "#8c96c6", "#8856a7", "#810f7c"],
    6: ["#edf8fb", "#bfd3e6", "#9ebcda", "#8c96c6", "#8856a7", "#810f7c"],
    7: [
      "#edf8fb",
      "#bfd3e6",
      "#9ebcda",
      "#8c96c6",
      "#8c6bb1",
      "#88419d",
      "#6e016b"
    ],
    8: [
      "#f7fcfd",
      "#e0ecf4",
      "#bfd3e6",
      "#9ebcda",
      "#8c96c6",
      "#8c6bb1",
      "#88419d",
      "#6e016b"
    ],
    9: [
      "#f7fcfd",
      "#e0ecf4",
      "#bfd3e6",
      "#9ebcda",
      "#8c96c6",
      "#8c6bb1",
      "#88419d",
      "#810f7c",
      "#4d004b"
    ]
  },
  RdPu: {
    3: ["#fde0dd", "#fa9fb5", "#c51b8a"],
    4: ["#feebe2", "#fbb4b9", "#f768a1", "#ae017e"],
    5: ["#feebe2", "#fbb4b9", "#f768a1", "#c51b8a", "#7a0177"],
    6: ["#feebe2", "#fcc5c0", "#fa9fb5", "#f768a1", "#c51b8a", "#7a0177"],
    7: [
      "#feebe2",
      "#fcc5c0",
      "#fa9fb5",
      "#f768a1",
      "#dd3497",
      "#ae017e",
      "#7a0177"
    ],
    8: [
      "#fff7f3",
      "#fde0dd",
      "#fcc5c0",
      "#fa9fb5",
      "#f768a1",
      "#dd3497",
      "#ae017e",
      "#7a0177"
    ],
    9: [
      "#fff7f3",
      "#fde0dd",
      "#fcc5c0",
      "#fa9fb5",
      "#f768a1",
      "#dd3497",
      "#ae017e",
      "#7a0177",
      "#49006a"
    ]
  },
  PuRd: {
    3: ["#e7e1ef", "#c994c7", "#dd1c77"],
    4: ["#f1eef6", "#d7b5d8", "#df65b0", "#ce1256"],
    5: ["#f1eef6", "#d7b5d8", "#df65b0", "#dd1c77", "#980043"],
    6: ["#f1eef6", "#d4b9da", "#c994c7", "#df65b0", "#dd1c77", "#980043"],
    7: [
      "#f1eef6",
      "#d4b9da",
      "#c994c7",
      "#df65b0",
      "#e7298a",
      "#ce1256",
      "#91003f"
    ],
    8: [
      "#f7f4f9",
      "#e7e1ef",
      "#d4b9da",
      "#c994c7",
      "#df65b0",
      "#e7298a",
      "#ce1256",
      "#91003f"
    ],
    9: [
      "#f7f4f9",
      "#e7e1ef",
      "#d4b9da",
      "#c994c7",
      "#df65b0",
      "#e7298a",
      "#ce1256",
      "#980043",
      "#67001f"
    ]
  },
  OrRd: {
    3: ["#fee8c8", "#fdbb84", "#e34a33"],
    4: ["#fef0d9", "#fdcc8a", "#fc8d59", "#d7301f"],
    5: ["#fef0d9", "#fdcc8a", "#fc8d59", "#e34a33", "#b30000"],
    6: ["#fef0d9", "#fdd49e", "#fdbb84", "#fc8d59", "#e34a33", "#b30000"],
    7: [
      "#fef0d9",
      "#fdd49e",
      "#fdbb84",
      "#fc8d59",
      "#ef6548",
      "#d7301f",
      "#990000"
    ],
    8: [
      "#fff7ec",
      "#fee8c8",
      "#fdd49e",
      "#fdbb84",
      "#fc8d59",
      "#ef6548",
      "#d7301f",
      "#990000"
    ],
    9: [
      "#fff7ec",
      "#fee8c8",
      "#fdd49e",
      "#fdbb84",
      "#fc8d59",
      "#ef6548",
      "#d7301f",
      "#b30000",
      "#7f0000"
    ]
  },
  YlOrRd: {
    3: ["#ffeda0", "#feb24c", "#f03b20"],
    4: ["#ffffb2", "#fecc5c", "#fd8d3c", "#e31a1c"],
    5: ["#ffffb2", "#fecc5c", "#fd8d3c", "#f03b20", "#bd0026"],
    6: ["#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#f03b20", "#bd0026"],
    7: [
      "#ffffb2",
      "#fed976",
      "#feb24c",
      "#fd8d3c",
      "#fc4e2a",
      "#e31a1c",
      "#b10026"
    ],
    8: [
      "#ffffcc",
      "#ffeda0",
      "#fed976",
      "#feb24c",
      "#fd8d3c",
      "#fc4e2a",
      "#e31a1c",
      "#b10026"
    ],
    9: [
      "#ffffcc",
      "#ffeda0",
      "#fed976",
      "#feb24c",
      "#fd8d3c",
      "#fc4e2a",
      "#e31a1c",
      "#bd0026",
      "#800026"
    ]
  },
  YlOrBr: {
    3: ["#fff7bc", "#fec44f", "#d95f0e"],
    4: ["#ffffd4", "#fed98e", "#fe9929", "#cc4c02"],
    5: ["#ffffd4", "#fed98e", "#fe9929", "#d95f0e", "#993404"],
    6: ["#ffffd4", "#fee391", "#fec44f", "#fe9929", "#d95f0e", "#993404"],
    7: [
      "#ffffd4",
      "#fee391",
      "#fec44f",
      "#fe9929",
      "#ec7014",
      "#cc4c02",
      "#8c2d04"
    ],
    8: [
      "#ffffe5",
      "#fff7bc",
      "#fee391",
      "#fec44f",
      "#fe9929",
      "#ec7014",
      "#cc4c02",
      "#8c2d04"
    ],
    9: [
      "#ffffe5",
      "#fff7bc",
      "#fee391",
      "#fec44f",
      "#fe9929",
      "#ec7014",
      "#cc4c02",
      "#993404",
      "#662506"
    ]
  },
  Purples: {
    3: ["#efedf5", "#bcbddc", "#756bb1"],
    4: ["#f2f0f7", "#cbc9e2", "#9e9ac8", "#6a51a3"],
    5: ["#f2f0f7", "#cbc9e2", "#9e9ac8", "#756bb1", "#54278f"],
    6: ["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"],
    7: [
      "#f2f0f7",
      "#dadaeb",
      "#bcbddc",
      "#9e9ac8",
      "#807dba",
      "#6a51a3",
      "#4a1486"
    ],
    8: [
      "#fcfbfd",
      "#efedf5",
      "#dadaeb",
      "#bcbddc",
      "#9e9ac8",
      "#807dba",
      "#6a51a3",
      "#4a1486"
    ],
    9: [
      "#fcfbfd",
      "#efedf5",
      "#dadaeb",
      "#bcbddc",
      "#9e9ac8",
      "#807dba",
      "#6a51a3",
      "#54278f",
      "#3f007d"
    ]
  },
  Blues: {
    3: ["#deebf7", "#9ecae1", "#3182bd"],
    4: ["#eff3ff", "#bdd7e7", "#6baed6", "#2171b5"],
    5: ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"],
    6: ["#eff3ff", "#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08519c"],
    7: [
      "#eff3ff",
      "#c6dbef",
      "#9ecae1",
      "#6baed6",
      "#4292c6",
      "#2171b5",
      "#084594"
    ],
    8: [
      "#f7fbff",
      "#deebf7",
      "#c6dbef",
      "#9ecae1",
      "#6baed6",
      "#4292c6",
      "#2171b5",
      "#084594"
    ],
    9: [
      "#f7fbff",
      "#deebf7",
      "#c6dbef",
      "#9ecae1",
      "#6baed6",
      "#4292c6",
      "#2171b5",
      "#08519c",
      "#08306b"
    ]
  },
  Greens: {
    3: ["#e5f5e0", "#a1d99b", "#31a354"],
    4: ["#edf8e9", "#bae4b3", "#74c476", "#238b45"],
    5: ["#edf8e9", "#bae4b3", "#74c476", "#31a354", "#006d2c"],
    6: ["#edf8e9", "#c7e9c0", "#a1d99b", "#74c476", "#31a354", "#006d2c"],
    7: [
      "#edf8e9",
      "#c7e9c0",
      "#a1d99b",
      "#74c476",
      "#41ab5d",
      "#238b45",
      "#005a32"
    ],
    8: [
      "#f7fcf5",
      "#e5f5e0",
      "#c7e9c0",
      "#a1d99b",
      "#74c476",
      "#41ab5d",
      "#238b45",
      "#005a32"
    ],
    9: [
      "#f7fcf5",
      "#e5f5e0",
      "#c7e9c0",
      "#a1d99b",
      "#74c476",
      "#41ab5d",
      "#238b45",
      "#006d2c",
      "#00441b"
    ]
  },
  Oranges: {
    3: ["#fee6ce", "#fdae6b", "#e6550d"],
    4: ["#feedde", "#fdbe85", "#fd8d3c", "#d94701"],
    5: ["#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#a63603"],
    6: ["#feedde", "#fdd0a2", "#fdae6b", "#fd8d3c", "#e6550d", "#a63603"],
    7: [
      "#feedde",
      "#fdd0a2",
      "#fdae6b",
      "#fd8d3c",
      "#f16913",
      "#d94801",
      "#8c2d04"
    ],
    8: [
      "#fff5eb",
      "#fee6ce",
      "#fdd0a2",
      "#fdae6b",
      "#fd8d3c",
      "#f16913",
      "#d94801",
      "#8c2d04"
    ],
    9: [
      "#fff5eb",
      "#fee6ce",
      "#fdd0a2",
      "#fdae6b",
      "#fd8d3c",
      "#f16913",
      "#d94801",
      "#a63603",
      "#7f2704"
    ]
  },
  Reds: {
    3: ["#fee0d2", "#fc9272", "#de2d26"],
    4: ["#fee5d9", "#fcae91", "#fb6a4a", "#cb181d"],
    5: ["#fee5d9", "#fcae91", "#fb6a4a", "#de2d26", "#a50f15"],
    6: ["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#de2d26", "#a50f15"],
    7: [
      "#fee5d9",
      "#fcbba1",
      "#fc9272",
      "#fb6a4a",
      "#ef3b2c",
      "#cb181d",
      "#99000d"
    ],
    8: [
      "#fff5f0",
      "#fee0d2",
      "#fcbba1",
      "#fc9272",
      "#fb6a4a",
      "#ef3b2c",
      "#cb181d",
      "#99000d"
    ],
    9: [
      "#fff5f0",
      "#fee0d2",
      "#fcbba1",
      "#fc9272",
      "#fb6a4a",
      "#ef3b2c",
      "#cb181d",
      "#a50f15",
      "#67000d"
    ]
  },
  Greys: {
    3: ["#f0f0f0", "#bdbdbd", "#636363"],
    4: ["#f7f7f7", "#cccccc", "#969696", "#525252"],
    5: ["#f7f7f7", "#cccccc", "#969696", "#636363", "#252525"],
    6: ["#f7f7f7", "#d9d9d9", "#bdbdbd", "#969696", "#636363", "#252525"],
    7: [
      "#f7f7f7",
      "#d9d9d9",
      "#bdbdbd",
      "#969696",
      "#737373",
      "#525252",
      "#252525"
    ],
    8: [
      "#ffffff",
      "#f0f0f0",
      "#d9d9d9",
      "#bdbdbd",
      "#969696",
      "#737373",
      "#525252",
      "#252525"
    ],
    9: [
      "#ffffff",
      "#f0f0f0",
      "#d9d9d9",
      "#bdbdbd",
      "#969696",
      "#737373",
      "#525252",
      "#252525",
      "#000000"
    ]
  },
  PuOr: {
    3: ["#f1a340", "#f7f7f7", "#998ec3"],
    4: ["#e66101", "#fdb863", "#b2abd2", "#5e3c99"],
    5: ["#e66101", "#fdb863", "#f7f7f7", "#b2abd2", "#5e3c99"],
    6: ["#b35806", "#f1a340", "#fee0b6", "#d8daeb", "#998ec3", "#542788"],
    7: [
      "#b35806",
      "#f1a340",
      "#fee0b6",
      "#f7f7f7",
      "#d8daeb",
      "#998ec3",
      "#542788"
    ],
    8: [
      "#b35806",
      "#e08214",
      "#fdb863",
      "#fee0b6",
      "#d8daeb",
      "#b2abd2",
      "#8073ac",
      "#542788"
    ],
    9: [
      "#b35806",
      "#e08214",
      "#fdb863",
      "#fee0b6",
      "#f7f7f7",
      "#d8daeb",
      "#b2abd2",
      "#8073ac",
      "#542788"
    ],
    10: [
      "#7f3b08",
      "#b35806",
      "#e08214",
      "#fdb863",
      "#fee0b6",
      "#d8daeb",
      "#b2abd2",
      "#8073ac",
      "#542788",
      "#2d004b"
    ],
    11: [
      "#7f3b08",
      "#b35806",
      "#e08214",
      "#fdb863",
      "#fee0b6",
      "#f7f7f7",
      "#d8daeb",
      "#b2abd2",
      "#8073ac",
      "#542788",
      "#2d004b"
    ]
  },
  BrBG: {
    3: ["#d8b365", "#f5f5f5", "#5ab4ac"],
    4: ["#a6611a", "#dfc27d", "#80cdc1", "#018571"],
    5: ["#a6611a", "#dfc27d", "#f5f5f5", "#80cdc1", "#018571"],
    6: ["#8c510a", "#d8b365", "#f6e8c3", "#c7eae5", "#5ab4ac", "#01665e"],
    7: [
      "#8c510a",
      "#d8b365",
      "#f6e8c3",
      "#f5f5f5",
      "#c7eae5",
      "#5ab4ac",
      "#01665e"
    ],
    8: [
      "#8c510a",
      "#bf812d",
      "#dfc27d",
      "#f6e8c3",
      "#c7eae5",
      "#80cdc1",
      "#35978f",
      "#01665e"
    ],
    9: [
      "#8c510a",
      "#bf812d",
      "#dfc27d",
      "#f6e8c3",
      "#f5f5f5",
      "#c7eae5",
      "#80cdc1",
      "#35978f",
      "#01665e"
    ],
    10: [
      "#543005",
      "#8c510a",
      "#bf812d",
      "#dfc27d",
      "#f6e8c3",
      "#c7eae5",
      "#80cdc1",
      "#35978f",
      "#01665e",
      "#003c30"
    ],
    11: [
      "#543005",
      "#8c510a",
      "#bf812d",
      "#dfc27d",
      "#f6e8c3",
      "#f5f5f5",
      "#c7eae5",
      "#80cdc1",
      "#35978f",
      "#01665e",
      "#003c30"
    ]
  },
  PRGn: {
    3: ["#af8dc3", "#f7f7f7", "#7fbf7b"],
    4: ["#7b3294", "#c2a5cf", "#a6dba0", "#008837"],
    5: ["#7b3294", "#c2a5cf", "#f7f7f7", "#a6dba0", "#008837"],
    6: ["#762a83", "#af8dc3", "#e7d4e8", "#d9f0d3", "#7fbf7b", "#1b7837"],
    7: [
      "#762a83",
      "#af8dc3",
      "#e7d4e8",
      "#f7f7f7",
      "#d9f0d3",
      "#7fbf7b",
      "#1b7837"
    ],
    8: [
      "#762a83",
      "#9970ab",
      "#c2a5cf",
      "#e7d4e8",
      "#d9f0d3",
      "#a6dba0",
      "#5aae61",
      "#1b7837"
    ],
    9: [
      "#762a83",
      "#9970ab",
      "#c2a5cf",
      "#e7d4e8",
      "#f7f7f7",
      "#d9f0d3",
      "#a6dba0",
      "#5aae61",
      "#1b7837"
    ],
    10: [
      "#40004b",
      "#762a83",
      "#9970ab",
      "#c2a5cf",
      "#e7d4e8",
      "#d9f0d3",
      "#a6dba0",
      "#5aae61",
      "#1b7837",
      "#00441b"
    ],
    11: [
      "#40004b",
      "#762a83",
      "#9970ab",
      "#c2a5cf",
      "#e7d4e8",
      "#f7f7f7",
      "#d9f0d3",
      "#a6dba0",
      "#5aae61",
      "#1b7837",
      "#00441b"
    ]
  },
  PiYG: {
    3: ["#e9a3c9", "#f7f7f7", "#a1d76a"],
    4: ["#d01c8b", "#f1b6da", "#b8e186", "#4dac26"],
    5: ["#d01c8b", "#f1b6da", "#f7f7f7", "#b8e186", "#4dac26"],
    6: ["#c51b7d", "#e9a3c9", "#fde0ef", "#e6f5d0", "#a1d76a", "#4d9221"],
    7: [
      "#c51b7d",
      "#e9a3c9",
      "#fde0ef",
      "#f7f7f7",
      "#e6f5d0",
      "#a1d76a",
      "#4d9221"
    ],
    8: [
      "#c51b7d",
      "#de77ae",
      "#f1b6da",
      "#fde0ef",
      "#e6f5d0",
      "#b8e186",
      "#7fbc41",
      "#4d9221"
    ],
    9: [
      "#c51b7d",
      "#de77ae",
      "#f1b6da",
      "#fde0ef",
      "#f7f7f7",
      "#e6f5d0",
      "#b8e186",
      "#7fbc41",
      "#4d9221"
    ],
    10: [
      "#8e0152",
      "#c51b7d",
      "#de77ae",
      "#f1b6da",
      "#fde0ef",
      "#e6f5d0",
      "#b8e186",
      "#7fbc41",
      "#4d9221",
      "#276419"
    ],
    11: [
      "#8e0152",
      "#c51b7d",
      "#de77ae",
      "#f1b6da",
      "#fde0ef",
      "#f7f7f7",
      "#e6f5d0",
      "#b8e186",
      "#7fbc41",
      "#4d9221",
      "#276419"
    ]
  },
  phyHeatmap: {
    4: ["#5879A3", "#E7CA60", "#E59244", "#D16051" ]
  },
  RdBu: {
    3: ["#ef8a62", "#f7f7f7", "#67a9cf"],
    4: ["#ca0020", "#f4a582", "#92c5de", "#0571b0"],
    5: ["#ca0020", "#f4a582", "#f7f7f7", "#92c5de", "#0571b0"],
    6: ["#b2182b", "#ef8a62", "#fddbc7", "#d1e5f0", "#67a9cf", "#2166ac"],
    7: [
      "#b2182b",
      "#ef8a62",
      "#fddbc7",
      "#f7f7f7",
      "#d1e5f0",
      "#67a9cf",
      "#2166ac"
    ],
    8: [
      "#b2182b",
      "#d6604d",
      "#f4a582",
      "#fddbc7",
      "#d1e5f0",
      "#92c5de",
      "#4393c3",
      "#2166ac"
    ],
    9: [
      "#b2182b",
      "#d6604d",
      "#f4a582",
      "#fddbc7",
      "#f7f7f7",
      "#d1e5f0",
      "#92c5de",
      "#4393c3",
      "#2166ac"
    ],
    10: [
      "#67001f",
      "#b2182b",
      "#d6604d",
      "#f4a582",
      "#fddbc7",
      "#d1e5f0",
      "#92c5de",
      "#4393c3",
      "#2166ac",
      "#053061"
    ],
    11: [
      "#67001f",
      "#b2182b",
      "#d6604d",
      "#f4a582",
      "#fddbc7",
      "#f7f7f7",
      "#d1e5f0",
      "#92c5de",
      "#4393c3",
      "#2166ac",
      "#053061"
    ]
  },
  RdGy: {
    3: ["#ef8a62", "#ffffff", "#999999"],
    4: ["#ca0020", "#f4a582", "#bababa", "#404040"],
    5: ["#ca0020", "#f4a582", "#ffffff", "#bababa", "#404040"],
    6: ["#b2182b", "#ef8a62", "#fddbc7", "#e0e0e0", "#999999", "#4d4d4d"],
    7: [
      "#b2182b",
      "#ef8a62",
      "#fddbc7",
      "#ffffff",
      "#e0e0e0",
      "#999999",
      "#4d4d4d"
    ],
    8: [
      "#b2182b",
      "#d6604d",
      "#f4a582",
      "#fddbc7",
      "#e0e0e0",
      "#bababa",
      "#878787",
      "#4d4d4d"
    ],
    9: [
      "#b2182b",
      "#d6604d",
      "#f4a582",
      "#fddbc7",
      "#ffffff",
      "#e0e0e0",
      "#bababa",
      "#878787",
      "#4d4d4d"
    ],
    10: [
      "#67001f",
      "#b2182b",
      "#d6604d",
      "#f4a582",
      "#fddbc7",
      "#e0e0e0",
      "#bababa",
      "#878787",
      "#4d4d4d",
      "#1a1a1a"
    ],
    11: [
      "#67001f",
      "#b2182b",
      "#d6604d",
      "#f4a582",
      "#fddbc7",
      "#ffffff",
      "#e0e0e0",
      "#bababa",
      "#878787",
      "#4d4d4d",
      "#1a1a1a"
    ]
  },
  RdYlBu: {
    3: ["#fc8d59", "#ffffbf", "#91bfdb"],
    4: ["#d7191c", "#fdae61", "#abd9e9", "#2c7bb6"],
    5: ["#d7191c", "#fdae61", "#ffffbf", "#abd9e9", "#2c7bb6"],
    6: ["#d73027", "#fc8d59", "#fee090", "#e0f3f8", "#91bfdb", "#4575b4"],
    7: [
      "#d73027",
      "#fc8d59",
      "#fee090",
      "#ffffbf",
      "#e0f3f8",
      "#91bfdb",
      "#4575b4"
    ],
    8: [
      "#d73027",
      "#f46d43",
      "#fdae61",
      "#fee090",
      "#e0f3f8",
      "#abd9e9",
      "#74add1",
      "#4575b4"
    ],
    9: [
      "#d73027",
      "#f46d43",
      "#fdae61",
      "#fee090",
      "#ffffbf",
      "#e0f3f8",
      "#abd9e9",
      "#74add1",
      "#4575b4"
    ],
    10: [
      "#a50026",
      "#d73027",
      "#f46d43",
      "#fdae61",
      "#fee090",
      "#e0f3f8",
      "#abd9e9",
      "#74add1",
      "#4575b4",
      "#313695"
    ],
    11: [
      "#a50026",
      "#d73027",
      "#f46d43",
      "#fdae61",
      "#fee090",
      "#ffffbf",
      "#e0f3f8",
      "#abd9e9",
      "#74add1",
      "#4575b4",
      "#313695"
    ]
  },
  Spectral: {
    3: ["#fc8d59", "#ffffbf", "#99d594"],
    4: ["#d7191c", "#fdae61", "#abdda4", "#2b83ba"],
    5: ["#d7191c", "#fdae61", "#ffffbf", "#abdda4", "#2b83ba"],
    6: ["#d53e4f", "#fc8d59", "#fee08b", "#e6f598", "#99d594", "#3288bd"],
    7: [
      "#d53e4f",
      "#fc8d59",
      "#fee08b",
      "#ffffbf",
      "#e6f598",
      "#99d594",
      "#3288bd"
    ],
    8: [
      "#d53e4f",
      "#f46d43",
      "#fdae61",
      "#fee08b",
      "#e6f598",
      "#abdda4",
      "#66c2a5",
      "#3288bd"
    ],
    9: [
      "#d53e4f",
      "#f46d43",
      "#fdae61",
      "#fee08b",
      "#ffffbf",
      "#e6f598",
      "#abdda4",
      "#66c2a5",
      "#3288bd"
    ],
    10: [
      "#9e0142",
      "#d53e4f",
      "#f46d43",
      "#fdae61",
      "#fee08b",
      "#e6f598",
      "#abdda4",
      "#66c2a5",
      "#3288bd",
      "#5e4fa2"
    ],
    11: [
      "#9e0142",
      "#d53e4f",
      "#f46d43",
      "#fdae61",
      "#fee08b",
      "#ffffbf",
      "#e6f598",
      "#abdda4",
      "#66c2a5",
      "#3288bd",
      "#5e4fa2"
    ]
  },
  SpectralR: {
    9: [
      "#3288bd",
      "#66c2a5",
      "#abdda4",
      "#e6f598",
      "#ffffbf",
      "#fee08b",
      "#fdae61",
      "#f46d43",
      "#d53e4f"
    ],
    10: [
      "#3288bd", "#5e4fa2", "#66c2a5", "#abdda4", "#e6f598", "#fee08b", "#fdae61", "#f46d43", "#d53e4f", "#9e0142"
    ],
    11: [
      "#3288bd", "#5e4fa2", "#66c2a5", "#abdda4", "#e6f598", "#ffffbf", "#fee08b", "#fdae61", "#f46d43", "#d53e4f", "#9e0142"
    ]
  },
  RdYlGn: {
    3: ["#fc8d59", "#ffffbf", "#91cf60"],
    4: ["#d7191c", "#fdae61", "#a6d96a", "#1a9641"],
    5: ["#d7191c", "#fdae61", "#ffffbf", "#a6d96a", "#1a9641"],
    6: ["#d73027", "#fc8d59", "#fee08b", "#d9ef8b", "#91cf60", "#1a9850"],
    7: [
      "#d73027",
      "#fc8d59",
      "#fee08b",
      "#ffffbf",
      "#d9ef8b",
      "#91cf60",
      "#1a9850"
    ],
    8: [
      "#d73027",
      "#f46d43",
      "#fdae61",
      "#fee08b",
      "#d9ef8b",
      "#a6d96a",
      "#66bd63",
      "#1a9850"
    ],
    9: [
      "#d73027",
      "#f46d43",
      "#fdae61",
      "#fee08b",
      "#ffffbf",
      "#d9ef8b",
      "#a6d96a",
      "#66bd63",
      "#1a9850"
    ],
    10: [
      "#a50026",
      "#d73027",
      "#f46d43",
      "#fdae61",
      "#fee08b",
      "#d9ef8b",
      "#a6d96a",
      "#66bd63",
      "#1a9850",
      "#006837"
    ],
    11: [
      "#a50026",
      "#d73027",
      "#f46d43",
      "#fdae61",
      "#fee08b",
      "#ffffbf",
      "#d9ef8b",
      "#a6d96a",
      "#66bd63",
      "#1a9850",
      "#006837"
    ]
  },
  Accent: {
    3: ["#7fc97f", "#beaed4", "#fdc086"],
    4: ["#7fc97f", "#beaed4", "#fdc086", "#ffff99"],
    5: ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0"],
    6: ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0", "#f0027f"],
    7: [
      "#7fc97f",
      "#beaed4",
      "#fdc086",
      "#ffff99",
      "#386cb0",
      "#f0027f",
      "#bf5b17"
    ],
    8: [
      "#7fc97f",
      "#beaed4",
      "#fdc086",
      "#ffff99",
      "#386cb0",
      "#f0027f",
      "#bf5b17",
      "#666666"
    ]
  },
  Dark2: {
    3: ["#1b9e77", "#d95f02", "#7570b3"],
    4: ["#1b9e77", "#d95f02", "#7570b3", "#e7298a"],
    5: ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e"],
    6: ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02"],
    7: [
      "#1b9e77",
      "#d95f02",
      "#7570b3",
      "#e7298a",
      "#66a61e",
      "#e6ab02",
      "#a6761d"
    ],
    8: [
      "#1b9e77",
      "#d95f02",
      "#7570b3",
      "#e7298a",
      "#66a61e",
      "#e6ab02",
      "#a6761d",
      "#666666"
    ]
  },
  Paired: {
    3: ["#a6cee3", "#1f78b4", "#b2df8a"],
    4: ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c"],
    5: ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99"],
    6: ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c"],
    7: [
      "#a6cee3",
      "#1f78b4",
      "#b2df8a",
      "#33a02c",
      "#fb9a99",
      "#e31a1c",
      "#fdbf6f"
    ],
    8: [
      "#a6cee3",
      "#1f78b4",
      "#b2df8a",
      "#33a02c",
      "#fb9a99",
      "#e31a1c",
      "#fdbf6f",
      "#ff7f00"
    ],
    9: [
      "#a6cee3",
      "#1f78b4",
      "#b2df8a",
      "#33a02c",
      "#fb9a99",
      "#e31a1c",
      "#fdbf6f",
      "#ff7f00",
      "#cab2d6"
    ],
    10: [
      "#a6cee3",
      "#1f78b4",
      "#b2df8a",
      "#33a02c",
      "#fb9a99",
      "#e31a1c",
      "#fdbf6f",
      "#ff7f00",
      "#cab2d6",
      "#6a3d9a"
    ],
    11: [
      "#a6cee3",
      "#1f78b4",
      "#b2df8a",
      "#33a02c",
      "#fb9a99",
      "#e31a1c",
      "#fdbf6f",
      "#ff7f00",
      "#cab2d6",
      "#6a3d9a",
      "#ffff99"
    ],
    12: [
      "#a6cee3",
      "#1f78b4",
      "#b2df8a",
      "#33a02c",
      "#fb9a99",
      "#e31a1c",
      "#fdbf6f",
      "#ff7f00",
      "#cab2d6",
      "#6a3d9a",
      "#ffff99",
      "#b15928"
    ]
  },
  Pastel1: {
    3: ["#fbb4ae", "#b3cde3", "#ccebc5"],
    4: ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4"],
    5: ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6"],
    6: ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc"],
    7: [
      "#fbb4ae",
      "#b3cde3",
      "#ccebc5",
      "#decbe4",
      "#fed9a6",
      "#ffffcc",
      "#e5d8bd"
    ],
    8: [
      "#fbb4ae",
      "#b3cde3",
      "#ccebc5",
      "#decbe4",
      "#fed9a6",
      "#ffffcc",
      "#e5d8bd",
      "#fddaec"
    ],
    9: [
      "#fbb4ae",
      "#b3cde3",
      "#ccebc5",
      "#decbe4",
      "#fed9a6",
      "#ffffcc",
      "#e5d8bd",
      "#fddaec",
      "#f2f2f2"
    ]
  },
  Pastel2: {
    3: ["#b3e2cd", "#fdcdac", "#cbd5e8"],
    4: ["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4"],
    5: ["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4", "#e6f5c9"],
    6: ["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4", "#e6f5c9", "#fff2ae"],
    7: [
      "#b3e2cd",
      "#fdcdac",
      "#cbd5e8",
      "#f4cae4",
      "#e6f5c9",
      "#fff2ae",
      "#f1e2cc"
    ],
    8: [
      "#b3e2cd",
      "#fdcdac",
      "#cbd5e8",
      "#f4cae4",
      "#e6f5c9",
      "#fff2ae",
      "#f1e2cc",
      "#cccccc"
    ]
  },
  Set1: {
    3: ["#e41a1c", "#377eb8", "#4daf4a"],
    4: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3"],
    5: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"],
    6: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33"],
    7: [
      "#e41a1c",
      "#377eb8",
      "#4daf4a",
      "#984ea3",
      "#ff7f00",
      "#ffff33",
      "#a65628"
    ],
    8: [
      "#e41a1c",
      "#377eb8",
      "#4daf4a",
      "#984ea3",
      "#ff7f00",
      "#ffff33",
      "#a65628",
      "#f781bf"
    ],
    9: [
      "#e41a1c",
      "#377eb8",
      "#4daf4a",
      "#984ea3",
      "#ff7f00",
      "#ffff33",
      "#a65628",
      "#f781bf",
      "#999999"
    ]
  },
  Set2: {
    3: ["#66c2a5", "#fc8d62", "#8da0cb"],
    4: ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3"],
    5: ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854"],
    6: ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f"],
    7: [
      "#66c2a5",
      "#fc8d62",
      "#8da0cb",
      "#e78ac3",
      "#a6d854",
      "#ffd92f",
      "#e5c494"
    ],
    8: [
      "#66c2a5",
      "#fc8d62",
      "#8da0cb",
      "#e78ac3",
      "#a6d854",
      "#ffd92f",
      "#e5c494",
      "#b3b3b3"
    ]
  },
  Set3: {
    3: ["#8dd3c7", "#ffffb3", "#bebada"],
    4: ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072"],
    5: ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3"],
    6: ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462"],
    7: [
      "#8dd3c7",
      "#ffffb3",
      "#bebada",
      "#fb8072",
      "#80b1d3",
      "#fdb462",
      "#b3de69"
    ],
    8: [
      "#8dd3c7",
      "#ffffb3",
      "#bebada",
      "#fb8072",
      "#80b1d3",
      "#fdb462",
      "#b3de69",
      "#fccde5"
    ],
    9: [
      "#8dd3c7",
      "#ffffb3",
      "#bebada",
      "#fb8072",
      "#80b1d3",
      "#fdb462",
      "#b3de69",
      "#fccde5",
      "#d9d9d9"
    ],
    10: [
      "#8dd3c7",
      "#ffffb3",
      "#bebada",
      "#fb8072",
      "#80b1d3",
      "#fdb462",
      "#b3de69",
      "#fccde5",
      "#d9d9d9",
      "#bc80bd"
    ],
    11: [
      "#8dd3c7",
      "#ffffb3",
      "#bebada",
      "#fb8072",
      "#80b1d3",
      "#fdb462",
      "#b3de69",
      "#fccde5",
      "#d9d9d9",
      "#bc80bd",
      "#ccebc5"
    ],
    12: [
      "#8dd3c7",
      "#ffffb3",
      "#bebada",
      "#fb8072",
      "#80b1d3",
      "#fdb462",
      "#b3de69",
      "#fccde5",
      "#d9d9d9",
      "#bc80bd",
      "#ccebc5",
      "#ffed6f"
    ]
  }
};

/*!
 DataTables 1.10.13
 ©2008-2016 SpryMedia Ltd - datatables.net/license
*/
(function (h) {
  "function" === typeof define && define.amd
    ? define(["jquery"], function (E) {
      return h(E, window, document);
    })
    : "object" === typeof exports
      ? (module.exports = function (E, H) {
        E || (E = window);
        H ||
          (H =
            "undefined" !== typeof window
              ? require("jquery")
              : require("jquery")(E));
        return h(H, E, E.document);
      })
      : h(jQuery, window, document);
})(function (h, E, H, k) {
  function Y(a) {
    var b,
      c,
      d = {};
    h.each(a, function (e) {
      if (
        (b = e.match(/^([^A-Z]+?)([A-Z])/)) &&
        -1 !== "a aa ai ao as b fn i m o s ".indexOf(b[1] + " ")
      )
        (c = e.replace(b[0], b[2].toLowerCase())),
          (d[c] = e),
          "o" === b[1] && Y(a[e]);
    });
    a._hungarianMap = d;
  }
  function J(a, b, c) {
    a._hungarianMap || Y(a);
    var d;
    h.each(b, function (e) {
      d = a._hungarianMap[e];
      if (d !== k && (c || b[d] === k))
        "o" === d.charAt(0)
          ? (b[d] || (b[d] = {}), h.extend(!0, b[d], b[e]), J(a[d], b[d], c))
          : (b[d] = b[e]);
    });
  }
  function Fa(a) {
    var b = m.defaults.oLanguage,
      c = a.sZeroRecords;
    !a.sEmptyTable &&
      c &&
      "No data available in table" === b.sEmptyTable &&
      F(a, a, "sZeroRecords", "sEmptyTable");
    !a.sLoadingRecords &&
      c &&
      "Loading..." === b.sLoadingRecords &&
      F(a, a, "sZeroRecords", "sLoadingRecords");
    a.sInfoThousands && (a.sThousands = a.sInfoThousands);
    (a = a.sDecimal) && fb(a);
  }
  function gb(a) {
    A(a, "ordering", "bSort");
    A(a, "orderMulti", "bSortMulti");
    A(a, "orderClasses", "bSortClasses");
    A(a, "orderCellsTop", "bSortCellsTop");
    A(a, "order", "aaSorting");
    A(a, "orderFixed", "aaSortingFixed");
    A(a, "paging", "bPaginate");
    A(a, "pagingType", "sPaginationType");
    A(a, "pageLength", "iDisplayLength");
    A(a, "searching", "bFilter");
    "boolean" === typeof a.sScrollX && (a.sScrollX = a.sScrollX ? "100%" : "");
    "boolean" === typeof a.scrollX && (a.scrollX = a.scrollX ? "100%" : "");
    if ((a = a.aoSearchCols))
      for (var b = 0, c = a.length; b < c; b++)
        a[b] && J(m.models.oSearch, a[b]);
  }
  function hb(a) {
    A(a, "orderable", "bSortable");
    A(a, "orderData", "aDataSort");
    A(a, "orderSequence", "asSorting");
    A(a, "orderDataType", "sortDataType");
    var b = a.aDataSort;
    b && !h.isArray(b) && (a.aDataSort = [b]);
  }
  function ib(a) {
    if (!m.__browser) {
      var b = {};
      m.__browser = b;
      var c = h("<div/>")
        .css({
          position: "fixed",
          top: 0,
          left: -1 * h(E).scrollLeft(),
          height: 1,
          width: 1,
          overflow: "hidden"
        })
        .append(
          h("<div/>")
            .css({
              position: "absolute",
              top: 1,
              left: 1,
              width: 100,
              overflow: "scroll"
            })
            .append(h("<div/>").css({ width: "100%", height: 10 }))
        )
        .appendTo("body"),
        d = c.children(),
        e = d.children();
      b.barWidth = d[0].offsetWidth - d[0].clientWidth;
      b.bScrollOversize = 100 === e[0].offsetWidth && 100 !== d[0].clientWidth;
      b.bScrollbarLeft = 1 !== Math.round(e.offset().left);
      b.bBounding = c[0].getBoundingClientRect().width ? !0 : !1;
      c.remove();
    }
    h.extend(a.oBrowser, m.__browser);
    a.oScroll.iBarWidth = m.__browser.barWidth;
  }
  function jb(a, b, c, d, e, f) {
    var g,
      j = !1;
    c !== k && ((g = c), (j = !0));
    for (; d !== e;)
      a.hasOwnProperty(d) &&
        ((g = j ? b(g, a[d], d, a) : a[d]), (j = !0), (d += f));
    return g;
  }
  function Ga(a, b) {
    var c = m.defaults.column,
      d = a.aoColumns.length,
      c = h.extend({}, m.models.oColumn, c, {
        nTh: b ? b : H.createElement("th"),
        sTitle: c.sTitle ? c.sTitle : b ? b.innerHTML : "",
        aDataSort: c.aDataSort ? c.aDataSort : [d],
        mData: c.mData ? c.mData : d,
        idx: d
      });
    a.aoColumns.push(c);
    c = a.aoPreSearchCols;
    c[d] = h.extend({}, m.models.oSearch, c[d]);
    la(a, d, h(b).data());
  }
  function la(a, b, c) {
    var b = a.aoColumns[b],
      d = a.oClasses,
      e = h(b.nTh);
    if (!b.sWidthOrig) {
      b.sWidthOrig = e.attr("width") || null;
      var f = (e.attr("style") || "").match(/width:\s*(\d+[pxem%]+)/);
      f && (b.sWidthOrig = f[1]);
    }
    c !== k &&
      null !== c &&
      (hb(c),
        J(m.defaults.column, c),
        c.mDataProp !== k && !c.mData && (c.mData = c.mDataProp),
        c.sType && (b._sManualType = c.sType),
        c.className && !c.sClass && (c.sClass = c.className),
        h.extend(b, c),
        F(b, c, "sWidth", "sWidthOrig"),
        c.iDataSort !== k && (b.aDataSort = [c.iDataSort]),
        F(b, c, "aDataSort"));
    var g = b.mData,
      j = R(g),
      i = b.mRender ? R(b.mRender) : null,
      c = function (a) {
        return "string" === typeof a && -1 !== a.indexOf("@");
      };
    b._bAttrSrc = h.isPlainObject(g) && (c(g.sort) || c(g.type) || c(g.filter));
    b._setter = null;
    b.fnGetData = function (a, b, c) {
      var d = j(a, b, k, c);
      return i && b ? i(d, b, a, c) : d;
    };
    b.fnSetData = function (a, b, c) {
      return S(g)(a, b, c);
    };
    "number" !== typeof g && (a._rowReadObject = !0);
    a.oFeatures.bSort || ((b.bSortable = !1), e.addClass(d.sSortableNone));
    a = -1 !== h.inArray("asc", b.asSorting);
    c = -1 !== h.inArray("desc", b.asSorting);
    !b.bSortable || (!a && !c)
      ? ((b.sSortingClass = d.sSortableNone), (b.sSortingClassJUI = ""))
      : a && !c
        ? ((b.sSortingClass = d.sSortableAsc),
          (b.sSortingClassJUI = d.sSortJUIAscAllowed))
        : !a && c
          ? ((b.sSortingClass = d.sSortableDesc),
            (b.sSortingClassJUI = d.sSortJUIDescAllowed))
          : ((b.sSortingClass = d.sSortable), (b.sSortingClassJUI = d.sSortJUI));
  }
  function Z(a) {
    if (!1 !== a.oFeatures.bAutoWidth) {
      var b = a.aoColumns;
      Ha(a);
      for (var c = 0, d = b.length; c < d; c++)
        b[c].nTh.style.width = b[c].sWidth;
    }
    b = a.oScroll;
    ("" !== b.sY || "" !== b.sX) && ma(a);
    s(a, null, "column-sizing", [a]);
  }
  function $(a, b) {
    var c = na(a, "bVisible");
    return "number" === typeof c[b] ? c[b] : null;
  }
  function aa(a, b) {
    var c = na(a, "bVisible"),
      c = h.inArray(b, c);
    return -1 !== c ? c : null;
  }
  function ba(a) {
    var b = 0;
    h.each(a.aoColumns, function (a, d) {
      d.bVisible && "none" !== h(d.nTh).css("display") && b++;
    });
    return b;
  }
  function na(a, b) {
    var c = [];
    h.map(a.aoColumns, function (a, e) {
      a[b] && c.push(e);
    });
    return c;
  }
  function Ia(a) {
    var b = a.aoColumns,
      c = a.aoData,
      d = m.ext.type.detect,
      e,
      f,
      g,
      j,
      i,
      h,
      l,
      q,
      r;
    e = 0;
    for (f = b.length; e < f; e++)
      if (((l = b[e]), (r = []), !l.sType && l._sManualType))
        l.sType = l._sManualType;
      else if (!l.sType) {
        g = 0;
        for (j = d.length; g < j; g++) {
          i = 0;
          for (h = c.length; i < h; i++) {
            r[i] === k && (r[i] = B(a, i, e, "type"));
            q = d[g](r[i], a);
            if (!q && g !== d.length - 1) break;
            if ("html" === q) break;
          }
          if (q) {
            l.sType = q;
            break;
          }
        }
        l.sType || (l.sType = "string");
      }
  }
  function kb(a, b, c, d) {
    var e,
      f,
      g,
      j,
      i,
      n,
      l = a.aoColumns;
    if (b)
      for (e = b.length - 1; 0 <= e; e--) {
        n = b[e];
        var q = n.targets !== k ? n.targets : n.aTargets;
        h.isArray(q) || (q = [q]);
        f = 0;
        for (g = q.length; f < g; f++)
          if ("number" === typeof q[f] && 0 <= q[f]) {
            for (; l.length <= q[f];) Ga(a);
            d(q[f], n);
          } else if ("number" === typeof q[f] && 0 > q[f])
            d(l.length + q[f], n);
          else if ("string" === typeof q[f]) {
            j = 0;
            for (i = l.length; j < i; j++)
              ("_all" == q[f] || h(l[j].nTh).hasClass(q[f])) && d(j, n);
          }
      }
    if (c) {
      e = 0;
      for (a = c.length; e < a; e++) d(e, c[e]);
    }
  }
  function N(a, b, c, d) {
    var e = a.aoData.length,
      f = h.extend(!0, {}, m.models.oRow, { src: c ? "dom" : "data", idx: e });
    f._aData = b;
    a.aoData.push(f);
    for (var g = a.aoColumns, j = 0, i = g.length; j < i; j++)
      g[j].sType = null;
    a.aiDisplayMaster.push(e);
    b = a.rowIdFn(b);
    b !== k && (a.aIds[b] = f);
    (c || !a.oFeatures.bDeferRender) && Ja(a, e, c, d);
    return e;
  }
  function oa(a, b) {
    var c;
    b instanceof h || (b = h(b));
    return b.map(function (b, e) {
      c = Ka(a, e);
      return N(a, c.data, e, c.cells);
    });
  }
  function B(a, b, c, d) {
    var e = a.iDraw,
      f = a.aoColumns[c],
      g = a.aoData[b]._aData,
      j = f.sDefaultContent,
      i = f.fnGetData(g, d, { settings: a, row: b, col: c });
    if (i === k)
      return (
        a.iDrawError != e &&
        null === j &&
        (K(
          a,
          0,
          "Requested unknown parameter " +
          ("function" == typeof f.mData
            ? "{function}"
            : "'" + f.mData + "'") +
          " for row " +
          b +
          ", column " +
          c,
          4
        ),
          (a.iDrawError = e)),
        j
      );
    if ((i === g || null === i) && null !== j && d !== k) i = j;
    else if ("function" === typeof i) return i.call(g);
    return null === i && "display" == d ? "" : i;
  }
  function lb(a, b, c, d) {
    a.aoColumns[c].fnSetData(a.aoData[b]._aData, d, {
      settings: a,
      row: b,
      col: c
    });
  }
  function La(a) {
    return h.map(a.match(/(\\.|[^\.])+/g) || [""], function (a) {
      return a.replace(/\\\./g, ".");
    });
  }
  function R(a) {
    if (h.isPlainObject(a)) {
      var b = {};
      h.each(a, function (a, c) {
        c && (b[a] = R(c));
      });
      return function (a, c, f, g) {
        var j = b[c] || b._;
        return j !== k ? j(a, c, f, g) : a;
      };
    }
    if (null === a)
      return function (a) {
        return a;
      };
    if ("function" === typeof a)
      return function (b, c, f, g) {
        return a(b, c, f, g);
      };
    if (
      "string" === typeof a &&
      (-1 !== a.indexOf(".") || -1 !== a.indexOf("[") || -1 !== a.indexOf("("))
    ) {
      var c = function (a, b, f) {
        var g, j;
        if ("" !== f) {
          j = La(f);
          for (var i = 0, n = j.length; i < n; i++) {
            f = j[i].match(ca);
            g = j[i].match(V);
            if (f) {
              j[i] = j[i].replace(ca, "");
              "" !== j[i] && (a = a[j[i]]);
              g = [];
              j.splice(0, i + 1);
              j = j.join(".");
              if (h.isArray(a)) {
                i = 0;
                for (n = a.length; i < n; i++) g.push(c(a[i], b, j));
              }
              a = f[0].substring(1, f[0].length - 1);
              a = "" === a ? g : g.join(a);
              break;
            } else if (g) {
              j[i] = j[i].replace(V, "");
              a = a[j[i]]();
              continue;
            }
            if (null === a || a[j[i]] === k) return k;
            a = a[j[i]];
          }
        }
        return a;
      };
      return function (b, e) {
        return c(b, e, a);
      };
    }
    return function (b) {
      return b[a];
    };
  }
  function S(a) {
    if (h.isPlainObject(a)) return S(a._);
    if (null === a) return function () { };
    if ("function" === typeof a)
      return function (b, d, e) {
        a(b, "set", d, e);
      };
    if (
      "string" === typeof a &&
      (-1 !== a.indexOf(".") || -1 !== a.indexOf("[") || -1 !== a.indexOf("("))
    ) {
      var b = function (a, d, e) {
        var e = La(e),
          f;
        f = e[e.length - 1];
        for (var g, j, i = 0, n = e.length - 1; i < n; i++) {
          g = e[i].match(ca);
          j = e[i].match(V);
          if (g) {
            e[i] = e[i].replace(ca, "");
            a[e[i]] = [];
            f = e.slice();
            f.splice(0, i + 1);
            g = f.join(".");
            if (h.isArray(d)) {
              j = 0;
              for (n = d.length; j < n; j++)
                (f = {}), b(f, d[j], g), a[e[i]].push(f);
            } else a[e[i]] = d;
            return;
          }
          j && ((e[i] = e[i].replace(V, "")), (a = a[e[i]](d)));
          if (null === a[e[i]] || a[e[i]] === k) a[e[i]] = {};
          a = a[e[i]];
        }
        if (f.match(V)) a[f.replace(V, "")](d);
        else a[f.replace(ca, "")] = d;
      };
      return function (c, d) {
        return b(c, d, a);
      };
    }
    return function (b, d) {
      b[a] = d;
    };
  }
  function Ma(a) {
    return D(a.aoData, "_aData");
  }
  function pa(a) {
    a.aoData.length = 0;
    a.aiDisplayMaster.length = 0;
    a.aiDisplay.length = 0;
    a.aIds = {};
  }
  function qa(a, b, c) {
    for (var d = -1, e = 0, f = a.length; e < f; e++)
      a[e] == b ? (d = e) : a[e] > b && a[e]--;
    -1 != d && c === k && a.splice(d, 1);
  }
  function da(a, b, c, d) {
    var e = a.aoData[b],
      f,
      g = function (c, d) {
        for (; c.childNodes.length;) c.removeChild(c.firstChild);
        c.innerHTML = B(a, b, d, "display");
      };
    if ("dom" === c || ((!c || "auto" === c) && "dom" === e.src))
      e._aData = Ka(a, e, d, d === k ? k : e._aData).data;
    else {
      var j = e.anCells;
      if (j)
        if (d !== k) g(j[d], d);
        else {
          c = 0;
          for (f = j.length; c < f; c++) g(j[c], c);
        }
    }
    e._aSortData = null;
    e._aFilterData = null;
    g = a.aoColumns;
    if (d !== k) g[d].sType = null;
    else {
      c = 0;
      for (f = g.length; c < f; c++) g[c].sType = null;
      Na(a, e);
    }
  }
  function Ka(a, b, c, d) {
    var e = [],
      f = b.firstChild,
      g,
      j,
      i = 0,
      n,
      l = a.aoColumns,
      q = a._rowReadObject,
      d = d !== k ? d : q ? {} : [],
      r = function (a, b) {
        if ("string" === typeof a) {
          var c = a.indexOf("@");
          -1 !== c && ((c = a.substring(c + 1)), S(a)(d, b.getAttribute(c)));
        }
      },
      m = function (a) {
        if (c === k || c === i)
          (j = l[i]),
            (n = h.trim(a.innerHTML)),
            j && j._bAttrSrc
              ? (S(j.mData._)(d, n),
                r(j.mData.sort, a),
                r(j.mData.type, a),
                r(j.mData.filter, a))
              : q
                ? (j._setter || (j._setter = S(j.mData)), j._setter(d, n))
                : (d[i] = n);
        i++;
      };
    if (f)
      for (; f;) {
        g = f.nodeName.toUpperCase();
        if ("TD" == g || "TH" == g) m(f), e.push(f);
        f = f.nextSibling;
      }
    else {
      e = b.anCells;
      f = 0;
      for (g = e.length; f < g; f++) m(e[f]);
    }
    if ((b = b.firstChild ? b : b.nTr))
      (b = b.getAttribute("id")) && S(a.rowId)(d, b);
    return { data: d, cells: e };
  }
  function Ja(a, b, c, d) {
    var e = a.aoData[b],
      f = e._aData,
      g = [],
      j,
      i,
      n,
      l,
      q;
    if (null === e.nTr) {
      j = c || H.createElement("tr");
      e.nTr = j;
      e.anCells = g;
      j._DT_RowIndex = b;
      Na(a, e);
      l = 0;
      for (q = a.aoColumns.length; l < q; l++) {
        n = a.aoColumns[l];
        i = c ? d[l] : H.createElement(n.sCellType);
        i._DT_CellIndex = { row: b, column: l };
        g.push(i);
        if (
          (!c || n.mRender || n.mData !== l) &&
          (!h.isPlainObject(n.mData) || n.mData._ !== l + ".display")
        )
          i.innerHTML = B(a, b, l, "display");
        n.sClass && (i.className += " " + n.sClass);
        n.bVisible && !c
          ? j.appendChild(i)
          : !n.bVisible && c && i.parentNode.removeChild(i);
        n.fnCreatedCell &&
          n.fnCreatedCell.call(a.oInstance, i, B(a, b, l), f, b, l);
      }
      s(a, "aoRowCreatedCallback", null, [j, f, b]);
    }
    e.nTr.setAttribute("role", "row");
  }
  function Na(a, b) {
    var c = b.nTr,
      d = b._aData;
    if (c) {
      var e = a.rowIdFn(d);
      e && (c.id = e);
      d.DT_RowClass &&
        ((e = d.DT_RowClass.split(" ")),
          (b.__rowc = b.__rowc ? sa(b.__rowc.concat(e)) : e),
          h(c)
            .removeClass(b.__rowc.join(" "))
            .addClass(d.DT_RowClass));
      d.DT_RowAttr && h(c).attr(d.DT_RowAttr);
      d.DT_RowData && h(c).data(d.DT_RowData);
    }
  }
  function mb(a) {
    var b,
      c,
      d,
      e,
      f,
      g = a.nTHead,
      j = a.nTFoot,
      i = 0 === h("th, td", g).length,
      n = a.oClasses,
      l = a.aoColumns;
    i && (e = h("<tr/>").appendTo(g));
    b = 0;
    for (c = l.length; b < c; b++)
      (f = l[b]),
        (d = h(f.nTh).addClass(f.sClass)),
        i && d.appendTo(e),
        a.oFeatures.bSort &&
        (d.addClass(f.sSortingClass),
          !1 !== f.bSortable &&
          (d.attr("tabindex", a.iTabIndex).attr("aria-controls", a.sTableId),
            Oa(a, f.nTh, b))),
        f.sTitle != d[0].innerHTML && d.html(f.sTitle),
        Pa(a, "header")(a, d, f, n);
    i && ea(a.aoHeader, g);
    h(g)
      .find(">tr")
      .attr("role", "row");
    h(g)
      .find(">tr>th, >tr>td")
      .addClass(n.sHeaderTH);
    h(j)
      .find(">tr>th, >tr>td")
      .addClass(n.sFooterTH);
    if (null !== j) {
      a = a.aoFooter[0];
      b = 0;
      for (c = a.length; b < c; b++)
        (f = l[b]),
          (f.nTf = a[b].cell),
          f.sClass && h(f.nTf).addClass(f.sClass);
    }
  }
  function fa(a, b, c) {
    var d,
      e,
      f,
      g = [],
      j = [],
      i = a.aoColumns.length,
      n;
    if (b) {
      c === k && (c = !1);
      d = 0;
      for (e = b.length; d < e; d++) {
        g[d] = b[d].slice();
        g[d].nTr = b[d].nTr;
        for (f = i - 1; 0 <= f; f--)
          !a.aoColumns[f].bVisible && !c && g[d].splice(f, 1);
        j.push([]);
      }
      d = 0;
      for (e = g.length; d < e; d++) {
        if ((a = g[d].nTr)) for (; (f = a.firstChild);) a.removeChild(f);
        f = 0;
        for (b = g[d].length; f < b; f++)
          if (((n = i = 1), j[d][f] === k)) {
            a.appendChild(g[d][f].cell);
            for (
              j[d][f] = 1;
              g[d + i] !== k && g[d][f].cell == g[d + i][f].cell;

            )
              (j[d + i][f] = 1), i++;
            for (; g[d][f + n] !== k && g[d][f].cell == g[d][f + n].cell;) {
              for (c = 0; c < i; c++) j[d + c][f + n] = 1;
              n++;
            }
            h(g[d][f].cell)
              .attr("rowspan", i)
              .attr("colspan", n);
          }
      }
    }
  }
  function O(a) {
    var b = s(a, "aoPreDrawCallback", "preDraw", [a]);
    if (-1 !== h.inArray(!1, b)) C(a, !1);
    else {
      var b = [],
        c = 0,
        d = a.asStripeClasses,
        e = d.length,
        f = a.oLanguage,
        g = a.iInitDisplayStart,
        j = "ssp" == y(a),
        i = a.aiDisplay;
      a.bDrawing = !0;
      g !== k &&
        -1 !== g &&
        ((a._iDisplayStart = j ? g : g >= a.fnRecordsDisplay() ? 0 : g),
          (a.iInitDisplayStart = -1));
      var g = a._iDisplayStart,
        n = a.fnDisplayEnd();
      if (a.bDeferLoading) (a.bDeferLoading = !1), a.iDraw++, C(a, !1);
      else if (j) {
        if (!a.bDestroying && !nb(a)) return;
      } else a.iDraw++;
      if (0 !== i.length) {
        f = j ? a.aoData.length : n;
        for (j = j ? 0 : g; j < f; j++) {
          var l = i[j],
            q = a.aoData[l];
          null === q.nTr && Ja(a, l);
          l = q.nTr;
          if (0 !== e) {
            var r = d[c % e];
            q._sRowStripe != r &&
              (h(l)
                .removeClass(q._sRowStripe)
                .addClass(r),
                (q._sRowStripe = r));
          }
          s(a, "aoRowCallback", null, [l, q._aData, c, j]);
          b.push(l);
          c++;
        }
      } else
        (c = f.sZeroRecords),
          1 == a.iDraw && "ajax" == y(a)
            ? (c = f.sLoadingRecords)
            : f.sEmptyTable && 0 === a.fnRecordsTotal() && (c = f.sEmptyTable),
          (b[0] = h("<tr/>", { class: e ? d[0] : "" }).append(
            h("<td />", {
              valign: "top",
              colSpan: ba(a),
              class: a.oClasses.sRowEmpty
            }).html(c)
          )[0]);
      s(a, "aoHeaderCallback", "header", [
        h(a.nTHead).children("tr")[0],
        Ma(a),
        g,
        n,
        i
      ]);
      s(a, "aoFooterCallback", "footer", [
        h(a.nTFoot).children("tr")[0],
        Ma(a),
        g,
        n,
        i
      ]);
      d = h(a.nTBody);
      d.children().detach();
      d.append(h(b));
      s(a, "aoDrawCallback", "draw", [a]);
      a.bSorted = !1;
      a.bFiltered = !1;
      a.bDrawing = !1;
    }
  }
  function T(a, b) {
    var c = a.oFeatures,
      d = c.bFilter;
    c.bSort && ob(a);
    d ? ga(a, a.oPreviousSearch) : (a.aiDisplay = a.aiDisplayMaster.slice());
    !0 !== b && (a._iDisplayStart = 0);
    a._drawHold = b;
    O(a);
    a._drawHold = !1;
  }
  function pb(a) {
    var b = a.oClasses,
      c = h(a.nTable),
      c = h("<div/>").insertBefore(c),
      d = a.oFeatures,
      e = h("<div/>", {
        id: a.sTableId + "_wrapper",
        class: b.sWrapper + (a.nTFoot ? "" : " " + b.sNoFooter)
      });
    a.nHolding = c[0];
    a.nTableWrapper = e[0];
    a.nTableReinsertBefore = a.nTable.nextSibling;
    for (var f = a.sDom.split(""), g, j, i, n, l, q, k = 0; k < f.length; k++) {
      g = null;
      j = f[k];
      if ("<" == j) {
        i = h("<div/>")[0];
        n = f[k + 1];
        if ("'" == n || '"' == n) {
          l = "";
          for (q = 2; f[k + q] != n;) (l += f[k + q]), q++;
          "H" == l ? (l = b.sJUIHeader) : "F" == l && (l = b.sJUIFooter);
          -1 != l.indexOf(".")
            ? ((n = l.split(".")),
              (i.id = n[0].substr(1, n[0].length - 1)),
              (i.className = n[1]))
            : "#" == l.charAt(0)
              ? (i.id = l.substr(1, l.length - 1))
              : (i.className = l);
          k += q;
        }
        e.append(i);
        e = h(i);
      } else if (">" == j) e = e.parent();
      else if ("l" == j && d.bPaginate && d.bLengthChange) g = qb(a);
      else if ("f" == j && d.bFilter) g = rb(a);
      else if ("r" == j && d.bProcessing) g = sb(a);
      else if ("t" == j) g = tb(a);
      else if ("i" == j && d.bInfo) g = ub(a);
      else if ("p" == j && d.bPaginate) g = vb(a);
      else if (0 !== m.ext.feature.length) {
        i = m.ext.feature;
        q = 0;
        for (n = i.length; q < n; q++)
          if (j == i[q].cFeature) {
            g = i[q].fnInit(a);
            break;
          }
      }
      g &&
        ((i = a.aanFeatures), i[j] || (i[j] = []), i[j].push(g), e.append(g));
    }
    c.replaceWith(e);
    a.nHolding = null;
  }
  function ea(a, b) {
    var c = h(b).children("tr"),
      d,
      e,
      f,
      g,
      j,
      i,
      n,
      l,
      q,
      k;
    a.splice(0, a.length);
    f = 0;
    for (i = c.length; f < i; f++) a.push([]);
    f = 0;
    for (i = c.length; f < i; f++) {
      d = c[f];
      for (e = d.firstChild; e;) {
        if (
          "TD" == e.nodeName.toUpperCase() ||
          "TH" == e.nodeName.toUpperCase()
        ) {
          l = 1 * e.getAttribute("colspan");
          q = 1 * e.getAttribute("rowspan");
          l = !l || 0 === l || 1 === l ? 1 : l;
          q = !q || 0 === q || 1 === q ? 1 : q;
          g = 0;
          for (j = a[f]; j[g];) g++;
          n = g;
          k = 1 === l ? !0 : !1;
          for (j = 0; j < l; j++)
            for (g = 0; g < q; g++)
              (a[f + g][n + j] = { cell: e, unique: k }), (a[f + g].nTr = d);
        }
        e = e.nextSibling;
      }
    }
  }
  function ta(a, b, c) {
    var d = [];
    c || ((c = a.aoHeader), b && ((c = []), ea(c, b)));
    for (var b = 0, e = c.length; b < e; b++)
      for (var f = 0, g = c[b].length; f < g; f++)
        if (c[b][f].unique && (!d[f] || !a.bSortCellsTop)) d[f] = c[b][f].cell;
    return d;
  }
  function ua(a, b, c) {
    s(a, "aoServerParams", "serverParams", [b]);
    if (b && h.isArray(b)) {
      var d = {},
        e = /(.*?)\[\]$/;
      h.each(b, function (a, b) {
        var c = b.name.match(e);
        c
          ? ((c = c[0]), d[c] || (d[c] = []), d[c].push(b.value))
          : (d[b.name] = b.value);
      });
      b = d;
    }
    var f,
      g = a.ajax,
      j = a.oInstance,
      i = function (b) {
        s(a, null, "xhr", [a, b, a.jqXHR]);
        c(b);
      };
    if (h.isPlainObject(g) && g.data) {
      f = g.data;
      var n = h.isFunction(f) ? f(b, a) : f,
        b = h.isFunction(f) && n ? n : h.extend(!0, b, n);
      delete g.data;
    }
    n = {
      data: b,
      success: function (b) {
        var c = b.error || b.sError;
        c && K(a, 0, c);
        a.json = b;
        i(b);
      },
      dataType: "json",
      cache: !1,
      type: a.sServerMethod,
      error: function (b, c) {
        var d = s(a, null, "xhr", [a, null, a.jqXHR]);
        -1 === h.inArray(!0, d) &&
          ("parsererror" == c
            ? K(a, 0, "Invalid JSON response", 1)
            : 4 === b.readyState && K(a, 0, "Ajax error", 7));
        C(a, !1);
      }
    };
    a.oAjaxData = b;
    s(a, null, "preXhr", [a, b]);
    a.fnServerData
      ? a.fnServerData.call(
        j,
        a.sAjaxSource,
        h.map(b, function (a, b) {
          return { name: b, value: a };
        }),
        i,
        a
      )
      : a.sAjaxSource || "string" === typeof g
        ? (a.jqXHR = h.ajax(h.extend(n, { url: g || a.sAjaxSource })))
        : h.isFunction(g)
          ? (a.jqXHR = g.call(j, b, i, a))
          : ((a.jqXHR = h.ajax(h.extend(n, g))), (g.data = f));
  }
  function nb(a) {
    return a.bAjaxDataGet
      ? (a.iDraw++,
        C(a, !0),
        ua(a, wb(a), function (b) {
          xb(a, b);
        }),
        !1)
      : !0;
  }
  function wb(a) {
    var b = a.aoColumns,
      c = b.length,
      d = a.oFeatures,
      e = a.oPreviousSearch,
      f = a.aoPreSearchCols,
      g,
      j = [],
      i,
      n,
      l,
      k = W(a);
    g = a._iDisplayStart;
    i = !1 !== d.bPaginate ? a._iDisplayLength : -1;
    var r = function (a, b) {
      j.push({ name: a, value: b });
    };
    r("sEcho", a.iDraw);
    r("iColumns", c);
    r("sColumns", D(b, "sName").join(","));
    r("iDisplayStart", g);
    r("iDisplayLength", i);
    var ra = {
      draw: a.iDraw,
      columns: [],
      order: [],
      start: g,
      length: i,
      search: { value: e.sSearch, regex: e.bRegex }
    };
    for (g = 0; g < c; g++)
      (n = b[g]),
        (l = f[g]),
        (i = "function" == typeof n.mData ? "function" : n.mData),
        ra.columns.push({
          data: i,
          name: n.sName,
          searchable: n.bSearchable,
          orderable: n.bSortable,
          search: { value: l.sSearch, regex: l.bRegex }
        }),
        r("mDataProp_" + g, i),
        d.bFilter &&
        (r("sSearch_" + g, l.sSearch),
          r("bRegex_" + g, l.bRegex),
          r("bSearchable_" + g, n.bSearchable)),
        d.bSort && r("bSortable_" + g, n.bSortable);
    d.bFilter && (r("sSearch", e.sSearch), r("bRegex", e.bRegex));
    d.bSort &&
      (h.each(k, function (a, b) {
        ra.order.push({ column: b.col, dir: b.dir });
        r("iSortCol_" + a, b.col);
        r("sSortDir_" + a, b.dir);
      }),
        r("iSortingCols", k.length));
    b = m.ext.legacy.ajax;
    return null === b ? (a.sAjaxSource ? j : ra) : b ? j : ra;
  }
  function xb(a, b) {
    var c = va(a, b),
      d = b.sEcho !== k ? b.sEcho : b.draw,
      e = b.iTotalRecords !== k ? b.iTotalRecords : b.recordsTotal,
      f =
        b.iTotalDisplayRecords !== k
          ? b.iTotalDisplayRecords
          : b.recordsFiltered;
    if (d) {
      if (1 * d < a.iDraw) return;
      a.iDraw = 1 * d;
    }
    pa(a);
    a._iRecordsTotal = parseInt(e, 10);
    a._iRecordsDisplay = parseInt(f, 10);
    d = 0;
    for (e = c.length; d < e; d++) N(a, c[d]);
    a.aiDisplay = a.aiDisplayMaster.slice();
    a.bAjaxDataGet = !1;
    O(a);
    a._bInitComplete || wa(a, b);
    a.bAjaxDataGet = !0;
    C(a, !1);
  }
  function va(a, b) {
    var c =
      h.isPlainObject(a.ajax) && a.ajax.dataSrc !== k
        ? a.ajax.dataSrc
        : a.sAjaxDataProp;
    return "data" === c ? b.aaData || b[c] : "" !== c ? R(c)(b) : b;
  }
  function rb(a) {
    var b = a.oClasses,
      c = a.sTableId,
      d = a.oLanguage,
      e = a.oPreviousSearch,
      f = a.aanFeatures,
      g = '<input type="search" class="' + b.sFilterInput + '"/>',
      j = d.sSearch,
      j = j.match(/_INPUT_/) ? j.replace("_INPUT_", g) : j + g,
      b = h("<div/>", {
        id: !f.f ? c + "_filter" : null,
        class: b.sFilter
      }).append(h("<label/>").append(j)),
      f = function () {
        var b = !this.value ? "" : this.value;
        b != e.sSearch &&
          (ga(a, {
            sSearch: b,
            bRegex: e.bRegex,
            bSmart: e.bSmart,
            bCaseInsensitive: e.bCaseInsensitive
          }),
            (a._iDisplayStart = 0),
            O(a));
      },
      g = null !== a.searchDelay ? a.searchDelay : "ssp" === y(a) ? 400 : 0,
      i = h("input", b)
        .val(e.sSearch)
        .attr("placeholder", d.sSearchPlaceholder)
        .on("keyup.DT search.DT input.DT paste.DT cut.DT", g ? Qa(f, g) : f)
        .on("keypress.DT", function (a) {
          if (13 == a.keyCode) return !1;
        })
        .attr("aria-controls", c);
    h(a.nTable).on("search.dt.DT", function (b, c) {
      if (a === c)
        try {
          i[0] !== H.activeElement && i.val(e.sSearch);
        } catch (d) { }
    });
    return b[0];
  }
  function ga(a, b, c) {
    var d = a.oPreviousSearch,
      e = a.aoPreSearchCols,
      f = function (a) {
        d.sSearch = a.sSearch;
        d.bRegex = a.bRegex;
        d.bSmart = a.bSmart;
        d.bCaseInsensitive = a.bCaseInsensitive;
      };
    Ia(a);
    if ("ssp" != y(a)) {
      yb(
        a,
        b.sSearch,
        c,
        b.bEscapeRegex !== k ? !b.bEscapeRegex : b.bRegex,
        b.bSmart,
        b.bCaseInsensitive
      );
      f(b);
      for (b = 0; b < e.length; b++)
        zb(
          a,
          e[b].sSearch,
          b,
          e[b].bEscapeRegex !== k ? !e[b].bEscapeRegex : e[b].bRegex,
          e[b].bSmart,
          e[b].bCaseInsensitive
        );
      Ab(a);
    } else f(b);
    a.bFiltered = !0;
    s(a, null, "search", [a]);
  }
  function Ab(a) {
    for (
      var b = m.ext.search, c = a.aiDisplay, d, e, f = 0, g = b.length;
      f < g;
      f++
    ) {
      for (var j = [], i = 0, n = c.length; i < n; i++)
        (e = c[i]),
          (d = a.aoData[e]),
          b[f](a, d._aFilterData, e, d._aData, i) && j.push(e);
      c.length = 0;
      h.merge(c, j);
    }
  }
  function zb(a, b, c, d, e, f) {
    if ("" !== b) {
      for (
        var g = [], j = a.aiDisplay, d = Ra(b, d, e, f), e = 0;
        e < j.length;
        e++
      )
        (b = a.aoData[j[e]]._aFilterData[c]), d.test(b) && g.push(j[e]);
      a.aiDisplay = g;
    }
  }
  function yb(a, b, c, d, e, f) {
    var d = Ra(b, d, e, f),
      f = a.oPreviousSearch.sSearch,
      g = a.aiDisplayMaster,
      j,
      e = [];
    0 !== m.ext.search.length && (c = !0);
    j = Bb(a);
    if (0 >= b.length) a.aiDisplay = g.slice();
    else {
      if (j || c || f.length > b.length || 0 !== b.indexOf(f) || a.bSorted)
        a.aiDisplay = g.slice();
      b = a.aiDisplay;
      for (c = 0; c < b.length; c++)
        d.test(a.aoData[b[c]]._sFilterRow) && e.push(b[c]);
      a.aiDisplay = e;
    }
  }
  function Ra(a, b, c, d) {
    a = b ? a : Sa(a);
    c &&
      (a =
        "^(?=.*?" +
        h
          .map(a.match(/"[^"]+"|[^ ]+/g) || [""], function (a) {
            if ('"' === a.charAt(0))
              var b = a.match(/^"(.*)"$/),
                a = b ? b[1] : a;
            return a.replace('"', "");
          })
          .join(")(?=.*?") +
        ").*$");
    return RegExp(a, d ? "i" : "");
  }
  function Bb(a) {
    var b = a.aoColumns,
      c,
      d,
      e,
      f,
      g,
      j,
      i,
      h,
      l = m.ext.type.search;
    c = !1;
    d = 0;
    for (f = a.aoData.length; d < f; d++)
      if (((h = a.aoData[d]), !h._aFilterData)) {
        j = [];
        e = 0;
        for (g = b.length; e < g; e++)
          (c = b[e]),
            c.bSearchable
              ? ((i = B(a, d, e, "filter")),
                l[c.sType] && (i = l[c.sType](i)),
                null === i && (i = ""),
                "string" !== typeof i && i.toString && (i = i.toString()))
              : (i = ""),
            i.indexOf &&
            -1 !== i.indexOf("&") &&
            ((xa.innerHTML = i), (i = $b ? xa.textContent : xa.innerText)),
            i.replace && (i = i.replace(/[\r\n]/g, "")),
            j.push(i);
        h._aFilterData = j;
        h._sFilterRow = j.join("  ");
        c = !0;
      }
    return c;
  }
  function Cb(a) {
    return {
      search: a.sSearch,
      smart: a.bSmart,
      regex: a.bRegex,
      caseInsensitive: a.bCaseInsensitive
    };
  }
  function Db(a) {
    return {
      sSearch: a.search,
      bSmart: a.smart,
      bRegex: a.regex,
      bCaseInsensitive: a.caseInsensitive
    };
  }
  function ub(a) {
    var b = a.sTableId,
      c = a.aanFeatures.i,
      d = h("<div/>", { class: a.oClasses.sInfo, id: !c ? b + "_info" : null });
    c ||
      (a.aoDrawCallback.push({ fn: Eb, sName: "information" }),
        d.attr("role", "status").attr("aria-live", "polite"),
        h(a.nTable).attr("aria-describedby", b + "_info"));
    return d[0];
  }
  function Eb(a) {
    var b = a.aanFeatures.i;
    if (0 !== b.length) {
      var c = a.oLanguage,
        d = a._iDisplayStart + 1,
        e = a.fnDisplayEnd(),
        f = a.fnRecordsTotal(),
        g = a.fnRecordsDisplay(),
        j = g ? c.sInfo : c.sInfoEmpty;
      g !== f && (j += " " + c.sInfoFiltered);
      j += c.sInfoPostFix;
      j = Fb(a, j);
      c = c.fnInfoCallback;
      null !== c && (j = c.call(a.oInstance, a, d, e, f, g, j));
      h(b).html(j);
    }
  }
  function Fb(a, b) {
    var c = a.fnFormatNumber,
      d = a._iDisplayStart + 1,
      e = a._iDisplayLength,
      f = a.fnRecordsDisplay(),
      g = -1 === e;
    return b
      .replace(/_START_/g, c.call(a, d))
      .replace(/_END_/g, c.call(a, a.fnDisplayEnd()))
      .replace(/_MAX_/g, c.call(a, a.fnRecordsTotal()))
      .replace(/_TOTAL_/g, c.call(a, f))
      .replace(/_PAGE_/g, c.call(a, g ? 1 : Math.ceil(d / e)))
      .replace(/_PAGES_/g, c.call(a, g ? 1 : Math.ceil(f / e)));
  }
  function ha(a) {
    var b,
      c,
      d = a.iInitDisplayStart,
      e = a.aoColumns,
      f;
    c = a.oFeatures;
    var g = a.bDeferLoading;
    if (a.bInitialised) {
      pb(a);
      mb(a);
      fa(a, a.aoHeader);
      fa(a, a.aoFooter);
      C(a, !0);
      c.bAutoWidth && Ha(a);
      b = 0;
      for (c = e.length; b < c; b++)
        (f = e[b]), f.sWidth && (f.nTh.style.width = v(f.sWidth));
      s(a, null, "preInit", [a]);
      T(a);
      e = y(a);
      if ("ssp" != e || g)
        "ajax" == e
          ? ua(
            a,
            [],
            function (c) {
              var f = va(a, c);
              for (b = 0; b < f.length; b++) N(a, f[b]);
              a.iInitDisplayStart = d;
              T(a);
              C(a, !1);
              wa(a, c);
            },
            a
          )
          : (C(a, !1), wa(a));
    } else
      setTimeout(function () {
        ha(a);
      }, 200);
  }
  function wa(a, b) {
    a._bInitComplete = !0;
    (b || a.oInit.aaData) && Z(a);
    s(a, null, "plugin-init", [a, b]);
    s(a, "aoInitComplete", "init", [a, b]);
  }
  function Ta(a, b) {
    var c = parseInt(b, 10);
    a._iDisplayLength = c;
    Ua(a);
    s(a, null, "length", [a, c]);
  }
  function qb(a) {
    for (
      var b = a.oClasses,
      c = a.sTableId,
      d = a.aLengthMenu,
      e = h.isArray(d[0]),
      f = e ? d[0] : d,
      d = e ? d[1] : d,
      e = h("<select/>", {
        name: c + "_length",
        "aria-controls": c,
        class: b.sLengthSelect
      }),
      g = 0,
      j = f.length;
      g < j;
      g++
    )
      e[0][g] = new Option(d[g], f[g]);
    var i = h("<div><label/></div>").addClass(b.sLength);
    a.aanFeatures.l || (i[0].id = c + "_length");
    i.children().append(
      a.oLanguage.sLengthMenu.replace("_MENU_", e[0].outerHTML)
    );
    h("select", i)
      .val(a._iDisplayLength)
      .on("change.DT", function () {
        Ta(a, h(this).val());
        O(a);
      });
    h(a.nTable).on("length.dt.DT", function (b, c, d) {
      a === c && h("select", i).val(d);
    });
    return i[0];
  }
  function vb(a) {
    var b = a.sPaginationType,
      c = m.ext.pager[b],
      d = "function" === typeof c,
      e = function (a) {
        O(a);
      },
      b = h("<div/>").addClass(a.oClasses.sPaging + b)[0],
      f = a.aanFeatures;
    d || c.fnInit(a, b, e);
    f.p ||
      ((b.id = a.sTableId + "_paginate"),
        a.aoDrawCallback.push({
          fn: function (a) {
            if (d) {
              var b = a._iDisplayStart,
                i = a._iDisplayLength,
                h = a.fnRecordsDisplay(),
                l = -1 === i,
                b = l ? 0 : Math.ceil(b / i),
                i = l ? 1 : Math.ceil(h / i),
                h = c(b, i),
                k,
                l = 0;
              for (k = f.p.length; l < k; l++)
                Pa(a, "pageButton")(a, f.p[l], l, h, b, i);
            } else c.fnUpdate(a, e);
          },
          sName: "pagination"
        }));
    return b;
  }
  function Va(a, b, c) {
    var d = a._iDisplayStart,
      e = a._iDisplayLength,
      f = a.fnRecordsDisplay();
    0 === f || -1 === e
      ? (d = 0)
      : "number" === typeof b
        ? ((d = b * e), d > f && (d = 0))
        : "first" == b
          ? (d = 0)
          : "previous" == b
            ? ((d = 0 <= e ? d - e : 0), 0 > d && (d = 0))
            : "next" == b
              ? d + e < f && (d += e)
              : "last" == b
                ? (d = Math.floor((f - 1) / e) * e)
                : K(a, 0, "Unknown paging action: " + b, 5);
    b = a._iDisplayStart !== d;
    a._iDisplayStart = d;
    b && (s(a, null, "page", [a]), c && O(a));
    return b;
  }
  function sb(a) {
    return h("<div/>", {
      id: !a.aanFeatures.r ? a.sTableId + "_processing" : null,
      class: a.oClasses.sProcessing
    })
      .html(a.oLanguage.sProcessing)
      .insertBefore(a.nTable)[0];
  }
  function C(a, b) {
    a.oFeatures.bProcessing &&
      h(a.aanFeatures.r).css("display", b ? "block" : "none");
    s(a, null, "processing", [a, b]);
  }
  function tb(a) {
    var b = h(a.nTable);
    b.attr("role", "grid");
    var c = a.oScroll;
    if ("" === c.sX && "" === c.sY) return a.nTable;
    var d = c.sX,
      e = c.sY,
      f = a.oClasses,
      g = b.children("caption"),
      j = g.length ? g[0]._captionSide : null,
      i = h(b[0].cloneNode(!1)),
      n = h(b[0].cloneNode(!1)),
      l = b.children("tfoot");
    l.length || (l = null);
    i = h("<div/>", { class: f.sScrollWrapper })
      .append(
        h("<div/>", { class: f.sScrollHead })
          .css({
            overflow: "hidden",
            position: "relative",
            border: 0,
            width: d ? (!d ? null : v(d)) : "100%"
          })
          .append(
            h("<div/>", { class: f.sScrollHeadInner })
              .css({ "box-sizing": "content-box", width: c.sXInner || "100%" })
              .append(
                i
                  .removeAttr("id")
                  .css("margin-left", 0)
                  .append("top" === j ? g : null)
                  .append(b.children("thead"))
              )
          )
      )
      .append(
        h("<div/>", { class: f.sScrollBody })
          .css({
            position: "relative",
            overflow: "auto",
            width: !d ? null : v(d)
          })
          .append(b)
      );
    l &&
      i.append(
        h("<div/>", { class: f.sScrollFoot })
          .css({
            overflow: "hidden",
            border: 0,
            width: d ? (!d ? null : v(d)) : "100%"
          })
          .append(
            h("<div/>", { class: f.sScrollFootInner }).append(
              n
                .removeAttr("id")
                .css("margin-left", 0)
                .append("bottom" === j ? g : null)
                .append(b.children("tfoot"))
            )
          )
      );
    var b = i.children(),
      k = b[0],
      f = b[1],
      r = l ? b[2] : null;
    if (d)
      h(f).on("scroll.DT", function () {
        var a = this.scrollLeft;
        k.scrollLeft = a;
        l && (r.scrollLeft = a);
      });
    h(f).css(e && c.bCollapse ? "max-height" : "height", e);
    a.nScrollHead = k;
    a.nScrollBody = f;
    a.nScrollFoot = r;
    a.aoDrawCallback.push({ fn: ma, sName: "scrolling" });
    return i[0];
  }
  function ma(a) {
    var b = a.oScroll,
      c = b.sX,
      d = b.sXInner,
      e = b.sY,
      b = b.iBarWidth,
      f = h(a.nScrollHead),
      g = f[0].style,
      j = f.children("div"),
      i = j[0].style,
      n = j.children("table"),
      j = a.nScrollBody,
      l = h(j),
      q = j.style,
      r = h(a.nScrollFoot).children("div"),
      m = r.children("table"),
      p = h(a.nTHead),
      o = h(a.nTable),
      u = o[0],
      s = u.style,
      t = a.nTFoot ? h(a.nTFoot) : null,
      x = a.oBrowser,
      U = x.bScrollOversize,
      ac = D(a.aoColumns, "nTh"),
      P,
      L,
      Q,
      w,
      Wa = [],
      y = [],
      z = [],
      A = [],
      B,
      C = function (a) {
        a = a.style;
        a.paddingTop = "0";
        a.paddingBottom = "0";
        a.borderTopWidth = "0";
        a.borderBottomWidth = "0";
        a.height = 0;
      };
    L = j.scrollHeight > j.clientHeight;
    if (a.scrollBarVis !== L && a.scrollBarVis !== k)
      (a.scrollBarVis = L), Z(a);
    else {
      a.scrollBarVis = L;
      o.children("thead, tfoot").remove();
      t &&
        ((Q = t.clone().prependTo(o)), (P = t.find("tr")), (Q = Q.find("tr")));
      w = p.clone().prependTo(o);
      p = p.find("tr");
      L = w.find("tr");
      w.find("th, td").removeAttr("tabindex");
      c || ((q.width = "100%"), (f[0].style.width = "100%"));
      h.each(ta(a, w), function (b, c) {
        B = $(a, b);
        c.style.width = a.aoColumns[B].sWidth;
      });
      t &&
        I(function (a) {
          a.style.width = "";
        }, Q);
      f = o.outerWidth();
      if ("" === c) {
        s.width = "100%";
        if (
          U &&
          (o.find("tbody").height() > j.offsetHeight ||
            "scroll" == l.css("overflow-y"))
        )
          s.width = v(o.outerWidth() - b);
        f = o.outerWidth();
      } else "" !== d && ((s.width = v(d)), (f = o.outerWidth()));
      I(C, L);
      I(function (a) {
        z.push(a.innerHTML);
        Wa.push(v(h(a).css("width")));
      }, L);
      I(function (a, b) {
        if (h.inArray(a, ac) !== -1) a.style.width = Wa[b];
      }, p);
      h(L).height(0);
      t &&
        (I(C, Q),
          I(function (a) {
            A.push(a.innerHTML);
            y.push(v(h(a).css("width")));
          }, Q),
          I(function (a, b) {
            a.style.width = y[b];
          }, P),
          h(Q).height(0));
      I(function (a, b) {
        a.innerHTML =
          '<div class="dataTables_sizing" style="height:0;overflow:hidden;">' +
          z[b] +
          "</div>";
        a.style.width = Wa[b];
      }, L);
      t &&
        I(function (a, b) {
          a.innerHTML =
            '<div class="dataTables_sizing" style="height:0;overflow:hidden;">' +
            A[b] +
            "</div>";
          a.style.width = y[b];
        }, Q);
      if (o.outerWidth() < f) {
        P =
          j.scrollHeight > j.offsetHeight || "scroll" == l.css("overflow-y")
            ? f + b
            : f;
        if (
          U &&
          (j.scrollHeight > j.offsetHeight || "scroll" == l.css("overflow-y"))
        )
          s.width = v(P - b);
        ("" === c || "" !== d) && K(a, 1, "Possible column misalignment", 6);
      } else P = "100%";
      q.width = v(P);
      g.width = v(P);
      t && (a.nScrollFoot.style.width = v(P));
      !e && U && (q.height = v(u.offsetHeight + b));
      c = o.outerWidth();
      n[0].style.width = v(c);
      i.width = v(c);
      d = o.height() > j.clientHeight || "scroll" == l.css("overflow-y");
      e = "padding" + (x.bScrollbarLeft ? "Left" : "Right");
      i[e] = d ? b + "px" : "0px";
      t &&
        ((m[0].style.width = v(c)),
          (r[0].style.width = v(c)),
          (r[0].style[e] = d ? b + "px" : "0px"));
      o.children("colgroup").insertBefore(o.children("thead"));
      l.scroll();
      if ((a.bSorted || a.bFiltered) && !a._drawHold) j.scrollTop = 0;
    }
  }
  function I(a, b, c) {
    for (var d = 0, e = 0, f = b.length, g, j; e < f;) {
      g = b[e].firstChild;
      for (j = c ? c[e].firstChild : null; g;)
        1 === g.nodeType && (c ? a(g, j, d) : a(g, d), d++),
          (g = g.nextSibling),
          (j = c ? j.nextSibling : null);
      e++;
    }
  }
  function Ha(a) {
    var b = a.nTable,
      c = a.aoColumns,
      d = a.oScroll,
      e = d.sY,
      f = d.sX,
      g = d.sXInner,
      j = c.length,
      i = na(a, "bVisible"),
      n = h("th", a.nTHead),
      l = b.getAttribute("width"),
      k = b.parentNode,
      r = !1,
      m,
      p,
      o = a.oBrowser,
      d = o.bScrollOversize;
    (m = b.style.width) && -1 !== m.indexOf("%") && (l = m);
    for (m = 0; m < i.length; m++)
      (p = c[i[m]]),
        null !== p.sWidth && ((p.sWidth = Gb(p.sWidthOrig, k)), (r = !0));
    if (d || (!r && !f && !e && j == ba(a) && j == n.length))
      for (m = 0; m < j; m++)
        (i = $(a, m)), null !== i && (c[i].sWidth = v(n.eq(m).width()));
    else {
      j = h(b)
        .clone()
        .css("visibility", "hidden")
        .removeAttr("id");
      j.find("tbody tr").remove();
      var u = h("<tr/>").appendTo(j.find("tbody"));
      j.find("thead, tfoot").remove();
      j.append(h(a.nTHead).clone()).append(h(a.nTFoot).clone());
      j.find("tfoot th, tfoot td").css("width", "");
      n = ta(a, j.find("thead")[0]);
      for (m = 0; m < i.length; m++)
        (p = c[i[m]]),
          (n[m].style.width =
            null !== p.sWidthOrig && "" !== p.sWidthOrig
              ? v(p.sWidthOrig)
              : ""),
          p.sWidthOrig &&
          f &&
          h(n[m]).append(
            h("<div/>").css({
              width: p.sWidthOrig,
              margin: 0,
              padding: 0,
              border: 0,
              height: 1
            })
          );
      if (a.aoData.length)
        for (m = 0; m < i.length; m++)
          (r = i[m]),
            (p = c[r]),
            h(Hb(a, r))
              .clone(!1)
              .append(p.sContentPadding)
              .appendTo(u);
      h("[name]", j).removeAttr("name");
      p = h("<div/>")
        .css(
          f || e
            ? {
              position: "absolute",
              top: 0,
              left: 0,
              height: 1,
              right: 0,
              overflow: "hidden"
            }
            : {}
        )
        .append(j)
        .appendTo(k);
      f && g
        ? j.width(g)
        : f
          ? (j.css("width", "auto"),
            j.removeAttr("width"),
            j.width() < k.clientWidth && l && j.width(k.clientWidth))
          : e
            ? j.width(k.clientWidth)
            : l && j.width(l);
      for (m = e = 0; m < i.length; m++)
        (k = h(n[m])),
          (g = k.outerWidth() - k.width()),
          (k = o.bBounding
            ? Math.ceil(n[m].getBoundingClientRect().width)
            : k.outerWidth()),
          (e += k),
          (c[i[m]].sWidth = v(k - g));
      b.style.width = v(e);
      p.remove();
    }
    l && (b.style.width = v(l));
    if ((l || f) && !a._reszEvt)
      (b = function () {
        h(E).on(
          "resize.DT-" + a.sInstance,
          Qa(function () {
            Z(a);
          })
        );
      }),
        d ? setTimeout(b, 1e3) : b(),
        (a._reszEvt = !0);
  }
  function Gb(a, b) {
    if (!a) return 0;
    var c = h("<div/>")
      .css("width", v(a))
      .appendTo(b || H.body),
      d = c[0].offsetWidth;
    c.remove();
    return d;
  }
  function Hb(a, b) {
    var c = Ib(a, b);
    if (0 > c) return null;
    var d = a.aoData[c];
    return !d.nTr ? h("<td/>").html(B(a, c, b, "display"))[0] : d.anCells[b];
  }
  function Ib(a, b) {
    for (var c, d = -1, e = -1, f = 0, g = a.aoData.length; f < g; f++)
      (c = B(a, f, b, "display") + ""),
        (c = c.replace(bc, "")),
        (c = c.replace(/&nbsp;/g, " ")),
        c.length > d && ((d = c.length), (e = f));
    return e;
  }
  function v(a) {
    return null === a
      ? "0px"
      : "number" == typeof a
        ? 0 > a
          ? "0px"
          : a + "px"
        : a.match(/\d$/)
          ? a + "px"
          : a;
  }
  function W(a) {
    var b,
      c,
      d = [],
      e = a.aoColumns,
      f,
      g,
      j,
      i;
    b = a.aaSortingFixed;
    c = h.isPlainObject(b);
    var n = [];
    f = function (a) {
      a.length && !h.isArray(a[0]) ? n.push(a) : h.merge(n, a);
    };
    h.isArray(b) && f(b);
    c && b.pre && f(b.pre);
    f(a.aaSorting);
    c && b.post && f(b.post);
    for (a = 0; a < n.length; a++) {
      i = n[a][0];
      f = e[i].aDataSort;
      b = 0;
      for (c = f.length; b < c; b++)
        (g = f[b]),
          (j = e[g].sType || "string"),
          n[a]._idx === k && (n[a]._idx = h.inArray(n[a][1], e[g].asSorting)),
          d.push({
            src: i,
            col: g,
            dir: n[a][1],
            index: n[a]._idx,
            type: j,
            formatter: m.ext.type.order[j + "-pre"]
          });
    }
    return d;
  }
  function ob(a) {
    var b,
      c,
      d = [],
      e = m.ext.type.order,
      f = a.aoData,
      g = 0,
      j,
      i = a.aiDisplayMaster,
      h;
    Ia(a);
    h = W(a);
    b = 0;
    for (c = h.length; b < c; b++) (j = h[b]), j.formatter && g++, Jb(a, j.col);
    if ("ssp" != y(a) && 0 !== h.length) {
      b = 0;
      for (c = i.length; b < c; b++) d[i[b]] = b;
      g === h.length
        ? i.sort(function (a, b) {
          var c,
            e,
            g,
            j,
            i = h.length,
            k = f[a]._aSortData,
            m = f[b]._aSortData;
          for (g = 0; g < i; g++)
            if (
              ((j = h[g]),
                (c = k[j.col]),
                (e = m[j.col]),
                (c = c < e ? -1 : c > e ? 1 : 0),
                0 !== c)
            )
              return "asc" === j.dir ? c : -c;
          c = d[a];
          e = d[b];
          return c < e ? -1 : c > e ? 1 : 0;
        })
        : i.sort(function (a, b) {
          var c,
            g,
            j,
            i,
            k = h.length,
            m = f[a]._aSortData,
            p = f[b]._aSortData;
          for (j = 0; j < k; j++)
            if (
              ((i = h[j]),
                (c = m[i.col]),
                (g = p[i.col]),
                (i = e[i.type + "-" + i.dir] || e["string-" + i.dir]),
                (c = i(c, g)),
                0 !== c)
            )
              return c;
          c = d[a];
          g = d[b];
          return c < g ? -1 : c > g ? 1 : 0;
        });
    }
    a.bSorted = !0;
  }
  function Kb(a) {
    for (
      var b,
      c,
      d = a.aoColumns,
      e = W(a),
      a = a.oLanguage.oAria,
      f = 0,
      g = d.length;
      f < g;
      f++
    ) {
      c = d[f];
      var j = c.asSorting;
      b = c.sTitle.replace(/<.*?>/g, "");
      var i = c.nTh;
      i.removeAttribute("aria-sort");
      c.bSortable &&
        (0 < e.length && e[0].col == f
          ? (i.setAttribute(
            "aria-sort",
            "asc" == e[0].dir ? "ascending" : "descending"
          ),
            (c = j[e[0].index + 1] || j[0]))
          : (c = j[0]),
          (b += "asc" === c ? a.sSortAscending : a.sSortDescending));
      i.setAttribute("aria-label", b);
    }
  }
  function Xa(a, b, c, d) {
    var e = a.aaSorting,
      f = a.aoColumns[b].asSorting,
      g = function (a, b) {
        var c = a._idx;
        c === k && (c = h.inArray(a[1], f));
        return c + 1 < f.length ? c + 1 : b ? null : 0;
      };
    "number" === typeof e[0] && (e = a.aaSorting = [e]);
    c && a.oFeatures.bSortMulti
      ? ((c = h.inArray(b, D(e, "0"))),
        -1 !== c
          ? ((b = g(e[c], !0)),
            null === b && 1 === e.length && (b = 0),
            null === b ? e.splice(c, 1) : ((e[c][1] = f[b]), (e[c]._idx = b)))
          : (e.push([b, f[0], 0]), (e[e.length - 1]._idx = 0)))
      : e.length && e[0][0] == b
        ? ((b = g(e[0])), (e.length = 1), (e[0][1] = f[b]), (e[0]._idx = b))
        : ((e.length = 0), e.push([b, f[0]]), (e[0]._idx = 0));
    T(a);
    "function" == typeof d && d(a);
  }
  function Oa(a, b, c, d) {
    var e = a.aoColumns[c];
    Ya(b, {}, function (b) {
      !1 !== e.bSortable &&
        (a.oFeatures.bProcessing
          ? (C(a, !0),
            setTimeout(function () {
              Xa(a, c, b.shiftKey, d);
              "ssp" !== y(a) && C(a, !1);
            }, 0))
          : Xa(a, c, b.shiftKey, d));
    });
  }
  function ya(a) {
    var b = a.aLastSort,
      c = a.oClasses.sSortColumn,
      d = W(a),
      e = a.oFeatures,
      f,
      g;
    if (e.bSort && e.bSortClasses) {
      e = 0;
      for (f = b.length; e < f; e++)
        (g = b[e].src),
          h(D(a.aoData, "anCells", g)).removeClass(c + (2 > e ? e + 1 : 3));
      e = 0;
      for (f = d.length; e < f; e++)
        (g = d[e].src),
          h(D(a.aoData, "anCells", g)).addClass(c + (2 > e ? e + 1 : 3));
    }
    a.aLastSort = d;
  }
  function Jb(a, b) {
    var c = a.aoColumns[b],
      d = m.ext.order[c.sSortDataType],
      e;
    d && (e = d.call(a.oInstance, a, b, aa(a, b)));
    for (
      var f, g = m.ext.type.order[c.sType + "-pre"], j = 0, i = a.aoData.length;
      j < i;
      j++
    )
      if (
        ((c = a.aoData[j]),
          c._aSortData || (c._aSortData = []),
          !c._aSortData[b] || d)
      )
        (f = d ? e[j] : B(a, j, b, "sort")), (c._aSortData[b] = g ? g(f) : f);
  }
  function za(a) {
    if (a.oFeatures.bStateSave && !a.bDestroying) {
      var b = {
        time: +new Date(),
        start: a._iDisplayStart,
        length: a._iDisplayLength,
        order: h.extend(!0, [], a.aaSorting),
        search: Cb(a.oPreviousSearch),
        columns: h.map(a.aoColumns, function (b, d) {
          return { visible: b.bVisible, search: Cb(a.aoPreSearchCols[d]) };
        })
      };
      s(a, "aoStateSaveParams", "stateSaveParams", [a, b]);
      a.oSavedState = b;
      a.fnStateSaveCallback.call(a.oInstance, a, b);
    }
  }
  function Lb(a, b, c) {
    var d,
      e,
      f = a.aoColumns,
      b = function (b) {
        if (b && b.time) {
          var i = s(a, "aoStateLoadParams", "stateLoadParams", [a, g]);
          if (
            -1 === h.inArray(!1, i) &&
            ((i = a.iStateDuration),
              !(0 < i && b.time < +new Date() - 1e3 * i) &&
              !(b.columns && f.length !== b.columns.length))
          ) {
            a.oLoadedState = h.extend(!0, {}, g);
            b.start !== k &&
              ((a._iDisplayStart = b.start), (a.iInitDisplayStart = b.start));
            b.length !== k && (a._iDisplayLength = b.length);
            b.order !== k &&
              ((a.aaSorting = []),
                h.each(b.order, function (b, c) {
                  a.aaSorting.push(c[0] >= f.length ? [0, c[1]] : c);
                }));
            b.search !== k && h.extend(a.oPreviousSearch, Db(b.search));
            if (b.columns) {
              d = 0;
              for (e = b.columns.length; d < e; d++)
                (i = b.columns[d]),
                  i.visible !== k && (f[d].bVisible = i.visible),
                  i.search !== k &&
                  h.extend(a.aoPreSearchCols[d], Db(i.search));
            }
            s(a, "aoStateLoaded", "stateLoaded", [a, g]);
          }
        }
        c();
      };
    if (a.oFeatures.bStateSave) {
      var g = a.fnStateLoadCallback.call(a.oInstance, a, b);
      g !== k && b(g);
    } else c();
  }
  function Aa(a) {
    var b = m.settings,
      a = h.inArray(a, D(b, "nTable"));
    return -1 !== a ? b[a] : null;
  }
  function K(a, b, c, d) {
    c =
      "DataTables warning: " + (a ? "table id=" + a.sTableId + " - " : "") + c;
    d &&
      (c +=
        ". For more information about this error, please see http://datatables.net/tn/" +
        d);
    if (b) E.console && console.log && console.log(c);
    else if (
      ((b = m.ext),
        (b = b.sErrMode || b.errMode),
        a && s(a, null, "error", [a, d, c]),
        "alert" == b)
    )
      alert(c);
    else {
      if ("throw" == b) throw Error(c);
      "function" == typeof b && b(a, d, c);
    }
  }
  function F(a, b, c, d) {
    h.isArray(c)
      ? h.each(c, function (c, d) {
        h.isArray(d) ? F(a, b, d[0], d[1]) : F(a, b, d);
      })
      : (d === k && (d = c), b[c] !== k && (a[d] = b[c]));
  }
  function Mb(a, b, c) {
    var d, e;
    for (e in b)
      b.hasOwnProperty(e) &&
        ((d = b[e]),
          h.isPlainObject(d)
            ? (h.isPlainObject(a[e]) || (a[e] = {}), h.extend(!0, a[e], d))
            : (a[e] =
              c && "data" !== e && "aaData" !== e && h.isArray(d)
                ? d.slice()
                : d));
    return a;
  }
  function Ya(a, b, c) {
    h(a)
      .on("click.DT", b, function (b) {
        a.blur();
        c(b);
      })
      .on("keypress.DT", b, function (a) {
        13 === a.which && (a.preventDefault(), c(a));
      })
      .on("selectstart.DT", function () {
        return !1;
      });
  }
  function z(a, b, c, d) {
    c && a[b].push({ fn: c, sName: d });
  }
  function s(a, b, c, d) {
    var e = [];
    b &&
      (e = h.map(a[b].slice().reverse(), function (b) {
        return b.fn.apply(a.oInstance, d);
      }));
    null !== c &&
      ((b = h.Event(c + ".dt")), h(a.nTable).trigger(b, d), e.push(b.result));
    return e;
  }
  function Ua(a) {
    var b = a._iDisplayStart,
      c = a.fnDisplayEnd(),
      d = a._iDisplayLength;
    b >= c && (b = c - d);
    b -= b % d;
    if (-1 === d || 0 > b) b = 0;
    a._iDisplayStart = b;
  }
  function Pa(a, b) {
    var c = a.renderer,
      d = m.ext.renderer[b];
    return h.isPlainObject(c) && c[b]
      ? d[c[b]] || d._
      : "string" === typeof c
        ? d[c] || d._
        : d._;
  }
  function y(a) {
    return a.oFeatures.bServerSide
      ? "ssp"
      : a.ajax || a.sAjaxSource
        ? "ajax"
        : "dom";
  }
  function ia(a, b) {
    var c = [],
      c = Nb.numbers_length,
      d = Math.floor(c / 2);
    b <= c
      ? (c = X(0, b))
      : a <= d
        ? ((c = X(0, c - 2)), c.push("ellipsis"), c.push(b - 1))
        : (a >= b - 1 - d
          ? (c = X(b - (c - 2), b))
          : ((c = X(a - d + 2, a + d - 1)), c.push("ellipsis"), c.push(b - 1)),
          c.splice(0, 0, "ellipsis"),
          c.splice(0, 0, 0));
    c.DT_el = "span";
    return c;
  }
  function fb(a) {
    h.each(
      {
        num: function (b) {
          return Ba(b, a);
        },
        "num-fmt": function (b) {
          return Ba(b, a, Za);
        },
        "html-num": function (b) {
          return Ba(b, a, Ca);
        },
        "html-num-fmt": function (b) {
          return Ba(b, a, Ca, Za);
        }
      },
      function (b, c) {
        x.type.order[b + a + "-pre"] = c;
        b.match(/^html\-/) && (x.type.search[b + a] = x.type.search.html);
      }
    );
  }
  function Ob(a) {
    return function () {
      var b = [Aa(this[m.ext.iApiIndex])].concat(
        Array.prototype.slice.call(arguments)
      );
      return m.ext.internal[a].apply(this, b);
    };
  }
  var m = function (a) {
    this.$ = function (a, b) {
      return this.api(!0).$(a, b);
    };
    this._ = function (a, b) {
      return this.api(!0)
        .rows(a, b)
        .data();
    };
    this.api = function (a) {
      return a ? new u(Aa(this[x.iApiIndex])) : new u(this);
    };
    this.fnAddData = function (a, b) {
      var c = this.api(!0),
        d =
          h.isArray(a) && (h.isArray(a[0]) || h.isPlainObject(a[0]))
            ? c.rows.add(a)
            : c.row.add(a);
      (b === k || b) && c.draw();
      return d.flatten().toArray();
    };
    this.fnAdjustColumnSizing = function (a) {
      var b = this.api(!0).columns.adjust(),
        c = b.settings()[0],
        d = c.oScroll;
      a === k || a ? b.draw(!1) : ("" !== d.sX || "" !== d.sY) && ma(c);
    };
    this.fnClearTable = function (a) {
      var b = this.api(!0).clear();
      (a === k || a) && b.draw();
    };
    this.fnClose = function (a) {
      this.api(!0)
        .row(a)
        .child.hide();
    };
    this.fnDeleteRow = function (a, b, c) {
      var d = this.api(!0),
        a = d.rows(a),
        e = a.settings()[0],
        h = e.aoData[a[0][0]];
      a.remove();
      b && b.call(this, e, h);
      (c === k || c) && d.draw();
      return h;
    };
    this.fnDestroy = function (a) {
      this.api(!0).destroy(a);
    };
    this.fnDraw = function (a) {
      this.api(!0).draw(a);
    };
    this.fnFilter = function (a, b, c, d, e, h) {
      e = this.api(!0);
      null === b || b === k
        ? e.search(a, c, d, h)
        : e.column(b).search(a, c, d, h);
      e.draw();
    };
    this.fnGetData = function (a, b) {
      var c = this.api(!0);
      if (a !== k) {
        var d = a.nodeName ? a.nodeName.toLowerCase() : "";
        return b !== k || "td" == d || "th" == d
          ? c.cell(a, b).data()
          : c.row(a).data() || null;
      }
      return c.data().toArray();
    };
    this.fnGetNodes = function (a) {
      var b = this.api(!0);
      return a !== k
        ? b.row(a).node()
        : b
          .rows()
          .nodes()
          .flatten()
          .toArray();
    };
    this.fnGetPosition = function (a) {
      var b = this.api(!0),
        c = a.nodeName.toUpperCase();
      return "TR" == c
        ? b.row(a).index()
        : "TD" == c || "TH" == c
          ? ((a = b.cell(a).index()), [a.row, a.columnVisible, a.column])
          : null;
    };
    this.fnIsOpen = function (a) {
      return this.api(!0)
        .row(a)
        .child.isShown();
    };
    this.fnOpen = function (a, b, c) {
      return this.api(!0)
        .row(a)
        .child(b, c)
        .show()
        .child()[0];
    };
    this.fnPageChange = function (a, b) {
      var c = this.api(!0).page(a);
      (b === k || b) && c.draw(!1);
    };
    this.fnSetColumnVis = function (a, b, c) {
      a = this.api(!0)
        .column(a)
        .visible(b);
      (c === k || c) && a.columns.adjust().draw();
    };
    this.fnSettings = function () {
      return Aa(this[x.iApiIndex]);
    };
    this.fnSort = function (a) {
      this.api(!0)
        .order(a)
        .draw();
    };
    this.fnSortListener = function (a, b, c) {
      this.api(!0).order.listener(a, b, c);
    };
    this.fnUpdate = function (a, b, c, d, e) {
      var h = this.api(!0);
      c === k || null === c ? h.row(b).data(a) : h.cell(b, c).data(a);
      (e === k || e) && h.columns.adjust();
      (d === k || d) && h.draw();
      return 0;
    };
    this.fnVersionCheck = x.fnVersionCheck;
    var b = this,
      c = a === k,
      d = this.length;
    c && (a = {});
    this.oApi = this.internal = x.internal;
    for (var e in m.ext.internal) e && (this[e] = Ob(e));
    this.each(function () {
      var e = {},
        g = 1 < d ? Mb(e, a, !0) : a,
        j = 0,
        i,
        e = this.getAttribute("id"),
        n = !1,
        l = m.defaults,
        q = h(this);
      if ("table" != this.nodeName.toLowerCase())
        K(
          null,
          0,
          "Non-table node initialisation (" + this.nodeName + ")",
          2
        );
      else {
        gb(l);
        hb(l.column);
        J(l, l, !0);
        J(l.column, l.column, !0);
        J(l, h.extend(g, q.data()));
        var r = m.settings,
          j = 0;
        for (i = r.length; j < i; j++) {
          var p = r[j];
          if (
            p.nTable == this ||
            p.nTHead.parentNode == this ||
            (p.nTFoot && p.nTFoot.parentNode == this)
          ) {
            var u = g.bRetrieve !== k ? g.bRetrieve : l.bRetrieve;
            if (c || u) return p.oInstance;
            if (g.bDestroy !== k ? g.bDestroy : l.bDestroy) {
              p.oInstance.fnDestroy();
              break;
            } else {
              K(p, 0, "Cannot reinitialise DataTable", 3);
              return;
            }
          }
          if (p.sTableId == this.id) {
            r.splice(j, 1);
            break;
          }
        }
        if (null === e || "" === e)
          this.id = e = "DataTables_Table_" + m.ext._unique++;
        var o = h.extend(!0, {}, m.models.oSettings, {
          sDestroyWidth: q[0].style.width,
          sInstance: e,
          sTableId: e
        });
        o.nTable = this;
        o.oApi = b.internal;
        o.oInit = g;
        r.push(o);
        o.oInstance = 1 === b.length ? b : q.dataTable();
        gb(g);
        g.oLanguage && Fa(g.oLanguage);
        g.aLengthMenu &&
          !g.iDisplayLength &&
          (g.iDisplayLength = h.isArray(g.aLengthMenu[0])
            ? g.aLengthMenu[0][0]
            : g.aLengthMenu[0]);
        g = Mb(h.extend(!0, {}, l), g);
        F(
          o.oFeatures,
          g,
          "bPaginate bLengthChange bFilter bSort bSortMulti bInfo bProcessing bAutoWidth bSortClasses bServerSide bDeferRender".split(
            " "
          )
        );
        F(o, g, [
          "asStripeClasses",
          "ajax",
          "fnServerData",
          "fnFormatNumber",
          "sServerMethod",
          "aaSorting",
          "aaSortingFixed",
          "aLengthMenu",
          "sPaginationType",
          "sAjaxSource",
          "sAjaxDataProp",
          "iStateDuration",
          "sDom",
          "bSortCellsTop",
          "iTabIndex",
          "fnStateLoadCallback",
          "fnStateSaveCallback",
          "renderer",
          "searchDelay",
          "rowId",
          ["iCookieDuration", "iStateDuration"],
          ["oSearch", "oPreviousSearch"],
          ["aoSearchCols", "aoPreSearchCols"],
          ["iDisplayLength", "_iDisplayLength"],
          ["bJQueryUI", "bJUI"]
        ]);
        F(o.oScroll, g, [
          ["sScrollX", "sX"],
          ["sScrollXInner", "sXInner"],
          ["sScrollY", "sY"],
          ["bScrollCollapse", "bCollapse"]
        ]);
        F(o.oLanguage, g, "fnInfoCallback");
        z(o, "aoDrawCallback", g.fnDrawCallback, "user");
        z(o, "aoServerParams", g.fnServerParams, "user");
        z(o, "aoStateSaveParams", g.fnStateSaveParams, "user");
        z(o, "aoStateLoadParams", g.fnStateLoadParams, "user");
        z(o, "aoStateLoaded", g.fnStateLoaded, "user");
        z(o, "aoRowCallback", g.fnRowCallback, "user");
        z(o, "aoRowCreatedCallback", g.fnCreatedRow, "user");
        z(o, "aoHeaderCallback", g.fnHeaderCallback, "user");
        z(o, "aoFooterCallback", g.fnFooterCallback, "user");
        z(o, "aoInitComplete", g.fnInitComplete, "user");
        z(o, "aoPreDrawCallback", g.fnPreDrawCallback, "user");
        o.rowIdFn = R(g.rowId);
        ib(o);
        var t = o.oClasses;
        g.bJQueryUI
          ? (h.extend(t, m.ext.oJUIClasses, g.oClasses),
            g.sDom === l.sDom &&
            "lfrtip" === l.sDom &&
            (o.sDom = '<"H"lfr>t<"F"ip>'),
            o.renderer)
            ? h.isPlainObject(o.renderer) &&
            !o.renderer.header &&
            (o.renderer.header = "jqueryui")
            : (o.renderer = "jqueryui")
          : h.extend(t, m.ext.classes, g.oClasses);
        q.addClass(t.sTable);
        o.iInitDisplayStart === k &&
          ((o.iInitDisplayStart = g.iDisplayStart),
            (o._iDisplayStart = g.iDisplayStart));
        null !== g.iDeferLoading &&
          ((o.bDeferLoading = !0),
            (e = h.isArray(g.iDeferLoading)),
            (o._iRecordsDisplay = e ? g.iDeferLoading[0] : g.iDeferLoading),
            (o._iRecordsTotal = e ? g.iDeferLoading[1] : g.iDeferLoading));
        var v = o.oLanguage;
        h.extend(!0, v, g.oLanguage);
        v.sUrl &&
          (h.ajax({
            dataType: "json",
            url: v.sUrl,
            success: function (a) {
              Fa(a);
              J(l.oLanguage, a);
              h.extend(true, v, a);
              ha(o);
            },
            error: function () {
              ha(o);
            }
          }),
            (n = !0));
        null === g.asStripeClasses &&
          (o.asStripeClasses = [t.sStripeOdd, t.sStripeEven]);
        var e = o.asStripeClasses,
          x = q
            .children("tbody")
            .find("tr")
            .eq(0);
        -1 !==
          h.inArray(
            !0,
            h.map(e, function (a) {
              return x.hasClass(a);
            })
          ) &&
          (h("tbody tr", this).removeClass(e.join(" ")),
            (o.asDestroyStripes = e.slice()));
        e = [];
        r = this.getElementsByTagName("thead");
        0 !== r.length && (ea(o.aoHeader, r[0]), (e = ta(o)));
        if (null === g.aoColumns) {
          r = [];
          j = 0;
          for (i = e.length; j < i; j++) r.push(null);
        } else r = g.aoColumns;
        j = 0;
        for (i = r.length; j < i; j++) Ga(o, e ? e[j] : null);
        kb(o, g.aoColumnDefs, r, function (a, b) {
          la(o, a, b);
        });
        if (x.length) {
          var w = function (a, b) {
            return a.getAttribute("data-" + b) !== null ? b : null;
          };
          h(x[0])
            .children("th, td")
            .each(function (a, b) {
              var c = o.aoColumns[a];
              if (c.mData === a) {
                var d = w(b, "sort") || w(b, "order"),
                  e = w(b, "filter") || w(b, "search");
                if (d !== null || e !== null) {
                  c.mData = {
                    _: a + ".display",
                    sort: d !== null ? a + ".@data-" + d : k,
                    type: d !== null ? a + ".@data-" + d : k,
                    filter: e !== null ? a + ".@data-" + e : k
                  };
                  la(o, a);
                }
              }
            });
        }
        var U = o.oFeatures,
          e = function () {
            if (g.aaSorting === k) {
              var a = o.aaSorting;
              j = 0;
              for (i = a.length; j < i; j++)
                a[j][1] = o.aoColumns[j].asSorting[0];
            }
            ya(o);
            U.bSort &&
              z(o, "aoDrawCallback", function () {
                if (o.bSorted) {
                  var a = W(o),
                    b = {};
                  h.each(a, function (a, c) {
                    b[c.src] = c.dir;
                  });
                  s(o, null, "order", [o, a, b]);
                  Kb(o);
                }
              });
            z(
              o,
              "aoDrawCallback",
              function () {
                (o.bSorted || y(o) === "ssp" || U.bDeferRender) && ya(o);
              },
              "sc"
            );
            var a = q.children("caption").each(function () {
              this._captionSide = h(this).css("caption-side");
            }),
              b = q.children("thead");
            b.length === 0 && (b = h("<thead/>").appendTo(q));
            o.nTHead = b[0];
            b = q.children("tbody");
            b.length === 0 && (b = h("<tbody/>").appendTo(q));
            o.nTBody = b[0];
            b = q.children("tfoot");
            if (
              b.length === 0 &&
              a.length > 0 &&
              (o.oScroll.sX !== "" || o.oScroll.sY !== "")
            )
              b = h("<tfoot/>").appendTo(q);
            if (b.length === 0 || b.children().length === 0)
              q.addClass(t.sNoFooter);
            else if (b.length > 0) {
              o.nTFoot = b[0];
              ea(o.aoFooter, o.nTFoot);
            }
            if (g.aaData)
              for (j = 0; j < g.aaData.length; j++) N(o, g.aaData[j]);
            else
              (o.bDeferLoading || y(o) == "dom") &&
                oa(o, h(o.nTBody).children("tr"));
            o.aiDisplay = o.aiDisplayMaster.slice();
            o.bInitialised = true;
            n === false && ha(o);
          };
        g.bStateSave
          ? ((U.bStateSave = !0),
            z(o, "aoDrawCallback", za, "state_save"),
            Lb(o, g, e))
          : e();
      }
    });
    b = null;
    return this;
  },
    x,
    u,
    p,
    t,
    $a = {},
    Pb = /[\r\n]/g,
    Ca = /<.*?>/g,
    cc = /^\d{2,4}[\.\/\-]\d{1,2}[\.\/\-]\d{1,2}([T ]{1}\d{1,2}[:\.]\d{2}([\.:]\d{2})?)?$/,
    dc = RegExp(
      "(\\/|\\.|\\*|\\+|\\?|\\||\\(|\\)|\\[|\\]|\\{|\\}|\\\\|\\$|\\^|\\-)",
      "g"
    ),
    Za = /[',$£€¥%\u2009\u202F\u20BD\u20a9\u20BArfk]/gi,
    M = function (a) {
      return !a || !0 === a || "-" === a ? !0 : !1;
    },
    Qb = function (a) {
      var b = parseInt(a, 10);
      return !isNaN(b) && isFinite(a) ? b : null;
    },
    Rb = function (a, b) {
      $a[b] || ($a[b] = RegExp(Sa(b), "g"));
      return "string" === typeof a && "." !== b
        ? a.replace(/\./g, "").replace($a[b], ".")
        : a;
    },
    ab = function (a, b, c) {
      var d = "string" === typeof a;
      if (M(a)) return !0;
      b && d && (a = Rb(a, b));
      c && d && (a = a.replace(Za, ""));
      return !isNaN(parseFloat(a)) && isFinite(a);
    },
    Sb = function (a, b, c) {
      return M(a)
        ? !0
        : !(M(a) || "string" === typeof a)
          ? null
          : ab(a.replace(Ca, ""), b, c)
            ? !0
            : null;
    },
    D = function (a, b, c) {
      var d = [],
        e = 0,
        f = a.length;
      if (c !== k) for (; e < f; e++) a[e] && a[e][b] && d.push(a[e][b][c]);
      else for (; e < f; e++) a[e] && d.push(a[e][b]);
      return d;
    },
    ja = function (a, b, c, d) {
      var e = [],
        f = 0,
        g = b.length;
      if (d !== k) for (; f < g; f++) a[b[f]][c] && e.push(a[b[f]][c][d]);
      else for (; f < g; f++) e.push(a[b[f]][c]);
      return e;
    },
    X = function (a, b) {
      var c = [],
        d;
      b === k ? ((b = 0), (d = a)) : ((d = b), (b = a));
      for (var e = b; e < d; e++) c.push(e);
      return c;
    },
    Tb = function (a) {
      for (var b = [], c = 0, d = a.length; c < d; c++) a[c] && b.push(a[c]);
      return b;
    },
    sa = function (a) {
      var b = [],
        c,
        d,
        e = a.length,
        f,
        g = 0;
      d = 0;
      a: for (; d < e; d++) {
        c = a[d];
        for (f = 0; f < g; f++) if (b[f] === c) continue a;
        b.push(c);
        g++;
      }
      return b;
    };
  m.util = {
    throttle: function (a, b) {
      var c = b !== k ? b : 200,
        d,
        e;
      return function () {
        var b = this,
          g = +new Date(),
          h = arguments;
        d && g < d + c
          ? (clearTimeout(e),
            (e = setTimeout(function () {
              d = k;
              a.apply(b, h);
            }, c)))
          : ((d = g), a.apply(b, h));
      };
    },
    escapeRegex: function (a) {
      return a.replace(dc, "\\$1");
    }
  };
  var A = function (a, b, c) {
    a[b] !== k && (a[c] = a[b]);
  },
    ca = /\[.*?\]$/,
    V = /\(\)$/,
    Sa = m.util.escapeRegex,
    xa = h("<div>")[0],
    $b = xa.textContent !== k,
    bc = /<.*?>/g,
    Qa = m.util.throttle,
    Ub = [],
    w = Array.prototype,
    ec = function (a) {
      var b,
        c,
        d = m.settings,
        e = h.map(d, function (a) {
          return a.nTable;
        });
      if (a) {
        if (a.nTable && a.oApi) return [a];
        if (a.nodeName && "table" === a.nodeName.toLowerCase())
          return (b = h.inArray(a, e)), -1 !== b ? [d[b]] : null;
        if (a && "function" === typeof a.settings)
          return a.settings().toArray();
        "string" === typeof a ? (c = h(a)) : a instanceof h && (c = a);
      } else return [];
      if (c)
        return c
          .map(function () {
            b = h.inArray(this, e);
            return -1 !== b ? d[b] : null;
          })
          .toArray();
    };
  u = function (a, b) {
    if (!(this instanceof u)) return new u(a, b);
    var c = [],
      d = function (a) {
        (a = ec(a)) && (c = c.concat(a));
      };
    if (h.isArray(a)) for (var e = 0, f = a.length; e < f; e++) d(a[e]);
    else d(a);
    this.context = sa(c);
    b && h.merge(this, b);
    this.selector = { rows: null, cols: null, opts: null };
    u.extend(this, this, Ub);
  };
  m.Api = u;
  h.extend(u.prototype, {
    any: function () {
      return 0 !== this.count();
    },
    concat: w.concat,
    context: [],
    count: function () {
      return this.flatten().length;
    },
    each: function (a) {
      for (var b = 0, c = this.length; b < c; b++)
        a.call(this, this[b], b, this);
      return this;
    },
    eq: function (a) {
      var b = this.context;
      return b.length > a ? new u(b[a], this[a]) : null;
    },
    filter: function (a) {
      var b = [];
      if (w.filter) b = w.filter.call(this, a, this);
      else
        for (var c = 0, d = this.length; c < d; c++)
          a.call(this, this[c], c, this) && b.push(this[c]);
      return new u(this.context, b);
    },
    flatten: function () {
      var a = [];
      return new u(this.context, a.concat.apply(a, this.toArray()));
    },
    join: w.join,
    indexOf:
      w.indexOf ||
      function (a, b) {
        for (var c = b || 0, d = this.length; c < d; c++)
          if (this[c] === a) return c;
        return -1;
      },
    iterator: function (a, b, c, d) {
      var e = [],
        f,
        g,
        h,
        i,
        n,
        l = this.context,
        m,
        p,
        t = this.selector;
      "string" === typeof a && ((d = c), (c = b), (b = a), (a = !1));
      g = 0;
      for (h = l.length; g < h; g++) {
        var s = new u(l[g]);
        if ("table" === b) (f = c.call(s, l[g], g)), f !== k && e.push(f);
        else if ("columns" === b || "rows" === b)
          (f = c.call(s, l[g], this[g], g)), f !== k && e.push(f);
        else if (
          "column" === b ||
          "column-rows" === b ||
          "row" === b ||
          "cell" === b
        ) {
          p = this[g];
          "column-rows" === b && (m = Da(l[g], t.opts));
          i = 0;
          for (n = p.length; i < n; i++)
            (f = p[i]),
              (f =
                "cell" === b
                  ? c.call(s, l[g], f.row, f.column, g, i)
                  : c.call(s, l[g], f, g, i, m)),
              f !== k && e.push(f);
        }
      }
      return e.length || d
        ? ((a = new u(l, a ? e.concat.apply([], e) : e)),
          (b = a.selector),
          (b.rows = t.rows),
          (b.cols = t.cols),
          (b.opts = t.opts),
          a)
        : this;
    },
    lastIndexOf:
      w.lastIndexOf ||
      function (a, b) {
        return this.indexOf.apply(this.toArray.reverse(), arguments);
      },
    length: 0,
    map: function (a) {
      var b = [];
      if (w.map) b = w.map.call(this, a, this);
      else
        for (var c = 0, d = this.length; c < d; c++)
          b.push(a.call(this, this[c], c));
      return new u(this.context, b);
    },
    pluck: function (a) {
      return this.map(function (b) {
        return b[a];
      });
    },
    pop: w.pop,
    push: w.push,
    reduce:
      w.reduce ||
      function (a, b) {
        return jb(this, a, b, 0, this.length, 1);
      },
    reduceRight:
      w.reduceRight ||
      function (a, b) {
        return jb(this, a, b, this.length - 1, -1, -1);
      },
    reverse: w.reverse,
    selector: null,
    shift: w.shift,
    sort: w.sort,
    splice: w.splice,
    toArray: function () {
      return w.slice.call(this);
    },
    to$: function () {
      return h(this);
    },
    toJQuery: function () {
      return h(this);
    },
    unique: function () {
      return new u(this.context, sa(this));
    },
    unshift: w.unshift
  });
  u.extend = function (a, b, c) {
    if (c.length && b && (b instanceof u || b.__dt_wrapper)) {
      var d,
        e,
        f,
        g = function (a, b, c) {
          return function () {
            var d = b.apply(a, arguments);
            u.extend(d, d, c.methodExt);
            return d;
          };
        };
      d = 0;
      for (e = c.length; d < e; d++)
        (f = c[d]),
          (b[f.name] =
            "function" === typeof f.val
              ? g(a, f.val, f)
              : h.isPlainObject(f.val)
                ? {}
                : f.val),
          (b[f.name].__dt_wrapper = !0),
          u.extend(a, b[f.name], f.propExt);
    }
  };
  u.register = p = function (a, b) {
    if (h.isArray(a))
      for (var c = 0, d = a.length; c < d; c++) u.register(a[c], b);
    else
      for (
        var e = a.split("."), f = Ub, g, j, c = 0, d = e.length;
        c < d;
        c++
      ) {
        g = (j = -1 !== e[c].indexOf("()")) ? e[c].replace("()", "") : e[c];
        var i;
        a: {
          i = 0;
          for (var n = f.length; i < n; i++)
            if (f[i].name === g) {
              i = f[i];
              break a;
            }
          i = null;
        }
        i ||
          ((i = { name: g, val: {}, methodExt: [], propExt: [] }), f.push(i));
        c === d - 1 ? (i.val = b) : (f = j ? i.methodExt : i.propExt);
      }
  };
  u.registerPlural = t = function (a, b, c) {
    u.register(a, c);
    u.register(b, function () {
      var a = c.apply(this, arguments);
      return a === this
        ? this
        : a instanceof u
          ? a.length
            ? h.isArray(a[0])
              ? new u(a.context, a[0])
              : a[0]
            : k
          : a;
    });
  };
  p("tables()", function (a) {
    var b;
    if (a) {
      b = u;
      var c = this.context;
      if ("number" === typeof a) a = [c[a]];
      else
        var d = h.map(c, function (a) {
          return a.nTable;
        }),
          a = h(d)
            .filter(a)
            .map(function () {
              var a = h.inArray(this, d);
              return c[a];
            })
            .toArray();
      b = new b(a);
    } else b = this;
    return b;
  });
  p("table()", function (a) {
    var a = this.tables(a),
      b = a.context;
    return b.length ? new u(b[0]) : a;
  });
  t("tables().nodes()", "table().node()", function () {
    return this.iterator(
      "table",
      function (a) {
        return a.nTable;
      },
      1
    );
  });
  t("tables().body()", "table().body()", function () {
    return this.iterator(
      "table",
      function (a) {
        return a.nTBody;
      },
      1
    );
  });
  t("tables().header()", "table().header()", function () {
    return this.iterator(
      "table",
      function (a) {
        return a.nTHead;
      },
      1
    );
  });
  t("tables().footer()", "table().footer()", function () {
    return this.iterator(
      "table",
      function (a) {
        return a.nTFoot;
      },
      1
    );
  });
  t("tables().containers()", "table().container()", function () {
    return this.iterator(
      "table",
      function (a) {
        return a.nTableWrapper;
      },
      1
    );
  });
  p("draw()", function (a) {
    return this.iterator("table", function (b) {
      "page" === a
        ? O(b)
        : ("string" === typeof a && (a = "full-hold" === a ? !1 : !0),
          T(b, !1 === a));
    });
  });
  p("page()", function (a) {
    return a === k
      ? this.page.info().page
      : this.iterator("table", function (b) {
        Va(b, a);
      });
  });
  p("page.info()", function () {
    if (0 === this.context.length) return k;
    var a = this.context[0],
      b = a._iDisplayStart,
      c = a.oFeatures.bPaginate ? a._iDisplayLength : -1,
      d = a.fnRecordsDisplay(),
      e = -1 === c;
    return {
      page: e ? 0 : Math.floor(b / c),
      pages: e ? 1 : Math.ceil(d / c),
      start: b,
      end: a.fnDisplayEnd(),
      length: c,
      recordsTotal: a.fnRecordsTotal(),
      recordsDisplay: d,
      serverSide: "ssp" === y(a)
    };
  });
  p("page.len()", function (a) {
    return a === k
      ? 0 !== this.context.length
        ? this.context[0]._iDisplayLength
        : k
      : this.iterator("table", function (b) {
        Ta(b, a);
      });
  });
  var Vb = function (a, b, c) {
    if (c) {
      var d = new u(a);
      d.one("draw", function () {
        c(d.ajax.json());
      });
    }
    if ("ssp" == y(a)) T(a, b);
    else {
      C(a, !0);
      var e = a.jqXHR;
      e && 4 !== e.readyState && e.abort();
      ua(a, [], function (c) {
        pa(a);
        for (var c = va(a, c), d = 0, e = c.length; d < e; d++) N(a, c[d]);
        T(a, b);
        C(a, !1);
      });
    }
  };
  p("ajax.json()", function () {
    var a = this.context;
    if (0 < a.length) return a[0].json;
  });
  p("ajax.params()", function () {
    var a = this.context;
    if (0 < a.length) return a[0].oAjaxData;
  });
  p("ajax.reload()", function (a, b) {
    return this.iterator("table", function (c) {
      Vb(c, !1 === b, a);
    });
  });
  p("ajax.url()", function (a) {
    var b = this.context;
    if (a === k) {
      if (0 === b.length) return k;
      b = b[0];
      return b.ajax
        ? h.isPlainObject(b.ajax)
          ? b.ajax.url
          : b.ajax
        : b.sAjaxSource;
    }
    return this.iterator("table", function (b) {
      h.isPlainObject(b.ajax) ? (b.ajax.url = a) : (b.ajax = a);
    });
  });
  p("ajax.url().load()", function (a, b) {
    return this.iterator("table", function (c) {
      Vb(c, !1 === b, a);
    });
  });
  var bb = function (a, b, c, d, e) {
    var f = [],
      g,
      j,
      i,
      n,
      l,
      m;
    i = typeof b;
    if (!b || "string" === i || "function" === i || b.length === k) b = [b];
    i = 0;
    for (n = b.length; i < n; i++) {
      j =
        b[i] && b[i].split && !b[i].match(/[\[\(:]/)
          ? b[i].split(",")
          : [b[i]];
      l = 0;
      for (m = j.length; l < m; l++)
        (g = c("string" === typeof j[l] ? h.trim(j[l]) : j[l])) &&
          g.length &&
          (f = f.concat(g));
    }
    a = x.selector[a];
    if (a.length) {
      i = 0;
      for (n = a.length; i < n; i++) f = a[i](d, e, f);
    }
    return sa(f);
  },
    cb = function (a) {
      a || (a = {});
      a.filter && a.search === k && (a.search = a.filter);
      return h.extend({ search: "none", order: "current", page: "all" }, a);
    },
    db = function (a) {
      for (var b = 0, c = a.length; b < c; b++)
        if (0 < a[b].length)
          return (
            (a[0] = a[b]),
            (a[0].length = 1),
            (a.length = 1),
            (a.context = [a.context[b]]),
            a
          );
      a.length = 0;
      return a;
    },
    Da = function (a, b) {
      var c,
        d,
        e,
        f = [],
        g = a.aiDisplay;
      c = a.aiDisplayMaster;
      var j = b.search;
      d = b.order;
      e = b.page;
      if ("ssp" == y(a)) return "removed" === j ? [] : X(0, c.length);
      if ("current" == e) {
        c = a._iDisplayStart;
        for (d = a.fnDisplayEnd(); c < d; c++) f.push(g[c]);
      } else if ("current" == d || "applied" == d)
        f =
          "none" == j
            ? c.slice()
            : "applied" == j
              ? g.slice()
              : h.map(c, function (a) {
                return -1 === h.inArray(a, g) ? a : null;
              });
      else if ("index" == d || "original" == d) {
        c = 0;
        for (d = a.aoData.length; c < d; c++)
          "none" == j
            ? f.push(c)
            : ((e = h.inArray(c, g)),
              ((-1 === e && "removed" == j) || (0 <= e && "applied" == j)) &&
              f.push(c));
      }
      return f;
    };
  p("rows()", function (a, b) {
    a === k ? (a = "") : h.isPlainObject(a) && ((b = a), (a = ""));
    var b = cb(b),
      c = this.iterator(
        "table",
        function (c) {
          var e = b,
            f;
          return bb(
            "row",
            a,
            function (a) {
              var b = Qb(a);
              if (b !== null && !e) return [b];
              f || (f = Da(c, e));
              if (b !== null && h.inArray(b, f) !== -1) return [b];
              if (a === null || a === k || a === "") return f;
              if (typeof a === "function")
                return h.map(f, function (b) {
                  var e = c.aoData[b];
                  return a(b, e._aData, e.nTr) ? b : null;
                });
              b = Tb(ja(c.aoData, f, "nTr"));
              if (a.nodeName) {
                if (a._DT_RowIndex !== k) return [a._DT_RowIndex];
                if (a._DT_CellIndex) return [a._DT_CellIndex.row];
                b = h(a).closest("*[data-dt-row]");
                return b.length ? [b.data("dt-row")] : [];
              }
              if (typeof a === "string" && a.charAt(0) === "#") {
                var i = c.aIds[a.replace(/^#/, "")];
                if (i !== k) return [i.idx];
              }
              return h(b)
                .filter(a)
                .map(function () {
                  return this._DT_RowIndex;
                })
                .toArray();
            },
            c,
            e
          );
        },
        1
      );
    c.selector.rows = a;
    c.selector.opts = b;
    return c;
  });
  p("rows().nodes()", function () {
    return this.iterator(
      "row",
      function (a, b) {
        return a.aoData[b].nTr || k;
      },
      1
    );
  });
  p("rows().data()", function () {
    return this.iterator(
      !0,
      "rows",
      function (a, b) {
        return ja(a.aoData, b, "_aData");
      },
      1
    );
  });
  t("rows().cache()", "row().cache()", function (a) {
    return this.iterator(
      "row",
      function (b, c) {
        var d = b.aoData[c];
        return "search" === a ? d._aFilterData : d._aSortData;
      },
      1
    );
  });
  t("rows().invalidate()", "row().invalidate()", function (a) {
    return this.iterator("row", function (b, c) {
      da(b, c, a);
    });
  });
  t("rows().indexes()", "row().index()", function () {
    return this.iterator(
      "row",
      function (a, b) {
        return b;
      },
      1
    );
  });
  t("rows().ids()", "row().id()", function (a) {
    for (var b = [], c = this.context, d = 0, e = c.length; d < e; d++)
      for (var f = 0, g = this[d].length; f < g; f++) {
        var h = c[d].rowIdFn(c[d].aoData[this[d][f]]._aData);
        b.push((!0 === a ? "#" : "") + h);
      }
    return new u(c, b);
  });
  t("rows().remove()", "row().remove()", function () {
    var a = this;
    this.iterator("row", function (b, c, d) {
      var e = b.aoData,
        f = e[c],
        g,
        h,
        i,
        n,
        l;
      e.splice(c, 1);
      g = 0;
      for (h = e.length; g < h; g++)
        if (
          ((i = e[g]),
            (l = i.anCells),
            null !== i.nTr && (i.nTr._DT_RowIndex = g),
            null !== l)
        ) {
          i = 0;
          for (n = l.length; i < n; i++) l[i]._DT_CellIndex.row = g;
        }
      qa(b.aiDisplayMaster, c);
      qa(b.aiDisplay, c);
      qa(a[d], c, !1);
      Ua(b);
      c = b.rowIdFn(f._aData);
      c !== k && delete b.aIds[c];
    });
    this.iterator("table", function (a) {
      for (var c = 0, d = a.aoData.length; c < d; c++) a.aoData[c].idx = c;
    });
    return this;
  });
  p("rows.add()", function (a) {
    var b = this.iterator(
      "table",
      function (b) {
        var c,
          f,
          g,
          h = [];
        f = 0;
        for (g = a.length; f < g; f++)
          (c = a[f]),
            c.nodeName && "TR" === c.nodeName.toUpperCase()
              ? h.push(oa(b, c)[0])
              : h.push(N(b, c));
        return h;
      },
      1
    ),
      c = this.rows(-1);
    c.pop();
    h.merge(c, b);
    return c;
  });
  p("row()", function (a, b) {
    return db(this.rows(a, b));
  });
  p("row().data()", function (a) {
    var b = this.context;
    if (a === k)
      return b.length && this.length ? b[0].aoData[this[0]]._aData : k;
    b[0].aoData[this[0]]._aData = a;
    da(b[0], this[0], "data");
    return this;
  });
  p("row().node()", function () {
    var a = this.context;
    return a.length && this.length ? a[0].aoData[this[0]].nTr || null : null;
  });
  p("row.add()", function (a) {
    a instanceof h && a.length && (a = a[0]);
    var b = this.iterator("table", function (b) {
      return a.nodeName && "TR" === a.nodeName.toUpperCase()
        ? oa(b, a)[0]
        : N(b, a);
    });
    return this.row(b[0]);
  });
  var eb = function (a, b) {
    var c = a.context;
    if (c.length && (c = c[0].aoData[b !== k ? b : a[0]]) && c._details)
      c._details.remove(), (c._detailsShow = k), (c._details = k);
  },
    Wb = function (a, b) {
      var c = a.context;
      if (c.length && a.length) {
        var d = c[0].aoData[a[0]];
        if (d._details) {
          (d._detailsShow = b)
            ? d._details.insertAfter(d.nTr)
            : d._details.detach();
          var e = c[0],
            f = new u(e),
            g = e.aoData;
          f.off(
            "draw.dt.DT_details column-visibility.dt.DT_details destroy.dt.DT_details"
          );
          0 < D(g, "_details").length &&
            (f.on("draw.dt.DT_details", function (a, b) {
              e === b &&
                f
                  .rows({ page: "current" })
                  .eq(0)
                  .each(function (a) {
                    a = g[a];
                    a._detailsShow && a._details.insertAfter(a.nTr);
                  });
            }),
              f.on("column-visibility.dt.DT_details", function (a, b) {
                if (e === b)
                  for (var c, d = ba(b), f = 0, h = g.length; f < h; f++)
                    (c = g[f]),
                      c._details &&
                      c._details.children("td[colspan]").attr("colspan", d);
              }),
              f.on("destroy.dt.DT_details", function (a, b) {
                if (e === b)
                  for (var c = 0, d = g.length; c < d; c++)
                    g[c]._details && eb(f, c);
              }));
        }
      }
    };
  p("row().child()", function (a, b) {
    var c = this.context;
    if (a === k)
      return c.length && this.length ? c[0].aoData[this[0]]._details : k;
    if (!0 === a) this.child.show();
    else if (!1 === a) eb(this);
    else if (c.length && this.length) {
      var d = c[0],
        c = c[0].aoData[this[0]],
        e = [],
        f = function (a, b) {
          if (h.isArray(a) || a instanceof h)
            for (var c = 0, k = a.length; c < k; c++) f(a[c], b);
          else
            a.nodeName && "tr" === a.nodeName.toLowerCase()
              ? e.push(a)
              : ((c = h("<tr><td/></tr>").addClass(b)),
                (h("td", c)
                  .addClass(b)
                  .html(a)[0].colSpan = ba(d)),
                e.push(c[0]));
        };
      f(a, b);
      c._details && c._details.detach();
      c._details = h(e);
      c._detailsShow && c._details.insertAfter(c.nTr);
    }
    return this;
  });
  p(["row().child.show()", "row().child().show()"], function () {
    Wb(this, !0);
    return this;
  });
  p(["row().child.hide()", "row().child().hide()"], function () {
    Wb(this, !1);
    return this;
  });
  p(["row().child.remove()", "row().child().remove()"], function () {
    eb(this);
    return this;
  });
  p("row().child.isShown()", function () {
    var a = this.context;
    return a.length && this.length
      ? a[0].aoData[this[0]]._detailsShow || !1
      : !1;
  });
  var fc = /^([^:]+):(name|visIdx|visible)$/,
    Xb = function (a, b, c, d, e) {
      for (var c = [], d = 0, f = e.length; d < f; d++) c.push(B(a, e[d], b));
      return c;
    };
  p("columns()", function (a, b) {
    a === k ? (a = "") : h.isPlainObject(a) && ((b = a), (a = ""));
    var b = cb(b),
      c = this.iterator(
        "table",
        function (c) {
          var e = a,
            f = b,
            g = c.aoColumns,
            j = D(g, "sName"),
            i = D(g, "nTh");
          return bb(
            "column",
            e,
            function (a) {
              var b = Qb(a);
              if (a === "") return X(g.length);
              if (b !== null) return [b >= 0 ? b : g.length + b];
              if (typeof a === "function") {
                var e = Da(c, f);
                return h.map(g, function (b, f) {
                  return a(f, Xb(c, f, 0, 0, e), i[f]) ? f : null;
                });
              }
              var k = typeof a === "string" ? a.match(fc) : "";
              if (k)
                switch (k[2]) {
                  case "visIdx":
                  case "visible":
                    b = parseInt(k[1], 10);
                    if (b < 0) {
                      var m = h.map(g, function (a, b) {
                        return a.bVisible ? b : null;
                      });
                      return [m[m.length + b]];
                    }
                    return [$(c, b)];
                  case "name":
                    return h.map(j, function (a, b) {
                      return a === k[1] ? b : null;
                    });
                  default:
                    return [];
                }
              if (a.nodeName && a._DT_CellIndex)
                return [a._DT_CellIndex.column];
              b = h(i)
                .filter(a)
                .map(function () {
                  return h.inArray(this, i);
                })
                .toArray();
              if (b.length || !a.nodeName) return b;
              b = h(a).closest("*[data-dt-column]");
              return b.length ? [b.data("dt-column")] : [];
            },
            c,
            f
          );
        },
        1
      );
    c.selector.cols = a;
    c.selector.opts = b;
    return c;
  });
  t("columns().header()", "column().header()", function () {
    return this.iterator(
      "column",
      function (a, b) {
        return a.aoColumns[b].nTh;
      },
      1
    );
  });
  t("columns().footer()", "column().footer()", function () {
    return this.iterator(
      "column",
      function (a, b) {
        return a.aoColumns[b].nTf;
      },
      1
    );
  });
  t("columns().data()", "column().data()", function () {
    return this.iterator("column-rows", Xb, 1);
  });
  t("columns().dataSrc()", "column().dataSrc()", function () {
    return this.iterator(
      "column",
      function (a, b) {
        return a.aoColumns[b].mData;
      },
      1
    );
  });
  t("columns().cache()", "column().cache()", function (a) {
    return this.iterator(
      "column-rows",
      function (b, c, d, e, f) {
        return ja(
          b.aoData,
          f,
          "search" === a ? "_aFilterData" : "_aSortData",
          c
        );
      },
      1
    );
  });
  t("columns().nodes()", "column().nodes()", function () {
    return this.iterator(
      "column-rows",
      function (a, b, c, d, e) {
        return ja(a.aoData, e, "anCells", b);
      },
      1
    );
  });
  t("columns().visible()", "column().visible()", function (a, b) {
    var c = this.iterator("column", function (b, c) {
      if (a === k) return b.aoColumns[c].bVisible;
      var f = b.aoColumns,
        g = f[c],
        j = b.aoData,
        i,
        n,
        l;
      if (a !== k && g.bVisible !== a) {
        if (a) {
          var m = h.inArray(!0, D(f, "bVisible"), c + 1);
          i = 0;
          for (n = j.length; i < n; i++)
            (l = j[i].nTr),
              (f = j[i].anCells),
              l && l.insertBefore(f[c], f[m] || null);
        } else h(D(b.aoData, "anCells", c)).detach();
        g.bVisible = a;
        fa(b, b.aoHeader);
        fa(b, b.aoFooter);
        za(b);
      }
    });
    a !== k &&
      (this.iterator("column", function (c, e) {
        s(c, null, "column-visibility", [c, e, a, b]);
      }),
        (b === k || b) && this.columns.adjust());
    return c;
  });
  t("columns().indexes()", "column().index()", function (a) {
    return this.iterator(
      "column",
      function (b, c) {
        return "visible" === a ? aa(b, c) : c;
      },
      1
    );
  });
  p("columns.adjust()", function () {
    return this.iterator(
      "table",
      function (a) {
        Z(a);
      },
      1
    );
  });
  p("column.index()", function (a, b) {
    if (0 !== this.context.length) {
      var c = this.context[0];
      if ("fromVisible" === a || "toData" === a) return $(c, b);
      if ("fromData" === a || "toVisible" === a) return aa(c, b);
    }
  });
  p("column()", function (a, b) {
    return db(this.columns(a, b));
  });
  p("cells()", function (a, b, c) {
    h.isPlainObject(a) &&
      (a.row === k ? ((c = a), (a = null)) : ((c = b), (b = null)));
    h.isPlainObject(b) && ((c = b), (b = null));
    if (null === b || b === k)
      return this.iterator("table", function (b) {
        var d = a,
          e = cb(c),
          f = b.aoData,
          g = Da(b, e),
          i = Tb(ja(f, g, "anCells")),
          j = h([].concat.apply([], i)),
          l,
          n = b.aoColumns.length,
          m,
          p,
          t,
          u,
          s,
          v;
        return bb(
          "cell",
          d,
          function (a) {
            var c = typeof a === "function";
            if (a === null || a === k || c) {
              m = [];
              p = 0;
              for (t = g.length; p < t; p++) {
                l = g[p];
                for (u = 0; u < n; u++) {
                  s = { row: l, column: u };
                  if (c) {
                    v = f[l];
                    a(s, B(b, l, u), v.anCells ? v.anCells[u] : null) &&
                      m.push(s);
                  } else m.push(s);
                }
              }
              return m;
            }
            if (h.isPlainObject(a)) return [a];
            c = j
              .filter(a)
              .map(function (a, b) {
                return {
                  row: b._DT_CellIndex.row,
                  column: b._DT_CellIndex.column
                };
              })
              .toArray();
            if (c.length || !a.nodeName) return c;
            v = h(a).closest("*[data-dt-row]");
            return v.length
              ? [{ row: v.data("dt-row"), column: v.data("dt-column") }]
              : [];
          },
          b,
          e
        );
      });
    var d = this.columns(b, c),
      e = this.rows(a, c),
      f,
      g,
      j,
      i,
      n,
      l = this.iterator(
        "table",
        function (a, b) {
          f = [];
          g = 0;
          for (j = e[b].length; g < j; g++) {
            i = 0;
            for (n = d[b].length; i < n; i++)
              f.push({ row: e[b][g], column: d[b][i] });
          }
          return f;
        },
        1
      );
    h.extend(l.selector, { cols: b, rows: a, opts: c });
    return l;
  });
  t("cells().nodes()", "cell().node()", function () {
    return this.iterator(
      "cell",
      function (a, b, c) {
        return (a = a.aoData[b]) && a.anCells ? a.anCells[c] : k;
      },
      1
    );
  });
  p("cells().data()", function () {
    return this.iterator(
      "cell",
      function (a, b, c) {
        return B(a, b, c);
      },
      1
    );
  });
  t("cells().cache()", "cell().cache()", function (a) {
    a = "search" === a ? "_aFilterData" : "_aSortData";
    return this.iterator(
      "cell",
      function (b, c, d) {
        return b.aoData[c][a][d];
      },
      1
    );
  });
  t("cells().render()", "cell().render()", function (a) {
    return this.iterator(
      "cell",
      function (b, c, d) {
        return B(b, c, d, a);
      },
      1
    );
  });
  t("cells().indexes()", "cell().index()", function () {
    return this.iterator(
      "cell",
      function (a, b, c) {
        return { row: b, column: c, columnVisible: aa(a, c) };
      },
      1
    );
  });
  t("cells().invalidate()", "cell().invalidate()", function (a) {
    return this.iterator("cell", function (b, c, d) {
      da(b, c, a, d);
    });
  });
  p("cell()", function (a, b, c) {
    return db(this.cells(a, b, c));
  });
  p("cell().data()", function (a) {
    var b = this.context,
      c = this[0];
    if (a === k)
      return b.length && c.length ? B(b[0], c[0].row, c[0].column) : k;
    lb(b[0], c[0].row, c[0].column, a);
    da(b[0], c[0].row, "data", c[0].column);
    return this;
  });
  p("order()", function (a, b) {
    var c = this.context;
    if (a === k) return 0 !== c.length ? c[0].aaSorting : k;
    "number" === typeof a
      ? (a = [[a, b]])
      : a.length &&
      !h.isArray(a[0]) &&
      (a = Array.prototype.slice.call(arguments));
    return this.iterator("table", function (b) {
      b.aaSorting = a.slice();
    });
  });
  p("order.listener()", function (a, b, c) {
    return this.iterator("table", function (d) {
      Oa(d, a, b, c);
    });
  });
  p("order.fixed()", function (a) {
    if (!a) {
      var b = this.context,
        b = b.length ? b[0].aaSortingFixed : k;
      return h.isArray(b) ? { pre: b } : b;
    }
    return this.iterator("table", function (b) {
      b.aaSortingFixed = h.extend(!0, {}, a);
    });
  });
  p(["columns().order()", "column().order()"], function (a) {
    var b = this;
    return this.iterator("table", function (c, d) {
      var e = [];
      h.each(b[d], function (b, c) {
        e.push([c, a]);
      });
      c.aaSorting = e;
    });
  });
  p("search()", function (a, b, c, d) {
    var e = this.context;
    return a === k
      ? 0 !== e.length
        ? e[0].oPreviousSearch.sSearch
        : k
      : this.iterator("table", function (e) {
        e.oFeatures.bFilter &&
          ga(
            e,
            h.extend({}, e.oPreviousSearch, {
              sSearch: a + "",
              bRegex: null === b ? !1 : b,
              bSmart: null === c ? !0 : c,
              bCaseInsensitive: null === d ? !0 : d
            }),
            1
          );
      });
  });
  t("columns().search()", "column().search()", function (a, b, c, d) {
    return this.iterator("column", function (e, f) {
      var g = e.aoPreSearchCols;
      if (a === k) return g[f].sSearch;
      e.oFeatures.bFilter &&
        (h.extend(g[f], {
          sSearch: a + "",
          bRegex: null === b ? !1 : b,
          bSmart: null === c ? !0 : c,
          bCaseInsensitive: null === d ? !0 : d
        }),
          ga(e, e.oPreviousSearch, 1));
    });
  });
  p("state()", function () {
    return this.context.length ? this.context[0].oSavedState : null;
  });
  p("state.clear()", function () {
    return this.iterator("table", function (a) {
      a.fnStateSaveCallback.call(a.oInstance, a, {});
    });
  });
  p("state.loaded()", function () {
    return this.context.length ? this.context[0].oLoadedState : null;
  });
  p("state.save()", function () {
    return this.iterator("table", function (a) {
      za(a);
    });
  });
  m.versionCheck = m.fnVersionCheck = function (a) {
    for (
      var b = m.version.split("."), a = a.split("."), c, d, e = 0, f = a.length;
      e < f;
      e++
    )
      if (
        ((c = parseInt(b[e], 10) || 0), (d = parseInt(a[e], 10) || 0), c !== d)
      )
        return c > d;
    return !0;
  };
  m.isDataTable = m.fnIsDataTable = function (a) {
    var b = h(a).get(0),
      c = !1;
    if (a instanceof m.Api) return !0;
    h.each(m.settings, function (a, e) {
      var f = e.nScrollHead ? h("table", e.nScrollHead)[0] : null,
        g = e.nScrollFoot ? h("table", e.nScrollFoot)[0] : null;
      if (e.nTable === b || f === b || g === b) c = !0;
    });
    return c;
  };
  m.tables = m.fnTables = function (a) {
    var b = !1;
    h.isPlainObject(a) && ((b = a.api), (a = a.visible));
    var c = h.map(m.settings, function (b) {
      if (!a || (a && h(b.nTable).is(":visible"))) return b.nTable;
    });
    return b ? new u(c) : c;
  };
  m.camelToHungarian = J;
  p("$()", function (a, b) {
    var c = this.rows(b).nodes(),
      c = h(c);
    return h([].concat(c.filter(a).toArray(), c.find(a).toArray()));
  });
  h.each(["on", "one", "off"], function (a, b) {
    p(b + "()", function () {
      var a = Array.prototype.slice.call(arguments);
      a[0] = h
        .map(a[0].split(/\s/), function (a) {
          return !a.match(/\.dt\b/) ? a + ".dt" : a;
        })
        .join(" ");
      var d = h(this.tables().nodes());
      d[b].apply(d, a);
      return this;
    });
  });
  p("clear()", function () {
    return this.iterator("table", function (a) {
      pa(a);
    });
  });
  p("settings()", function () {
    return new u(this.context, this.context);
  });
  p("init()", function () {
    var a = this.context;
    return a.length ? a[0].oInit : null;
  });
  p("data()", function () {
    return this.iterator("table", function (a) {
      return D(a.aoData, "_aData");
    }).flatten();
  });
  p("destroy()", function (a) {
    a = a || !1;
    return this.iterator("table", function (b) {
      var c = b.nTableWrapper.parentNode,
        d = b.oClasses,
        e = b.nTable,
        f = b.nTBody,
        g = b.nTHead,
        j = b.nTFoot,
        i = h(e),
        f = h(f),
        k = h(b.nTableWrapper),
        l = h.map(b.aoData, function (a) {
          return a.nTr;
        }),
        p;
      b.bDestroying = !0;
      s(b, "aoDestroyCallback", "destroy", [b]);
      a || new u(b).columns().visible(!0);
      k.off(".DT")
        .find(":not(tbody *)")
        .off(".DT");
      h(E).off(".DT-" + b.sInstance);
      e != g.parentNode && (i.children("thead").detach(), i.append(g));
      j && e != j.parentNode && (i.children("tfoot").detach(), i.append(j));
      b.aaSorting = [];
      b.aaSortingFixed = [];
      ya(b);
      h(l).removeClass(b.asStripeClasses.join(" "));
      h("th, td", g).removeClass(
        d.sSortable +
        " " +
        d.sSortableAsc +
        " " +
        d.sSortableDesc +
        " " +
        d.sSortableNone
      );
      b.bJUI &&
        (h("th span." + d.sSortIcon + ", td span." + d.sSortIcon, g).detach(),
          h("th, td", g).each(function () {
            var a = h("div." + d.sSortJUIWrapper, this);
            h(this).append(a.contents());
            a.detach();
          }));
      f.children().detach();
      f.append(l);
      g = a ? "remove" : "detach";
      i[g]();
      k[g]();
      !a &&
        c &&
        (c.insertBefore(e, b.nTableReinsertBefore),
          i.css("width", b.sDestroyWidth).removeClass(d.sTable),
          (p = b.asDestroyStripes.length) &&
          f.children().each(function (a) {
            h(this).addClass(b.asDestroyStripes[a % p]);
          }));
      c = h.inArray(b, m.settings);
      -1 !== c && m.settings.splice(c, 1);
    });
  });
  h.each(["column", "row", "cell"], function (a, b) {
    p(b + "s().every()", function (a) {
      var d = this.selector.opts,
        e = this;
      return this.iterator(b, function (f, g, h, i, m) {
        a.call(e[b](g, "cell" === b ? h : d, "cell" === b ? d : k), g, h, i, m);
      });
    });
  });
  p("i18n()", function (a, b, c) {
    var d = this.context[0],
      a = R(a)(d.oLanguage);
    a === k && (a = b);
    c !== k && h.isPlainObject(a) && (a = a[c] !== k ? a[c] : a._);
    return a.replace("%d", c);
  });
  m.version = "1.10.13";
  m.settings = [];
  m.models = {};
  m.models.oSearch = {
    bCaseInsensitive: !0,
    sSearch: "",
    bRegex: !1,
    bSmart: !0
  };
  m.models.oRow = {
    nTr: null,
    anCells: null,
    _aData: [],
    _aSortData: null,
    _aFilterData: null,
    _sFilterRow: null,
    _sRowStripe: "",
    src: null,
    idx: -1
  };
  m.models.oColumn = {
    idx: null,
    aDataSort: null,
    asSorting: null,
    bSearchable: null,
    bSortable: null,
    bVisible: null,
    _sManualType: null,
    _bAttrSrc: !1,
    fnCreatedCell: null,
    fnGetData: null,
    fnSetData: null,
    mData: null,
    mRender: null,
    nTh: null,
    nTf: null,
    sClass: null,
    sContentPadding: null,
    sDefaultContent: null,
    sName: null,
    sSortDataType: "std",
    sSortingClass: null,
    sSortingClassJUI: null,
    sTitle: null,
    sType: null,
    sWidth: null,
    sWidthOrig: null
  };
  m.defaults = {
    aaData: null,
    aaSorting: [[0, "asc"]],
    aaSortingFixed: [],
    ajax: null,
    aLengthMenu: [10, 25, 50, 100],
    aoColumns: null,
    aoColumnDefs: null,
    aoSearchCols: [],
    asStripeClasses: null,
    bAutoWidth: !0,
    bDeferRender: !1,
    bDestroy: !1,
    bFilter: !0,
    bInfo: !0,
    bJQueryUI: !1,
    bLengthChange: !0,
    bPaginate: !0,
    bProcessing: !1,
    bRetrieve: !1,
    bScrollCollapse: !1,
    bServerSide: !1,
    bSort: !0,
    bSortMulti: !0,
    bSortCellsTop: !1,
    bSortClasses: !0,
    bStateSave: !1,
    fnCreatedRow: null,
    fnDrawCallback: null,
    fnFooterCallback: null,
    fnFormatNumber: function (a) {
      return a
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, this.oLanguage.sThousands);
    },
    fnHeaderCallback: null,
    fnInfoCallback: null,
    fnInitComplete: null,
    fnPreDrawCallback: null,
    fnRowCallback: null,
    fnServerData: null,
    fnServerParams: null,
    fnStateLoadCallback: function (a) {
      try {
        return JSON.parse(
          (-1 === a.iStateDuration ? sessionStorage : localStorage).getItem(
            "DataTables_" + a.sInstance + "_" + location.pathname
          )
        );
      } catch (b) { }
    },
    fnStateLoadParams: null,
    fnStateLoaded: null,
    fnStateSaveCallback: function (a, b) {
      try {
        (-1 === a.iStateDuration ? sessionStorage : localStorage).setItem(
          "DataTables_" + a.sInstance + "_" + location.pathname,
          JSON.stringify(b)
        );
      } catch (c) { }
    },
    fnStateSaveParams: null,
    iStateDuration: 7200,
    iDeferLoading: null,
    iDisplayLength: 10,
    iDisplayStart: 0,
    iTabIndex: 0,
    oClasses: {},
    oLanguage: {
      oAria: {
        sSortAscending: ": activate to sort column ascending",
        sSortDescending: ": activate to sort column descending"
      },
      oPaginate: {
        sFirst: "First",
        sLast: "Last",
        sNext: "Next",
        sPrevious: "Previous"
      },
      sEmptyTable: "No data available in table",
      sInfo: "Showing _START_ to _END_ of _TOTAL_ entries",
      sInfoEmpty: "Showing 0 to 0 of 0 entries",
      sInfoFiltered: "(filtered from _MAX_ total entries)",
      sInfoPostFix: "",
      sDecimal: "",
      sThousands: ",",
      sLengthMenu: "Show _MENU_ entries",
      sLoadingRecords: "Loading...",
      sProcessing: "Processing...",
      sSearch: "Search:",
      sSearchPlaceholder: "",
      sUrl: "",
      sZeroRecords: "No matching records found"
    },
    oSearch: h.extend({}, m.models.oSearch),
    sAjaxDataProp: "data",
    sAjaxSource: null,
    sDom: "lfrtip",
    searchDelay: null,
    sPaginationType: "simple_numbers",
    sScrollX: "",
    sScrollXInner: "",
    sScrollY: "",
    sServerMethod: "GET",
    renderer: null,
    rowId: "DT_RowId"
  };
  Y(m.defaults);
  m.defaults.column = {
    aDataSort: null,
    iDataSort: -1,
    asSorting: ["asc", "desc"],
    bSearchable: !0,
    bSortable: !0,
    bVisible: !0,
    fnCreatedCell: null,
    mData: null,
    mRender: null,
    sCellType: "td",
    sClass: "",
    sContentPadding: "",
    sDefaultContent: null,
    sName: "",
    sSortDataType: "std",
    sTitle: null,
    sType: null,
    sWidth: null
  };
  Y(m.defaults.column);
  m.models.oSettings = {
    oFeatures: {
      bAutoWidth: null,
      bDeferRender: null,
      bFilter: null,
      bInfo: null,
      bLengthChange: null,
      bPaginate: null,
      bProcessing: null,
      bServerSide: null,
      bSort: null,
      bSortMulti: null,
      bSortClasses: null,
      bStateSave: null
    },
    oScroll: {
      bCollapse: null,
      iBarWidth: 0,
      sX: null,
      sXInner: null,
      sY: null
    },
    oLanguage: { fnInfoCallback: null },
    oBrowser: {
      bScrollOversize: !1,
      bScrollbarLeft: !1,
      bBounding: !1,
      barWidth: 0
    },
    ajax: null,
    aanFeatures: [],
    aoData: [],
    aiDisplay: [],
    aiDisplayMaster: [],
    aIds: {},
    aoColumns: [],
    aoHeader: [],
    aoFooter: [],
    oPreviousSearch: {},
    aoPreSearchCols: [],
    aaSorting: null,
    aaSortingFixed: [],
    asStripeClasses: null,
    asDestroyStripes: [],
    sDestroyWidth: 0,
    aoRowCallback: [],
    aoHeaderCallback: [],
    aoFooterCallback: [],
    aoDrawCallback: [],
    aoRowCreatedCallback: [],
    aoPreDrawCallback: [],
    aoInitComplete: [],
    aoStateSaveParams: [],
    aoStateLoadParams: [],
    aoStateLoaded: [],
    sTableId: "",
    nTable: null,
    nTHead: null,
    nTFoot: null,
    nTBody: null,
    nTableWrapper: null,
    bDeferLoading: !1,
    bInitialised: !1,
    aoOpenRows: [],
    sDom: null,
    searchDelay: null,
    sPaginationType: "two_button",
    iStateDuration: 0,
    aoStateSave: [],
    aoStateLoad: [],
    oSavedState: null,
    oLoadedState: null,
    sAjaxSource: null,
    sAjaxDataProp: null,
    bAjaxDataGet: !0,
    jqXHR: null,
    json: k,
    oAjaxData: k,
    fnServerData: null,
    aoServerParams: [],
    sServerMethod: null,
    fnFormatNumber: null,
    aLengthMenu: null,
    iDraw: 0,
    bDrawing: !1,
    iDrawError: -1,
    _iDisplayLength: 10,
    _iDisplayStart: 0,
    _iRecordsTotal: 0,
    _iRecordsDisplay: 0,
    bJUI: null,
    oClasses: {},
    bFiltered: !1,
    bSorted: !1,
    bSortCellsTop: null,
    oInit: null,
    aoDestroyCallback: [],
    fnRecordsTotal: function () {
      return "ssp" == y(this)
        ? 1 * this._iRecordsTotal
        : this.aiDisplayMaster.length;
    },
    fnRecordsDisplay: function () {
      return "ssp" == y(this)
        ? 1 * this._iRecordsDisplay
        : this.aiDisplay.length;
    },
    fnDisplayEnd: function () {
      var a = this._iDisplayLength,
        b = this._iDisplayStart,
        c = b + a,
        d = this.aiDisplay.length,
        e = this.oFeatures,
        f = e.bPaginate;
      return e.bServerSide
        ? !1 === f || -1 === a
          ? b + d
          : Math.min(b + a, this._iRecordsDisplay)
        : !f || c > d || -1 === a
          ? d
          : c;
    },
    oInstance: null,
    sInstance: null,
    iTabIndex: 0,
    nScrollHead: null,
    nScrollFoot: null,
    aLastSort: [],
    oPlugins: {},
    rowIdFn: null,
    rowId: null
  };
  m.ext = x = {
    buttons: {},
    classes: {},
    builder: "-source-",
    errMode: "alert",
    feature: [],
    search: [],
    selector: { cell: [], column: [], row: [] },
    internal: {},
    legacy: { ajax: null },
    pager: {},
    renderer: { pageButton: {}, header: {} },
    order: {},
    type: { detect: [], search: {}, order: {} },
    _unique: 0,
    fnVersionCheck: m.fnVersionCheck,
    iApiIndex: 0,
    oJUIClasses: {},
    sVersion: m.version
  };
  h.extend(x, {
    afnFiltering: x.search,
    aTypes: x.type.detect,
    ofnSearch: x.type.search,
    oSort: x.type.order,
    afnSortData: x.order,
    aoFeatures: x.feature,
    oApi: x.internal,
    oStdClasses: x.classes,
    oPagination: x.pager
  });
  h.extend(m.ext.classes, {
    sTable: "dataTable",
    sNoFooter: "no-footer",
    sPageButton: "paginate_button",
    sPageButtonActive: "current",
    sPageButtonDisabled: "disabled",
    sStripeOdd: "odd",
    sStripeEven: "even",
    sRowEmpty: "dataTables_empty",
    sWrapper: "dataTables_wrapper",
    sFilter: "dataTables_filter",
    sInfo: "dataTables_info",
    sPaging: "dataTables_paginate paging_",
    sLength: "dataTables_length",
    sProcessing: "dataTables_processing",
    sSortAsc: "sorting_asc",
    sSortDesc: "sorting_desc",
    sSortable: "sorting",
    sSortableAsc: "sorting_asc_disabled",
    sSortableDesc: "sorting_desc_disabled",
    sSortableNone: "sorting_disabled",
    sSortColumn: "sorting_",
    sFilterInput: "",
    sLengthSelect: "",
    sScrollWrapper: "dataTables_scroll",
    sScrollHead: "dataTables_scrollHead",
    sScrollHeadInner: "dataTables_scrollHeadInner",
    sScrollBody: "dataTables_scrollBody",
    sScrollFoot: "dataTables_scrollFoot",
    sScrollFootInner: "dataTables_scrollFootInner",
    sHeaderTH: "",
    sFooterTH: "",
    sSortJUIAsc: "",
    sSortJUIDesc: "",
    sSortJUI: "",
    sSortJUIAscAllowed: "",
    sSortJUIDescAllowed: "",
    sSortJUIWrapper: "",
    sSortIcon: "",
    sJUIHeader: "",
    sJUIFooter: ""
  });
  var Ea = "",
    Ea = "",
    G = Ea + "ui-state-default",
    ka = Ea + "css_right ui-icon ui-icon-",
    Yb = Ea + "fg-toolbar ui-toolbar ui-widget-header ui-helper-clearfix";
  h.extend(m.ext.oJUIClasses, m.ext.classes, {
    sPageButton: "fg-button ui-button " + G,
    sPageButtonActive: "ui-state-disabled",
    sPageButtonDisabled: "ui-state-disabled",
    sPaging:
      "dataTables_paginate fg-buttonset ui-buttonset fg-buttonset-multi ui-buttonset-multi paging_",
    sSortAsc: G + " sorting_asc",
    sSortDesc: G + " sorting_desc",
    sSortable: G + " sorting",
    sSortableAsc: G + " sorting_asc_disabled",
    sSortableDesc: G + " sorting_desc_disabled",
    sSortableNone: G + " sorting_disabled",
    sSortJUIAsc: ka + "triangle-1-n",
    sSortJUIDesc: ka + "triangle-1-s",
    sSortJUI: ka + "carat-2-n-s",
    sSortJUIAscAllowed: ka + "carat-1-n",
    sSortJUIDescAllowed: ka + "carat-1-s",
    sSortJUIWrapper: "DataTables_sort_wrapper",
    sSortIcon: "DataTables_sort_icon",
    sScrollHead: "dataTables_scrollHead " + G,
    sScrollFoot: "dataTables_scrollFoot " + G,
    sHeaderTH: G,
    sFooterTH: G,
    sJUIHeader: Yb + " ui-corner-tl ui-corner-tr",
    sJUIFooter: Yb + " ui-corner-bl ui-corner-br"
  });
  var Nb = m.ext.pager;
  h.extend(Nb, {
    simple: function () {
      return ["previous", "next"];
    },
    full: function () {
      return ["first", "previous", "next", "last"];
    },
    numbers: function (a, b) {
      return [ia(a, b)];
    },
    simple_numbers: function (a, b) {
      return ["previous", ia(a, b), "next"];
    },
    full_numbers: function (a, b) {
      return ["first", "previous", ia(a, b), "next", "last"];
    },
    first_last_numbers: function (a, b) {
      return ["first", ia(a, b), "last"];
    },
    _numbers: ia,
    numbers_length: 7
  });
  h.extend(!0, m.ext.renderer, {
    pageButton: {
      _: function (a, b, c, d, e, f) {
        var g = a.oClasses,
          j = a.oLanguage.oPaginate,
          i = a.oLanguage.oAria.paginate || {},
          m,
          l,
          p = 0,
          r = function (b, d) {
            var k,
              t,
              u,
              s,
              v = function (b) {
                Va(a, b.data.action, true);
              };
            k = 0;
            for (t = d.length; k < t; k++) {
              s = d[k];
              if (h.isArray(s)) {
                u = h("<" + (s.DT_el || "div") + "/>").appendTo(b);
                r(u, s);
              } else {
                m = null;
                l = "";
                switch (s) {
                  case "ellipsis":
                    b.append('<span class="ellipsis">&#x2026;</span>');
                    break;
                  case "first":
                    m = j.sFirst;
                    l = s + (e > 0 ? "" : " " + g.sPageButtonDisabled);
                    break;
                  case "previous":
                    m = j.sPrevious;
                    l = s + (e > 0 ? "" : " " + g.sPageButtonDisabled);
                    break;
                  case "next":
                    m = j.sNext;
                    l = s + (e < f - 1 ? "" : " " + g.sPageButtonDisabled);
                    break;
                  case "last":
                    m = j.sLast;
                    l = s + (e < f - 1 ? "" : " " + g.sPageButtonDisabled);
                    break;
                  default:
                    m = s + 1;
                    l = e === s ? g.sPageButtonActive : "";
                }
                if (m !== null) {
                  u = h("<a>", {
                    class: g.sPageButton + " " + l,
                    "aria-controls": a.sTableId,
                    "aria-label": i[s],
                    "data-dt-idx": p,
                    tabindex: a.iTabIndex,
                    id:
                      c === 0 && typeof s === "string"
                        ? a.sTableId + "_" + s
                        : null
                  })
                    .html(m)
                    .appendTo(b);
                  Ya(u, { action: s }, v);
                  p++;
                }
              }
            }
          },
          t;
        try {
          t = h(b)
            .find(H.activeElement)
            .data("dt-idx");
        } catch (u) { }
        r(h(b).empty(), d);
        t !== k &&
          h(b)
            .find("[data-dt-idx=" + t + "]")
            .focus();
      }
    }
  });
  h.extend(m.ext.type.detect, [
    function (a, b) {
      var c = b.oLanguage.sDecimal;
      return ab(a, c) ? "num" + c : null;
    },
    function (a) {
      if (a && !(a instanceof Date) && !cc.test(a)) return null;
      var b = Date.parse(a);
      return (null !== b && !isNaN(b)) || M(a) ? "date" : null;
    },
    function (a, b) {
      var c = b.oLanguage.sDecimal;
      return ab(a, c, !0) ? "num-fmt" + c : null;
    },
    function (a, b) {
      var c = b.oLanguage.sDecimal;
      return Sb(a, c) ? "html-num" + c : null;
    },
    function (a, b) {
      var c = b.oLanguage.sDecimal;
      return Sb(a, c, !0) ? "html-num-fmt" + c : null;
    },
    function (a) {
      return M(a) || ("string" === typeof a && -1 !== a.indexOf("<"))
        ? "html"
        : null;
    }
  ]);
  h.extend(m.ext.type.search, {
    html: function (a) {
      return M(a)
        ? a
        : "string" === typeof a
          ? a.replace(Pb, " ").replace(Ca, "")
          : "";
    },
    string: function (a) {
      return M(a) ? a : "string" === typeof a ? a.replace(Pb, " ") : a;
    }
  });
  var Ba = function (a, b, c, d) {
    if (0 !== a && (!a || "-" === a)) return -Infinity;
    b && (a = Rb(a, b));
    a.replace && (c && (a = a.replace(c, "")), d && (a = a.replace(d, "")));
    return 1 * a;
  };
  h.extend(x.type.order, {
    "date-pre": function (a) {
      return Date.parse(a) || -Infinity;
    },
    "html-pre": function (a) {
      return M(a)
        ? ""
        : a.replace
          ? a.replace(/<.*?>/g, "").toLowerCase()
          : a + "";
    },
    "string-pre": function (a) {
      return M(a)
        ? ""
        : "string" === typeof a
          ? a.toLowerCase()
          : !a.toString
            ? ""
            : a.toString();
    },
    "string-asc": function (a, b) {
      return a < b ? -1 : a > b ? 1 : 0;
    },
    "string-desc": function (a, b) {
      return a < b ? 1 : a > b ? -1 : 0;
    }
  });
  fb("");
  h.extend(!0, m.ext.renderer, {
    header: {
      _: function (a, b, c, d) {
        h(a.nTable).on("order.dt.DT", function (e, f, g, h) {
          if (a === f) {
            e = c.idx;
            b.removeClass(
              c.sSortingClass + " " + d.sSortAsc + " " + d.sSortDesc
            ).addClass(
              h[e] == "asc"
                ? d.sSortAsc
                : h[e] == "desc"
                  ? d.sSortDesc
                  : c.sSortingClass
            );
          }
        });
      },
      jqueryui: function (a, b, c, d) {
        h("<div/>")
          .addClass(d.sSortJUIWrapper)
          .append(b.contents())
          .append(h("<span/>").addClass(d.sSortIcon + " " + c.sSortingClassJUI))
          .appendTo(b);
        h(a.nTable).on("order.dt.DT", function (e, f, g, h) {
          if (a === f) {
            e = c.idx;
            b.removeClass(d.sSortAsc + " " + d.sSortDesc).addClass(
              h[e] == "asc"
                ? d.sSortAsc
                : h[e] == "desc"
                  ? d.sSortDesc
                  : c.sSortingClass
            );
            b.find("span." + d.sSortIcon)
              .removeClass(
                d.sSortJUIAsc +
                " " +
                d.sSortJUIDesc +
                " " +
                d.sSortJUI +
                " " +
                d.sSortJUIAscAllowed +
                " " +
                d.sSortJUIDescAllowed
              )
              .addClass(
                h[e] == "asc"
                  ? d.sSortJUIAsc
                  : h[e] == "desc"
                    ? d.sSortJUIDesc
                    : c.sSortingClassJUI
              );
          }
        });
      }
    }
  });
  var Zb = function (a) {
    return "string" === typeof a
      ? a
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
      : a;
  };
  m.render = {
    number: function (a, b, c, d, e) {
      return {
        display: function (f) {
          if ("number" !== typeof f && "string" !== typeof f) return f;
          var g = 0 > f ? "-" : "",
            h = parseFloat(f);
          if (isNaN(h)) return Zb(f);
          h = h.toFixed(c);
          f = Math.abs(h);
          h = parseInt(f, 10);
          f = c ? b + (f - h).toFixed(c).substring(2) : "";
          return (
            g +
            (d || "") +
            h.toString().replace(/\B(?=(\d{3})+(?!\d))/g, a) +
            f +
            (e || "")
          );
        }
      };
    },
    text: function () {
      return { display: Zb };
    }
  };
  h.extend(m.ext.internal, {
    _fnExternApiFunc: Ob,
    _fnBuildAjax: ua,
    _fnAjaxUpdate: nb,
    _fnAjaxParameters: wb,
    _fnAjaxUpdateDraw: xb,
    _fnAjaxDataSrc: va,
    _fnAddColumn: Ga,
    _fnColumnOptions: la,
    _fnAdjustColumnSizing: Z,
    _fnVisibleToColumnIndex: $,
    _fnColumnIndexToVisible: aa,
    _fnVisbleColumns: ba,
    _fnGetColumns: na,
    _fnColumnTypes: Ia,
    _fnApplyColumnDefs: kb,
    _fnHungarianMap: Y,
    _fnCamelToHungarian: J,
    _fnLanguageCompat: Fa,
    _fnBrowserDetect: ib,
    _fnAddData: N,
    _fnAddTr: oa,
    _fnNodeToDataIndex: function (a, b) {
      return b._DT_RowIndex !== k ? b._DT_RowIndex : null;
    },
    _fnNodeToColumnIndex: function (a, b, c) {
      return h.inArray(c, a.aoData[b].anCells);
    },
    _fnGetCellData: B,
    _fnSetCellData: lb,
    _fnSplitObjNotation: La,
    _fnGetObjectDataFn: R,
    _fnSetObjectDataFn: S,
    _fnGetDataMaster: Ma,
    _fnClearTable: pa,
    _fnDeleteIndex: qa,
    _fnInvalidate: da,
    _fnGetRowElements: Ka,
    _fnCreateTr: Ja,
    _fnBuildHead: mb,
    _fnDrawHead: fa,
    _fnDraw: O,
    _fnReDraw: T,
    _fnAddOptionsHtml: pb,
    _fnDetectHeader: ea,
    _fnGetUniqueThs: ta,
    _fnFeatureHtmlFilter: rb,
    _fnFilterComplete: ga,
    _fnFilterCustom: Ab,
    _fnFilterColumn: zb,
    _fnFilter: yb,
    _fnFilterCreateSearch: Ra,
    _fnEscapeRegex: Sa,
    _fnFilterData: Bb,
    _fnFeatureHtmlInfo: ub,
    _fnUpdateInfo: Eb,
    _fnInfoMacros: Fb,
    _fnInitialise: ha,
    _fnInitComplete: wa,
    _fnLengthChange: Ta,
    _fnFeatureHtmlLength: qb,
    _fnFeatureHtmlPaginate: vb,
    _fnPageChange: Va,
    _fnFeatureHtmlProcessing: sb,
    _fnProcessingDisplay: C,
    _fnFeatureHtmlTable: tb,
    _fnScrollDraw: ma,
    _fnApplyToChildren: I,
    _fnCalculateColumnWidths: Ha,
    _fnThrottle: Qa,
    _fnConvertToWidth: Gb,
    _fnGetWidestNode: Hb,
    _fnGetMaxLenString: Ib,
    _fnStringToCss: v,
    _fnSortFlatten: W,
    _fnSort: ob,
    _fnSortAria: Kb,
    _fnSortListener: Xa,
    _fnSortAttachListener: Oa,
    _fnSortingClasses: ya,
    _fnSortData: Jb,
    _fnSaveState: za,
    _fnLoadState: Lb,
    _fnSettingsFromNode: Aa,
    _fnLog: K,
    _fnMap: F,
    _fnBindAction: Ya,
    _fnCallbackReg: z,
    _fnCallbackFire: s,
    _fnLengthOverflow: Ua,
    _fnRenderer: Pa,
    _fnDataSource: y,
    _fnRowAttributes: Na,
    _fnCalculateEnd: function () { }
  });
  h.fn.dataTable = m;
  m.$ = h;
  h.fn.dataTableSettings = m.settings;
  h.fn.dataTableExt = m.ext;
  h.fn.DataTable = function (a) {
    return h(this)
      .dataTable(a)
      .api();
  };
  h.each(m, function (a, b) {
    h.fn.DataTable[a] = b;
  });
  return h.fn.dataTable;
});
/*!
 DataTables Bootstrap 3 integration
 ©2011-2015 SpryMedia Ltd - datatables.net/license
*/
(function (b) {
  "function" === typeof define && define.amd
    ? define(["jquery", "datatables.net"], function (a) {
      return b(a, window, document);
    })
    : "object" === typeof exports
      ? (module.exports = function (a, d) {
        a || (a = window);
        if (!d || !d.fn.dataTable) d = require("datatables.net")(a, d).$;
        return b(d, a, a.document);
      })
      : b(jQuery, window, document);
})(function (b, a, d, m) {
  var f = b.fn.dataTable;
  b.extend(!0, f.defaults, {
    dom:
      "<'row'<'col-sm-6'l><'col-sm-6'f>><'row'<'col-sm-12'tr>><'row'<'col-sm-5'i><'col-sm-7'p>>",
    renderer: "bootstrap"
  });
  b.extend(f.ext.classes, {
    sWrapper: "dataTables_wrapper form-inline dt-bootstrap",
    sFilterInput: "form-control input-sm",
    sLengthSelect: "form-control input-sm",
    sProcessing: "dataTables_processing panel panel-default"
  });
  f.ext.renderer.pageButton.bootstrap = function (a, h, r, s, j, n) {
    var o = new f.Api(a),
      t = a.oClasses,
      k = a.oLanguage.oPaginate,
      u = a.oLanguage.oAria.paginate || {},
      e,
      g,
      p = 0,
      q = function (d, f) {
        var l,
          h,
          i,
          c,
          m = function (a) {
            a.preventDefault();
            !b(a.currentTarget).hasClass("disabled") &&
              o.page() != a.data.action &&
              o.page(a.data.action).draw("page");
          };
        l = 0;
        for (h = f.length; l < h; l++)
          if (((c = f[l]), b.isArray(c))) q(d, c);
          else {
            g = e = "";
            switch (c) {
              case "ellipsis":
                e = "&#x2026;";
                g = "disabled";
                break;
              case "first":
                e = k.sFirst;
                g = c + (0 < j ? "" : " disabled");
                break;
              case "previous":
                e = k.sPrevious;
                g = c + (0 < j ? "" : " disabled");
                break;
              case "next":
                e = k.sNext;
                g = c + (j < n - 1 ? "" : " disabled");
                break;
              case "last":
                e = k.sLast;
                g = c + (j < n - 1 ? "" : " disabled");
                break;
              default:
                (e = c + 1), (g = j === c ? "active" : "");
            }
            e &&
              ((i = b("<li>", {
                class: t.sPageButton + " " + g,
                id:
                  0 === r && "string" === typeof c ? a.sTableId + "_" + c : null
              })
                .append(
                  b("<a>", {
                    href: "#",
                    "aria-controls": a.sTableId,
                    "aria-label": u[c],
                    "data-dt-idx": p,
                    tabindex: a.iTabIndex
                  }).html(e)
                )
                .appendTo(d)),
                a.oApi._fnBindAction(i, { action: c }, m),
                p++);
          }
      },
      i;
    try {
      i = b(h)
        .find(d.activeElement)
        .data("dt-idx");
    } catch (v) { }
    q(
      b(h)
        .empty()
        .html('<ul class="pagination"/>')
        .children("ul"),
      s
    );
    i !== m &&
      b(h)
        .find("[data-dt-idx=" + i + "]")
        .focus();
  };
  return f;
});

/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 1.3.2
 * 2016-06-16 18:25:19
 *
 * By Eli Grey, http://eligrey.com
 * License: MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */
var saveAs =
  saveAs ||
  (function (e) {
    "use strict";
    if (
      !(
        "undefined" == typeof e ||
        ("undefined" != typeof navigator &&
          /MSIE [1-9]\./.test(navigator.userAgent))
      )
    ) {
      var t = e.document,
        n = function () {
          return e.URL || e.webkitURL || e;
        },
        o = t.createElementNS("http://www.w3.org/1999/xhtml", "a"),
        r = "download" in o,
        a = function (e) {
          var t = new MouseEvent("click");
          e.dispatchEvent(t);
        },
        i = /constructor/i.test(e.HTMLElement),
        d = /CriOS\/[\d]+/.test(navigator.userAgent),
        f = function (t) {
          (e.setImmediate || e.setTimeout)(function () {
            throw t;
          }, 0);
        },
        u = "application/octet-stream",
        s = 4e4,
        c = function (e) {
          var t = function () {
            "string" == typeof e ? n().revokeObjectURL(e) : e.remove();
          };
          setTimeout(t, s);
        },
        l = function (e, t, n) {
          t = [].concat(t);
          for (var o = t.length; o--;) {
            var r = e["on" + t[o]];
            if ("function" == typeof r)
              try {
                r.call(e, n || e);
              } catch (e) {
                f(e);
              }
          }
        },
        p = function (e) {
          return /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(
            e.type
          )
            ? new Blob([String.fromCharCode(65279), e], { type: e.type })
            : e;
        },
        v = function (t, f, s) {
          s || (t = p(t));
          var v,
            w = this,
            m = t.type,
            y = m === u,
            h = function () {
              l(w, "writestart progress write writeend".split(" "));
            },
            S = function () {
              if ((d || (y && i)) && e.FileReader) {
                var o = new FileReader();
                return (
                  (o.onloadend = function () {
                    var t = d
                      ? o.result
                      : o.result.replace(
                        /^data:[^;]*;/,
                        "data:attachment/file;"
                      ),
                      n = e.open(t, "_blank");
                    n || (e.location.href = t),
                      (t = void 0),
                      (w.readyState = w.DONE),
                      h();
                  }),
                  o.readAsDataURL(t),
                  void (w.readyState = w.INIT)
                );
              }
              if ((v || (v = n().createObjectURL(t)), y)) e.location.href = v;
              else {
                var r = e.open(v, "_blank");
                r || (e.location.href = v);
              }
              (w.readyState = w.DONE), h(), c(v);
            };
          return (
            (w.readyState = w.INIT),
            r
              ? ((v = n().createObjectURL(t)),
                void setTimeout(function () {
                  (o.href = v),
                    (o.download = f),
                    a(o),
                    h(),
                    c(v),
                    (w.readyState = w.DONE);
                }))
              : void S()
          );
        },
        w = v.prototype,
        m = function (e, t, n) {
          return new v(e, t || e.name || "download", n);
        };
      return "undefined" != typeof navigator && navigator.msSaveOrOpenBlob
        ? function (e, t, n) {
          return (
            (t = t || e.name || "download"),
            n || (e = p(e)),
            navigator.msSaveOrOpenBlob(e, t)
          );
        }
        : ((w.abort = function () { }),
          (w.readyState = w.INIT = 0),
          (w.WRITING = 1),
          (w.DONE = 2),
          (w.error = w.onwritestart = w.onprogress = w.onwrite = w.onabort = w.onerror = w.onwriteend = null),
          m);
    }
  })(
    ("undefined" != typeof self && self) ||
    ("undefined" != typeof window && window) ||
    this.content
  );
"undefined" != typeof module && module.exports
  ? (module.exports.saveAs = saveAs)
  : "undefined" != typeof define &&
  null !== define &&
  null !== define.amd &&
  define([], function () {
    return saveAs;
  });
