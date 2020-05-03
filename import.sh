#!/bin/sh

firebase-import
    --database_url https://eh-bot-46aff.firebaseio.com
    --path /locations --json functions/data/locations.json
    --service_account eh-bot-46aff-firebase-adminsdk-6xz9b-6600f7d1e6.json
