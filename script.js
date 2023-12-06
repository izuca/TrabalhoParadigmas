
function kmeansParallel(data,k,maxIterations){
    // Inicializa os centróides aleatoriamente
    let centroids = initializeCentroids(data,k);
    
    let workers = [];
    for(let i = 0; i < k; i++){
      workers.push(new Worker('kmeans-worker.js'));
    }
    
    for(let iter = 0; iter < maxIterations; iter++){
      
      // Atribui pontos ao clusters usando workers
      // O clustersPromises é o ArrayCompartilhado
      let clustersPromises = workers.map((worker, index) => {
        return new Promise((resolve,reject) => {
          worker.postMessage({ points: data, centroid: centroids[index] })
          
          worker.onmessage = (event) => { resolve(event.data); };
  
          worker.onerror = (error) =>{
            console.error("Erro", error);
            reject(error);
          }
        })
      })
  
      // Aguarda todas as promessas para a conclusão do processamento do worker
      Promise.all(clustersPromises).then((clusters) => {
        // Atualiza os centróides
        let oldCentroids = centroids;
        centroids = updateCentroids(data, clusters, k);
  
        
        if(checkConvergence(centroids, oldCentroids) || iter == maxIterations - 1){
          //Termina os workers
          let terminatePromises = workers.map((worker) => {
            return new Promise((resolve) => {
              worker.terminate();
              resolve();
            })  
          })
          
          return Promise.all(terminatePromises).then(() => console.log(clusters));
        }
      })
    }
  }
  
  function initializeCentroids(data, k){
    //Seleciona os k itens selecionados como centróides iniciais
    return data.slice(0,k); //Atualmente aleatorio
  }
  
  function updateCentroids(clusters, k){
    // Calcula os novos centróides com base nos pontos atribuídos aos clusters
    let newCentroids = [];
  
    for(let i = 0; i < k; i++){
      let centroid = calculateCentroid(clusters[i]);
      newCentroids.push(centroid);
    }
  
    return newCentroids;
  }
  
  function calculateCentroid(cluster){
    // Calcula o centróide de um cluster como a média dos pontos no cluster
    let centroid = {
      pts: 0,
      stl: 0,
      ast: 0,
      reb: 0,
      pf: 0
    };
  
    for(let i = 0; i < cluster.length; i++){
      centroid.pts += cluster[i].pts;
      centroid.stl += cluster[i].stl;
      centroid.ast += cluster[i].ast;
      centroid.pf += cluster[i].pf;
      centroid.reb += cluster[i].reb
    }
  
    centroid.pts /= cluster[i].pts;
    centroid.stl /= cluster[i].stl;
    centroid.ast /= cluster[i].ast;
    centroid.pf /= cluster[i].pf;
    centroid.pf /= cluster[i].reb;
  
    return centroid;
  }
  
  function checkConvergence(newCentroids, oldCentroids){
    // Verifica se os centróides convergiram
    return JSON.stringify(newCentroids) == JSON.stringify(oldCentroids);
  }
  
  let data = dataSet();
  let k = 5;
  let maxIterations = 100;
  
  
  kmeansParallel(data, k, maxIterations)
  