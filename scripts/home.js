import data from '../data.mock.json' with { type: 'json' };

const main = $('main');

const categories = data.map(recipe => recipe.tipo);
const categoriesSet = new Set(categories);

categoriesSet.forEach(catg => {
	const categoryName = capitalize(catg);
	const recipes = data.filter(rec => rec.tipo === catg);
	main.append(createSection(categoryName, recipes));
});

// ---------------------------------------------

function $(key) {
	return document.querySelector(key);
}

function createElement(tag, className, content) {
	const el = document.createElement(tag);
	if (className) el.classList.add(className);
	if (content) el.textContent = content;

	return el;
}

function createRecipeElement(recipe) {
	const article = createElement('section', 'recipe');

	const img = createElement('img');
	img.src = recipe.link_imagem;
	img.alt = recipe.receita;
	article.append(img);

	const divInfo = createElement('div', 'info');
	article.append(divInfo);
	const h3 = createElement('h3', null, recipe.receita);
	divInfo.append(h3);

	const p = createElement('p');
	const strong = createElement('strong', null, 'Ingredientes:');
	p.append(strong);
	const ingredientes =
		recipe.IngredientesBase?.flatMap(item => item.nomesIngrediente).join(
			', ',
		) ?? '';
	p.append(` ${ingredientes}`);
	divInfo.append(p);

	return article;
}

function createSection(title, data) {
	const section = createElement('section', 'recipe-group');
	const titleElem = createElement('h2');
	titleElem.textContent = title;
	section.append(titleElem);
	const div = createElement('div', 'recipe-wrapper');
	section.append(div);

	data.forEach(recipe => {
		div.append(createRecipeElement(recipe));
	});

	return section;
}

function capitalize(string) {
	return string[0].toUpperCase() + string.slice(1);
}
