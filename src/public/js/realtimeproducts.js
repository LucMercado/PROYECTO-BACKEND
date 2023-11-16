//Creo el cliente que escucha cuando se crea un producto nuevo
const socketClient = io()

//Creo la escucha de producto nuevo
socketClient.on('newProduct', (product) => {
    console.log("Escuchado")
    const productList = document.getElementById('product-list')
    const newElement = document.createElement('li')
    newElement.innerHTML = `
        <h3>${product.title}</h3>
        <p>Precio: ${product.price}</p>
        <p>Descripción: ${product.description}</p>
        <p>Categoría: ${product.category}</p>
    `
    productList.appendChild(newElement)
})

