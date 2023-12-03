// app.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('O evento DOMContentLoaded foi disparado!');
    
    window.processText = function () {
        console.log('Função processText foi chamada!');
        
        const textInput = document.getElementById('textInput').value;
        console.log('Texto de entrada:', textInput);

        const tokenizer = new natural.WordTokenizer();
        const tokens = tokenizer.tokenize(textInput);
        console.log('Tokens:', tokens);

        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `<p>Texto dividido em tokens: ${tokens.join(', ')}</p>`;
    };
});
