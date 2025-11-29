# Scripts de Manutenção

## Fix Category Names (fixCategoryNames.js)

Este script corrige categorias antigas no Firebase que foram salvas com IDs (como `cat_assinaturas`) ao invés de nomes (como `Assinaturas`).

### O que o script faz:

1. ✅ Busca todas as transações no Firebase
2. ✅ Identifica transações com categorias usando IDs antigos
3. ✅ Mostra um preview das mudanças que serão feitas
4. ✅ Aguarda 5 segundos para você cancelar se necessário
5. ✅ Atualiza as categorias em lotes (batches) de 500 transações
6. ✅ Mostra o progresso da atualização

### Mapeamento de Categorias:

O script converte os seguintes IDs para nomes:

**Despesas Fixas:**
- `cat_moradia` → `Moradia`
- `cat_transporte` → `Transporte`
- `cat_educacao` → `Educação`
- `cat_saude` → `Saúde`
- `cat_mercado` → `Mercado`
- `cat_servicos` → `Serviços Essenciais`
- `cat_pets` → `Pets`
- `cat_criancas` → `Crianças`

**Guilty-free:**
- `cat_assinaturas` → `Assinaturas`
- `cat_academia` → `Academia e Bem-Estar`
- `cat_alimentacao_fora` → `Alimentação fora`
- `cat_lazer` → `Lazer`
- `cat_presentes` → `Presentes`
- `cat_compras` → `Compras pessoais`

**Investimentos:**
- `cat_consorcios` → `Consórcios`

**Imprevistos:**
- `cat_saude_imprevista` → `Saúde imprevista`
- `cat_manutencao_carro` → `Manutenção carro`
- `cat_multas` → `Multas e taxas`
- `cat_outros_imprevistos` → `Outros imprevistos`

### Como usar:

#### Opção 1: Via npm script (Recomendado)
```bash
npm run fix-categories
```

#### Opção 2: Diretamente com Node.js
```bash
node scripts/fixCategoryNames.js
```

### Exemplo de saída:

```
🚀 Starting category name fix script...

📥 Fetching all transactions...
📊 Found 250 total transactions

🔍 Found 45 transactions with old category IDs

📋 Preview of changes:
   cat_assinaturas → Assinaturas (12 transactions)
   cat_moradia → Moradia (8 transactions)
   cat_educacao → Educação (15 transactions)
   cat_lazer → Lazer (10 transactions)

⚠️  This will update the database. Make sure you have a backup!
Press Ctrl+C to cancel, or wait 5 seconds to continue...

✓ Updated 45/45 transactions

✅ Successfully updated 45 transactions!
🎉 Category names are now unified!

✨ Script completed successfully!
```

### ⚠️ IMPORTANTE:

1. **Backup**: O script mostra um preview e aguarda 5 segundos antes de executar
2. **Seguro**: Só atualiza transações que realmente precisam (com IDs antigos)
3. **Idempotente**: Pode ser executado múltiplas vezes sem problemas
4. **Reversível**: Se precisar reverter, você pode editar manualmente no Firebase Console

### Requisitos:

- Node.js instalado
- Arquivo `.env.local` configurado com as credenciais do Firebase
- Conexão com a internet

### Em caso de erro:

Se o script falhar no meio da execução:
1. Ele mostra onde parou
2. Você pode executá-lo novamente
3. Ele só atualizará as transações que ainda têm IDs antigos

### Verificar resultados:

Após executar o script:
1. Acesse o Firebase Console
2. Vá em Firestore Database → transactions
3. Verifique que as categorias agora usam nomes ao invés de IDs
4. Ou simplesmente use o app e veja que não há mais duplicações como "cat_assinaturas" e "Assinaturas"
