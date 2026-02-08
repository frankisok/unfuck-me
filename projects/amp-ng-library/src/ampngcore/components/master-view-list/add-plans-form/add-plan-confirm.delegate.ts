import { AMPProductPlan } from '../../../models/product';

export interface AddPlanConfirmDelegate {
    onAddContentSubmit(content: AMPProductPlan);

    onAddContentCancel();
}
