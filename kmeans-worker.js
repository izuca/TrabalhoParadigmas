self.onmessage = function(event) {
    // Recebe pontos e centróide e atribui pontos ao cluster correspondente
    let points = event.data.points;
    let centroid = event.data.centroid;
    
    let cluster = assignToClusters(points, centroid);
    this.postMessage(cluster);
  }
  
  function assignToClusters(data, centroids){
    let cluster = []
    const limite = 2;
    for(let i = 0; i < data.length; i++) {
      let point = data[i];
      let distance = calculateDistance(point, centroids);
      
      if(distance < limite)
          cluster.push(point);
    }
    
    return cluster;
  }
  
  function calculateDistance(point1, point2){
    //Calcula a distância euclidiana entre dois pontos
    return Math.sqrt(Math.pow(point1.pts - point2.pts, 2) + Math.pow(point1.stl - point2.stl, 2)+ Math.pow(point1.ast - point2.ast, 2)+ Math.pow(point1.reb - point2.reb, 2)+ Math.pow(point1.pf - point2.pf, 2));
  }