import { LabourRole } from '../enums/labour-role.enum';
import { LabourTrade } from '../enums/labour-trade.enum';

export type TradeSelection = {
  trade: LabourTrade;
  roles: LabourRole[];
};
