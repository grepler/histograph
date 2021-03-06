/**
 * @ngdoc function
 * @name histograph.controller:AllShortestPathsCtrl
 * @description
 * # AllShortestPathsCtrl
 */
angular.module('histograph')
  .controller('AllShortestPathsCtrl', function ($scope, $log, $routeParams, socket, allShortestPaths, ResourceFactory) {
    $log.log('AllShortestPathsCtrl ready', $routeParams.ids, allShortestPaths);

    $scope.AllShortestPaths = allShortestPaths.data.result.items;

    $scope.syncQueue($routeParams.ids);

    $scope.pagetitle = 'documents on the path'
    /*
      Set graph title
    */
    $scope.setHeader('graph', 'items connecting your queued ones (shortest paths)');

    const graph = {
      nodes: [],
      edges: []
    };


    const index = {
      nodes: {},
      edges: {}
    };

    allShortestPaths.data.result.items.forEach(function (d) {
      for (let i = 0; i < d.path.length; i++) {
        if (!index.nodes[d.path[i].id]) {
          // is one of the KNOWN ones?
          const known = allShortestPaths.data.info.ids.indexOf(d.path[i].id) !== -1;
          index.nodes[d.path[i].id] = {
            id: `${d.path[i].id}`,
            label: d.path[i].name,
            x: Math.random() * 50,
            y: Math.random() * 50,
            type: d.path[i].type + (known ? 'Known' : '')
          }
          graph.nodes.push(index.nodes[d.path[i].id])
        }
        // edges
        if (i == d.path.length - 1) break;

        const edgeId = `${d.path[i].id}.${d.path[i + 1].id}`;

        if (!index.edges[edgeId]) {
          index.edges[edgeId] = {
            id: edgeId,
            source: `${d.path[i].id}`,
            target: `${d.path[i + 1].id}`,
            color: '#a3a3a3',
            weight: 1
          };
          graph.edges.push(index.edges[edgeId])
        }
      }
    })
    // get entities ids to load
    $scope.relatedEntities = graph.nodes.filter(function (d) {
      return d.type == 'location' || d.type == 'place' || d.type == 'person';
    }).map(function (d) {
      return d.id;
    });
    // get some resource ids to load
    const resourcesToLoad = graph.nodes.filter(function (d) {
      return d.type == 'resource';
    }).map(function (d) {
      return d.id;
    });

    $log.log('AllShortestPathsCtrl load related items ', resourcesToLoad.length);


    if (resourcesToLoad.length) {
      ResourceFactory.get({
        id: resourcesToLoad.join(',')
      }, function (res) {
        $scope.setRelatedItems(res.result.items);
      })
    } else $scope.setRelatedItems([])

    console.log(graph)
    $scope.setGraph(graph)
  });
