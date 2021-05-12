
import * as dbconnections from './../../../dbconnections'


// Couch Connection
export var couchDBName: string = dbconnections['CouchDBName']
console.log(couchDBName)
export var CouchHost: string = dbconnections['CouchHost']
export var CouchPass: string = dbconnections['CouchPass']
export var CouchPort: string = dbconnections['CouchPort']
export var CouchUser: string = dbconnections['CouchUser']

// Data Warehouse Connection
export var DWHost: string = dbconnections['DWHost']
export var DWPort: string = dbconnections['DWPort']
export var DWUser: string = dbconnections['DWUser']
export var DWPass: string = dbconnections['DWPass']
export var DWInitialDB: string = dbconnections['DWInitialDB']

// ASHOP Connection
// export var NorpacServiceName: string = dbconnections['NorpacServiceName']
// export var NorpacHost: string = dbconnections['NorpacHost']
// export var NorpacPass: string = dbconnections['NorpacPass']
// export var NorpacPort: string = dbconnections['NorpacPort']
// export var NorpacUser: string = dbconnections['NorpacUser']
// export var strNorpacConnection: string = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=" + NorpacHost + ")(PORT=" + NorpacPort + "))(CONNECT_DATA =(SERVICE_NAME=" + NorpacServiceName + ")))"
export var strNorpacConnection: string = '';

// WCGOP Connection
export var IFQServiceName: string = dbconnections['IFQServiceName']
export var IFQHost: string = dbconnections['IFQHost']
export var IFQPass: string = dbconnections['IFQPass']
export var IFQPort: string = dbconnections['IFQPort']
export var IFQUser: string = dbconnections['IFQUser']
export var strIFQConnection: string = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=" + IFQHost + ")(PORT=" + IFQPort + "))(CONNECT_DATA =(SERVICE_NAME=" + IFQServiceName + ")))"

// Create connection to Couch to last entire runtime of application
export var couchurl: string = "https://" + CouchUser + ":" + CouchPass + "@" + CouchHost + ":" + CouchPort
export const couchDB = require('nano')({
    url: couchurl,
    requestDefaults: {
        pool: {
            maxSockets: Infinity
        }
    }
});

export var couchConnection = couchDB.use(couchDBName);

// Setting this process export var to "0" is extremely unsafe in most situations, use with care.
// It is unsafe because Node does not like self signed TLS (SSL) certificates, 
// this setting disables Node's rejection of invalid or unauthorized certificates, and allows them.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
console.log('CouchDB connection configured successfully.');