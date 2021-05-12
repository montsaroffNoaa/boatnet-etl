# boatnet-etl


**General Info:**

This repo currently contains scripts for three major jobs, which should probably be separated into multiple repos, especially as other major ETL jobs are created (such as surveys). The repo also contains a myriad of one-off scripts that have been used to interact with CouchDB data for reads and edits. They have been kept around to easily create new ones as needed.

Two of the major scripts are the ASHOP and WCGOP migration scripts,folders labeled as ASHOP and WCGOP. The main looping logic is located in the ashop-etl and wcgop-etl.ts files respectively. Other files in the folder contain other functions / constructors to attempt reducing line count in main files. 

The Taxonomy folder contains the third major script, which moreso is many small scripts. Buried in there is the code that pulled data from a handful of sources both internal and external to create the current taxonomy database in CouchDB. There is a lot of bloat in there that is mostly comprised of one-off scripts I wrote to query data from or write data to CouchDB both for testing purposes as well as editing data as needed. There is a lot of scratch work throughout the repo that has not been cleaned, both because this has served as my personal scratch pad for Couch data, and because I have often reused many of the one-offs to do other similar jobs.

The Common folder at the top level contains various functions and global variables to be used by more than one major scripts, for example, simple view querying or db connection variables. 

The Catch Groupings folder was, simply, the code that built the catch-grouping documents in Couch. 



**To Build:**

This repo will not build correctly without having boatnet-module repo alongside it in the same parent folder. There are many references to the models residing in that repo that are used to assist in type checking the data objects created for storage in Couch. 

In the parent folder where boatnet-etl folder lives, you will need to create a typescript file by the name of dbconnections.ts, of which a dummy version of is available in this repo. 

Install the npm packages listed. Some of those are currently unused, and need to be cleaned up. 



**Current Status:**

Build failures at the moment due to boatnet-module changes over time. The wcgop-script should be functional as it stands. The ashop-etl script is broken at the moment for unknown reason, and is currently being fixed. 

Some npm packages are out of date and need to be updated, which will probably as usual break everything and need fixing, on the back burner.

A specific branch of boatnet-module needs to be created to keep this repo stable. 



**IMPORTANT NOTES:**

The wcgop script, as it currently stands this moment, does not create any new look up documents (code is there, only disabled), and requires them to be existing in the database already. This is because it is much easier to run and load/reload Catch data into Couch. 

I have been running various scripts directly through my instance of VSCode, and as such I simply have an Intialize function in the respective etl files, and comment / uncomment them as necessary before running the repo. 