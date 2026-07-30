export function validateDate(date) {
      const eventDate = new Date(date);
    if (eventDate < new Date()) throw new Error("Fecha no disponible");
}

export function validateCapacity(capacity){
    if (capacity <= 0) throw new Error("La capacidad no puede ser menor a 0");
    
}

export function validatePrice(price){
    if(price < 0) throw new Error("El precio no puede ser menor a 0");
    
}

