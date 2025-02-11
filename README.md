# Piwik Pro Manager
Piwik Pro Manager saves time, minimizes redundancy and fosters transparency for Piwik Pro Admins, especially in Multi-Site Setups.

## Quick Start Guide

### Video Guide

[![Getting Started with Piwik Pro Manager - Video](youtube-thumbnail.png)](https://youtu.be/yXKHIK-s_QI)

### Text Guide
1. In any Google Sheet owned by you, go to File -> Settings and ensure that the Locale is set to "United States".
2. Go to **Extensions -> Apps Script**
3. The Apps Script editor window will open.
4. Copy the code from https://github.com/loldenburg/piwik-manager-appsscript/blob/main/mainHandler.js
5. Paste the code into the Apps Script editor window.
6. Give the Apps Script a proper name (= this will be the name in your Google Sheets menu), e.g., "Piwik Pro Manager {My Org}" 
7. Save the Apps Script (e.g. via the "Save" icon).
8. Reload the Google Sheet (not the Apps Script Editor).
9. Under "Extensions", you should now see "Piwik Pro Manager {My Org}". 
10. Run "Setup" and follow the steps there.
![img.png](piwik-pro-manager-extension-screenshot.png)

## Which Piwik Pro Credentials do I need?

You need:

* A Piwik Pro Client ID and Secret for a User with "Manage" rights to the Sites you want to edit. Generate them here: https://help.piwik.pro/support/questions/generate-api-credentials/
* Your Piwik Pro Organization Prefex, e.g., if your Piwik Pro URL is "mycompany.piwik.pro", the Org Prefix is "mycompany"

## About

Piwik Pro Manager was built and is maintained by Lukas Oldenburg from dim28, an independent Analytics consultant with no liaison to the company Piwik Pro.

You can contact Lukas via [LinkedIn](https://www.linkedin.com/in/lukas-oldenburg/), [BlueSky](https://bsky.app/profile/lukasoldenburg.bsky.social), or the [contact form](https://www.dim28.ch/contact).

Also check out [Lukas Oldenburg's blog on Medium](https://lukas-oldenburg.medium.com/).

The tool is free of any warranty. It runs on Google Cloud Platform servers in Switzerland. 

Thank you for reporting any bugs. :)
