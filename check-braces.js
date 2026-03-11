const fs = require('fs');
const content = fs.readFileSync('messages/en.json', 'utf8');
let openBraces = 0;
let closeBraces = 0;
let openBrackets = 0;
let closeBrackets = 0;
for (let char of content) {
  if (char === '{') openBraces++;
  if (char === '}') closeBraces++;
  if (char === '[') openBrackets++;
  if (char === ']') closeBrackets++;
}
console.log('Open braces {:', openBraces);
console.log('Close braces }:', closeBraces);
console.log('Open brackets [:', openBrackets);
console.log('Close brackets ]:', closeBrackets);
console.log('Balanced:', openBraces === closeBraces && openBrackets === closeBrackets);