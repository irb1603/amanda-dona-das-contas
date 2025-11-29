import { Category, Pilar } from "@/types";

export const PILARS: Pilar[] = ['Despesas Fixas', 'Investimentos', 'Guilty-free', 'Imprevistos'];

export const CATEGORIES: Category[] = [
    // Despesas Fixas
    { id: 'cat_moradia', name: 'Moradia', pilar: 'Despesas Fixas' },
    { id: 'cat_transporte', name: 'Transporte', pilar: 'Despesas Fixas' },
    { id: 'cat_educacao', name: 'Educação', pilar: 'Despesas Fixas' },
    { id: 'cat_saude', name: 'Saúde', pilar: 'Despesas Fixas' },
    { id: 'cat_mercado', name: 'Mercado', pilar: 'Despesas Fixas' },
    { id: 'cat_servicos', name: 'Serviços Essenciais', pilar: 'Despesas Fixas' },
    { id: 'cat_pets', name: 'Pets', pilar: 'Despesas Fixas' },
    { id: 'cat_criancas', name: 'Crianças', pilar: 'Despesas Fixas' },

    // Guilty-free
    { id: 'cat_assinaturas', name: 'Assinaturas', pilar: 'Guilty-free' },
    { id: 'cat_academia', name: 'Academia e Bem-Estar', pilar: 'Guilty-free' },
    { id: 'cat_alimentacao_fora', name: 'Alimentação fora', pilar: 'Guilty-free' },
    { id: 'cat_lazer', name: 'Lazer', pilar: 'Guilty-free' },
    { id: 'cat_presentes', name: 'Presentes', pilar: 'Guilty-free' },
    { id: 'cat_compras', name: 'Compras pessoais', pilar: 'Guilty-free' },

    // Investimentos
    { id: 'cat_consorcios', name: 'Consórcios', pilar: 'Investimentos' },

    // Imprevistos
    { id: 'cat_saude_imprevista', name: 'Saúde imprevista', pilar: 'Imprevistos' },
    { id: 'cat_manutencao_carro', name: 'Manutenção carro', pilar: 'Imprevistos' },
    { id: 'cat_multas', name: 'Multas e taxas', pilar: 'Imprevistos' },
    { id: 'cat_outros_imprevistos', name: 'Outros imprevistos', pilar: 'Imprevistos' },
];
