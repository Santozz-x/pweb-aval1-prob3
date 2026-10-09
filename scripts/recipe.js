import { getRecipe } from './api.js';
import { $, createElement, createRecipeImage } from './dom.js';

const status = $('#status');
const container = $('#recipe');

load();

async function load() {
	const id = new URLSearchParams(location.search).get('id');

	if (!/^\d+$/.test(id ?? '')) {
		showError('Receita inválida. Volte e selecione uma receita.');
		return;
	}

	status.textContent = 'Carregando receita...';
	status.className = 'status loading';

	try {
		render(await getRecipe(id));
		status.textContent = '';
		status.className = 'status';
	} catch (error) {
		showError(`${error.message} Tente novamente.`);
	}
}

function render(recipe) {
	document.title = `${recipe.name} — Livro de Receitas`;

	container.append(createElement('h2', null, recipe.name));
	if (recipe.typeLabel) container.append(createElement('p', 'tag', `Categoria: ${recipe.typeLabel}`));
	container.append(createRecipeImage(recipe, 'detail-image'));

	container.append(createElement('h3', null, 'Ingredientes'));
	if (recipe.ingredients.length) {
		const ul = createElement('ul', 'ingredients');
		ul.append(...recipe.ingredients.map(item => createElement('li', null, item)));
		container.append(ul);
	} else {
		container.append(createElement('p', null, 'Ingredientes não informados.'));
	}

	container.append(createElement('h3', null, 'Modo de preparo'));
	if (recipe.steps.length) {
		const ol = createElement('ol', 'steps');
		ol.append(...recipe.steps.map(step => createElement('li', null, step)));
		container.append(ol);
	} else {
		container.append(createElement('p', null, 'Modo de preparo não informado.'));
	}
}

function showError(message) {
	status.textContent = message;
	status.className = 'status error';
}
