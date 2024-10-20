// Piwik Pro Manager, by dim28.ch, Lukas Oldenburg.
// Description: Main handler for the (future) Piwik Pro Manager Google Sheets Add-on.
// Version: 2024-10-18-4

var filter_warning = "Filters will be removed as they may not match the data range anymore after update.";
var spreadsheet = SpreadsheetApp.getActive();
var gsheets_id = spreadsheet.getId();
// TODO move the secret to Secret Manager and out of the sheet (set only once with setup)
var piwik_org_prefix = "";
var piwik_client_id = "";
var piwik_client_secret = "";
try {
    piwik_org_prefix = getConfigSettings('piwik_org_prefix');
    piwik_client_id = getConfigSettings('piwik_client_id');
    piwik_client_secret = getConfigSettings('piwik_client_secret');
} catch (e) {
    console.log('Could not get api settings from config, probably a new sheet', e);
}
var master_id = '1smNdc0EDppHi8qky-huoblAfinBe4OwpmqgkgE27FWM'; // Manager-Master-Sheet

function menuGen(menuLabel, menuObj) {
    var menu = menuLabel ? SpreadsheetApp.getUi().createMenu(menuLabel) : SpreadsheetApp.getUi().createAddonMenu();

    for (var i in menuObj) {
        switch (menuObj[i].m_type) {
            case 'fn':
                menu.addItem(menuObj[i].label, menuObj[i].fn);
                break;
            case 'separator':
                menu.addSeparator();
                break;
            case 'sub':
                menu.addSubMenu(menuGen(menuObj[i].label, menuObj[i].sub));
                break;
        }
    }
    return menu;
}

/**
 * The event handler triggered when installing the add-on.
 * @param {Event} e The onInstall event.
 * @see https://developers.google.com/apps-script/guides/triggers#oninstalle
 */
function onInstall(e) {
    onOpen(e);
}

function onOpen(e) {
//  var xMenu = menuGen(getMenuName(), getMenuObj()).addToUi();
    try {
        var menu = getMenuObj();
    } catch (e) {
    }
//  var menuName = getMenuName();
    try {
//    var xMenu = menuGen(menuName, menu).addToUi();
        void menuGen(undefined, menu).addToUi();
    } catch (e) {
        console.log('onOpen error:', e)
    }
}

function onEdit(e) {
    // https://developers.google.com/apps-script/guides/triggers/events
    // console.log("onEdit event: " + JSON.stringify(e));
    customOnEdit(e);
}


function getMenuName() {
    return 'Piwik Pro Manager';
}

/**
 * calls the web app doPost handler
 * @param {object} payload - JSONifiable payload (at least `script: "script_name"`)
 * @param {boolean} [sync] - if true, returns response from server synchronously
 * @returns {any} response of web app
 */
function trigger_server(payload, sync) {
    // uncomment this for times of maintenance
    /* var ui = SpreadsheetApp.getUi();
    ui.alert("We are undergoing maintenance. This should be over by Saturday morning 11:00 AM UTC.");
    return {error: "maintenance"};
    */
    var payload_defaults = {
        "piwik_org_prefix": piwik_org_prefix,
        "piwik_client_id": piwik_client_id,
        "piwik_client_secret": piwik_client_secret,
        "gsheets_id": gsheets_id,
        "topic": "piwik_mgr"
    };

    for (var key in payload_defaults) {
        if (payload[key] === undefined) {
            payload[key] = payload_defaults[key];
        }
    }
    sync = sync || false;

    var dest = Utilities.newBlob(Utilities.base64Decode("aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J4YnRWNGVvZmxRcFdtMFdFNS1JOEVCZHZsRGFFWkdqR3NBUkFCTnEybFlsRXpGWkVsb1Izam1OMGNJN2lKWVpGSkd1Zy9leGVj")).getDataAsString();
    console.log("Triggering server with sync = " + sync.toString() + " and payload: ", payload);
    var body = {
        payload: JSON.stringify(payload),
        sync: sync
    };

    var response = UrlFetchApp.fetch(dest, {
        method: "POST",
        contentType: 'application/json',
        muteHttpExceptions: true,
        payload: JSON.stringify(body)
    });

    //var ui = SpreadsheetApp.getUi();
    //ui.alert(response);
    //ui.alert(JSON.stringify(response.getContentText()));
    return JSON.parse(response.getContentText());
}

function getMenuObj() {
    return [
        {m_type: 'fn', label: 'Setup', fn: 'guidedSetup'},
        {m_type: 'separator'},
        {
            m_type: 'sub', label: 'Sites', sub: [
                {m_type: 'fn', label: 'Refresh Sites', fn: 'piwik_sites_refresh'},
                {m_type: 'fn', label: 'Clone Custom Dimensions', fn: 'piwik_customdimensions_clone'}
            ]
        },
        {
            m_type: 'sub', label: 'Tags', sub: [
                {m_type: 'fn', label: 'Refresh Tags', fn: 'piwik_tags_refresh'},
                {m_type: 'fn', label: 'Refresh Tags & TagDetails', fn: 'piwik_tags_refresh_with_details'},
                {m_type: 'fn', label: 'Edit/Delete Tags', fn: 'piwik_tags_edit'},
                {m_type: 'fn', label: 'Sync Tags in other Sites', fn: 'piwik_tags_sync'},
                {m_type: 'fn', label: 'Edit and Sync Tags', fn: 'piwik_tags_edit_and_sync'}, // Missing function added
                {m_type: 'fn', label: 'Copy Tags', fn: 'piwik_tags_copy'}
            ]
        },
        {
            m_type: 'sub', label: 'Tag Details', sub: [  // Added missing sub-menu for TagDetails
                {m_type: 'fn', label: 'Refresh Tags & TagDetails', fn: 'piwik_tags_refresh_with_details'},
                {m_type: 'fn', label: 'Edit/Delete TagDetails', fn: 'piwik_tagdetails_edit'},  // Missing function added
                {m_type: 'fn', label: 'Sync TagDetails', fn: 'piwik_tagdetails_sync'},  // Missing function added
                {m_type: 'fn', label: 'Edit and Sync TagDetails', fn: 'piwik_tagdetails_edit_and_sync'}  // Missing function added
            ]
        },
        {
            m_type: 'sub', label: 'Variables', sub: [
                {m_type: 'fn', label: 'Refresh Variables', fn: 'piwik_variables_refresh'},
                {m_type: 'fn', label: 'Refresh Variables with Usage Info', fn: 'piwik_variables_refresh_with_usage'},
                {m_type: 'fn', label: 'Edit/Delete Variables', fn: 'piwik_variables_edit'},
                {m_type: 'fn', label: 'Copy Variables', fn: 'piwik_variables_copy'},
                {m_type: 'fn', label: 'Sync Variables', fn: 'piwik_variables_sync'}
            ]
        },
        {
            m_type: 'sub', label: 'Triggers', sub: [
                {m_type: 'fn', label: 'Refresh Triggers', fn: 'piwik_triggers_refresh'},
                {m_type: 'fn', label: 'Edit/Delete Triggers', fn: 'piwik_triggers_edit'},
                {m_type: 'fn', label: 'Copy Triggers', fn: 'piwik_triggers_copy'}
            ]
        },
        {
            m_type: 'sub', label: 'Custom Dimensions', sub: [
                {m_type: 'fn', label: 'Refresh Custom Dimensions', fn: 'piwik_customdimensions_refresh'},
                {m_type: 'fn', label: 'Edit Custom Dimensions', fn: 'piwik_customdimensions_edit'},
                {m_type: 'fn', label: 'Sync Custom Dimensions', fn: 'piwik_customdimensions_sync'},
                {m_type: 'fn', label: 'Edit & Sync Custom Dimensions', fn: 'piwik_customdimensions_edit_and_sync'},
                {m_type: 'fn', label: 'Clone Custom Dimensions ("Sites" tab)', fn: 'piwik_customdimensions_clone'}
            ]
        },
        {
            m_type: 'sub', label: 'Goals', sub: [
                {m_type: 'fn', label: 'Refresh Goals', fn: 'piwik_goals_refresh'},
                {m_type: 'fn', label: 'Delete Goals', fn: 'piwik_goals_delete'},
                {m_type: 'fn', label: 'Sync Goals', fn: 'piwik_goals_sync'},
                {m_type: 'fn', label: 'Copy Goals', fn: 'piwik_goals_copy'}
            ]
        },
        {
            m_type: 'sub', label: 'Other', sub: [
                {m_type: 'fn', label: 'Recreate Sheet', fn: 'sheetRecreation'},
                {m_type: 'fn', label: 'Recreate this Tab', fn: 'recreateThisTab'},
                {m_type: 'fn', label: 'Populate all Tabs', fn: 'piwik_refresh_all_tabs'},
                {m_type: 'fn', label: 'Delete all Piwik Manager Tabs', fn: 'deleteAllPiwikMgrSheets'},
                {m_type: 'fn', label: 'Terms & Conditions', fn: 'showTerms'},
                {m_type: 'fn', label: 'Contact', fn: 'showContact'}
            ]
        }
    ];
}

// ---
// MENU FUNCTIONS
// ---
function piwik_sites_refresh() {
    var sheetName = "Sites";
    activateTab(sheetName);

    var msg = "Refreshing Sites. Please wait. " + filter_warning;
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_sites_refresh"});
}

function piwik_customdimensions_clone() {
    var sheetName = "Sites";
    activateTab(sheetName);
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert("Confirm", "This will clone the Custom Dimensions to the destination sites selected " +
        "in the 'Clone Custom Dimensions to' column. \n\n'Cloning' means creating new Custom Dimensions in the " +
        "destination sites with the same 'Slot', 'Tracking ID', name & settings as " +
        " in the source site. \n\nThis will not do anything if a destination site already has differently configured Custom " +
        "Dimensions. Continue?", ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.CANCEL) {
        return;  // Exit if the user cancels
    }

    var msg = "Cloning Custom Dimensions. Please wait.";
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_customdimensions_clone"});
}

function piwik_tags_refresh() {
    var sheetName = "Tags";
    activateTab(sheetName);

    var msg = "Refreshing Tags. Please wait. " + filter_warning;
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_tags_refresh"});
    removeFiltersFromSheet("Tags");
}

function piwik_tags_refresh_with_details() {
    var sheetName = "TagDetails";
    activateTab(sheetName);

    var msg = "Refreshing Tags & Tag Details. Please wait. " + filter_warning;
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_tags_refresh_with_details"});
    removeFiltersFromSheet("TagDetails");
}

function piwik_tags_edit() {
    var sheetName = "Tags";
    activateTab(sheetName);

    var ui = SpreadsheetApp.getUi();
    var response = ui.alert("Confirm", "This will edit or delete the Tags marked with 'edit' or 'delete' " +
        "in the 'EDIT/DELETE' column. Continue?", ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.CANCEL) {
        return;  // Exit if the user cancels
    }

    var msg = "Editing Tags. Please wait.";
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_tags_edit"});
}

function piwik_tags_edit_and_sync() {
    var sheetName = "Tags";
    activateTab(sheetName);

    var ui = SpreadsheetApp.getUi();
    var response = ui.alert("Confirm", "This will edit or delete the Tags marked with 'edit' or 'delete' in the " +
        "'EDIT/DELETE' column, and then sync the updates in the 'SYNC IN' column. Continue?", ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.CANCEL) {
        return;  // Exit if the user cancels
    }

    var msg = "Editing and Syncing Tags. Please wait.";
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_tags_edit_and_sync"});
}

function piwik_tags_copy() {
    var sheetName = "Tags";
    activateTab(sheetName);

    var ui = SpreadsheetApp.getUi();
    var response = ui.alert("Confirm", "This will copy the Tags to the sites selected in the 'COPY TO' column. " +
        "Copying will only be done if no tag of the same name exists in the destination sites. If you do NOT want to copy " +
        "triggers with the tag, change the dropdown in cell P2." +
        "\n\nContinue?", ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.CANCEL) {
        return;  // Exit if the user cancels
    }

    var msg = "Copying Tags. Please wait.";
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_tags_copy"});
}

function piwik_tagdetails_edit() {
    var sheetName = "TagDetails";
    activateTab(sheetName);

    var ui = SpreadsheetApp.getUi();
    var response = ui.alert("Confirm", "This will edit or delete the Tag Details marked with 'edit' or " +
        "'delete' in the 'EDIT/DELETE' column. Continue?", ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.CANCEL) {
        return;  // Exit if the user cancels
    }

    var msg = "Editing Tag Details. Please wait.";
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_tagdetails_edit"});
}

function piwik_tagdetails_sync() {
    var sheetName = "TagDetails";
    activateTab(sheetName);

    var ui = SpreadsheetApp.getUi();
    var response = ui.alert("Confirm", "This will sync the TagDetails in the destination sites selected in " +
        "the 'SYNC IN' column. 'Synching' means TagDetails of the same name will be updated to the same definition as " +
        "in the source site. \n\nContinue?", ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.CANCEL) {
        return;  // Exit if the user cancels
    }

    var msg = "Syncing Tag Details. Please wait.";
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_tagdetails_sync"});
}

function piwik_tagdetails_edit_and_sync() {
    var sheetName = "TagDetails";
    activateTab(sheetName);

    var ui = SpreadsheetApp.getUi();
    var response = ui.alert("Confirm", "This will edit or delete the TagDetails marked with 'edit' or 'delete' in the 'EDIT/DELETE' column, and then sync the updates in the 'SYNC IN' column. Continue?", ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.CANCEL) {
        return;  // Exit if the user cancels
    }

    var msg = "Editing and Syncing Tag Details. Please wait.";
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_tagdetails_edit_and_sync"});
}

function piwik_customdimensions_refresh() {
    var sheetName = "CustomDimensions";
    activateTab(sheetName);

    var msg = "Refreshing Custom Dimensions. Please wait. " + filter_warning;
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_customdimensions_refresh"});
    removeFiltersFromSheet("CustomDimensions");
}

function piwik_customdimensions_edit() {
    var sheetName = "CustomDimensions";
    activateTab(sheetName);

    var ui = SpreadsheetApp.getUi();
    var response = ui.alert("Confirm", "This will edit the Custom Dimensions marked with 'edit' " +
        "in the 'EDIT' column. Continue?", ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.CANCEL) {
        return;  // Exit if the user cancels
    }

    var msg = "Editing Custom Dimensions. Please wait.";
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_customdimensions_edit"});
}

function piwik_customdimensions_sync() {
    var sheetName = "CustomDimensions";
    activateTab(sheetName);

    var ui = SpreadsheetApp.getUi();
    var response = ui.alert("Confirm", "This will sync the Custom Dimensions in the destination sites selected " +
        "in the 'SYNC IN' column. 'Synching' means Custom Dimensions of the same Slot, ID and Scope will be updated to the same " +
        "definition as in the source site. Continue?", ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.CANCEL) {
        return;  // Exit if the user cancels
    }

    var msg = "Syncing Custom Dimensions. Please wait.";
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_customdimensions_sync"});
}

function piwik_customdimensions_edit_and_sync() {
    var sheetName = "CustomDimensions";
    activateTab(sheetName);

    var ui = SpreadsheetApp.getUi();
    var response = ui.alert("Confirm", "This will edit the Custom Dimensions marked with 'edit' in " +
        "the 'EDIT' column, and then sync the updates to the Sites marked in the 'SYNC IN' column. " +
        "\n\nContinue?", ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.CANCEL) {
        return;  // Exit if the user cancels
    }

    var msg = "Editing and Syncing Custom Dimensions. Please wait.";
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_customdimensions_edit_and_sync"});
}

function piwik_variables_refresh() {
    var sheetName = "Variables";
    activateTab(sheetName);

    var msg = "Refreshing Variables. Please wait. " + filter_warning;
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_variables_refresh"});
    removeFiltersFromSheet(sheetName);
}

function piwik_variables_refresh_with_usage() {
    var sheetName = "Variables";
    activateTab(sheetName);
    var ui = SpreadsheetApp.getUi();

    var response = ui.alert("Confirm", "This will refresh the Variables including the 'used_in' columns. " +
        "The data in these columns will be based on the current state of " +
        "the 'TagDetails' and 'Triggers' tabs. If those tabs are not up to date, refresh them first, " +
        "and then run this function again." +
        "\n\nContinue with Variables refresh incl. Usage data?", ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.CANCEL) {
        return;
    }
    var msg = "Refreshing Variables with Usage stats based on the 'TagDetails' and 'Triggers' tabs. Please wait. " + filter_warning;
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_variables_refresh_with_usage"});
    removeFiltersFromSheet(sheetName);
}

function piwik_variables_edit() {
    var sheetName = "Variables";
    activateTab(sheetName);

    var ui = SpreadsheetApp.getUi();
    var response = ui.alert("Confirm", "This will edit or delete the Variables marked with 'edit' or 'delete' " +
        "in the 'EDIT/DELETE' column. Continue?", ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.CANCEL) {
        return;  // Exit if the user cancels
    }

    var msg = "Editing Variables. Please wait.";
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_variables_edit"});
}

function piwik_variables_copy() {
    var sheetName = "Variables";
    activateTab(sheetName);

    var ui = SpreadsheetApp.getUi();
    var response = ui.alert("Confirm", "This will copy the Variables to other sites selected in the 'COPY TO' " +
        "column. If a Variable of the same name already exists in the destination site, it won't be copied. " +
        "Continue?", ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.CANCEL) {
        return;  // Exit if the user cancels
    }

    var msg = "Copying Variables. Please wait.";
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_variables_copy"});
}

function piwik_variables_sync() {
    var sheetName = "Variables";
    activateTab(sheetName);

    var ui = SpreadsheetApp.getUi();
    var response = ui.alert("Confirm", "This will sync the Variables in the destination sites selected in " +
        "the 'SYNC IN' column. 'Synching' means Variables of the same name will be updated to the same definition " +
        "as in the source site. Continue?", ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.CANCEL) {
        return;  // Exit if the user cancels
    }

    var msg = "Syncing Variables. Please wait.";
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_variables_sync"});
}

function piwik_triggers_refresh() {
    var sheetName = "Triggers";
    activateTab(sheetName);

    var msg = "Refreshing Triggers. Please wait.";
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_triggers_refresh"});
    removeFiltersFromSheet(sheetName);
}

function piwik_triggers_edit() {
    var sheetName = "Triggers";
    activateTab(sheetName);

    var ui = SpreadsheetApp.getUi();
    var response = ui.alert("Confirm", "This will edit or delete the Triggers marked with 'edit' or 'delete' " +
        "in the 'EDIT/DELETE' column. Continue?", ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.CANCEL) {
        return;  // Exit if the user cancels
    }

    var msg = "Editing Triggers. Please wait.";
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_triggers_edit"});
}

function piwik_triggers_copy() {
    var sheetName = "Triggers";
    activateTab(sheetName);

    var ui = SpreadsheetApp.getUi();
    var response = ui.alert("Confirm", "This will copy the Triggers to other sites selected in the 'COPY TO'" +
        " column. If a Trigger of the same name already exists in the destination site, it won't be copied. " +
        "Continue?", ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.CANCEL) {
        return;  // Exit if the user cancels
    }

    var msg = "Copying Triggers. Please wait.";
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_triggers_copy"});
}

function piwik_goals_refresh() {
    var sheetName = "Goals";
    activateTab(sheetName);

    var msg = "Refreshing Goals. Please wait. " + filter_warning;
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_goals_refresh"});
    removeFiltersFromSheet("Tags");
}

function piwik_goals_delete() {
    var sheetName = "Goals";
    activateTab(sheetName);

    var ui = SpreadsheetApp.getUi();
    var response = ui.alert("Confirm", "This will delete the Goals marked with 'delete' " +
        "in the 'DELETE' column. Continue?", ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.CANCEL) {
        return;  // Exit if the user cancels
    }

    var msg = "Deleting Goals. Please wait.";
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_goals_delete"});
}

function piwik_goals_sync() {
    var sheetName = "Goals";
    activateTab(sheetName);

    var ui = SpreadsheetApp.getUi();
    ui.alert("Still in development", ui.ButtonSet.OK);
    /*
    var response = ui.alert("Confirm", "This will delete the Goals marked with 'delete' in the 'DELETE' column. " +
        "Continue?", ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.CANCEL) {
        return;  // Exit if the user cancels
    }

    var msg = "Deleting Goals. Please wait.";
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_goals_sync"});*/
}

function piwik_goals_copy() {
    var sheetName = "Goals";
    activateTab(sheetName);

    var ui = SpreadsheetApp.getUi();
    var response = ui.alert("Confirm", "This will create goals of the same name and definition in the sites " +
        "selected in the 'COPY TO' column. Continue?", ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.CANCEL) {
        return;  // Exit if the user cancels
    }

    var msg = "Copying Goals. Please wait and follow the progress in the Status area.";
    show_update_running_msg(msg, "Status", 10);
    trigger_server({"script": "piwik_goals_copy"});
}


// OTHER

function piwik_refresh_all_tabs() {
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert("This will refresh/populate all Tabs and remove the filters on all tabs. This can take a while. \n\n" +
        "Continue? ", ui.ButtonSet.OK_CANCEL);
    if (response === ui.Button.CANCEL) {
        return;  // Exit if the user cancels
    }
    show_update_running_msg("Refreshing all Tabs. Please wait...", "Status", 30);
    trigger_server({"script": "piwik_refresh_all_tabs"});
    const sheetsToClear = ["Sites", "CustomDimensions", "Tags", "TagDetails", "Triggers", "Variables"];
    for (var i = 0; i < sheetsToClear.length; i++) {
        removeFiltersFromSheet(sheetsToClear[i]);
    }
}


function showContact() {
    var ui = SpreadsheetApp.getUi();
    var htmlTerms = HtmlService.createHtmlOutput(`  
    <ul style="font-family: Calibri,sans-serif">
        <li>Questions / problems / feedback? Contact me at <a href="mailto:lukas.oldenburg@dim28.ch">lukas.oldenburg@dim28.ch</a></li>        
    </ul>
    `).setWidth(400).setHeight(300);
    ui.showModalDialog(htmlTerms, 'Contact & Support');
}

// ---
// HELPER FUNCTIONS
// ---

function show_update_running_msg(msg, title, duration) {
    msg = msg || "Please wait! Updating...";
    title = title || "Status";
    duration = duration || 5; // 5 secs as default
    //var spreadsheet = SpreadsheetApp.getActive();
    //spreadsheet.getRangeByName("last_refresh").setValue("Updating... please wait!");
    SpreadsheetApp.getActiveSpreadsheet().toast(msg, title, duration);// use -1 to show indefinite time
}

function activateTab(tabName) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var activeSheet = ss.getActiveSheet();

    // Only activate the sheet if it's not already active
    if (activeSheet.getName() !== tabName) {
        var ssp = ss.getSheetByName(tabName);
        if (ssp) {
            ss.setActiveSheet(ssp);
            SpreadsheetApp.flush(); // Sometimes sheet activation doesn't work without it
            Utilities.sleep(500);    // Added sleep for reliability in some cases
        } else {
            Logger.log("Sheet '" + tabName + "' not found.");
        }
    }
}

// TODO add functionality to delete only sheets that are actually Piwik Mgr sheets. currently used for debugging only (it only deletes everything that is called "Sheet"something...)
function deleteAllPiwikMgrSheets() {
    var ss_cur = SpreadsheetApp.getActive();
    var sheets = ss_cur.getSheets();
    for (var i in sheets) {
        if (sheets[i].getName().indexOf('Sheet') === -1) {
            ss_cur.deleteSheet(sheets[i]);
        }
    }
}

/**
 * (re)creates sheet
 * @param {Boolean} silent - deactivates prompts
 * @param {Boolean} firstRun - true if the sheet is created for the first time (config and update_log tab will also be imported)
 */
function sheetRecreation(silent, firstRun) { // TODO

    if (firstRun !== true) {
        firstRun = false;
    }
    console.log("Starting Sheet Recreation process with Silent mode set to: " + JSON.stringify(silent) + " and existing" +
        " mandatory tabs: " + JSON.stringify(firstRun));
    var ui = SpreadsheetApp.getUi();

    var ss_cur = SpreadsheetApp.getActive();
    var ss_source = SpreadsheetApp.openById(master_id);

    if (!silent) {
        var result = ui.alert('This function (re)creates all Component Manager sheets ("tabs") apart from ' +
            '"Config" and additional sheets that you may have created. \nStart (re)creating sheet?',
            ui.ButtonSet.OK_CANCEL);
        if (result !== ui.Button.OK) return false;
    }

    ss_cur.toast("Importing required tabs. Don't make any changes until you see 'Finished (re)creating sheet'!", "Wait a bit", -1);

    var ssp_configInternal = ss_source.getSheetByName('configInternal');
    var sortedModel_pre = ssp_configInternal.getRange("A2:A").getValues();
    var finalModelBegin_pre = ssp_configInternal.getRange("B2:B").getValues();
    var finalModelEnd_pre = ssp_configInternal.getRange("C2:C").getValues();

    //conversion to 1d arrays
    var sortedModel = sortedModel_pre.filter(x => x[0] ? x[0] : false).map(x => x[0]);
    var finalModelBegin = finalModelBegin_pre.filter(x => x[0] ? x[0] : false).map(x => x[0]);
    var finalModelEnd = finalModelEnd_pre.filter(x => x[0] ? x[0] : false).map(x => x[0]);
    var allTechnicalSheets = finalModelBegin.concat([]);

    allTechnicalSheets = allTechnicalSheets.concat(finalModelEnd);

    //console.log(sortedModel_)
    //console.log(finalModelBegin_)
    //console.log(finalModelEnd_)
    console.log('allTechnicalSheets:', allTechnicalSheets);

    //delete all sheets, except "Config" and update_log from allTechnicalSheets
    var sheets = ss_cur.getSheets();
    console.log("Sheets:", sheets);
    for (let i = 0; i < sheets.length; i++) {
        var sheetName = sheets[i].getName();
        if (sheetName === 'Config' || sheetName === 'update_log' || allTechnicalSheets.indexOf(sheetName) === -1) continue;
        ss_cur.deleteSheet(sheets[i]);
        Utilities.sleep(1000);
    }

    var sheets_source = ss_source.getSheets();

    //sheets must be sorted in such way that formula would use only already existing sheets
    //this is model sorted array, so sheets will be copy-pasted in that order (sheets not in this list will be pushed first)
    //instead of hardcoded array, data will be read from configInternal sheet

    sheets_source.sort(
        function (a, b) {
            var res;
            //console.log('a.getName(): ', a.getName(), ' _ b.getName(): ', b.getName(), sortedModel.indexOf(a.getName()), sortedModel.indexOf(b.getName()));
            if (sortedModel.indexOf(a.getName()) > sortedModel.indexOf(b.getName())) res = 1;
            else if (sortedModel.indexOf(a.getName()) < sortedModel.indexOf(b.getName())) res = -1;
            else res = 0;
            //console.log('res: ',0);
            return res;
        }
    );

    console.log("Fill sheets with data from Master Sheet, sortedModel: ", sortedModel);
    var sheetsFirstRunOnly = ['Config']; // tabs that will be imported only if sheet is created for the first time
    // (= they shall never be overwritten as this would destroy the config of the client)
    for (let i of sheets_source) {
        var cur_tab_name = i.getName();
        console.log("Checking for tab name " + cur_tab_name);
        // console.log("Checking if tab name " + cur_tab_name + " is in sortedModel: ", sortedModel.indexOf(cur_tab_name) === -1);
        var import_this_tab = false;
        // import tabs logic
        if (sheetsFirstRunOnly.indexOf(cur_tab_name) > -1) { // if eg "config" tab
            if (firstRun) {
                import_this_tab = true;
                console.log("first run and tab is among tabs for first run only, so import it");
            } else {
                import_this_tab = false;
            }
        } else if (sortedModel.indexOf(cur_tab_name) > -1 && cur_tab_name !== 'configInternal') {
            console.log("not first run, but tab is in sortedModel, so import it");
            import_this_tab = true;
        }
        if (!import_this_tab) {
            console.log("Skipping import of tab " + cur_tab_name);
            continue;
        }
        console.log("Copying data from source sheet for tab " + cur_tab_name);
        var ssp_destination = i.copyTo(ss_cur);
        ssp_destination.setName(cur_tab_name);
        Utilities.sleep(1000);
    }

    //now recreate sheets from "config"
    var searchFormulaInSheets = {};

    for (let i = 0; i < allTechnicalSheets.length; i++) {
        console.log(allTechnicalSheets[i]);
        var tmpssp = ss_cur.getSheetByName(allTechnicalSheets[i]);
        // console.log('tmpssp:', tmpssp);
        if (!tmpssp) continue;
        ss_cur.setActiveSheet(tmpssp);
        Utilities.sleep(300);
        console.log('active sheet: ', allTechnicalSheets[i]);
        console.log('move active sheet to ', i + 1);
        if (ss_cur.getNumSheets() >= i + 1) ss_cur.moveActiveSheet(i + 1);
        Utilities.sleep(300);
    }

    //there is chance that formulas with named ranges were pasted with errors. In such case we need to overwrite formulas in a one by one style.
    for (let p = 0; p < allTechnicalSheets.length; p++) {
        var tmpSheetName = allTechnicalSheets[p];
        console.log('tmpSheetName: ', tmpSheetName);
        try {
            var s_range;
            if (searchFormulaInSheets[tmpSheetName]) {
                s_range = ss_source.getSheetByName(searchFormulaInSheets[tmpSheetName]).getDataRange();
            } else {
                s_range = ss_source.getSheetByName(tmpSheetName).getDataRange();
            }
        } catch (e) {
            console.log('Error: ', e);
            continue;
        }

        var ssp_t = ss_cur.getSheetByName(tmpSheetName);
        if (!ssp_t) ssp_t = ss_cur.insertSheet().setName(tmpSheetName); // there was a case when 'update_log' was missing for some reason.
    }
    ss_cur.toast("Finished (re)creating sheet!", "All done", 10);
    SpreadsheetApp.flush();
}

/**
 * checks if the sheet has been set up correctly and shows an Alert and logs a console error if not
 * @returns {boolean}
 */
function hasSetupFinishedAlert(alertIfNot) {
    var finished = hasSetupFinished();
    var gsheets_id = SpreadsheetApp.getActiveSpreadsheet().getId();
    if (!finished) {
        console.error("setup_status in sheet " + gsheets_id + " is not complete yet, so not triggering server");
        if (alertIfNot) {
            var ui = SpreadsheetApp.getUi();
            ui.alert("Sheet setup is not complete yet, please run 'Extensions -> Piwik Pro Manager -> Setup' first to configure " +
                "sheet & API access. \nStill running into trouble? Write to lukas.oldenburg@dim28.ch or " +
                "set up a free call with our support: https://meet.boomerangapp.com/lukas.oldenburg.dim28.ch/meeting");
        }
    }
    return finished;
}

/**
 * checks if the sheet has been set up correctly. Usually called by hasSetupFinishedAlert (wrapper)
 * @returns {boolean}
 */
function hasSetupFinished() { // TODO
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var sheets = ss.getSheets();
    var config_sheet_exists = false;
    for (let i = 0; i < sheets.length; i++) {
        if (sheets[i].getName() === "config") {
            config_sheet_exists = true;
            break;
        }
    }
    if (!config_sheet_exists) {
        return false;
    }
    var setup_status = getConfigSettings("setup_status");
    if (setup_status) {
        return setup_status === "success";
    }
    // for older sheets without setup_status key:
    var company = ss.getRangeByName("company").getValue();
    if (!company || // no company ID
        (company.length === 24 && company.search(/[A-Z]/) !== -1)) { // indicates a preliminary ID (first part of Adobe Org ID)
        return false;
    }
    return true;
}

/**
 * Converts a column letter to its corresponding column index.
 * @param {string} letter - The column letter (e.g., "A", "B", "C", etc.).
 * @returns {number} The column index (e.g., 1, 2, 3, etc.).
 */
function columnLetterToIndex(letter) {
    let column = 0;
    let length = letter.length;
    for (let i = 0; i < length; i++) {
        column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
    }
    return column;
}

function customOnEdit(event) {
    // https://developers.google.com/apps-script/guides/triggers/events
    // console.log('customOnEdit');
    var ssp = SpreadsheetApp.getActiveSheet();

    var sspname = ssp.getName();
    // console.log("sspname: ", sspname);
    var editable_tabs = ["Tags", "TagDetails", "Variables", "Triggers", "CustomDimensions"];

    if (editable_tabs.indexOf(sspname) === -1) return true;

    var range = event.range;
    var colStart = range.getColumn();
    var colEnd = range.getLastColumn();
    var rowStart = range.getRow();
    var rowEnd = range.getLastRow();
    //console.log("rowSTart, End, ColSTart, End", rowStart, rowEnd, colStart, colEnd);
    var edit_colMap = {
        "Tags": "N",
        "TagDetails": "Z",
        "Variables": "W",
        "Triggers": "T",
        "CustomDimensions": "M"
    };
    var firstDataRow = 5;
    var editable_colsMap = {
        "Tags": ["D", "E", "F", "G"],
        "TagDetails": ["D", "E", "F", "G", "N", "O", "P", "Q", "R", "S"],
        "Variables": ["D", "E", "F"],
        "Triggers": ["D", "E"],
        "CustomDimensions": ["G", "H", "I", "J"]
    };
    var thisTabEditCol = columnLetterToIndex(edit_colMap[sspname]);
    // convert the editable columns for the current tab to numerical indexes
    var thisTabEditableCols = [];
    for (var key in editable_colsMap[sspname]) {
        thisTabEditableCols.push(columnLetterToIndex(editable_colsMap[sspname][key]));
    }
    // set value to "edit" in edit column on editing name or description
    if (thisTabEditableCols.indexOf(colStart) > -1 && thisTabEditableCols.indexOf(colEnd) > -1 && rowStart >= firstDataRow) {
        var oldValue = event.oldValue;
        var newValue = event.value;
        if (oldValue !== newValue) {
            ssp.getRange(rowStart, columnLetterToIndex(edit_colMap[sspname])).setValue("edit");
        }
    }
    return true;
}

/**
 * Shows terms & conditions. Does not save the timestamp when terms were shown to user. This is only done during the setup.
 * @param {boolean} showSetupInfo - if true, text is shown that can continue with the setup process after viewing the terms
 * @module showTerms
 */
function showTerms(showSetupInfo) { // TODO
    var ui = SpreadsheetApp.getUi();
    ui.alert("This function is not implemented yet.");
    return false;

    var setupInfoText = "";
    if (showSetupInfo) {
        setupInfoText = "<p style=\"font-family: Calibri,sans-serif\">You can re-start the setup after that.</p>";
    }
    var htmlTerms = HtmlService.createHtmlOutput(`
   
    <h3 style="font-family: Calibri,sans-serif">See the <a href="https://docs.datacroft.de/terms-and-conditions" target="_blank">terms & conditions</a> for the free trial version and our <a href="https://docs.datacroft.de/what-data-is-processed-and-stored-where" target="_blank">data protection info</a>.</h3>
    ` + setupInfoText + `
    <p style="font-family: Calibri,sans-serif">(If you are on a paid plan, your terms were part of the contract you signed).</p>
    `).setWidth(300).setHeight(300);
    ui.showModalDialog(htmlTerms, 'Terms and Conditions');
}

/**
 * Walks through guided self-setup of account
 * @module guidedSetup
 */
function guidedSetup() {
    //the function would have to import at least the tabs "How to get started" and "Config"
    //from the Master Sheet (if they don't exist yet).
    console.log("Checking if all mandatory startup tabs exist");
    var ss_cur = SpreadsheetApp.getActive();
    var sheets = ss_cur.getSheets();
    var mandatory_tabs = ['Config', 'Sites', 'Tags', 'TagDetails', 'Variables', 'Triggers', 'CustomDimensions'];
    var existing_mandatory_tabs = [];
    for (var i in sheets) {
        if (mandatory_tabs.indexOf(sheets[i].getName()) !== -1) {
            existing_mandatory_tabs++;
            if (existing_mandatory_tabs.length === mandatory_tabs.length) {
                console.log("All mandatory startup tabs exist");
                break;
            }
        }
    }
    // console.log("existing tabs:" + existing_mandatory_tabs.length, "mandatory tabs: " + mandatory_tabs.length);

    if (existing_mandatory_tabs.length < mandatory_tabs.length) {
        console.log("Not all mandatory tabs exist. Assuming this is a new sheet. Starting import from the Master Sheet.");
        // start sheet recreation process
        sheetRecreation(true, true);
    }

    console.log("Starting process for terms and conditions");
    var ui = SpreadsheetApp.getUi();
    var useremail = Session.getActiveUser().getEmail();
    var config_param_name = 'terms_and_users';

    function showCancelToast() {
        SpreadsheetApp.getActiveSpreadsheet().toast("No worries. Come back after setting everything up.", "Setup Account", 3);
    }

    //check if terms were Accepted, if yes - continue
    var terms_and_users = getConfigSettings(config_param_name);
    var terms_and_users_arr = [];
    var showTermPopup = true;
    var isTermsAccepted = false;
    var userInd = 0;

    if (terms_and_users) {
        try {
            terms_and_users_arr = JSON.parse(terms_and_users);
            // check if this user has already seen or even accepted the terms
            userInd = terms_and_users_arr.findIndex(x => x.u === useremail);
            if (userInd === -1) {
                // if user is not in the list yet, add user
                userInd = terms_and_users_arr.length;
                terms_and_users_arr.push({u: useremail});
            } else showTermPopup = false; // if user is in list, we don't show the terms popup again, ...
            // ... but we check if the terms have been accepted by this user
            isTermsAccepted = terms_and_users_arr.findIndex(x => x.u === useremail && x.a) > -1
        } catch (e) {
            console.error("parse didn't work - bad json apparently, starting from scratch then.");
            terms_and_users_arr = [{u: useremail}];
        }
    } else {
        terms_and_users_arr = [{u: useremail}];
        setConfigSettings(config_param_name, 'array of objects: u=email, s=date when the T&C were last shown to the user, a=date of acceptance', JSON.stringify(terms_and_users_arr));
    }
    showTermPopup = false; // TODO Force-setting this to false as long as there are no T&C to show
    // if user has never seen t&c, show popup
    if (showTermPopup) {
        showTerms(true);
        // store the date when the terms were shown to the user
        terms_and_users_arr[userInd].s = new Date((new Date()).getTime()).toISOString();
        updateConfigSettingsValue(config_param_name, JSON.stringify(terms_and_users_arr));
        return false;
    }

    if (!isTermsAccepted) {
        var response0 = ui.alert('',
            `I understand that any use of this tool comes without any guarantee nor liability.`, ui.ButtonSet.OK_CANCEL);

        if (response0 === ui.Button.OK) {
            console.log('user accepted, go next and write acceptance date to config sheet');
            terms_and_users_arr[userInd].a = new Date((new Date()).getTime()).toISOString();
            updateConfigSettingsValue(config_param_name, JSON.stringify(terms_and_users_arr));
        } else if (response0 === ui.Button.CANCEL) {
            console.log('cancelled');
            return false;
        } else return false;
    }

    var cur_sheet = SpreadsheetApp.getActiveSpreadsheet();
    var editors = cur_sheet.getEditors();

    if (editors.map(editor => editor.getEmail()).indexOf('gsheets-accessor@dim28-comp-mgr.iam.gserviceaccount.com') === -1) {
        console.log("User has not shared the sheet with the service account yet, adding it with Edit rights");
        cur_sheet.addEditor('gsheets-accessor@dim28-comp-mgr.iam.gserviceaccount.com');
    }
    // go to the config tab
    var config_tab = cur_sheet.getSheetByName('Config');
    cur_sheet.setActiveSheet(config_tab);

    var response1 = ui.alert('',
        'I confirm that I have created API credentials for a user with the necessary rights to perform ' +
        'the operations in Piwik Pro for the functions that I want to use (e.g. Tag Manager / Custom Dimensions)', ui.ButtonSet.YES_NO);

    if (response1 === ui.Button.YES) {
        console.log('API Confirmation confirmed');
    } else {
        console.log('API Confirmation cancelled');
        showCancelToast();
        return false;
    }
    var org_prefix_key = 'piwik_org_prefix'
    var org_prefix = getConfigSettings(org_prefix_key) || '';
    var org_prefix_msg = ' (e.g., mycompany.piwik.pro => "mycompany") or confirm existing Code (leave blank).\nCurrently: \n' + (org_prefix || "none") + ' \n ';

    var org_prefix_response = ui.prompt('Please provide your Piwik Account Code/Subdomain ', org_prefix_msg, ui.ButtonSet.OK_CANCEL);
    if (org_prefix_response.getSelectedButton() === ui.Button.OK) {
        console.log('Response Org Prefix:', org_prefix_response.getResponseText());
        if (org_prefix_response.getResponseText()) {
            org_prefix = org_prefix_response.getResponseText();
            setConfigSettings(org_prefix_key, null, org_prefix);
            piwik_org_prefix = org_prefix;
        }
    } else {
        showCancelToast();
        return false;
    }

    //20 Confirm (leave blank) or change your Client ID: [editable text field with current client ID, e.g. "XXXXXXXXX"] -> value updates field client_id
    var client_id_key = 'piwik_client_id';
    var client_id = getConfigSettings(client_id_key);
    var response2 = ui.prompt('Confirm (leave blank) or change your Piwik Pro "Client ID"', '\nCurrently: \n' + client_id + ' \n ', ui.ButtonSet.OK_CANCEL);
    if (response2.getSelectedButton() === ui.Button.OK) {
        console.log('response2 (client ID):', response2.getResponseText());
        if (response2.getResponseText()) {
            client_id = response2.getResponseText();
            setConfigSettings(client_id_key, null, client_id);
            piwik_client_id = client_id;
        }
    } else {
        showCancelToast();
        return false;
    }

    // 30 Secret (TODO do not store in sheet for security reasons)
    var secret_key = 'piwik_client_secret';
    var secret = getConfigSettings(secret_key);
    var secret_msg = "\nCurrent Secret: \n" + secret;

    var response3 = ui.prompt('Confirm (leave blank) or change your "Client Secret"', secret_msg, ui.ButtonSet.OK_CANCEL);
    if (response3.getSelectedButton() === ui.Button.OK) {
        // console.log('response3:', response3.getResponseText());
        if (response3.getResponseText()) {
            secret = response3.getResponseText();
            setConfigSettings(secret_key, null, secret);
            piwik_client_secret = secret;
        }
    } else {
        showCancelToast();
        return false;
    }

    var spreadsheet = SpreadsheetApp.getActive();

    var payload = {
        script: 'setup_client',
        piwik_org_prefix: piwik_org_prefix,
        piwik_client_id: piwik_client_id,
        secret: secret
    };
    //console.log('payload:', payload);
    spreadsheet.toast('We are now initializing your account. \n' +
        'You can change the config anytime by re-running the setup. Once done, you\'ll  receive another message here', "Thank you!", -20);

    var response = trigger_server(payload, true); // force sync response
    console.log('response:', response);
    // the first element in the log array is the function response dict, e.g. {"result": "done", "message": "Setup successful"}
    // the second element is usually the status code, e.g. 200
    try {
        spreadsheet.toast(JSON.parse(response.log).message, "Setup result", -1);
    } catch (e) {
        console.error('Error in setup response:', e);
        spreadsheet.toast("Setup failed with an unexpected error. Please contact support (lukas.oldenburg@dim28.ch).", "Setup result", -1);
    }
}

function recreateThisTab() {
    var ui = SpreadsheetApp.getUi();
    var ss = SpreadsheetApp.getActive();
    var ssp = ss.getActiveSheet();
    var sspname = ssp.getName();
    var ssp_index = ssp.getIndex();

    var ss_source = SpreadsheetApp.openById(master_id);
    var ssp_source = ss_source.getSheetByName(sspname);

    if (!ssp_source) {
        ui.alert('Master Sheet has no "' + sspname + '" tab. If you renamed the tab, rename it back (e.g. via ' +
            'Google Sheets Version Control) or start from scratch again via Other -> Recreate Sheet.', ui.ButtonSet.OK);
        return false;
    }

    var res = ui.alert('This resets the the current tab "' + sspname + '" to the default. Continue?', ui.ButtonSet.YES_NO);

    if (res === ui.Button.YES) {
        //delete the old tab and pull in a copy of sheet
        ss.toast("Don't make any changes in the spreadsheet until you see 'Finished (re)creating tab'!", "Wait a bit", -1);
        ss.deleteSheet(ssp);
        Utilities.sleep(1000);

        var ssp_destination = ssp_source.copyTo(ss);
        ssp_destination.setName(ssp_source.getName());
        Utilities.sleep(1000);

        //do we need named range delete? do we need formula recreation?

        activateTab(sspname);

        try {
            ss.moveActiveSheet(ssp_index);
        } catch (e) {
            console.log("wasn't been able to move sheet to that index ", ssp_index, e);
        }

        ss.toast('Finished (re)creating tab "' + sspname + '"', "All done", -1);
        SpreadsheetApp.flush();

    } else return false;

}


function getConfigSettings(config_key) {
    var ss_cur = SpreadsheetApp.getActive();
    var ssp_config = ss_cur.getSheetByName("Config");
    var data = ssp_config.getDataRange().getValues();
    var code_col = data[0].indexOf("Config Parameter");
    var value_index = code_col + 2; // always 2 columns to the right of the key
    //console.log("Config Key:" + config_key + ", Value Index:" + value_index);
    // find the value for the config key
    for (var i = 1; i < data.length; i++) {
        //console.log("data code col " + i + ": " + data[i][code_col]);
        //console.log("data value index " + i + ": " + data[i][value_index]);
        if (data[i][code_col] === config_key) {
            return data[i][value_index];
        }
    }
    if (config_key !== "reset_filters") {
        console.warn("Setting " + config_key + " not found!");
    }
    return undefined;
}

/**
 * in the "config" tab under "Other Settings", sets a value and description for an existing key
 * (or writes them to the first empty row under "Other Settings")
 * @param config_key - the key for which to set a value, e.g. "layout_version"
 * @param descr - the description for the description column
 * @param value - the value to set in the value column
 * @return {boolean}
 */
function setConfigSettings(config_key, descr, value) {
    var ss_cur = SpreadsheetApp.getActive();
    var ssp_config = ss_cur.getSheetByName("Config");
    var data = ssp_config.getDataRange().getValues();
    var code_col = data[0].indexOf("Config Parameter");
    var row_index = -1;

    // find the row with the config key
    for (var i = 1; i < data.length; i++) {
        if (data[i][code_col] === config_key) {
            row_index = i + 1;
            break;
        }
    }

    // if key does not exist yet, insert as new row below
    if (row_index === -1) {
        row_index = data.length + 1; // use the next empty row
    }

    // If descr is null or undefined, use the current value in the cell or an empty string if the cell is empty
    if (descr === null || descr === undefined) {
        var descr_col = code_col + 2; // "Descr" is in the column immediately to the right of "Config Parameter"
        var current_descr_value = ssp_config.getRange(row_index, descr_col).getValue();
        console.log("Current Description: ", current_descr_value);
        descr = current_descr_value || "no description";
    }

    var range_to_set = ssp_config.getRange(row_index, code_col + 1, 1, 3); // Assuming it updates 3 columns: config_key, descr, value

    range_to_set.setValues([[config_key, descr, value]]);

    if (!isNaN(value)) {
        ssp_config.getRange(row_index, code_col + 3).setNumberFormat("#"); // integer without decimals
    }

    return true;
}

/**
 * in the "config" tab under "Other Settings", updates a value for an existing key
 * @param config_key - the key for which to set a value, e.g. "layout_version"
 * @param value - the value to set in the value column
 * @return {boolean}
 */
function updateConfigSettingsValue(config_key, value) {
    var ss_cur = SpreadsheetApp.getActive();
    var ssp_config = ss_cur.getSheetByName("Config");
    var data = ssp_config.getDataRange().getValues();
    var code_col = data[0].indexOf("Other Settings Code");
    var row_index = -1;
    // find the row with the config key
    for (var i = 1; i < data.length; i++) {
        console.log(data[i][code_col]);
        if (data[i][code_col] === config_key) {
            // console.log("found it in row " + i);
            row_index = i + 1;
            break;
        }
    }

    if (row_index === -1) {
        console.log("Setting " + config_key + " not found, adding it below");
        var descr = "no description";
        if (config_key === "scopes") {
            descr = "OAuth V2 Scopes";
        }
        setConfigSettings(config_key, descr, value);
        return true;
    }

    ssp_config.getRange(row_index, code_col + 3).setValue(value);

    return true;
}

function removeFiltersFromSheet(sheetname) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ssp = ss.getSheetByName(sheetname);
    var filter = ssp.getFilter();

    if (filter) {
        filter.remove();
    }

    return true;
}