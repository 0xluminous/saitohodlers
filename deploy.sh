#!/bin/bash

APP_NAME="saitohodlers.com"

UPDATES=$(git pull)
if [[ $UPDATES != *"Already up to date"* ]]; then
  npm install
  npm run build

  if pm2 list | grep -q $APP_NAME; then
    pm2 restart $APP_NAME
  else
    pm2 start npm --name $APP_NAME -- start
  fi
else
  echo "No updates found. Nothing to do."
fi

