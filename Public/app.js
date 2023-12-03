// app.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('O evento DOMContentLoaded foi disparado!');
    
    window.processText = function (textInput) {
        console.log('Texto de entrada:', textInput);

        const tokenizer = new natural.WordTokenizer();
        const tokens = tokenizer.tokenize(textInput);
        console.log('Tokens:', tokens);

        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `<p>Texto dividido em tokens: ${tokens.join(', ')}</p>`;
    };
});
