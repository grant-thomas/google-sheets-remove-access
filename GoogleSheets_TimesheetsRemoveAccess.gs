function removeGoogleSheetsAccess() {
  // THIS SCRIPT CHANGES ACCESS PRIVILEDGES FOR ALL EMPLOYEE TIMESHEETS FROM EDIT TO VIEW ONLY
  // THIS SCRIPT RUNS EVERY TUESDAY AT 12AM
  // TIMESHEETS ARE DUE SUNDAY AT 12AM SO THIS GIVES EMPLOYEES 24 HOURS PAST THE DEADLINE TO MAKE CHANGES UNTIL THEY ARE LOCKED OUT

  // HOW IT WORKS:
  // THIS SCRIPT SEARCHES THROUGH ALL GOOGLE DRIVE FILES FROM /ROOT DIRECTORY,
  // THEN FINDS ALL THE FILES THAT CONTAIN SUNDAY'S DATE (END OF THE PREVIOUS WEEK) IN THE TITLE OF THE DOCUMENT
  // IT GETS THE EMPLOYEE FIRST AND LAST NAMES FROM CELL "C8" AND CREATES THE EMPLOYEE EMAIL ADDRESS FROM THE FIRST NAME

  // Get Sunday's date (2 days ago)
  var date = new Date();
  date.setDate(date.getDate()-2);
  date = Utilities.formatDate(date, "CST-6", "MM/dd/yy")
  Logger.log("Searching for files with date: " + date)
  Logger.log("==================================================")

  // Search Google Drive /root to find every file that contains a certain string in its text
  // returns var files which is a fileIterator type
  // NOTE 11-1-23 CHANGED fulltext to "title"
  var files = DriveApp.getRootFolder().searchFiles("title contains \"" + date + "\"");

  // Iterate over fileIterator
  while (files.hasNext()) {
    var file = files.next();
    Logger.log("Openning file: " + file.getName());

    // Get the employee first and last name from cell C8 (i.e. format = First Last)
    var name_cell = SpreadsheetApp.openById(file.getId()).getRange("C8").getValue();

    // Split the employee name, get only the first name, make it lowercase, concat. domain name (i.e. first@iconstudiobr.com)
    var employee_email = name_cell.split(" ")[0].toLowerCase() + "@companyname.com"
    
    // Change the employees access priviledges from editor to viewer
    Logger.log("Changing permissions for employee: " + employee_email)

    // ================================================================================== //
    // *** ADDED 12-12-23 ***
    // THIS CHANGES PERMISSIONS FROM EDIT TO VIEW AND DOES NOT NOTIFY USER ABOUT CHANGES
    var fileID = file.getId();
    Logger.log("File ID: " + fileID);

    var permissionId = Drive.Permissions.getIdForEmail(employee_email);
    var resource = Drive.newPermission();
    resource.role = 'reader';
    Drive.Permissions.update(resource, fileID, permissionId.id);
  }
}
