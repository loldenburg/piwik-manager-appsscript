# Data Protection - What Data is Used and Where is it Stored?

## Privacy Policy Regarding the Piwik Pro Data Accessed and Stored

### How Does the Piwik Pro Manager Process Data?
The Piwik Pro Manager uses Piwik Pro API Credentials to pull component meta data (no report or individual user data) from Piwik Pro, processes this data via various scripts hosted in Google Cloud Platform (GCP) components hosted in Switzerland and finally writes the data to a Google Sheet. The Google Sheet is owned and managed by your organization.

### What Piwik Pro Data Does the Piwik Pro Manager Use?
The Piwik Pro Manager never accesses Piwik Pro report data, so the data e.g. of your website visitors is untouched.

The Piwik Pro Manager accesses components meta data, i.e. data on Tags in Tag Manager, Custom Dimensions or Goals. "Meta data" refers to data like the name or description of a component or when it was created.

### Does the Piwik Pro Manager Store Personal Data (PII)?
By default, the Piwik Pro Manager does not store any personal data other than the Google account's email address of the user that has initiated the setup for fraud prevention and to document who has accepted the Terms & Conditions and when. 

### Where is Which Type of Data Stored?

#### Piwik Pro Credentials
The client secret used for the API is stored safely and in an encrypted way using Google Cloud Platform's Secret Manager, an industry standard for key storage security. You can furthermore simply disable the key in your Piwik Pro Admin section at any time.

#### Other Non-Sensitive Data
Some of the data in the Google Sheet, but no personal data, is stored in Google Cloud Platform's "Cloud Storage" as well as Google Cloud Platform's "Firestore" document database, both located in the European Union. This is done ...

* to make queries faster (e.g. to only query the delta between the last and the current "component usage" run makes the second and ensuing queries up to 95% faster, saves a lot of processing power)

* to track usage stats (e.g. how often which function is used and how long it runs) for performance and product optimization

* to generate parts of the "update logs" in the update_log tab (e.g. a list of all deleted Workspaces) to document changes.

### Data in the Google Sheet
By default, all data in Google Sheets is stored in Google's world-class data centers in an encrypted manner, so this also applies to the Piwik Pro Manager, which is basically a Google Sheets enhancement.

## Privacy Policy Regarding the Google Sheets Add-on
If you install the Piwik Pro Manager as a Google Sheets Add-on (not available yet as of Jan 11 2025), the following applies regarding personally identifiable information from your Google account:

* To use the Piwik Pro Manager, you need to share your Google Sheet with "edit" access to the Google Cloud Platform Service Account e-mail address that is mentioned in the "getting started" guide. The Setup process automatically shares the sheet with this Service Account. This way, we get programmatic read and write access to all data in this Google Sheet. This is required because the service cannot be provided otherwise. 

### Google Privacy Policy
See https://policies.google.com/privacy on how Google handles your data when using Google Sheets.

### End of Service
If you no longer wish to use the Piwik Pro Manager, simply delete your Piwik Pro Manager Google Sheet(s).

### Data Access and Deletion Requests
You can at any time request us to send you all data stored about your person by writing to lo[at]dim28.ch.

All account-related data is always deleted automatically after 6 months. You can at any time have all your personal and account-related data be deleted by writing to lo[at]datacroft.de.

### Changes
Our Privacy Policy may change from time to time. We will not reduce your rights under this Privacy Policy without your explicit consent. We will post any privacy policy changes on this page and, if the changes are significant, we will provide a more prominent notice.

### Last Modified
Jan 11, 2025