import { LabourRole } from '../enums/labour-role.enum';
import { LabourTrade } from '../enums/labour-trade.enum';

export class TradeSelectionDto {
  trade: LabourTrade;
  roles: LabourRole[];
}
