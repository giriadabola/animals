const animalImageBasePath = 'assets/animais';

function createFeedingAnimalOption(label, feedingType, imageFile) {
    return {
        label,
        feedingType,
        src: `${animalImageBasePath}/${imageFile}`
    };
}

export const feedingAnimalOptions = [
    createFeedingAnimalOption('Anchovas', 'Piscívoro', 'anchovas.png'),
    createFeedingAnimalOption('Antílopes', 'Herbívoro', 'antilopes.png'),
    createFeedingAnimalOption("Búfalos-d'água", 'Herbívoro', 'bufalos-d-agua.png'),
    createFeedingAnimalOption('Cavalas', 'Piscívoro', 'cavalas.png'),
    createFeedingAnimalOption('Cervos', 'Herbívoro', 'cervos.png'),
    createFeedingAnimalOption('Crustáceos', 'Carnívoro', 'crustáceo.png'),
    createFeedingAnimalOption('Javalis', 'Omnívoro', 'javalis.png'),
    createFeedingAnimalOption('Sardinhas', 'Piscívoro', 'sardinhas.png')
];
