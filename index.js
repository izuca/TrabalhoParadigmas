const express = require('express')
const morgan = require('morgan')
const {log} = require('mercedlogger')
const RadioBrowser = require('radio-browser')
//Objeto da Aplicação
const app = express()

//Configurando o EJS como motor de visualização
app.set('view engine', 'ejs')

//Definindo a Porta da Aplicação
const port = 3000;

//Middleware global
app.use(morgan('Request')) //Loga um Request a cada requisição


//Rotas
app.get('/', async(req,res) => {
    let filter = {
        by:'topvote',
        limit: 1000
    }

    //Buscando 1000 estações mais votadas
    RadioBrowser.getStations(filter)
        .then(data => {
            log.green('Sucesso', 'Requisição Feita')
            
            const totalStations = data.length
            const itemPerPage = 10
            const numberOfPages = Math.ceil(totalStations/itemPerPage)
            let currentPage = 1
            
            const criaPagina = (currentPage,itemPerPage) => {
                const trimStart = (currentPage - 1) * itemPerPage
                const trimEnd = trimStart + itemPerPage
                const pgAtual = data.slice(trimStart,trimEnd)

                return pgAtual
            }

            let pagina  = []
            for(i = 0; i < numberOfPages; i++){
                pagina[i] = criaPagina(i+1,itemPerPage);
            }
            
            res.render('index',{ pagina,currentPage,numberOfPages })

        })
        .catch(error => {
            log.red('Erro na requisição da API', error);
            res.status(500).send('Erro interno do servidor');
        })

})

//App listener
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
})