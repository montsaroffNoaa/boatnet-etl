import moment = require("moment");
import { Basket, BasketTypeName } from "@boatnet/bn-models/lib";


export function BuildBaskets(CouchIDs: string[], BasketData: any) {
    let Baskets: Basket[] = [];
    for (let i = 0; i < BasketData.length; i++) {

        let Weight;
        if (BasketData[i][2] == null) {
            Weight = null;
        } else (
            Weight = {
                measurementType: 'weight',
                value: BasketData[i][2],
                units: 'UNKNOWN' // TODO
            }
        )

        let ModifiedDate = BasketData[i][6];
        let ComputerEditedDate = BasketData[i][8]
        let UpdatedDate = null;
        let UpdatedBy = null;
        if (ComputerEditedDate != null) {
            UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
            UpdatedBy = BasketData[i][10];
        } else if (ModifiedDate != null) {
            UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
            UpdatedBy = BasketData[i][6];
        }

        let NewBasket: Basket = {
            _id: CouchIDs[i],
            type: BasketTypeName,
            count: BasketData[i][3],
            weight: Weight,
            createdBy: BasketData[i][5],
            createdDate: moment(BasketData[i][4], moment.ISO_8601).format(),
            updatedBy: UpdatedBy,
            updatedDate: UpdatedDate,
            dataSource: BasketData[i][9],

            legacy: {
                speciesCompItemId: BasketData[i][1],
                speciesCompBasketId: BasketData[i][0]
            }
        }
        Baskets.push(NewBasket);
    }

    if (Baskets.length == 0) {
        Baskets = null;
    }

    return Baskets;
}

