self.onmessage = function (event) {
  
  let points = event.data.points;
  let centroid = event.data.centroid;
  let sab = event.data.Sab;
  let sabIndex = event.data.sabIndex;

  //Testando atomics
  console.log(sab)
  const SabView = new Int32Array(sab)

  console.log('inside worker',SabView)
  console.log(sabIndex,' Começando a trabalhar');
  console.log(typeof(SabView))
  Atomics.wait(SabView,0,0); //N ta funfandooooooooooo
  Atomics.store(SabView,0,0);
  
  console.log('Working on ',sabIndex)
  
  SabView[sabIndex + 1] = 5 * sabIndex;
  
  Atomics.store(SabView,0,1);

  // Atribui pontos ao cluster correspondente
  let cluster = assignToClusters(points, centroid);
  console.log("controid antes do assignToClusters:", centroid);
  // Atualiza a parte correta do SharedArrayBuffer
  updateSharedArrayBuffer(sab, cluster, sabIndex);

  // Retorna apenas os clusters atualizados para o worker principal
  this.postMessage({ cluster: cluster, sabIndex: sabIndex });
};

function assignToClusters(data, centroids) {
  
  const clusters = new Array(centroids.length).fill().map(() => []);

  // Para cada ponto, encontre o cluster correspondente
  for (let i = 0; i < data.length; i++) {
    const point = data[i];
    const assignedCluster = calculateClosestCluster(point, centroids);
    

    
    if (assignedCluster !== -1) {
      clusters[assignedCluster].push(point);
    } else {
      console.error(
        "Erro: assignedCluster é -1. Alguma lógica adicional é necessária."
      );
    }
  }

  return clusters;
}

// Função para calcular o índice do cluster mais próximo
function calculateClosestCluster(point, centroids) {
  if (centroids.length === 0) {
    console.error("Erro: Não há centroids disponíveis.");
    return -1;
  }

  let closestCluster = 0;
  let minDistance = calculateDistance(point, centroids[0]);
  //console.log("esse e o ponto2:",centroids[0]);

  for (let i = 1; i < centroids.length; i++) {
    if (!centroids[i]) {
      console.error(`Erro: O cluster ${i} está indefinido.`);
      continue;
    }

    // Certifique-se de que point e centroids[i] são objetos definidos
    if (!point || !centroids[i]) {
      //console.error("Erro: Point ou centroids[i] é indefinido.");
      continue;
    }

    const distance = calculateDistance(point, centroids[i]);

    if (distance <= minDistance) {
      minDistance = distance;
      closestCluster = i;
    }
  }

  return closestCluster;
}

// Função para calcular a distância entre dois pontos
function calculateDistance(point1, point2) {
  //console.log("ponto1:",point1);
  //console.log("ponto2:",point2);
  if (!point1 || !point2) {
    console.error("Erro: Point1 ou point2 é indefinido.");
    return -1; // ou algum valor padrão
  }
  // Implemente a lógica de cálculo de distância apropriada para os seus dados
  // Aqui, usamos a distância euclidiana como exemplo
  return Math.sqrt(
    Math.pow(point1.pts - point2.pts, 2) +
      Math.pow(point1.stl - point2.stl, 2) +
      Math.pow(point1.ast - point2.ast, 2) +
      Math.pow(point1.reb - point2.reb, 2) +
      Math.pow(point1.pf - point2.pf, 2)
  );
}

function updateSharedArrayBuffer(sab, cluster, sabIndex) {
  // Obter uma visão do TypedArray com base na SharedArrayBuffer
  let sabView = new Float64Array(sab);

  // Extrair os valores do cluster para um array plano
  let flatArray = new Array(sabView.length).fill(0);

  cluster.forEach((obj) => {
    let objValues = Object.values(obj);
    objValues.forEach((value, index) => {
      flatArray[index] += value;
    });
  });

  // Calcular o deslocamento correto na SharedArrayBuffer
  let offset = sabIndex * sabView.length;

  // Verificar se o offset ultrapassa o comprimento da SharedArrayBuffer
  if (offset < sabView.length) {
    // Calcular a média dos valores
    let clusterSize = cluster.length || 1; // Evitar divisão por zero
    for (let i = 0; i < sabView.length; i++) {
      sabView[offset + i] = flatArray[i] / clusterSize;
    }
  } else {
    console.error("Error: Offset is out of bounds.");
  }
}

function createSharedArrayBuffer(dataArray, nunclusters) {
  const buffer = new SharedArrayBuffer(
    dataArray.length * nunclusters * Int32Array.BYTES_PER_ELEMENT * 5
  );
  const int32Array = new Int32Array(buffer);

  let currentIndex = 0;

  for (let i = 0; i < dataArray.length; i++) {
    const innerArray = dataArray[i];
    for (let j = 0; j < innerArray.length; j++) {
      const obj = innerArray[j];
      int32Array[currentIndex++] = obj.id;
      int32Array[currentIndex++] = obj.pts * 100;
      int32Array[currentIndex++] = obj.stl * 100;
      int32Array[currentIndex++] = obj.ast * 100;
      int32Array[currentIndex++] = obj.reb * 100;
    }
  }

  return int32Array;
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
