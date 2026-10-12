import { searchRecipes } from './api.js';
import { $, createElement, getRecipeImage } from './dom.js';

const PAGE_SIZE = 12;
const MAX_TEXT_LENGTH = 60;

const form = $('#search-form');
const status = $('#status');
const results = $('#results');
const pagination = $('#pagination');
const prevButton = $('#prev-button');
const nextButton = $('#next-button');
const pageInfo = $('#page-info');

let currentRecipes = [];
let page = 1;
let currentRequestId = 0;

form.addEventListener('submit', event => {
	event.preventDefault();
	const formData = new FormData(form);
	search({
		text: formData.text,
		type: formData.type,
	});
});

prevButton.addEventListener('click', () => goToPage(page - 1));
nextButton.addEventListener('click', () => goToPage(page + 1));

search();

async function search(text, type) {
	if (text && text.length > MAX_TEXT_LENGTH) {
		showStatus(
			`O termo deve ter no máximo ${MAX_TEXT_LENGTH} caracteres.`,
			'error',
		);
		return;
	}

	const id = ++currentRequestId;
	clearResults();
	showStatus('Carregando receitas...', 'loading');
	form.setAttribute('aria-busy', 'true');

	try {
		const recipes = await searchRecipes({ text, type });
		if (id !== currentRequestId) return; // a newer search has already started

		currentRecipes = recipes;
		if (recipes.length === 0) {
			showStatus(
				'Nenhuma receita encontrada. Tente outro termo ou tipo.',
				'empty',
			);
			return;
		}

		if (type) {
			showStatus(
				`${recipes.length} ${recipes.length === 1 ? 'receita encontrada' : 'receitas encontradas'}.`,
			);
		}
		goToPage(1, false);
	} catch (error) {
		if (id !== currentRequestId) return;
		showStatus(`${error.message} Tente novamente.`, 'error');
	} finally {
		if (id === currentRequestId) form.removeAttribute('aria-busy');
	}
}

function clearResults() {
	results.replaceChildren();
	currentRecipes = [];
	page = 1;
	pagination.hidden = true;
}

function goToPage(newPage, scroll = true) {
	const totalPages = Math.ceil(currentRecipes.length / PAGE_SIZE);
	page = Math.min(Math.max(newPage, 1), totalPages);

	const start = (page - 1) * PAGE_SIZE;
	results.replaceChildren(
		...currentRecipes.slice(start, start + PAGE_SIZE).map(createRecipeCard),
	);

	pagination.hidden = totalPages <= 1;
	pageInfo.textContent = `Página ${page} de ${totalPages}`;
	prevButton.disabled = page === 1;
	nextButton.disabled = page === totalPages;

	// if (scroll) status.scrollIntoView({ behavior: 'smooth' });
}

function createRecipeCard(recipe) {
	const link = createElement('a');
	link.href = `pages/recipe.html?id=${encodeURIComponent(recipe.id)}`;
	
	const article = createElement('article', 'recipe');
	link.append(article);

	article.append(getRecipeImage(recipe));

	const info = createElement('div', 'info');
	info.append(createElement('h3', null, recipe.name));
	if (recipe.typeLabel) {
		info.append(createElement('p', null, recipe.typeLabel));
	}
	article.append(info);

	const adhesive = createElement('div', 'adhesive');
	article.append(adhesive);

	return link;
}

function showStatus(message, kind = '') {
	console.log(message + kind);
	// status.textContent = message;
	// status.className = `status ${kind}`.trim();
}
