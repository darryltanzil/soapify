# Soapify

Need to quickly make a playlist for that middle school dance, but don't want to bother searching up clean versions? Say no more, because Soapify will do that for you! 

## Technologies Used
* React (with ES6 Javascript)
* Axios (promise-based HTTP client)
* Spotify Web API
* Node.JS

## What needs to be done
* States are unsynced with render function. Need to sync.
* implement "Add Clean Version" button which auto adds all clean songs to playlist
* Host using Heroku / Firebase so people can use it
* Bring the app out of development mode to allow more then 25 users
* Implement Search Algorithm

## Potential Search Algorithm
Currently, the app works by appending "clean version" to a spotify search of the song name it is looking for a clean version of. A potential, more accure accurate result would do the following:

1. Get the Audio Analysis Data using the track's ID, for the top 5 most clean versions of the song.
2. Using this, compare the tempo, pitch, audio duration, mood, etc, and assign a variance number in comparison to the original song.
3. Given this various number, compare against all 5 versions, and with the most accurate, assign to the playlist.

This would utilise the AI within Spotify to create a flawless way to find the clean version- will need to implement in the future.

## Images
![image](https://user-images.githubusercontent.com/5387769/170523265-0e4aa3ad-abbe-4029-8c4f-35a687ccbd64.png)

![image](https://user-images.githubusercontent.com/5387769/170523350-c940f164-4c99-4eba-8149-8eb332f577c0.png)


