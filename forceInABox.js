/* global d3 */
/* jslint browser: true, devel: true, indent: 4, multistr: true */

d3.layout.forceInABox = function() {
  'use strict';

  var force = d3.layout.force(),
    tree,
    foci = {},
    oldStart = force.start,
    oldLinkStrength = force.linkStrength(),
    oldGravity = force.gravity(),
    treeMapNodes = [],
    groupBy = function(d) {
      return d['cluster'];
    },
    enableGrouping = true,
    gravityToFoci = 0.1,
    gravityOverall = 0.01,
    linkStrengthInterCluster = 0.05;

  // force.gravity = function(x) {
  //     if (!arguments.length) return oldGravity;
  //     oldGravity = +x;
  //     return force;
  // };

  force.groupBy = function(x) {
    if (!arguments.length) return groupBy;
    if (typeof x === 'string') {
      x = function(d) {
        return d[x];
      };
      return force;
    }
    groupBy = x;
    return force;
  };

  var update = function() {
    if (enableGrouping) {
      force.gravity(gravityOverall);
    } else {
      force.gravity(oldGravity);
    }
  };

  force.enableGrouping = function(x) {
    if (!arguments.length) return enableGrouping;
    enableGrouping = x;
    update();
    return force;
  };

  force.gravityToFoci = function(x) {
    if (!arguments.length) return gravityToFoci;
    gravityToFoci = x;
    return force;
  };

  force.gravityOverall = function(x) {
    if (!arguments.length) return gravityOverall;
    gravityOverall = x;
    return force;
  };

  force.linkStrengthInterCluster = function(x) {
    if (!arguments.length) return linkStrengthInterCluster;
    linkStrengthInterCluster = x;
    return force;
  };

  force.linkStrength(function(e) {
    if (!enableGrouping || groupBy(e.source) === groupBy(e.target)) {
      if (typeof oldLinkStrength === 'function') {
        return oldLinkStrength(e);
      } else {
        return oldLinkStrength;
      }
    } else {
      if (typeof linkStrengthInterCluster === 'function') {
        return linkStrengthInterCluster(e);
      } else {
        return linkStrengthInterCluster;
      }
    }
  });

  function computeClustersCounts(nodes) {
    var clustersCounts = d3.map();

    nodes.forEach(function(d) {
      if (!clustersCounts.has(groupBy(d))) {
        clustersCounts.set(groupBy(d), 0);
      }
    });

    nodes.forEach(function(d) {
      // if (!d.show) { return; }
      clustersCounts.set(groupBy(d), clustersCounts.get(groupBy(d)) + 1);
    });

    return clustersCounts;
  }

  function getGroupsTree() {
    var children = [],
      totalSize = 0,
      clustersList,
      c,
      i,
      size,
      clustersCounts;

    clustersCounts = computeClustersCounts(force.nodes());

    //map.keys() is really slow, it's crucial to have it outside the loop
    clustersList = clustersCounts.keys();
    for (i = 0; i < clustersList.length; i += 1) {
      c = clustersList[i];
      size = clustersCounts.get(c);
      children.push({ id: c, size: size });
      totalSize += size;
    }
    return { id: 'clustersTree', size: totalSize, children: children };
  }

  force.recompute = function() {
    var treemap = d3.layout
      .treemap()
      .size(force.size())
      .sort(function(p, q) {
        return d3.ascending(p.size, q.size);
      })
      .value(function(d) {
        return d.size;
      });

    tree = getGroupsTree();
    treeMapNodes = treemap.nodes(tree);

    //compute foci
    foci.none = { x: 0, y: 0 };
    treeMapNodes.forEach(function(d) {
      foci[d.id] = {
        x: d.x + d.dx / 2,
        y: d.y + d.dy / 2
      };
    });

    // Draw the treemap
    return force;
  };

  force.drawTreemap = function(container) {
    container.selectAll('rect.cell').remove();
    container
      .selectAll('rect.cell')
      .data(treeMapNodes)
      .enter()
      .append('svg:rect')
      .attr('class', 'cell')
      .attr('x', function(d) {
        return d.x;
      })
      .attr('y', function(d) {
        return d.y;
      })
      .attr('width', function(d) {
        return d.dx;
      })
      .attr('height', function(d) {
        return d.dy;
      });

    return force;
  };

  force.deleteTreemap = function(container) {
    container.selectAll('rect.cell').remove();

    return force;
  };

  force.onTick = function(e) {
    if (!enableGrouping) {
      return force;
    }
    var k;
    k = force.gravityToFoci() * e.alpha;
    force.nodes().forEach(function(o) {
      if (!foci.hasOwnProperty(groupBy(o))) {
        return;
      }
      o.y += (foci[groupBy(o)].y - o.y) * k;
      o.x += (foci[groupBy(o)].x - o.x) * k;
    });
    return force;
  };

  force.start = function() {
    update();
    oldStart();
    if (enableGrouping) {
      force.recompute();
    }

    return force;
  };

  return force;
};
