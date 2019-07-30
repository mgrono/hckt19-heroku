# hckt19-heroku

1. Create Heroku account and install Heroku CLI
1. Create connected app on the Dev Org

1. Clone the repo
	```
    git clone https://github.com/mgrono/hckt19-heroku/
    ```
1. Login to Heroku
	```
    cd heroku
	heroku login
    ```

1. Create heroku app
	```
    heroku create *name-of-app*
    ```
1. go to /client/src/client-config.json and set app i
    HEROKU_APP_URL - your heroku instance url, for example http://name-of-app.herokuapp.com/

1. Configure connection to SFDC in: /server/config.json  
1. Push code to heroku and run the app
	```
    git push heroku master
    ```
1. Go to the url and check if app works correctly: http://name-of-app.herokuapp.com/
