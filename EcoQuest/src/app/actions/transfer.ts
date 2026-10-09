'use server';

import { withTransaction } from '@/lib/db';
import { getAuthenticatedUserId } from '@/lib/auth';
import { toKobo } from '@/lib/money';

/**
 * Executes an internal money transfer between two accounts owned by the same user.
 * Uses PostgreSQL transactions to ensure atomicity, preventing money from being created or lost.
 */
export async function executeAtomicTransfer(sourceAccountId: number, targetAccountId: number, amount: number) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  if (amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }

  const koboAmount = toKobo(amount);

  return await withTransaction(async (client) => {
    // 1. Lock the source account for update to prevent race conditions
    const sourceRes = await client.query(
      'SELECT balance, name FROM accounts WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [sourceAccountId, userId]
    );
    if (sourceRes.rows.length === 0) {
      throw new Error('Source account not found');
    }
    const sourceAccount = sourceRes.rows[0];
    
    if (sourceAccount.balance < koboAmount) {
      throw new Error('Insufficient balance');
    }

    // 2. Lock the target account for update
    const targetRes = await client.query(
      'SELECT id, name FROM accounts WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [targetAccountId, userId]
    );
    if (targetRes.rows.length === 0) {
      throw new Error('Target account not found');
    }
    const targetAccount = targetRes.rows[0];

    // 3. Perform atomic deduction and addition
    await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [koboAmount, sourceAccountId]);
    await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [koboAmount, targetAccountId]);

    // 4. Create robust transaction logs within the same atomic block
    const refPrefix = `SIM-EQ-TRF-${Math.floor(Math.random() * 900000) + 100000}`;
    
    await client.query(`
      INSERT INTO transactions (user_id, account_id, type, action_type, amount, description, recipient, reference, status, is_simulated, created_at)
      VALUES ($1, $2, 'debit', 'saving_transfer', $3, 'Save Money', $4, $5, 'successful', true, NOW())
    `, [userId, sourceAccountId, koboAmount, `Moved to ${targetAccount.name}`, `${refPrefix}-OUT`]);

    await client.query(`
      INSERT INTO transactions (user_id, account_id, type, action_type, amount, description, recipient, reference, status, is_simulated, created_at)
      VALUES ($1, $2, 'credit', 'saving_transfer', $3, 'Save Money', $4, $5, 'successful', true, NOW())
    `, [userId, targetAccountId, koboAmount, `From ${sourceAccount.name}`, `${refPrefix}-IN`]);

    return { success: true, message: 'Transfer completed successfully' };
  });
}
