import React from 'react';
import { useApp } from '../../context/AppContext';
import { AddFundsModal } from './AddFundsModal';
import { AirtimeModal } from './AirtimeModal';
import { CardsInfoModal } from './CardsInfoModal';
import { CreateGoalModal } from './CreateGoalModal';
import { LevelUpModal } from './LevelUpModal';
import { MoreActionsModal } from './MoreActionsModal';
import { PayBillsModal } from './PayBillsModal';
import { CreateBudgetModal } from './CreateBudgetModal';
import { RedeemRewardsModal } from './RedeemRewardsModal';
import { SaveMoneyModal } from './SaveMoneyModal';
import { TransactionReceiptModal } from './TransactionReceiptModal';
import { TransferModal } from './TransferModal';

export const ModalRoot: React.FC = () => {
  const { activeModal } = useApp();

  return (
    <>
      <LevelUpModal />
      {activeModal === 'transfer' && <TransferModal />}
      {activeModal === 'pay_bills' && <PayBillsModal />}
      {activeModal === 'buy_airtime' && <AirtimeModal />}
      {activeModal === 'save_money' && <SaveMoneyModal />}
      {activeModal === 'add_funds' && <AddFundsModal />}
      {activeModal === 'create_budget' && <CreateBudgetModal />}
      {activeModal === 'create_goal' && <CreateGoalModal />}
      {activeModal === 'redeem_rewards' && <RedeemRewardsModal />}
      {activeModal === 'transaction_receipt' && <TransactionReceiptModal />}
      {activeModal === 'cards_info' && <CardsInfoModal />}
      {activeModal === 'more_actions' && <MoreActionsModal />}
    </>
  );
};
