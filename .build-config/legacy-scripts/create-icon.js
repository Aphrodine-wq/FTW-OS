const fs = require('fs');
const path = require('path');

// Minimal PNG 256x256 solid blue
const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAQUlEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgWw8AAf9iu00AAAAASUVORK5CYII=";

const buffer = Buffer.from(pngBase64, 'base64');
fs.writeFileSync(path.join(__dirname, '../resources/icons/icon.png'), buffer);
console.log('Created icon.png');
