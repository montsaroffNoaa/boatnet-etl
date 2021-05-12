import { couchDB } from "./db-connection-variables";


// async function PurgeAllDocs(dbName: string){

//     let deletedDocIDs: string[] = [];
//     let dbConnection = couchDB.use(dbName);
    
//     // couchDB.db.changes('lookups-dev', {include_docs: true, filter: '_view', view: 'deleted/all-deleted-docs'}).then((body: any) => {
//     await couchDB.db.changes(dbName).then((body: any) => {
//         console.log(body);
//         for(let i = 0; i < body.results.length; i++){
//             if(body.results[i].deleted){
//                 deletedDocIDs.push(body.results[i].id)
//             }
//         }
//     });
    
//     let idAndRevTuples: string[][] = [];
//     await dbConnection.list({keys: deletedDocIDs, revs: true}).then((body: any) => {
//         console.log(body);
//         for(let i = 0; i < body.rows.length; i++){
//             let _id = body.rows[i].id;
//             let _rev = body.rows[i].value.rev
//             if(_rev.IsArray){
//                 console.log();
//             }
//             idAndRevTuples.push([_id, [_rev]]);
//         }
//     });

//     for(let i = 0; i < idAndRevTuples.length; i++){
//         let bodyObject: any = {};
//         bodyObject[idAndRevTuples[i][0]] = idAndRevTuples[i][1];
//         await couchDB.request({
//             db: dbName,
//             path: '_purge',
//             method: 'post',
//             body: bodyObject
//         }).then((body: any) => {
//             console.log(body);
//         });
//     }
// }


