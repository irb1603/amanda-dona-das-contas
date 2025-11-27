import { Category, Pilar } from "@/types";

export const PILARS: Pilar[] = ['Despesas Fixas', 'Investimentos', 'Guilty-free', 'Imprevistos'];

export const CATEGORIES: Category[] = [
    { id: 'cat_moradia', name: 'Moradia', pilar: 'Despesas Fixas' },
    { id: 'cat_educacao', name: 'Educação', pilar: 'Despesas Fixas' },
    { id: 'cat_alimentacao', name: 'Alimentação', pilar: 'Despesas Fixas' },
    { id: 'cat_transporte', name: 'Transporte', pilar: 'Despesas Fixas' },
    { id: 'cat_lazer', name: 'Lazer', pilar: 'Guilty-free' },
    { id: 'cat_restaurantes', name: 'Restaurantes', pilar: 'Guilty-free' },
    { id: 'cat_viagem', name: 'Viagem', pilar: 'Guilty-free' },
    { id: 'cat_investimento', name: 'Aportes', pilar: 'Investimentos' },
    { id: 'cat_reserva', name: 'Reserva de Emergência', pilar: 'Imprevistos' },
    { id: 'cat_saude', name: 'Saúde', pilar: 'Imprevistos' },
    { id: 'cat_outros', name: 'Outros', pilar: 'Guilty-free' },
];
