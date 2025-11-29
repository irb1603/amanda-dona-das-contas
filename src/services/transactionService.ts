import {
    collection,
    addDoc,
    writeBatch,
    doc,
    query,
    where,
    getDocs,
    updateDoc,
    Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Transaction, RecurringRule } from "@/types";

const TRANSACTIONS_COLLECTION = "transactions";
const RECURRING_RULES_COLLECTION = "recurring_rules";

/**
 * Generates and saves installment transactions for a credit card purchase.
 */
export async function createInstallmentTransactions(
    baseTransaction: Omit<Transaction, 'id' | 'installmentIndex' | 'totalInstallments' | 'parentTransactionId'>,
    totalInstallments: number,
    startDate: Date
): Promise<string[]> {
    const batch = writeBatch(db);
    const transactionIds: string[] = [];

    // Create a reference for the first transaction to use as parent ID (or generate a unique ID)
    // For simplicity, we'll generate a separate ID for the "purchase event" if needed, 
    // but usually the first installment acts as the anchor or they share a parentId.
    // Let's generate a random ID for the parent grouping.
    const parentTransactionId = doc(collection(db, TRANSACTIONS_COLLECTION)).id;

    const installmentValue = baseTransaction.amount / totalInstallments;

    for (let i = 0; i < totalInstallments; i++) {
        const transactionRef = doc(collection(db, TRANSACTIONS_COLLECTION));
        const transactionId = transactionRef.id;
        transactionIds.push(transactionId);

        // Calculate date: start date + i months (handling month boundaries correctly)
        const year = startDate.getFullYear();
        const month = startDate.getMonth();
        const day = startDate.getDate();

        // Add i months
        const newYear = year + Math.floor((month + i) / 12);
        const newMonth = (month + i) % 12;

        // Get last day of target month to handle edge cases
        const lastDayOfMonth = new Date(newYear, newMonth + 1, 0).getDate();
        const newDay = Math.min(day, lastDayOfMonth);

        const date = new Date(newYear, newMonth, newDay);

        // Remove undefined fields from baseTransaction
        const cleanBaseTransaction = Object.fromEntries(
            Object.entries(baseTransaction).filter(([_, v]) => v !== undefined)
        ) as Omit<Transaction, 'id' | 'installmentIndex' | 'totalInstallments' | 'parentTransactionId'>;

        const transaction: Transaction = {
            ...cleanBaseTransaction,
            amount: installmentValue, // Split amount
            date: date, // Firebase will convert Date to Timestamp
            installmentIndex: i + 1,
            totalInstallments: totalInstallments,
            parentTransactionId: parentTransactionId,
            description: `${baseTransaction.description} (${i + 1}/${totalInstallments})`
        };

        batch.set(transactionRef, transaction);
    }

    await batch.commit();
    return transactionIds;
}

/**
 * Modifies the number of installments for an existing installment transaction.
 * Can extend (add more installments) or reduce (delete future installments).
 */
export async function modifyInstallmentCount(
    parentTransactionId: string,
    newTotalInstallments: number,
    totalAmount: number,
    baseDescription: string,
    baseTransactionData: Partial<Transaction>
): Promise<void> {
    // Get all existing installments
    const q = query(
        collection(db, TRANSACTIONS_COLLECTION),
        where('parentTransactionId', '==', parentTransactionId)
    );

    const snapshot = await getDocs(q);
    const existingInstallments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as (Transaction & { id: string })[];

    // Sort by installment index
    existingInstallments.sort((a, b) => (a.installmentIndex || 0) - (b.installmentIndex || 0));

    const currentTotal = existingInstallments.length;
    const newInstallmentValue = totalAmount / newTotalInstallments;

    const batch = writeBatch(db);

    // Update existing installments that will remain
    const installmentsToKeep = Math.min(currentTotal, newTotalInstallments);
    for (let i = 0; i < installmentsToKeep; i++) {
        const installment = existingInstallments[i];
        const installmentRef = doc(db, TRANSACTIONS_COLLECTION, installment.id);

        batch.update(installmentRef, {
            amount: newInstallmentValue,
            totalInstallments: newTotalInstallments,
            description: `${baseDescription} (${i + 1}/${newTotalInstallments})`
        });
    }

    // If extending: create new installments
    if (newTotalInstallments > currentTotal) {
        // Get the date of the last existing installment to continue the sequence
        const lastInstallment = existingInstallments[existingInstallments.length - 1];
        const lastDate = lastInstallment.date instanceof Date
            ? lastInstallment.date
            : (lastInstallment.date as any).toDate();

        for (let i = currentTotal; i < newTotalInstallments; i++) {
            const transactionRef = doc(collection(db, TRANSACTIONS_COLLECTION));

            // Calculate date: last installment date + (i - currentTotal + 1) months
            const monthsToAdd = i - currentTotal + 1;
            const year = lastDate.getFullYear();
            const month = lastDate.getMonth();
            const day = lastDate.getDate();

            const newYear = year + Math.floor((month + monthsToAdd) / 12);
            const newMonth = (month + monthsToAdd) % 12;
            const lastDayOfMonth = new Date(newYear, newMonth + 1, 0).getDate();
            const newDay = Math.min(day, lastDayOfMonth);

            const date = new Date(newYear, newMonth, newDay);

            // Remove undefined fields from baseTransactionData
            const cleanBaseData = Object.fromEntries(
                Object.entries(baseTransactionData).filter(([_, v]) => v !== undefined)
            );

            const newInstallment: Transaction = {
                ...cleanBaseData,
                amount: newInstallmentValue,
                date: date,
                installmentIndex: i + 1,
                totalInstallments: newTotalInstallments,
                parentTransactionId: parentTransactionId,
                description: `${baseDescription} (${i + 1}/${newTotalInstallments})`
            } as Transaction;

            batch.set(transactionRef, newInstallment);
        }
    }

    // If reducing: delete extra installments
    if (newTotalInstallments < currentTotal) {
        for (let i = newTotalInstallments; i < currentTotal; i++) {
            const installment = existingInstallments[i];
            const installmentRef = doc(db, TRANSACTIONS_COLLECTION, installment.id);
            batch.delete(installmentRef);
        }
    }

    await batch.commit();
}


/**
 * Handles the "Delete from this month forward" logic for recurring expenses.
 * 1. Updates the RecurringRule to end before the specified date.
 * 2. Deletes any future transactions generated by this rule from the specified date onwards.
 */
export async function deleteRecurringTransactionFromDate(
    recurringRuleId: string,
    fromDate: Date
) {
    const batch = writeBatch(db);

    // 1. Update Recurring Rule
    // Set endDate to the previous month of the fromDate
    const endDate = new Date(fromDate);
    endDate.setMonth(endDate.getMonth() - 1);

    const ruleRef = doc(db, RECURRING_RULES_COLLECTION, recurringRuleId);
    batch.update(ruleRef, {
        endDate: endDate,
        isActive: false // Optionally mark as inactive if endDate is in the past
    });

    // 2. Find and delete future transactions linked to this rule
    const q = query(
        collection(db, TRANSACTIONS_COLLECTION),
        where("recurringRuleId", "==", recurringRuleId),
        where("date", ">=", fromDate)
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
}

/**
 * Helper to generate future transactions for a recurring rule (e.g., for the next 12 months).
 * This would be called when creating a new fixed expense.
 */
export async function generateRecurringTransactions(
    rule: RecurringRule,
    monthsToGenerate: number = 12
) {
    const batch = writeBatch(db);
    const ruleRef = doc(collection(db, RECURRING_RULES_COLLECTION)); // Generate ID if not provided
    const ruleId = rule.id || ruleRef.id;

    // Save the rule first if it's new
    if (!rule.id) {
        batch.set(ruleRef, { ...rule, id: ruleId });
    }

    for (let i = 0; i < monthsToGenerate; i++) {
        // Calculate date properly to handle month boundaries
        const year = rule.startDate.getFullYear();
        const month = rule.startDate.getMonth();
        const day = rule.startDate.getDate();

        const newYear = year + Math.floor((month + i) / 12);
        const newMonth = (month + i) % 12;
        const lastDayOfMonth = new Date(newYear, newMonth + 1, 0).getDate();
        const newDay = Math.min(day, lastDayOfMonth);

        const date = new Date(newYear, newMonth, newDay);

        // Stop if we exceed the rule's end date (if it exists)
        if (rule.endDate && date > rule.endDate) break;

        // Check for existing transaction for this rule in this month
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

        const q = query(
            collection(db, TRANSACTIONS_COLLECTION),
            where("recurringRuleId", "==", ruleId),
            where("date", ">=", startOfMonth),
            where("date", "<=", endOfMonth)
        );

        // We need to await this check, so we can't use a single batch for everything efficiently 
        // without potentially reading inside the loop. 
        // For 12 items, it's fine.
        const existingDocs = await getDocs(q);
        if (!existingDocs.empty) continue;

        const transactionRef = doc(collection(db, TRANSACTIONS_COLLECTION));
        const transaction: Transaction = {
            description: rule.description,
            amount: rule.amount,
            date: date,
            type: 'expense', // Assuming fixed expenses are expenses
            category: rule.category,
            pilar: rule.pilar,
            paymentMethod: rule.paymentMethod || 'debit_card',
            ...(rule.cardSource && { cardSource: rule.cardSource }),
            isFixed: true,
            recurringRuleId: ruleId
        };

        batch.set(transactionRef, transaction);
    }

    await batch.commit();
    return ruleId;
}

/**
 * Scans for duplicate recurring transactions and deletes them.
 * Duplicates are defined as transactions with the same recurringRuleId, month, and year.
 */
export async function removeDuplicateTransactions(): Promise<number> {
    const q = query(collection(db, TRANSACTIONS_COLLECTION), where("isFixed", "==", true));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    let deleteCount = 0;

    // Key: recurringRuleId-Month-Year -> count
    const seen = new Set<string>();

    snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!data.recurringRuleId) return;

        const date = (data.date as Timestamp).toDate();
        const key = `${data.recurringRuleId}-${date.getMonth()}-${date.getFullYear()}`;

        if (seen.has(key)) {
            // It's a duplicate, delete it
            batch.delete(doc.ref);
            deleteCount++;
        } else {
            seen.add(key);
        }
    });

    if (deleteCount > 0) {
        await batch.commit();
    }
    return deleteCount;
}
