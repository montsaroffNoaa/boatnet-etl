import { ExecuteOracleSQL, ReleaseOracle, InsertBulkCouchDB, WcgopConnection, GetDocFromDict } from '../Common/common-functions';
import { Rack, RackType } from '@boatnet/bn-models/lib';
import { dictObservers } from "./wcgop-etl";
import { get } from 'lodash';

async function BuildRacks() {
    let odb = await WcgopConnection();
    let oracleRacks = await ExecuteOracleSQL(odb, `Select * from racks`);
    let racks: Rack[] = [];

    for (let i = 0; i < oracleRacks.length; i++) {
        const currRack = oracleRacks[i];
        let createdBy = await GetDocFromDict(dictObservers, currRack[7], 'observers-by-userid', 'wcgop');
        let modifiedBy = await GetDocFromDict(dictObservers, currRack[9], 'observers-by-userid', 'wcgop');

        const newRack: Rack = {
            type: RackType,
            rackId: currRack[0],
            rackName: currRack[1],
            dissectionType: currRack[2],
            rackLocation: currRack[3],
            speciesId: currRack[4],
            rackColumns: currRack[5],
            rackRows: currRack[6],
            createdDate: currRack[8],
            createdBy: get(createdBy, 'firstName', '') + ' ' + get(createdBy, 'lastName', ''),
            updatedDate: currRack[10],
            updatedBy: get(modifiedBy, 'firstName', '') + ' ' + get(modifiedBy, 'lastName', ''),
        }
        racks.push(newRack);
    }

    await ReleaseOracle(odb);
    const r = await InsertBulkCouchDB(racks);
    console.log(r)
}

BuildRacks();