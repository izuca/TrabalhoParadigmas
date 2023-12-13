async function findSimilarities(data, k, maxIterations) {

    let centroids = initializeCentroids(data, k);
    
    let sab = new SharedArrayBuffer(Float64Array.BYTES_PER_ELEMENT * k * data.length);
    let sabView = new Float64Array(sab);

    let clusters = [];

    let workers = initializeWorkers(k);

    for (let iter = 0; iter < maxIterations; iter++) {
        let clustersPromises = workers.map((worker, index) => {
            return new Promise((resolve, reject) => {
              worker.postMessage({
                points: data,
                centroid: centroids[index],
                sab: sab,
                sabIndex: index
              });
              worker.onmessage = (event) => {
                let { cluster, sabIndex } = event.data;
                clusters[sabIndex] = cluster;
                resolve();
              };
      
              worker.onerror = (error) => {
                reject(error);
              };
            });
        });
        
        await Promise.all(clustersPromises);

        let oldCentroids = centroids;
        centroids = updateCentroids(clusters, k);

        if (checkConvergence(centroids, oldCentroids)) {
            // Termina workers
            await terminateWorkers(workers);
      
            // Retorna clusters ou faz o que for necessário
            return clusters;
          }
    
    }
}

function updateCentroids(clusters, k) {
    // Inicializa uma matriz para armazenar os novos centróides
    let newCentroids = [];
  
    for (let i = 0; i < k; i++) {
      // Inicializa o centróide para o cluster atual
      let centroid = {
        pts: 0,
        stl: 0,
        ast: 0,
        reb: 0,
        pf: 0
      };
  
      // Obtém os pontos no cluster atual
      let clusterPoints = clusters[i];
  
      // Soma as propriedades dos pontos no cluster
      for (let j = 0; j < clusterPoints.length; j++) {
        centroid.pts += clusterPoints[j].pts;
        centroid.stl += clusterPoints[j].stl;
        centroid.ast += clusterPoints[j].ast;
        centroid.reb += clusterPoints[j].reb;
        centroid.pf += clusterPoints[j].pf;
      }
  
      // Calcula a média das propriedades para obter o novo centróide
      let clusterSize = clusterPoints.length || 1; // Evita divisão por zero
      centroid.pts /= clusterSize;
      centroid.stl /= clusterSize;
      centroid.ast /= clusterSize;
      centroid.reb /= clusterSize;
      centroid.pf /= clusterSize;
  
      // Adiciona o novo centróide à matriz
      newCentroids.push(centroid);
    }
  
    return newCentroids;
  }


function initializeWorkers(k) {
    let workers = [];
  
    for (let i = 0; i < k; i++) {
      workers.push(new Worker('kmeans-worker.js'));
    }
  
    return workers;
  }

function initializeCentroids(data, k){
    let centroids = [];
    const dataLength = data.length;

    for (let i = 0; i < k; i++) {
        // Escolhe um índice aleatório dentro do tamanho dos dados
        const randomIndex = Math.floor(Math.random() * dataLength);
    
        // Adiciona o ponto correspondente ao índice como centróide
        centroids.push(data[randomIndex]);
      }
    
      return centroids;
}

// Função para encerrar workers
async function terminateWorkers(workers) {
  let terminatePromises = workers.map((worker) => {
    return new Promise((resolve) => {
      worker.terminate();
      resolve();
    });
  });

  await Promise.all(terminatePromises);
}