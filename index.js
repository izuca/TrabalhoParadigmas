const express = require('express')
const morgan = require('morgan')
const {log} = require('mercedlogger')

//Objeto da Aplicação
const app = express()

//Definindo a Porta da Aplicação
const port = 3000;

//Middleware global
app.use(morgan('Request')) //Loga um Request a cada requisição

//Rotas
app.get('/',(req,res) => {
    res.sendFile(__dirname + '/index.html')
})


//App listener
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
})