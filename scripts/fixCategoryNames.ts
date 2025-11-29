/**
 * Script to fix category names in Firebase transactions
 * Converts old category IDs (like "cat_assinaturas") to category names (like "Assinaturas")
 *
 * Usage:
 * 1. Make sure you have Node.js and ts-node installed
 * 2. Run: npx ts-node scripts/fixCategoryNames.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';

// Firebase configuration - using the same config from your app
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Category mapping: ID -> Name
const CATEGORY_MAPPING: { [key: string]: string } = {
    // Despesas Fixas
    'cat_moradia': 'Moradia',
    'cat_transporte': 'Transporte',
    'cat_educacao': 'Educação',
    'cat_saude': 'Saúde',
    'cat_mercado': 'Mercado',
    'cat_servicos': 'Serviços Essenciais',
    'cat_pets': 'Pets',
    'cat_criancas': 'Crianças',

    // Guilty-free
    'cat_assinaturas': 'Assinaturas',
    'cat_academia': 'Academia e Bem-Estar',
    'cat_alimentacao_fora': 'Alimentação fora',
    'cat_lazer': 'Lazer',
    'cat_presentes': 'Presentes',
    'cat_compras': 'Compras pessoais',

    // Investimentos
    'cat_consorcios': 'Consórcios',

    // Imprevistos
    'cat_saude_imprevista': 'Saúde imprevista',
    'cat_manutencao_carro': 'Manutenção carro',
    'cat_multas': 'Multas e taxas',
    'cat_outros_imprevistos': 'Outros imprevistos',
};

async function fixCategoryNames() {
    console.log('🚀 Starting category name fix script...\n');

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    try {
        // Get all transactions
        console.log('📥 Fetching all transactions...');
        const transactionsRef = collection(db, 'transactions');
        const snapshot = await getDocs(transactionsRef);

        console.log(`📊 Found ${snapshot.size} total transactions\n`);

        // Filter transactions that need updating
        const transactionsToUpdate: Array<{ id: string; oldCategory: string; newCategory: string }> = [];

        snapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const category = data.category;

            // Check if category is an ID that needs to be converted
            if (category && CATEGORY_MAPPING[category]) {
                transactionsToUpdate.push({
                    id: docSnapshot.id,
                    oldCategory: category,
                    newCategory: CATEGORY_MAPPING[category]
                });
            }
        });

        console.log(`🔍 Found ${transactionsToUpdate.length} transactions with old category IDs\n`);

        if (transactionsToUpdate.length === 0) {
            console.log('✅ No transactions need updating. All categories are already using names!');
            return;
        }

        // Show what will be updated
        console.log('📋 Preview of changes:');
        const categoryChanges: { [key: string]: number } = {};
        transactionsToUpdate.forEach(({ oldCategory, newCategory }) => {
            const key = `${oldCategory} → ${newCategory}`;
            categoryChanges[key] = (categoryChanges[key] || 0) + 1;
        });

        Object.entries(categoryChanges).forEach(([change, count]) => {
            console.log(`   ${change} (${count} transactions)`);
        });

        console.log('\n⚠️  This will update the database. Make sure you have a backup!');
        console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

        // Wait 5 seconds before proceeding
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Update in batches (Firestore batch limit is 500)
        const BATCH_SIZE = 500;
        let updatedCount = 0;

        for (let i = 0; i < transactionsToUpdate.length; i += BATCH_SIZE) {
            const batch = writeBatch(db);
            const batchItems = transactionsToUpdate.slice(i, i + BATCH_SIZE);

            batchItems.forEach(({ id, newCategory }) => {
                const docRef = doc(db, 'transactions', id);
                batch.update(docRef, { category: newCategory });
            });

            await batch.commit();
            updatedCount += batchItems.length;

            console.log(`✓ Updated ${updatedCount}/${transactionsToUpdate.length} transactions`);
        }

        console.log(`\n✅ Successfully updated ${updatedCount} transactions!`);
        console.log('🎉 Category names are now unified!\n');

    } catch (error) {
        console.error('❌ Error fixing category names:', error);
        throw error;
    }
}

// Run the script
fixCategoryNames()
    .then(() => {
        console.log('✨ Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    });
