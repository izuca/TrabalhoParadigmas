async function kmeansParallel(data, k, maxIterations, selecionado) {
  let nunclusters; // Numero de linhas dentro do cluster(para printar)

  const sab = new SharedArrayBuffer(
    Float64Array.BYTES_PER_ELEMENT * data.length * k
  );
  const sabView = new Float64Array(sab);

  //let centroids = initializeCentroids(data, k);
  let centroids = selecionado;
  console.log("centroids no inicio:", centroids);

  let workers = initializeWorkers(k);
  let clusters = [];

  //let numberOfWorkers = workers.length;
  //console.log(`Número de workers de fora: ${numberOfWorkers}`);

  for (let iter = 0; iter < maxIterations; iter++) {
    // Atribui pontos ao clusters usando workers
    // O clustersPromises é o ArrayCompartilhado
    let clustersPromises = workers.map((worker, index) => {
      return new Promise((resolve, reject) => {
        worker.postMessage({
          points: data,
          centroid: centroids,
          sab: sab,
          sabIndex: index,
        });

        worker.onmessage = (event) => {
          let { cluster, sabIndex } = event.data;
          clusters[sabIndex] = cluster;
          resolve();
        };
        //console.log("haaaaaaaaaaaaaaaaaaaaaaaa",worker);

        worker.onerror = (error) => {
          console.error("Erro", error);
          reject(error);
        };
      });
    });

    await Promise.all(clustersPromises);

    let numberOfPromises = clustersPromises.length;
    console.log(`Número de promises: ${numberOfPromises}`);
    // Atualiza os centróides
    let oldCentroids = centroids;

    for (let i = 0; i < clusters.length; i++) {
      const innerArray = clusters[i];
      for (let j = 0; j < innerArray.length; j++) {
        nunclusters = innerArray.length;

        console.log("Número de clusters:", nunclusters);
      }
    }

    const ResultadoFinal = createSharedArrayBuffer(clusters, nunclusters);
    centroids = updateCentroids(clusters, k);

    printResult([...ResultadoFinal][0]);
    if (checkConvergence(centroids, oldCentroids)) {
      // Termina workers
      await terminateWorkers(workers);
      console.log("clusters finais do final ----", clusters);
      console.log("O sab no final eh", sab);

      return clusters;
    }
  }
}

function checkConvergence(newCentroids, oldCentroids) {
  let tolerance = 0.0001;

  for (let i = 0; i < newCentroids.length; i++) {
    for (let prop in newCentroids[i]) {
      if (Math.abs(newCentroids[i][prop] - oldCentroids[i][prop]) > tolerance) {
        return false; // Ainda não convergiu
      }
    }
  }
  return true; // Convergiu
}

//Isso precisa ir pro worker
function initializeCentroids(data, k) {
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

function initializeWorkers(k) {
  let workers = [];

  for (let i = 0; i < k; i++) {
    workers.push(new Worker("kmeans-worker.js"));
  }

  return workers;
}

//Pode ser feito na thread principal
function updateCentroids(clusters, k) {
  // Calcula os novos centróides com base nos pontos atribuídos aos clusters
  let newCentroids = [];
  console.log("conteudo de K:", k);
  for (let i = 0; i < k; i++) {
    console.log(
      "valor dos clusters antes de entrar na calculateCentroid ",
      clusters
    );
    let centroid = calculateCentroid(clusters[i]);
    newCentroids.push(centroid);
  }

  return newCentroids;
}

//Errado segundo o professor
function calculateCentroid(cluster) {
  // Calcula o centróide de um cluster como a média dos pontos no cluster
  let centroid = {
    pts: 0,
    stl: 0,
    ast: 0,
    reb: 0,
    pf: 0,
  };

  if (cluster.length === 0) {
    return centroid;
  }

  // Essa média aritmética que estaria errada, seria uma boa revisarmos a lógica e enviar alguns e-mails para termos certeza
  for (let i = 0; i < cluster.length; i++) {
    centroid.pts += cluster[i].pts;
    centroid.stl += cluster[i].stl;
    centroid.ast += cluster[i].ast;
    centroid.pf += cluster[i].pf;
    centroid.reb += cluster[i].reb;
  }

  centroid.pts /= cluster.length;
  centroid.stl /= cluster.length;
  centroid.ast /= cluster.length;
  centroid.pf /= cluster.length;
  centroid.pf /= cluster.length;

  return centroid;
}

function checkConvergence(newCentroids, oldCentroids) {
  let tolerance = 0.0001;

  for (let i = 0; i < newCentroids.length; i++) {
    for (let prop in newCentroids[i]) {
      if (Math.abs(newCentroids[i][prop] - oldCentroids[i][prop]) > tolerance) {
        return false; // Ainda não convergiu
      }
    }
  }
  return true; // Convergiu
}

function createSharedArrayBuffer(dataArray, nunclusters) {
  sab = new SharedArrayBuffer(
    dataArray.length * nunclusters * Int32Array.BYTES_PER_ELEMENT * 5
  );
  sabView = new Int32Array(sab);

  let currentIndex = 0;

  for (let i = 0; i < dataArray.length; i++) {
    const innerArray = dataArray[i];
    for (let j = 0; j < innerArray.length; j++) {
      const obj = innerArray[j];
      sabView[currentIndex++] = obj.id;
      sabView[currentIndex++] = obj.pts * 100;
      sabView[currentIndex++] = obj.stl * 100;
      sabView[currentIndex++] = obj.ast * 100;
      sabView[currentIndex++] = obj.reb * 100;
    }
  }

  return sabView;
}

// Função para imprimir o resultado
function printResult(sharedArrayBuffer) {
  console.log("Conteúdo do SharedArrayBuffer:");
  for (let i = 0; i < sharedArrayBuffer.length; i += 5) {
    const id = sharedArrayBuffer[i];
    const pts = sharedArrayBuffer[i + 1] / 100;
    const stl = sharedArrayBuffer[i + 2] / 100;
    const ast = sharedArrayBuffer[i + 3] / 100;
    const reb = sharedArrayBuffer[i + 4] / 100;

    console.log(
      `ID: ${id}, PTS: ${pts}, STL: ${stl}, AST: ${ast}, REB: ${reb}`
    );
  }
}

async function terminateWorkers(workers) {
  let terminatePromises = workers.map((worker) => {
    return new Promise((resolve) => {
      worker.terminate();
      resolve();
    });
  });

  await Promise.all(terminatePromises);
}

//   let data = dataSet();
//   let k = 5;
//   let maxIterations = 100;

//kmeansParallel(data, k, maxIterations)
