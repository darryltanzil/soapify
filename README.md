# Soapify

Need to quickly make a playlist for that middle school dance, but don't want to bother searching up clean versions? Say no more, because Soapify will do that for you! 

Soapify allows you to grab your playlists from your account, and then generates a clean playlist using the following algorithm:

![IMG_0232](https://user-images.githubusercontent.com/5387769/172107258-29e7a32e-a89c-44d2-a29b-da4facebf176.jpg)

## Technologies Used
* React (with ES6 Javascript)
* Axios (promise-based HTTP client)
* Spotify Web API
* Node.JS

## What needs to be done
* Current algorithm is too picky, and doesn't pick up on some clean songs- refine by changing tempo variance, or looking at time signature?
* Create buttons and fields which let the user refine how precise they want the algorithm to be
* 429 too many requests error when dealing with excessively large playlists- perhaps use setInterval) in between?
* Host using Heroku / Firebase so people don't have to host locally
* Bring the app out of development mode to allow more then 25 users
* Get actually good UI design

## Images
<img width="321" alt="image" src="https://user-images.githubusercontent.com/5387769/172107335-9d757375-a17b-4600-b196-6be809f78b06.png" style="float: left;">
<img width="324" alt="image" src="https://user-images.githubusercontent.com/5387769/172107387-223026c2-1c50-4554-8fc2-04729f6d04d6.png" style="float: left;">
<img width="326" alt="image" src="https://user-images.githubusercontent.com/5387769/172107528-6d257370-9724-4d6e-862d-979bacaef0c8.png" style="float: left;">
<img width="324" alt="image" src="https://user-images.githubusercontent.com/5387769/172107595-53fd7fd7-90b9-4479-8e22-7aa5a1b4c001.png" style="float: left;">
<img width="1433" alt="image" src="https://user-images.githubusercontent.com/5387769/172107666-5487a749-f7a4-46e2-a09e-4f6d3686a589.png" >


