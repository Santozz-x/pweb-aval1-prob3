const BASE_URL = 'https://api-receitas-pi.vercel.app';
const MAX_ITEMS = 100;

export const TYPE_LABELS = {
	doce: 'Doce',
	salgado: 'Salgado',
	agridoce: 'Agridoce',
};

async function request(path) {
	let response;
	try {
		response = await fetch(`${BASE_URL}${path}`);
	} catch {
		throw new Error('Não foi possível conectar à API. Verifique sua conexão.');
	}

	if (!response.ok) {
		throw new Error(`A API respondeu com erro (código ${response.status}).`);
	}

	try {
		const body = await response.text();
		return body ? JSON.parse(body) : null;
	} catch {
		throw new Error('A resposta da API está em um formato inválido.');
	}
}

// Normalizes an API recipe so null/undefined never reach the UI.
export function normalizeRecipe(raw) {
	const ingredients =
		typeof raw?.ingredientes === 'string'
			? raw.ingredientes
					.split(',')
					.map(item => item.trim())
					.filter(Boolean)
			: [];

	const steps =
		typeof raw?.modo_preparo === 'string'
			? raw.modo_preparo
					.split(/\s*(?=\b\d+\.\s)/)
					.map(step => step.replace(/^\d+\.\s*/, '').trim())
					.filter(Boolean)
			: [];

	return {
		id: raw?.id,
		name: raw?.receita?.trim() || 'Receita sem nome',
		image: raw?.link_imagem?.trim() || '',
		type: raw?.tipo ?? '',
		typeLabel: TYPE_LABELS[raw?.tipo] ?? '',
		ingredients,
		steps,
	};
}

function toList(result) {
	const list = Array.isArray(result) ? result : result?.items;
	if (!Array.isArray(list)) {
		throw new Error('A resposta da API está em um formato inválido.');
	}
	return list.map(normalizeRecipe);
}

// Searches by name/description and/or type. With no filters, lists all.
export async function searchRecipes({ text = '', type = '' } = {}) {
	if (text) {
		const query = new URLSearchParams({
			descricao: text,
			page: 1,
			limit: MAX_ITEMS,
		});
		const recipes = toList(await request(`/receitas/descricao?${query}`));
		return type ? recipes.filter(recipe => recipe.type === type) : recipes;
	}

	if (type) {
		return toList(await request(`/receitas/tipo/${encodeURIComponent(type)}`));
	}

	return toList(await request(`/receitas/todas?page=1&limit=${MAX_ITEMS}`));
}

export async function getRecipe(id) {
	const result = await request(`/receitas/${encodeURIComponent(id)}`);
	if (!result || typeof result !== 'object' || !result.id) {
		throw new Error('Receita não encontrada.');
	}
	return normalizeRecipe(result);
}
