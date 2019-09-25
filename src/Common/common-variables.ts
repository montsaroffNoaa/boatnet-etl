import moment = require("moment");
import { BoatnetDate } from "../../../boatnet/libs/bn-models/models";

export var UploadedBy: string = 'nicholas.shaffer@noaa.gov';
export var CreatedBy: string = 'nicholas.shaffer@noaa.gov';
export var CreatedDate: BoatnetDate = moment(new Date().toLocaleTimeString(), moment.ISO_8601).format();
export var UploadedDate: BoatnetDate = moment(new Date().toLocaleTimeString(), moment.ISO_8601).format();
