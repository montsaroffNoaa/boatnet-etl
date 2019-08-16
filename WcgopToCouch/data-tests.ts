// import { ReleaseOracle, ExecuteOracleSQL, FetchDocument, OracleConnection } from ".";

// async function TestHauls(){
//     let odb = await OracleConnection();
//     console.log("asd")
//     let strSQL = `SELECT FISHING_ACTIVITIES.FISHING_ACTIVITY_ID, FISHING_ACTIVITIES.TRIP_ID, FISHING_ACTIVITIES.FISHING_ACTIVITY_NUM, FISHING_ACTIVITIES.OBSERVER_TOTAL_CATCH, FISHING_ACTIVITIES.OTC_WEIGHT_UM, FISHING_ACTIVITIES.OTC_WEIGHT_METHOD FROM OBSPROD.FISHING_ACTIVITIES`;
//     let lstHaulData = await ExecuteOracleSQL(odb, strSQL);
  
//     for(let i = 0; i < lstHaulData.length; i++){
//       let Document: any;
//       let strDocID, strDocRev;
  
//       strSQL = `SELECT COUNT(*) FROM OBSPROD.CATCHES WHERE CATCHES.FISHING_ACTIVITY_ID = ` + lstHaulData[i][0];
//       let CatchNum = await ExecuteOracleSQL(odb, strSQL);
//       CatchNum = CatchNum[0][0];
//       try {
        
//         [strDocID, strDocRev, Document] = await FetchDocument("haul_id", lstHaulData[i][0]);
//         if (strDocID == null){
//           console.log("Error: Document does not exist. haul_id = " + lstHaulData[i][0]);
//         } else if (Document.catches.length != CatchNum){ //TODO fix this weird issue with empty catch lists being null instead of empty
//             if (Document.catches[0] == null && CatchNum > 0){
//               console.log("Error: Haul Catch counts do not line up. haul_id = " + lstHaulData[i][0]);
//             } else if (Document.catches[0] != null && CatchNum == 0){
//               console.log("Error: Haul Catch counts do not line up. haul_id = " + lstHaulData[i][0]);
//           }
//         } else if (Document.old_trip_id != lstHaulData[i][1]){
//           console.log("Error: Document data inconsistent, trip id. haul_id = " + lstHaulData[i][0]);
//         } else if (Document.haul_num != lstHaulData[i][2]){
//           console.log("Error: Document data inconsistent, haul num. haul_id = " + lstHaulData[i][0]);
//         } else if (Document.observer_total_catch != lstHaulData[i][3]){
//           console.log("Error: Document data inconsistent, obs total catch. haul_id = " + lstHaulData[i][0]);
//         } else if (Document.otc_weight_um != lstHaulData[i][4]){
//           console.log("Error: Document data inconsistent, otc weight um. haul_id = " + lstHaulData[i][0]);
//         } else if (Document.otc_weight_method != lstHaulData[i][5]){
//           console.log("Error: Document data inconsistent, otc weight method. haul_id = " + lstHaulData[i][0]);
//         }
//       } catch (error) {
//         console.log(error, lstHaulData[i][0], Document)
//       }
//     }
//     await ReleaseOracle(odb);
//   }
//   async function TestTrips(){
//     let odb = await OracleConnection();
//     let strSQL = `SELECT TRIPS.TRIP_ID, COUNT(FISHING_ACTIVITIES.TRIP_ID) FROM OBSPROD.TRIPS LEFT JOIN OBSPROD.FISHING_ACTIVITIES ON TRIPS.TRIP_ID = FISHING_ACTIVITIES.TRIP_ID GROUP BY TRIPS.TRIP_ID`;
//     let strRawTripIDs = await ExecuteOracleSQL(odb, strSQL);
      
//     for(let i = 0; i < strRawTripIDs.length; i++){
//       let strDocID, strDocRev, Document: any;
//       [strDocID, strDocRev, Document] = await FetchDocument("trip_id", strRawTripIDs[i][0]);
//       strSQL = `SELECT TRIPS.DEBRIEFING_ID, TRIPS.TRIP_STATUS, TRIPS.LOGBOOK_NUMBER, TRIPS.NOTES, TRIPS.DATA_QUALITY, TRIPS.OTC_KP, TRIPS.TOTAL_HOOKS_KP, TRIPS.OBSERVER_LOGBOOK, TRIPS.EVALUATION_ID FROM OBSPROD.TRIPS WHERE TRIPS.TRIP_ID = ` + strRawTripIDs[i][0];
//       let TripData = await ExecuteOracleSQL(odb, strSQL);
//       if (strDocID == null){
//         console.log("Error: Document does not exist. trip_id = " + strRawTripIDs[i][0]);
//       } else if (Document.hauls.length != strRawTripIDs[i][1]){
//         console.log("Error: trip haul counts do not line up. trip_id = " + strRawTripIDs[i][0])
//       }  else if (Document.debriefing_id != TripData[0][0]){
//         console.log("Error: trip data does not line up, debriefing_id. trip_id = " + strRawTripIDs[i][0])
//       }  else if (Document.trip_status != TripData[0][1]){
//         console.log("Error: trip data does not line up, trip_status. trip_id = " + strRawTripIDs[i][0])
//       }  else if (Document.logbook_number != TripData[0][2]){
//         console.log("Error: trip data does not line up, logbook_number. trip_id = " + strRawTripIDs[i][0])
//       }  else if (Document.notes != TripData[0][3]){
//         console.log("Error: trip data does not line up, notes. trip_id = " + strRawTripIDs[i][0])
//       }  else if (Document.data_quality != TripData[0][4]){
//         console.log("Error: trip data does not line up, data_quality. trip_id = " + strRawTripIDs[i][0])
//       }  else if (Document.otc_kp != TripData[0][5]){
//         console.log("Error: trip data does not line up, otc_kp. trip_id = " + strRawTripIDs[i][0])
//       }  else if (Document.total_hooks_kp != TripData[0][6]){
//         console.log("Error: trip data does not line up, total_hooks_kp. trip_id = " + strRawTripIDs[i][0])
//       }  else if (Document.obs_logbook_num != TripData[0][7]){
//         console.log("Error: trip data does not line up, obs_logbook_num. trip_id = " + strRawTripIDs[i][0])
//       }  else if (Document.eval_id != TripData[0][8]){
//         console.log("Error: trip data does not line up, eval_id. trip_id = " + strRawTripIDs[i][0])
//       } 
//     }
//     await ReleaseOracle(odb);
//   }
//   async function TestContact(){
      
//     let odb = await OracleConnection();
//     let strSQL = `SELECT
//   CONTACT_ID,
//   USER_ID,
//   FIRST_NAME,
//   LAST_NAME,
//   ADDRESS_LINE1,
//   ADDRESS_LINE2,
//   CITY,
//   STATE,
//   ZIP_CODE,
//   COUNTRY,
//   HOME_PHONE,
//   WORK_PHONE,
//   CELL_PHONE,
//   WORK_EMAIL,
//   HOME_EMAIL,
//   EPRIB_UIN,
//   EPIRB_SERIAL_NUMBER,
//   PORT_ID,
//   CONTACT_TYPE,
//   CONTACT_CATEGORY,
//   RELATIONSHIP,
//   NOTES,
//   CREATED_BY,
//   CREATED_DATE,
//   MODIFIED_BY,
//   MODIFIED_DATE,
//   BIRTHDATE,
//   LICENSE_NUMBER,
//   EPIRB_UIN_2
  
      
//   FROM OBSPROD.CONTACTS`
  
//     let ContactData = await ExecuteOracleSQL(odb, strSQL);
//     await ReleaseOracle(odb);
//     for(let i = 0; i < ContactData.length; i++){
//       let strDocID, strDocRev, Document: any;
//       [strDocID, strDocRev, Document] = await FetchDocument("contact_id", ContactData[i][0]);
//       if (strDocID == null){
//         console.log("Error: Contact does not exist. " + ContactData[i][0]);
//       } else if (Document.first_name != ContactData[i][2]){
//         console.log("Error: Contact data does not line up, first_name. " + ContactData[i][0]);
//       } else if (Document.last_name != ContactData[i][3]){
//         console.log("Error: Contact data does not line up, last_name. " + ContactData[i][0]);
//       } else if (Document.address_line1 != ContactData[i][4]){
//         console.log("Error: Contact data does not line up, address_line1. " + ContactData[i][0]);
//       } else if (Document.address_line2 != ContactData[i][5]){
//         console.log("Error: Contact data does not line up, address_line2. " + ContactData[i][0]);
//       }  else if (Document.city != ContactData[i][6]){
//         console.log("Error: Contact data does not line up, city. " + ContactData[i][0]);
//       } else if (Document.state != ContactData[i][7]){
//         console.log("Error: Contact data does not line up, state. " + ContactData[i][0]);
//       } else if (Document.zip_code != ContactData[i][8]){
//         console.log("Error: Contact data does not line up, zip_code. " + ContactData[i][0]);
//       } else if (Document.country != ContactData[i][9]){
//         console.log("Error: Contact data does not line up, country. " + ContactData[i][0]);
//       } else if (Document.home_phone != ContactData[i][10]){
//         console.log("Error: Contact data does not line up, home_phone. " + ContactData[i][0]);
//       }  else if (Document.work_phone != ContactData[i][11]){
//         console.log("Error: Contact data does not line up, work_phone. " + ContactData[i][0]);
//       } else if (Document.cell_phone != ContactData[i][12]){
//         console.log("Error: Contact data does not line up, cell_phone. " + ContactData[i][0]);
//       } else if (Document.work_email != ContactData[i][13]){
//         console.log("Error: Contact data does not line up, work_email. " + ContactData[i][0]);
//       } else if (Document.home_email != ContactData[i][14]){
//         console.log("Error: Contact data does not line up, home_email. " + ContactData[i][0]);
//       } else if (Document.eprib_uin != ContactData[i][15]){
//         console.log("Error: Contact data does not line up, eprib_uin. " + ContactData[i][0]);
//       }  else if (Document.epirb_serial_number != ContactData[i][16]){
//         console.log("Error: Contact data does not line up, epirb_serial_number. " + ContactData[i][0]);
//       } else if (Document.contact_type != ContactData[i][18]){
//         console.log("Error: Contact data does not line up, contact_type. " + ContactData[i][0]);
//       } else if (Document.contact_category != ContactData[i][19]){
//         console.log("Error: Contact data does not line up, contact_category. " + ContactData[i][0]);
//       } else if (Document.relationship != ContactData[i][20]){
//         console.log("Error: Contact data does not line up, relationship. " + ContactData[i][0]);
//       } else if (Document.notes != ContactData[i][21]){
//         console.log("Error: Contact data does not line up, notes. " + ContactData[i][0]);
//       } else if (Document.birthdate != ContactData[i][26]){
//         console.log("Error: Contact data does not line up, birthdate. " + ContactData[i][0]);
//       } else if (Document.license_number != ContactData[i][27]){
//         console.log("Error: Contact data does not line up, license_number. " + ContactData[i][0]);
//       } else if (Document.epirb_uin_2 != ContactData[i][28]){
//         console.log("Error: Contact data does not line up, epirb_uin_2. " + ContactData[i][0]);
//       } 
      
      
      
      
//     }	
//   }
//   async function TestPort(){
      
      
//     let odb = await OracleConnection();
//     let strSQL = `
//   SELECT
//   PORT_ID,
//   PORT_NAME,
//   PORT_CODE,
//   PORT_GROUP,
//   STATE,
//   CREATED_BY,
//   CREATED_DATE,
//   MODIFIED_BY,
//   MODIFIED_DATE,
//   IFQ_PORT_ID,
//   IFQ_PORT_CODE
  
//   FROM OBSPROD.PORTS`
  
//     let PortData = await ExecuteOracleSQL(odb, strSQL);
//     await ReleaseOracle(odb);
//     for(let i = 0; i < PortData.length; i++){
//       let strDocID, strDocRev, Document: any;
//       [strDocID, strDocRev, Document] = await FetchDocument("port_id", PortData[i][0]);
//       if (strDocID == null){
//         console.log("Error: Port does not exist. " + PortData[i][0]);
//       } else if (Document.name != PortData[i][1]){
//         console.log("Error: Port data does not line up, name. " + PortData[i][0]);
//       } else if (Document.code != PortData[i][2]){
//         console.log("Error: Port data does not line up, code. " + PortData[i][0]);
//       } else if (Document.group != PortData[i][3]){
//         console.log("Error: Port data does not line up, group. " + PortData[i][0]);
//       } else if (Document.state != PortData[i][4]){
//         console.log("Error: Port data does not line up, state. " + PortData[i][0]);
//       } else if (Document.ifq_port_id != PortData[i][9]){
//         console.log("Error: Port data does not line up, ifq_port_id. " + PortData[i][0]);
//       } else if (Document.ifq_port_code != PortData[i][10]){
//         console.log("Error: Port data does not line up, ifq_port_code. " + PortData[i][0]);
//       } 
//     }	  
//   }
//   async function TestProgram(){
      
      
//     let odb = await OracleConnection();
//     let strSQL = `
//   SELECT
//   PROGRAM_ID,
//   PROGRAM_NAME,
//   DESCRIPTION,
//   CREATED_BY,
//   CREATED_DATE,
//   MODIFIED_BY,
//   MODIFIED_DATE
    
//   FROM OBSPROD.PROGRAMS`
  
//     let ProgramData = await ExecuteOracleSQL(odb, strSQL);
//     await ReleaseOracle(odb);
//     for(let i = 0; i < ProgramData.length; i++){
//       let strDocID, strDocRev, Document: any;
//       [strDocID, strDocRev, Document] = await FetchDocument("program_id", ProgramData[i][0]);
//       if (strDocID == null){
//         console.log("Error: Port does not exist. " + ProgramData[i][0]);
//       } else if (Document.name != ProgramData[i][1]){
//         console.log("Error: Port data does not line up, name. " + ProgramData[i][0]);
//       } else if (Document.description != ProgramData[i][2]){
//         console.log("Error: Port data does not line up, description. " + ProgramData[i][0]);
//       } 
//     }	  
//   }
//   async function TestUser(){
      
      
//     let odb = await OracleConnection();
//     let strSQL = `
//   SELECT
//   USER_ID,
//   FIRST_NAME,
//   LAST_NAME,
//   STATUS
    
//   FROM OBSPROD.USERS`
  
//     let UserData = await ExecuteOracleSQL(odb, strSQL);
//     await ReleaseOracle(odb);
//     for(let i = 0; i < UserData.length; i++){
//       let strDocID, strDocRev, Document: any;
//       [strDocID, strDocRev, Document] = await FetchDocument("user_id", UserData[i][0]);
//       if (strDocID == null){
//         console.log("Error: User does not exist. " + UserData[i][0]);
//       } else if (Document.first_name != UserData[i][1]){
//         console.log("Error: User data does not line up, first_name. " + UserData[i][0]);
//       } else if (Document.last_name != UserData[i][2]){
//           console.log("Error: User data does not line up, last_name. " + UserData[i][0]);
//       } else if (Document.status != UserData[i][3]){
//           console.log("Error: User data does not line up, status. " + UserData[i][0]);
//       } 
//     }	  
//   }
//   async function TestCatchCategory(){
      
//     let odb = await OracleConnection();
//     let strSQL = `SELECT
//   CATCH_CATEGORY_ID,
//   CATCH_CATEGORY_NAME,
//   CATCH_CATEGORY_CODE,
//   CREATED_BY,
//   MODIFIED_BY,
//   ACTIVE
      
//   FROM OBSPROD.CATCH_CATEGORIES`
  
//     let CatchCatData = await ExecuteOracleSQL(odb, strSQL);
//     await ReleaseOracle(odb);
//     for(let i = 0; i < CatchCatData.length; i++){
//       let strDocID, strDocRev, Document: any;
//       [strDocID, strDocRev, Document] = await FetchDocument("catch_category_id", CatchCatData[i][0]);
//       if (strDocID == null){
//         console.log("Error: CatchCat does not exist. " + CatchCatData[i][0]);
//       } else if (Document.name != CatchCatData[i][1]){
//         console.log("Error: CatchCat data does not line up, NAME. " + CatchCatData[i][0]);
//       } else if (Document.code != CatchCatData[i][2]){
//         console.log("Error: CatchCat data does not line up, CODE. " + CatchCatData[i][0]);
//       } else if (Document.active != CatchCatData[i][5]){
//         console.log("Error: CatchCat data does not line up, ACTIVE. " + CatchCatData[i][0]);
//       } 
//     }	
//   }
//   async function TestVessel(){
      
      
//     let odb = await OracleConnection();
//     let strSQL = `
//   SELECT
//   VESSEL_ID,
//   PORT_ID,
//   VESSEL_NAME,
//   VESSEL_TYPE,
//   COAST_GUARD_NUMBER,
//   STATE_REG_NUMBER,
//   REGISTERED_LENGTH,
//   REGISTERED_LENGTH_UM,
//   SAFETY_DECAL_EXP,
//   VESSEL_STATUS,
//   NOTES,
//   CREATED_BY,
//   CREATED_DATE,
//   MODIFIED_BY,
//   MODIFIED_DATE
    
//   FROM OBSPROD.VESSELS`
  
//     let VesselData = await ExecuteOracleSQL(odb, strSQL);
//     await ReleaseOracle(odb);
//     for(let i = 0; i < VesselData.length; i++){
//       let strDocID, strDocRev, Document: any;
//       [strDocID, strDocRev, Document] = await FetchDocument("vessel_id", VesselData[i][0]);
//       if (strDocID == null){
//         console.log("Error: Vessel does not exist. " + VesselData[i][0]);
//       } else if (Document.vessel_name != VesselData[i][2]){
//         console.log("Error: Vessel data does not line up, vessel_name. " + VesselData[i][0]);
//       } else if (Document.vessel_type != VesselData[i][3]){
//         console.log("Error: Vessel data does not line up, vessel_type. " + VesselData[i][0]);
//       }  else if (Document.coast_guard_num != VesselData[i][4]){
//         console.log("Error: Vessel data does not line up, coast_guard_num. " + VesselData[i][0]);
//       } else if (Document.state_reg_num != VesselData[i][5]){
//         console.log("Error: Vessel data does not line up, state_reg_num. " + VesselData[i][0]);
//       } else if (Document.registered_length != VesselData[i][6]){
//         console.log("Error: Vessel data does not line up, registered_length. " + VesselData[i][0]);
//       } else if (Document.registered_length_um != VesselData[i][7]){
//         console.log("Error: Vessel data does not line up, registered_length_um. " + VesselData[i][0]);
//       } else if (Document.vessel_status != VesselData[i][9]){
//         console.log("Error: Vessel data does not line up, vessel_status. " + VesselData[i][0]);
//       } else if (Document.notes != VesselData[i][10]){
//         console.log("Error: Vessel data does not line up, notes. " + VesselData[i][0]);
//       } 
//     }	  
//   }
//   async function TestVesselContact(){
      
      
//     let odb = await OracleConnection();
//     let strSQL = `
//     SELECT
//     VESSEL_CONTACT_ID,
//     VESSEL_ID,
//     CONTACT_ID,
//     CONTACT_TYPE,
//     CONTACT_STATUS,
//     CREATED_BY,
//     CREATED_DATE,
//     MODIFIED_BY,
//     MODIFIED_DATE
    
//   FROM OBSPROD.VESSEL_CONTACTS`
  
//     let VesselContactData = await ExecuteOracleSQL(odb, strSQL);
//     await ReleaseOracle(odb);
//     for(let i = 0; i < VesselContactData.length; i++){
//       let strDocID, strDocRev, Document: any;
//       [strDocID, strDocRev, Document] = await FetchDocument("vessel_contact_id", VesselContactData[i][0]);
//       if (strDocID == null){
//         console.log("Error: VesselContact does not exist. " + VesselContactData[i][0]);
//       } else if (Document.contact_type != VesselContactData[i][3]){
//         console.log("Error: VesselContact data does not line up, contact_type. " + VesselContactData[i][0]);
//       } else if (Document.contact_status != VesselContactData[i][4]){
//         console.log("Error: VesselContact data does not line up, contact_status. " + VesselContactData[i][0]);
//       } 
//     }	  
//   }
//   async function TestAllDocs(){
//     TestHauls();
//     TestTrips();
//     TestContact();
//     TestPort();
//     TestVesselContact();
//     TestVessel();
//     TestProgram();
//     TestUser();
//     TestCatchCategory();
    
//     //await TestLookupDocs("LOOKUPS", "LOOKUP_ID", "lookup_id")
//   }
  