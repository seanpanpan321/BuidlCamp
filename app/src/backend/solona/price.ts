// return json data from any file path (asynchronous)
function getJSON(path) {
    return fetch(path).then(response => response.json());
}

export function retPrice(id: number){
    const price = getJSON('./item/items.json')
    .then( (json) => JSON.parse(json) )
    .then( (obj) => { return obj.price } )
}

