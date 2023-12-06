//Errado, eu preciso arrumar uma forma de montar um SAB com workers, sem precisar esperar 7 minutos

const playerIds = Array.from({ length: 455 }, (_, index) => index + 1);
const apiUrl = 'https://www.balldontlie.io/api/v1/season_averages?season=2018&player_ids[]=';
const reqPerMinute = 60;
const delay = (60 * 1000) ;


// Talvez proxy??? ou vpn??? Algum jeito de burlar o limite da API
async function getPlayerData(playerId) {
  const response = await fetch(`${apiUrl}${playerId}`);
  const playerAverage = await response.json();
  return playerAverage;
}

async function getAllPlayerData() {
  const filteredPlayerDataArray = [];
 
  for (const playerId of playerIds) {
    try {
      if(playerId % 60 === 0){
        console.log('esperando')
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      const playerData = await getPlayerData(playerId);

      const filteredPlayerInfo = {
        id: playerId,
        pts: playerData.data[0].pts,
        stl: playerData.data[0].stl,
        ast: playerData.data[0].ast,
        reb: playerData.data[0].reb,
        pf: playerData.data[0].pf,
      };

    // Adiciona um atraso entre as chamadas
      filteredPlayerDataArray.push(filteredPlayerInfo);
    } catch (error) {
      console.log(playerId)
      console.error(`Erro ao obter dados para o jogador ${playerId}: ${error.message}`);
    }

  }

  return filteredPlayerDataArray;
}

// Chama a função principal
getAllPlayerData().then((result) => {
  console.log(result);
});
