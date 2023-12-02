const express = require('express')
const morgan = require('morgan')
const {log} = require('mercedlogger')
const apiRouter = require('./Controllers/Api')
const RadioBrowser = require('radio-browser')
//Objeto da Aplicação
const app = express()

//Configurando o EJS como motor de visualização
app.set('view engine', 'ejs')

//Definindo a Porta da Aplicação
const port = 3000;

//Middleware global
app.use(morgan('Request')) //Loga um Request a cada requisição
app.use(express.static('Public'))

//Rotas
app.get('/', async(req,res) => {
    let filter = {
        limit: 5,
        by: 'tag',
        searchterm: 'jazz'
    }
    RadioBrowser.getStations(filter)
        .then(data => {
            log.green('Sucesso', 'Requisição Feita')
            res.render('index', { data })

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