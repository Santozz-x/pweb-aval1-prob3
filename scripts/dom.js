export function $(selector) {
	return document.querySelector(selector);
}

export function createElement(tag, className, content) {
	const el = document.createElement(tag);
	if (className) el.className = className;
	if (content) el.textContent = content;
	return el;
}

const FALLBACK_IMAGE = new URL('../assets/no-image.svg', import.meta.url).href;

export function getRecipeImage(recipe, className) {
	const img = createElement('img', className);
	img.alt = recipe.image
		? `Foto da receita ${recipe.name}`
		: `Imagem indisponível para a receita ${recipe.name}`;
	img.loading = 'lazy';
	img.addEventListener(
		'error',
		() => {
			img.src = FALLBACK_IMAGE;
			img.alt = `Imagem indisponível para a receita ${recipe.name}`;
		},
		{ once: true },
	);
	img.src = recipe.image || FALLBACK_IMAGE;
	return img;
}
