import { useEffect, useState, useLayoutEffect } from 'react'; // use effect -> after render, do something 
import './App.css';
import axios from 'axios';
import Footer from './footer'

function App() {

  // spotify constants
  const CLIENT_ID = "9a8180550734469f9049f7880c2a91a5"
  const REDIRECT_URI = "http://localhost:3000"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"
  const SCOPE = "playlist-modify-private"

  const [token, setToken] = useState("")
  const [selectedPlaylistID, setSelectedPlaylistID] = useState("")
  const [selectedPlaylist, setSelectedPlaylist] = useState([])
  const [selectedPlaylistObject, setSelectedPlaylistObject] = useState({})

  const [width, setWidth] = useState(window.innerWidth);
  const [currentSongNameToClean, setCurrentSongNameToClean] = useState("");
  const [currentSongItem, setCurrentSongItem] = useState({});
  const [newCleanPlaylist, setNewCleanPlaylist] = useState([])
  const [currentSongExplicit, setCurrentSongExplicit] = useState(false);

  useLayoutEffect(() => {
    const interval = setInterval(() => {
      setNewCleanPlaylist((newCleanPlaylist) => newCleanPlaylist.concat({}).filter(value => Object.keys(value).length !== 0))
      console.log('this is the newCleanPlaylist' + JSON.stringify(newCleanPlaylist))
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // check if on mobile, or not
  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  const generateCleanPlaylist = () => {
    var user_id = ''
    axios.get('https://api.spotify.com/v1/me', {

      headers: {
        'Authorization': `Bearer ${token}`
      }

    }).then((response) => {
      user_id = response.data.id
      // alert("THE JSON OBJECT IS " + JSON.stringify(selectedPlaylistObject))
      //alert(selectedPlaylistObject.name)
      //alert(selectedPlaylistObject.description)
      //alert(selectedPlaylistObject.public)

      axios.post("https://api.spotify.com/v1/users/" + user_id + "/playlists",
        {
          name: selectedPlaylistObject.name + " Clean",
          description: selectedPlaylistObject.description,
          public: selectedPlaylistObject.public
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ).then((res) => {
        var newPlaylistID = res.data.id
        var urisClean = []
        newCleanPlaylist?.map(CS => (urisClean.push(CS.uri)))
        alert("The clean playlist has been generated to your account!")

        axios.post("https://api.spotify.com/v1/playlists/" + newPlaylistID + "/tracks",
          {
            "uris": urisClean
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      })

    })
  }


  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, [width]);

  const isMobile = width <= 768;

  // used for fetching
  const [playlists, setPlaylists] = useState([])

  const searchPlaylists = async (e) => {
    e.preventDefault()
    const { data } = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        // no params
      }
    })

    setPlaylists(data.items) // gets all plalists, and puts them in the constant "playlists"
  }

  // occurs every time a state variable changes
  useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")

    // check we have hash or a token saved in localStorage
    if (!token && hash) {

      // if there is a token, set the token state variable
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

      // check if we have a hash; if there is hash, perform tasks on string to extract token
      window.location.hash = ""
      window.localStorage.setItem("token", token)

    }

    // check if there is a value saved
    setToken(token)
  }, [token])

  useLayoutEffect(() => {

    async function getSongs() {
      const { data } = await axios.get("https://api.spotify.com/v1/playlists/" + selectedPlaylistID, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {

        }
      })
      if (data.name !== "soapify empty") {
        setSelectedPlaylistObject(data)
      }
      console.log("the selected playlist object is" + JSON.stringify(data));
      setSelectedPlaylist(data.tracks.items) // gets all songs from the playlist, and puts them into it      

      function addCleanSongs(trackName, track, explicit) {
        setCurrentSongNameToClean(trackName)
        setCurrentSongItem(track)
        console.log("The Track name is " + trackName)
        explicit ? setCurrentSongExplicit(true) : setCurrentSongExplicit(false)
        addNewClean(trackName, track, explicit);
      }

      selectedPlaylist.map(SP => (addCleanSongs(SP.track.name, SP.track, SP.track.explicit)))
      setNewCleanPlaylist([])
    }
    
    function addNewClean(trackName, track, explicit) {
      var cleanHasbeenFound = false
      async function searchForClean() {
        
        const { data } = await axios.get("https://api.spotify.com/v1/search", {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            q: trackName,
            type: 'track',
            limit: 5,
            offset: 0
          }
        })
        axios.get('https://api.spotify.com/v1/audio-analysis/' + track.id, {
          headers: {
            'Authorization': `Bearer ${token}`
          }

        }).then((currentSongItemAudioData) => {
          console.log("the search result is " + JSON.stringify(data.tracks.items))
          console.log("data track items are " + data.tracks.items[0].id)

          data.tracks.items.map(CS => (
            axios.get('https://api.spotify.com/v1/audio-analysis/' + CS.id, {
  
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }).then((iteratedSong) => {
              console.log("why is this not iterating")
              console.log(JSON.stringify(iteratedSong) + "=" + JSON.stringify(currentSongItemAudioData))
              var isOnTempo = iteratedSong.data.track.tempo - 0.1 <= currentSongItemAudioData.data.track.tempo && currentSongItemAudioData.data.track.tempo <= iteratedSong.data.track.tempo + 0.1 ? true : false
              var isSameDuration = iteratedSong.data.track.duration === currentSongItemAudioData.data.track.duration?  true : false
              var isExplicit = CS.explicit ? true : false
              var sameTrackName = CS.name === track.name ? true : false

              if (sameTrackName && isSameDuration && !cleanHasbeenFound && !isExplicit) {
                console.log("setting the new clean Playlist to " + JSON.stringify(CS))
                setNewCleanPlaylist((newCleanPlaylist) => newCleanPlaylist.concat(CS).filter(value => Object.keys(value).length !== 0))
                cleanHasbeenFound = true
              }
              else {
                console.log("not the correct song")
              }
            })
          ))
        })        
      }

      console.log(newCleanPlaylist);
      searchForClean()
    }

    console.log(selectedPlaylistID);
    console.log("The selected playlist is " + selectedPlaylist);
    getSongs();
  }, [selectedPlaylistID, token])

  // removes token from local storage, and sets state token back to empty string
  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }

  const renderPlaylists = () => {
    return playlists.map(playlist => (
      <div key={playlist.id} className="pl-container" onClick={() => { setSelectedPlaylistID(playlist.id); setNewCleanPlaylist([]) }}>
        <div className="playlist-box">
          <div className="pl-img">{playlist.images[0] ? <img width={"100%"} src={playlist.images[0].url} alt="" /> : <div>No Image</div>}</div>
          <div className="pl-content">
            <h1>{playlist.name}</h1>
            <p>
              {playlist.owner.display_name} and {playlist.owner.external_urls.spotify}
            </p>
          </div>
        </div>
      </div>
    ))
  }

  const renderSongs = () => {
    return selectedPlaylist?.map(SP => (
      <div key={SP.id} className={SP.track.explicit ? "song-box explicit" : 'song-box'} >
        <div className='song-img'>{SP.track.album.images[0].width ? <img width={"100%"} src={SP.track.album.images[0].url} alt="" /> : <div>No Image</div>}</div>
        <div className="song-content">
          <p>
            {SP.track.name} &nbsp;
            {SP.track.explicit && <i className="material-icons" style={{ fontSize: '20px' }}>explicit</i>} &nbsp;
          </p>
        </div>
        <br />
      </div>

    ))
  }

  const renderCleanSongs = () => {

    console.log("the new clean playlist is " + JSON.stringify(newCleanPlaylist))
    return newCleanPlaylist?.map(CS => (
      <div key={CS.id} className={CS.explicit ? "song-box explicit" : 'song-box'}>
        <div className="song-img">{CS.album.images[0].width ? <img width={"100%"} src={CS.album.images[0].url} alt="" /> : <div>No Image</div>}</div>
        <div className="song-content">
          <p>{CS.name}</p>
          {CS.explicit && <i className="material-icons" style={{ fontSize: '20px' }}>explicit</i>} &nbsp;
        </div>
      </div>
    ))
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="title">Soapify</h1>


        {!token ?
          <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`} className="button">login to spotify</a>
          :
          <>
            <div>
              <button type="submit" onClick={(e) => searchPlaylists(e)}><span>get playlists</span></button>
              <button onClick={logout} className="button">logout</button>
            </div>
            {renderPlaylists()}
            {selectedPlaylistID !== "" &&
              <div>
                <button onClick={() => { setSelectedPlaylistID("5NVYMkZmmeu7NrW5ZcTGvh"); setNewCleanPlaylist([]) }} className="button">find non-explicit</button>
                {currentSongNameToClean !== "" &&
                  <button onClick={() => { setSelectedPlaylistID("5NVYMkZmmeu7NrW5ZcTGvh"); generateCleanPlaylist() }} className="button">add clean claylist to account</button>
                  }
              </div>
            }
            {isMobile ?
              <>

                <h1>Clean</h1>
                {renderCleanSongs()}
                <h1>Unclean</h1>
                {renderSongs()}
              </>
              :
              <>
                <div class="pl-compare-container">
                  <div style={{ float: 'right' }}>
                    <h1>Clean</h1>
                    {renderCleanSongs()}
                    <h1>Unclean</h1>
                    {renderSongs()}
                  </div>

                </div>
              </>
            }
          </>
        }
      </header>
      <Footer />
    </div>
  );
}

export default App;
