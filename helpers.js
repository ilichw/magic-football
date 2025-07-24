export function getRandomElement(elements) {
    const length = elements.length;
    const index = Math.ceil(Math.random() * (length - 1));
    return elements[index];
}
