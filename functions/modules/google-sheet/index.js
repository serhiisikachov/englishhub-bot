const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const {GoogleAuth} = require("google-auth-library");

// If modifying these scopes, delete token.json.
const SCOPES = ['http://spreadsheets.google.com/feeds/spreadsheets/private/full'];

function writeLine(auth, row)
{
    const sheets = google.sheets({version: 'v4', auth});
    //Values example
    // let values = [
    //     [
    //         'firstname',
    //         'lastname',
    //         'username',
    //         'phone',
    //         'datetime',
    //         'teacher',
    //     ]
    // ];

    let values = [row]

    let resource = {
        values,
    };
    const request = {
        // The ID of the spreadsheet to update.
        spreadsheetId: '1seJSX7_QuB8a9FWYvuJEsoISV0sD-dZvdFnuRcYIbPQ',  // TODO: Update placeholder value.
        valueInputOption: "RAW",
        // The A1 notation of a range to search for a logical table of data.
        // Values are appended after the last row of the table.
        range: 'Bookings!A2',  // TODO: Update placeholder value
        resource: resource
    };


    sheets.spreadsheets.values.append(
        request
        , (err, result) => {
        if (err) {
            // Handle error.
            console.log(err);
        }
    });


}

class GoogleSheet {
    init() {
        // Load client secrets from a local file.
        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            //console.log(content);
            // Authorize a client with credentials, then call the Google Sheets API.
            return authorize(JSON.parse(content), writeLine);
        });
    }

    async exportNewBooking(row) {
        const auth = new GoogleAuth({
            // Scopes can be specified either as an array or as a single, space-delimited string.
            scopes: SCOPES
        });

        writeLine(auth, row);
    }
}

module.exports = GoogleSheet;

