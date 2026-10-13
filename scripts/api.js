const BASE_URL = 'https://api-receitas-pi.vercel.app';
const MAX_ITEMS = 100;

export const TYPE_LABELS = {
	doce: 'Doce',
	salgado: 'Salgado',
	agridoce: 'Agridoce',
};

/**
 * Busca dados na API de receitas e valida a resposta HTTP e o JSON retornado.
 *
 * @param {string} path Caminho e query string do recurso da API.
 * @returns {Promise<unknown>} Dados decodificados da resposta.
 * @throws {Error} Quando não é possível conectar, a API responde com erro ou
 * a resposta não contém JSON válido.
 */
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

/**
 * Normaliza uma receita da API para o formato consumido pela interface.
 *
 * @param {Object<string, unknown>|null|undefined} raw Receita recebida da API.
 * @returns {{
 * 	id: unknown,
 * 	name: string,
 * 	image: string,
 * 	type: string,
 * 	typeLabel: string,
 * 	ingredients: string[],
 * 	steps: string[]
 * }} Receita normalizada, sem valores nulos para os campos exibidos.
 */
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

/**
 * Converte uma resposta da API em uma lista de receitas normalizadas.
 *
 * @param {unknown} result Resposta da API, como lista ou objeto com `items`.
 * @returns {Array<ReturnType<typeof normalizeRecipe>>} Receitas normalizadas.
 * @throws {Error} Quando a resposta não contém uma lista de receitas.
 */
function toList(result) {
	const list = Array.isArray(result) ? result : result?.items;
	if (!Array.isArray(list)) {
		throw new Error('A resposta da API está em um formato inválido.');
	}
	return list.map(normalizeRecipe);
}

/**
 * Pesquisa receitas por texto, tipo ou ambos os filtros.
 *
 * Sem filtros, retorna todas as receitas disponíveis, respeitando o limite
 * máximo configurado para a API.
 *
 * @param {{text?: string, category?: string}} [filters={}] Filtros da pesquisa.
 * @returns {Promise<Array<ReturnType<typeof normalizeRecipe>>>} Receitas
 * normalizadas que correspondem aos filtros.
 */
export async function searchRecipes({ text = '', category = '' } = {}) {
	if (text) {
		const query = new URLSearchParams({
			descricao: text,
			page: 1,
			limit: MAX_ITEMS,
		});
		const recipes = toList(await request(`/receitas/descricao?${query}`));
		return category ? recipes.filter(recipe => recipe.type === category) : recipes;
	}

	if (category) {
		return toList(await request(`/receitas/tipo/${encodeURIComponent(category)}`));
	}

	return toList(await request(`/receitas/todas?page=1&limit=${MAX_ITEMS}`));
}

/**
 * Busca e normaliza uma receita pelo identificador.
 *
 * @param {string|number} id Identificador da receita.
 * @returns {Promise<ReturnType<typeof normalizeRecipe>>} Receita encontrada e
 * normalizada.
 * @throws {Error} Quando a receita não existe ou a resposta é inválida.
 */
export async function getRecipe(id) {
	const result = await request(`/receitas/${encodeURIComponent(id)}`);
	if (!result || typeof result !== 'object' || !result.id) {
		throw new Error('Receita não encontrada.');
	}
	return normalizeRecipe(result);
}
